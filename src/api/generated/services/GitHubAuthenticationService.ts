/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IOAuth2LoginDto } from '../models/IOAuth2LoginDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { UserResponseDto } from '../models/UserResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class GitHubAuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get GitHub OAuth Config
     * @returns any
     * @throws ApiError
     */
    public gitHubAuthControllerGetGithubConfig({
        action,
    }: {
        action: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/github/config/{action}',
            path: {
                'action': action,
            },
        });
    }
    /**
     * GitHub OAuth Login
     * @returns LoginResponseDto
     * @throws ApiError
     */
    public gitHubAuthControllerGithubLogin({
        requestBody,
    }: {
        requestBody: IOAuth2LoginDto,
    }): CancelablePromise<LoginResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/github/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * GitHub OAuth Bind
     * @returns UserResponseDto
     * @throws ApiError
     */
    public gitHubAuthControllerGithubBind({
        requestBody,
    }: {
        requestBody: IOAuth2LoginDto,
    }): CancelablePromise<UserResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/github/bind',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
