/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ListPasskeysResponseDto } from '../models/ListPasskeysResponseDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { Object } from '../models/Object';
import type { UpdatePasskeyDisplayNameRequestDto } from '../models/UpdatePasskeyDisplayNameRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PasskeyAuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Start Passkey Registration
     * @returns any
     * @throws ApiError
     */
    public passkeyControllerGenerateRegistrationOptions(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/passkey/register',
        });
    }
    /**
     * Complete Passkey Registration
     * @returns any
     * @throws ApiError
     */
    public passkeyControllerVerifyRegistrationResponse({
        requestBody,
    }: {
        requestBody: Object,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/passkey/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Start Passkey Authentication
     * @returns any
     * @throws ApiError
     */
    public passkeyControllerGenerateAuthenticationOptions(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/passkey/authentication',
        });
    }
    /**
     * Complete Passkey Authentication
     * @returns LoginResponseDto
     * @throws ApiError
     */
    public passkeyControllerVerifyAuthenticationResponse({
        state,
        requestBody,
    }: {
        state: string,
        requestBody: Object,
    }): CancelablePromise<LoginResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/passkey/authentication',
            query: {
                'state': state,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Start Passkey Authentication by Email
     * @returns any
     * @throws ApiError
     */
    public passkeyControllerGenerateAuthenticationOptionsByEmail({
        email,
    }: {
        email: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/passkey/authentication/{email}',
            path: {
                'email': email,
            },
        });
    }
    /**
     * List User Passkeys
     * @returns ListPasskeysResponseDto
     * @throws ApiError
     */
    public passkeyControllerGetUserPasskeys(): CancelablePromise<ListPasskeysResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/passkey',
        });
    }
    /**
     * Update Passkey Display Name
     * @returns any
     * @throws ApiError
     */
    public passkeyControllerUpdatePasskeyDisplayName({
        id,
        requestBody,
    }: {
        /**
         * Passkey ID
         */
        id: string,
        requestBody: UpdatePasskeyDisplayNameRequestDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/auth/passkey/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a Passkey
     * @returns any
     * @throws ApiError
     */
    public passkeyControllerDeletePasskey({
        id,
    }: {
        /**
         * Passkey ID
         */
        id: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/auth/passkey/{id}',
            path: {
                'id': id,
            },
        });
    }
}
