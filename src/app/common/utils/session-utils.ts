import { SsoTokenResponse } from "../models/sso-token-response.model";
import { SessionInfo } from "../models/session-info.model";
import { SsoVerifyInfo } from "../models/sso-verify-info.model";

const SESSION_STORAGE_OBJ_SESSION_INFO = "sessionInfo";
const LOCAL_STORAGE_OBJ_SSO_VERIFY_INFO = "ssoVerifyInfo";

export class SessionUtils {
    public static getSessionInfo(): SessionInfo {
        let retVal = null;
        try {
            const sessionInfoStr = sessionStorage.getItem(SESSION_STORAGE_OBJ_SESSION_INFO);
            if (sessionInfoStr) {
                retVal = JSON.parse(sessionInfoStr);
            }
        } catch (e) {
        }
        return retVal;
    }

    public static saveSessionInfo(ssoTokenResponse: SsoTokenResponse) {
        sessionStorage.setItem(SESSION_STORAGE_OBJ_SESSION_INFO, JSON.stringify(ssoTokenResponse));
    }

    public static removeSessionInfo() {
        sessionStorage.removeItem(SESSION_STORAGE_OBJ_SESSION_INFO);
    }

    public static getSsoVerifyInfo(): SsoVerifyInfo {
        let retVal = null;
        try {
            const ssoVerifyInfoStr = localStorage.getItem(LOCAL_STORAGE_OBJ_SSO_VERIFY_INFO);
            if (ssoVerifyInfoStr) {
                retVal = JSON.parse(ssoVerifyInfoStr);
            }
        } catch (e) {
        }
        return retVal;
    }

    public static saveSsoVerifyInfo(ssoVerifyInfo: SsoVerifyInfo) {
        localStorage.setItem(LOCAL_STORAGE_OBJ_SSO_VERIFY_INFO, JSON.stringify(ssoVerifyInfo));
    }

    public static removeSsoVerifyInfo() {
        localStorage.removeItem(LOCAL_STORAGE_OBJ_SSO_VERIFY_INFO);
    }
}
