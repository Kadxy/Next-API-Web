export enum AuthMethod {
    Email,
    Github,
    Google,
    Feishu,
    Passkey
}

export type OAuthPlatform = AuthMethod.Github | AuthMethod.Google | AuthMethod.Feishu;