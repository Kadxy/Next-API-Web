/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GoogleAuthDto } from '../models/GoogleAuthDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class GoogleAuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Google OAuth Login
     * @returns any
     * @throws ApiError
     */
    public googleAuthControllerGoogleLogin({
        requestBody,
    }: {
        requestBody: GoogleAuthDto,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/auth/google/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get Google OAuth Config
     * @returns any
     * @throws ApiError
     */
    public googleAuthControllerGetGoogleConfig(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/auth/google/config',
        });
    }
}
