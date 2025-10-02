export interface SSOClientConfig {
  ssoBaseUrl: string;           // e.g. http://localhost:3010
  clientId: string;             // e.g. wangov-universal
  backendCallbackUrl: string;   // e.g. http://localhost:3004/api/auth/callback
}

export interface BeginAuthOptions {
  redirectUri: string;          // e.g. http://tax.localhost:3003/auth/callback
  scope?: string;               // e.g. "profile email organization_access"
  state?: string;               // optional, will be generated if omitted
}

export interface CompleteAuthResult {
  ok: boolean;
  error?: string;
  token?: string;
  user?: any;
}
