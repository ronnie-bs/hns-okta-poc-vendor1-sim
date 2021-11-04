import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { encode as base64encode } from "base64-arraybuffer";
import jwtDecode, { JwtPayload } from "jwt-decode";
import { SessionUtils } from "src/app/common/utils/session-utils";
import { CommonConstants } from "src/app/common/constants/common-constants";
import { SsoTokenResponse } from "src/app/common/models/sso-token-response.model";
import { BehaviorSubject, Observable, Observer, Subject } from "rxjs";


const CLIENT_ID = "0oa27m8p1zALpn1w75d7";
const CALLBACK_URI = 'login/callback';
const SCOPES = ["openid", "profile", "email"];
@Injectable()
export class AuthService {
    private codeVerifier: string = "";
    private codeChallenge: string = "";
    private state: string = "";
    private ssoTokenResponse: SsoTokenResponse | null = null;
    private auth$: Subject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private http: HttpClient
    ) {
        const ssoVerifyInfo = SessionUtils.getSsoVerifyInfo();
        if (ssoVerifyInfo) {
            this.codeVerifier = ssoVerifyInfo.codeVerifier;
            this.codeChallenge = ssoVerifyInfo.codeChallenge;
            this.state = ssoVerifyInfo.state;
            SessionUtils.removeSsoVerifyInfo();
        }
    }

    public isAuthenticated(): Observable<boolean> {
        return this.auth$;
    }

    public isStatesMatch(state: string): boolean {
        const thisState = this.state || "";
        const argState = state || "";
        return thisState !== "" && argState !== "" && thisState === argState;
    }

    public async redirectToAuthUrl() {
        const authUrl = await this.getAuthUrl();
        console.log("AuthUrl", authUrl);
        SessionUtils.saveSsoVerifyInfo({
            codeVerifier: this.codeVerifier,
            codeChallenge: this.codeChallenge,
            state: this.state
        });
        window.location.href = authUrl;
    }

    public exchangeCodeForToken(authCode: string): Observable<SsoTokenResponse> {
        return new Observable((observer: Observer<SsoTokenResponse>) => {
            const tokenUrl = this.getTokenUrl();
            console.log("TokenUrl", tokenUrl);
            const tokenRequestBody = this.getTokenRequestBody(authCode);
            console.log("TokenRequestBody", tokenRequestBody);
    
            this.http.post(tokenUrl, tokenRequestBody, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } )
                .subscribe(tokenResponse => {
                    console.log("Token Response", tokenResponse);
                    this.ssoTokenResponse = this.parseTokenResponse(tokenResponse);
                    SessionUtils.saveSessionInfo(this.ssoTokenResponse);
                    this.auth$.next(true);
                    observer.next(this.ssoTokenResponse);
                    observer.complete();
                });    
        });
    }

    public logout() {
        const tokenRevokeUrl = this.getTokenRevokeUrl();
        const tokenRevokeBody = this.getTokenRevokeBody();
        const tokenRevokeHeader = this.getTokenRevokeHeader();
        this.http.post(tokenRevokeUrl, tokenRevokeBody, { headers: tokenRevokeHeader } )
            .subscribe(tokenRevokeResponse => {
                const logoutUrl = this.getLogoutUrl();;
                SessionUtils.removeSessionInfo();
                window.location.href = logoutUrl;
            });
    }

    public getSsoTokenResponse(): SsoTokenResponse | null {
        return this.ssoTokenResponse;
    }

    public getTokenUrl(): string {
        return `${CommonConstants.OKTA_TOKEN_BASE_URL}`;
    }

    public getTokenRevokeUrl(): string {
        return `${CommonConstants.OKTA_TOKEN_REVOKE_BASE_URL}`;
    }

    public getTokenRevokeBody(): string {
        return `${this.getTokenTypeHintUrlParam()}` +
            `&${this.getTokenUrlParam()}`;
    }

    public getTokenRevokeHeader(): any {
        return {
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': `Basic ${btoa(CLIENT_ID)}`
        };
    }

    public getLogoutUrl(): string {
        return `${CommonConstants.OKTA_LOGOUT_BASE_URL}` +
            `?${this.getIdTokenHintUrlParam()}` +
            `&${this.getLogoutRedirectUrlParam()}`;
    }

    public getTokenRequestBody(authCode: string): string {
        return `${this.getClientIdUrlParam()}` +
            `&${this.getCodeVerifierUrlParam()}` +
            `&${this.getRedirectUriUrlParam()}` +
            `&${this.getGrandTypeUrlParam()}` +
            `&${this.getAuthCodeUrlParam(authCode)}`;
    }

    public async getAuthUrl(): Promise<string> {
        return `${CommonConstants.OKTA_AUTH_BASE_URL}` +
            `?${this.getClientIdUrlParam()}` +
            `&${this.getRedirectUriUrlParam()}` +
            `&${this.getResponseTypeUrlParam()}` +
            `&${this.getResponseModeUrlParam()}` +
            `&${this.getStateUrlParam()}` +
            `&${this.getNonceUrlParam()}` +
            `&${await this.getCodeChallengeUrlParam()}` +
            `&${this.getCodeChallengeMethodUrlParam()}` +
            `&${this.getScopeUrlParam()}`;
    }

    private getClientIdUrlParam(): string {
        return `client_id=${CLIENT_ID}`;
    }

    private getCodeVerifierUrlParam(): string {
        return `code_verifier=${this.getCodeVerifier()}`;
    }

    private async getCodeChallengeUrlParam(): Promise<string> {
        return `code_challenge=${await this.getCodeChallenge()}`;
    }

    private getCodeChallengeMethodUrlParam(): string {
        return `code_challenge_method=S256`;
    }

    private getNonceUrlParam(): string {
        return `nonce=${this.getNonce()}`
    }

    private getRedirectUriUrlParam(): string {
        return `redirect_uri=${this.getRedirectUri()}`;
    }

    private getResponseTypeUrlParam(): string {
        return `response_type=code`;
    }

    private getResponseModeUrlParam(): string {
        return `response_mode=fragment`;
    }

    private getStateUrlParam(): string {
        return `state=${this.getState()}`;
    }

    private getScopeUrlParam(): string {
        const scopeString = `scope=${SCOPES.join(" ")}`;
        return encodeURI(scopeString);
    }

    private getGrandTypeUrlParam(): string {
        return `grant_type=authorization_code`;
    }

    private getAuthCodeUrlParam(authCode: string) {
        return `code=${authCode}`;
    }

    private getIdTokenHintUrlParam() {
        return `id_token_hint=${this.getIdTokenHint()}`;
    }

    private getLogoutRedirectUrlParam() {
        return `post_logout_redirect_uri=${this.getLogoutRedirectUrl()}`;
    }

    private getTokenTypeHintUrlParam() {
        return `token_type_hint: access_token`;
    }

    private getTokenUrlParam() {
        return `token=${this.getToken()}`;
    }

    private getCodeVerifier(): string {
        if (this.codeVerifier === "") {
            this.codeVerifier = this.getRandomString();
        }
        return this.codeVerifier;
    }

    private async getCodeChallenge(): Promise<string> {
        if (this.codeChallenge === "") {
            const encoder = new TextEncoder();
            const data = encoder.encode(this.getCodeVerifier());
            const digest = await window.crypto.subtle.digest("SHA-256", data);
            const base64Digest = base64encode(digest);
            this.codeChallenge = base64Digest
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=/g, "");
        }
        return this.codeChallenge;
    }

    private getNonce() {
        return this.getRandomString(32);
    }

    private getRedirectUri() {
        const baseUri = `${window.location.origin}/${CALLBACK_URI}`;
        return encodeURI(baseUri);
    }

    private getState() {
        if (this.state === "") {
            this.state = this.getRandomString();
        }
        return this.state;
    }

    private parseTokenResponse(tokenResponse: any): SsoTokenResponse {
        return {
            accessToken: tokenResponse["access_token"] || "",
            expiresIn: tokenResponse["expires_in"] || "",
            idToken: tokenResponse["id_token"] || "",
            scopes: (tokenResponse["scope"] || []).split(" "),
            tokenType: tokenResponse["token_type"] || "",
            user: this.getJwtUser(tokenResponse) || ""
        };
    }

    private getJwtUser(tokenResponse: any) {
        const jwt = tokenResponse["access_token"];
        const decoded = jwtDecode<JwtPayload>(jwt);
        return decoded.sub;
    }

    private getIdTokenHint() {
        const sessionInfo = SessionUtils.getSessionInfo();
        return sessionInfo.idToken;
    }

    private getToken() {
        const sessionInfo = SessionUtils.getSessionInfo();
        return sessionInfo.accessToken;
    }

    private getLogoutRedirectUrl() {
        return window.location.origin;
    }

    private getRandomString(length: number = 64) {
        let retVal = "";
        const charDomain = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";       
        for (let i = 0; i < length; i++) {
            retVal += charDomain.charAt(Math.floor(Math.random() * charDomain.length));
        }
        return retVal;
    }
}


/*
    https://dev-92274704.okta.com/oauth2/default/v1/authorize
        ?client_id=0oa2gfmv78peGnHEy5d7
        &code_challenge=6YpQDVD1nVjGkT07QJv2YYWZqUjMGDifyRdUcIo6DBM
        &code_challenge_method=S256
        &nonce=8HhsyZz23S0oEk3ukxJhww5aviftt6jfOJhCs30kj4SpWOUtjQbeukvwI9hgedVG
        &redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin%2Fcallback
        &response_type=code
        &state=E8sqiucDoso24oV1G34E3LQ96Nxg5olPjv4Dqgy26GTyx5Gc8ieZUp8akAGWtcw2
        &scope=openid%20profile%20email
*/
