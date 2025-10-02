import { SSOClientConfig, BeginAuthOptions, CompleteAuthResult } from './types';
import { Storage, Local } from './storage';

const STATE_KEY = 'wangov_oauth_state';
const CLIENT_ID_KEY = 'wangov_oauth_client_id';
const TOKEN_KEY = 'wangov_sso_token';
const USER_KEY = 'wangov_sso_user';

export class SSOClient {
  private cfg: SSOClientConfig;

  constructor(cfg: SSOClientConfig) {
    this.cfg = cfg;
  }

  buildAuthorizeUrl(opts: BeginAuthOptions): string {
    const scope = opts.scope || 'profile email';
    const state = opts.state || this.generateState();

    Storage.set(STATE_KEY, state);
    Storage.set(CLIENT_ID_KEY, this.cfg.clientId);

    const url = new URL(this.cfg.ssoBaseUrl.replace(/\/$/, '') + '/auth/authorize');
    url.searchParams.set('redirect_uri', opts.redirectUri);
    url.searchParams.set('client_id', this.cfg.clientId);
    url.searchParams.set('state', state);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope);
    return url.toString();
  }

  beginAuth(opts: BeginAuthOptions) {
    window.location.href = this.buildAuthorizeUrl(opts);
  }

  async completeAuthFromCallback(queryString: string): Promise<CompleteAuthResult> {
    const params = new URLSearchParams(queryString.startsWith('?') ? queryString : '?' + queryString);
    const code = params.get('code');
    const state = params.get('state');
    const storedState = Storage.get(STATE_KEY);

    if (!code) return { ok: false, error: 'Missing authorization code' };
    if (!state || !storedState || state !== storedState) {
      return { ok: false, error: 'Invalid OAuth state' };
    }

    const res = await fetch(this.cfg.backendCallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state, client_id: this.cfg.clientId })
    });

    if (!res.ok) {
      return { ok: false, error: `Callback exchange failed (${res.status})` };
    }

    const data = await res.json();
    if (data?.status !== 'success' || !data?.data?.token) {
      return { ok: false, error: 'Invalid callback response' };
    }

    Local.set(TOKEN_KEY, data.data.token);
    if (data.data.user) Local.set(USER_KEY, JSON.stringify(data.data.user));

    Storage.remove(STATE_KEY);
    Storage.remove(CLIENT_ID_KEY);

    return { ok: true, token: data.data.token, user: data.data.user };
  }

  isAuthenticated(): boolean {
    return !!Local.get(TOKEN_KEY) && !!Local.get(USER_KEY);
  }

  getUser<T = any>(): T | null {
    const raw = Local.get(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  getToken(): string | null {
    return Local.get(TOKEN_KEY);
  }

  logout() {
    Local.remove(TOKEN_KEY);
    Local.remove(USER_KEY);
  }

  private generateState(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export function createClient(cfg: SSOClientConfig) {
  return new SSOClient(cfg);
}
