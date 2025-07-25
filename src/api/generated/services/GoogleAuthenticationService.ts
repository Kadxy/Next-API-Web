/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IOAuth2LoginDto } from '../models/IOAuth2LoginDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { UserResponseDto } from '../models/UserResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class GoogleAuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get Google OAuth Config
     * @returns any
     * @throws ApiError
     */
    public googleAuthControllerGetGoogleConfig({
        action,
    }: {
        action: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/google/config/{action}',
            path: {
                'action': action,
            },
        });
    }
    /**
     * Google OAuth Login
     * @returns LoginResponseDto
     * @throws ApiError
     */
    public googleAuthControllerGoogleLogin({
        requestBody,
    }: {
        requestBody: IOAuth2LoginDto,
    }): CancelablePromise<LoginResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/google/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Google OAuth Bind
     * @returns UserResponseDto
     * @throws ApiError
     */
    public googleAuthControllerGoogleBind({
        requestBody,
    }: {
        requestBody: IOAuth2LoginDto,
    }): CancelablePromise<UserResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/google/bind',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
