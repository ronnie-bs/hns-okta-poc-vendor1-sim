export interface SsoTokenResponse {
    accessToken: string;
    expiresIn: number;
    idToken: string;
    scopes: string[];
    tokenType: string;
    user?: string;
}
