/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IOAuth2LoginDto } from '../models/IOAuth2LoginDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { UserResponseDto } from '../models/UserResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FeishuAuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get Feishu OAuth Config
     * @returns any
     * @throws ApiError
     */
    public feishuAuthControllerGetFeishuConfig({
        action,
    }: {
        action: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/feishu/config/{action}',
            path: {
                'action': action,
            },
        });
    }
    /**
     * Feishu OAuth Login
     * @returns LoginResponseDto
     * @throws ApiError
     */
    public feishuAuthControllerFeishuLogin({
        requestBody,
    }: {
        requestBody: IOAuth2LoginDto,
    }): CancelablePromise<LoginResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/feishu/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Feishu OAuth Bind
     * @returns UserResponseDto
     * @throws ApiError
     */
    public feishuAuthControllerFeishuBind({
        requestBody,
    }: {
        requestBody: IOAuth2LoginDto,
    }): CancelablePromise<UserResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/feishu/bind',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
