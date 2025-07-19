/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import { ApikeyService } from './services/ApikeyService';
import { AuthenticationService } from './services/AuthenticationService';
import { EpayService } from './services/EpayService';
import { FeishuAuthenticationService } from './services/FeishuAuthenticationService';
import { FishAudioService } from './services/FishAudioService';
import { GitHubAuthenticationService } from './services/GitHubAuthenticationService';
import { GoogleAuthenticationService } from './services/GoogleAuthenticationService';
import { MicrosoftAuthenticationService } from './services/MicrosoftAuthenticationService';
import { OpenAiService } from './services/OpenAiService';
import { PasskeyAuthenticationService } from './services/PasskeyAuthenticationService';
import { RedemptionService } from './services/RedemptionService';
import { TransactionService } from './services/TransactionService';
import { WalletService } from './services/WalletService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class ServerAPI {
    public readonly apikey: ApikeyService;
    public readonly authentication: AuthenticationService;
    public readonly epay: EpayService;
    public readonly feishuAuthentication: FeishuAuthenticationService;
    public readonly fishAudio: FishAudioService;
    public readonly gitHubAuthentication: GitHubAuthenticationService;
    public readonly googleAuthentication: GoogleAuthenticationService;
    public readonly microsoftAuthentication: MicrosoftAuthenticationService;
    public readonly openAi: OpenAiService;
    public readonly passkeyAuthentication: PasskeyAuthenticationService;
    public readonly redemption: RedemptionService;
    public readonly transaction: TransactionService;
    public readonly wallet: WalletService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'http://localhost:9527',
            VERSION: config?.VERSION ?? '1.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.apikey = new ApikeyService(this.request);
        this.authentication = new AuthenticationService(this.request);
        this.epay = new EpayService(this.request);
        this.feishuAuthentication = new FeishuAuthenticationService(this.request);
        this.fishAudio = new FishAudioService(this.request);
        this.gitHubAuthentication = new GitHubAuthenticationService(this.request);
        this.googleAuthentication = new GoogleAuthenticationService(this.request);
        this.microsoftAuthentication = new MicrosoftAuthenticationService(this.request);
        this.openAi = new OpenAiService(this.request);
        this.passkeyAuthentication = new PasskeyAuthenticationService(this.request);
        this.redemption = new RedemptionService(this.request);
        this.transaction = new TransactionService(this.request);
        this.wallet = new WalletService(this.request);
    }
}

