export enum AuthMethod {
    Email,
    Github,
    Google,
    Feishu,
    Microsoft,
    Passkey
}

export type OAuthPlatform = AuthMethod.Github | AuthMethod.Google | AuthMethod.Feishu | AuthMethod.Microsoft;