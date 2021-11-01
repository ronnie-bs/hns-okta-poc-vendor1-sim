export interface SsoVerifyInfo {
    codeVerifier: string;
    codeChallenge: string;
    state: string;
}
