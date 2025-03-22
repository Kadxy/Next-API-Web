/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GitHubAuthDto } from '../models/GitHubAuthDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class GitHubAuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * GitHub OAuth Login
     * @returns any
     * @throws ApiError
     */
    public gitHubAuthControllerGithubLogin({
        requestBody,
    }: {
        requestBody: GitHubAuthDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/github/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get GitHub OAuth Config
     * @returns any
     * @throws ApiError
     */
    public gitHubAuthControllerGetGithubConfig(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/github/config',
        });
    }
}
