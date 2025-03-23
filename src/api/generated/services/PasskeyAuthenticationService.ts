/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
    public passkeyControllerVerifyRegistrationResponse(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/passkey/register',
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
     * @returns any
     * @throws ApiError
     */
    public passkeyControllerVerifyAuthenticationResponse({
        state,
    }: {
        /**
         * random string
         */
        state: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/passkey/authentication',
            path: {
                'state': state,
            },
        });
    }
    /**
     * List User Passkeys
     * @returns any
     * @throws ApiError
     */
    public passkeyControllerGetUserPasskeys(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/passkey/list',
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
