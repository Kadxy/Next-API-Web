/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IOAuth2LoginDto } from '../models/IOAuth2LoginDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { UserResponseDto } from '../models/UserResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class MicrosoftAuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get Microsoft OAuth Config
     * @returns any
     * @throws ApiError
     */
    public microsoftAuthControllerGetMicrosoftConfig({
        action,
    }: {
        action: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/microsoft/config/{action}',
            path: {
                'action': action,
            },
        });
    }
    /**
     * Microsoft OAuth Login
     * @returns LoginResponseDto
     * @throws ApiError
     */
    public microsoftAuthControllerMicrosoftLogin({
        requestBody,
    }: {
        requestBody: IOAuth2LoginDto,
    }): CancelablePromise<LoginResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/microsoft/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Microsoft OAuth Bind
     * @returns UserResponseDto
     * @throws ApiError
     */
    public microsoftAuthControllerMicrosoftBind({
        requestBody,
    }: {
        requestBody: IOAuth2LoginDto,
    }): CancelablePromise<UserResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/microsoft/bind',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
