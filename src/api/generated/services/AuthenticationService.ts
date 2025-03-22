/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailLoginDto } from '../models/EmailLoginDto';
import type { SendEmailLoginCodeDto } from '../models/SendEmailLoginCodeDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Send Email Verification Code
     * @returns any
     * @throws ApiError
     */
    public authControllerSendEmailLoginCode({
        requestBody,
    }: {
        requestBody: SendEmailLoginCodeDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/verification/email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Login
     * @returns any
     * @throws ApiError
     */
    public authControllerLogin({
        requestBody,
    }: {
        requestBody: EmailLoginDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/login/email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Logout Current Device
     * @returns any
     * @throws ApiError
     */
    public authControllerLogout(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/logout',
        });
    }
    /**
     * Logout All Devices
     * @returns any
     * @throws ApiError
     */
    public authControllerLogoutAll(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/logout/all',
        });
    }
    /**
     * Get Current User
     * @returns any
     * @throws ApiError
     */
    public authControllerAccount(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/self',
        });
    }
}
