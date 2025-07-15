/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmailBindDto } from '../models/EmailBindDto';
import type { EmailLoginDto } from '../models/EmailLoginDto';
import type { GetPublicUserInfoResponseDto } from '../models/GetPublicUserInfoResponseDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { SendEmailLoginCodeDto } from '../models/SendEmailLoginCodeDto';
import type { UpdateDisplayNameDto } from '../models/UpdateDisplayNameDto';
import type { UserResponseDto } from '../models/UserResponseDto';
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
            url: '/auth/email/login/send-verification-code',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Login
     * @returns LoginResponseDto
     * @throws ApiError
     */
    public authControllerLogin({
        requestBody,
    }: {
        requestBody: EmailLoginDto,
    }): CancelablePromise<LoginResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/email/login/verify-code',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Send Email Bind Verification Code
     * @returns any
     * @throws ApiError
     */
    public authControllerSendEmailBindVerificationCode({
        requestBody,
    }: {
        requestBody: SendEmailLoginCodeDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/email/bind/send-verify-code',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Bind Email
     * @returns UserResponseDto
     * @throws ApiError
     */
    public authControllerBindEmail({
        requestBody,
    }: {
        requestBody: EmailBindDto,
    }): CancelablePromise<UserResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/email/bind/verify-code',
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
     * @returns UserResponseDto
     * @throws ApiError
     */
    public authControllerAccount(): CancelablePromise<UserResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/self',
        });
    }
    /**
     * Update User Display Name
     * @returns UserResponseDto
     * @throws ApiError
     */
    public authControllerUpdateDisplayName({
        requestBody,
    }: {
        requestBody: UpdateDisplayNameDto,
    }): CancelablePromise<UserResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/auth/self/displayName',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get User Public Info By Target User UID
     * @returns GetPublicUserInfoResponseDto
     * @throws ApiError
     */
    public authControllerGetPublicUserInfo({
        uid,
    }: {
        uid: string,
    }): CancelablePromise<GetPublicUserInfoResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/public/{uid}',
            path: {
                'uid': uid,
            },
        });
    }
}
