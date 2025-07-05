/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BillingService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get billing statistics (Admin only)
     * @returns any
     * @throws ApiError
     */
    public billingControllerGetBillingStats(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/billing/stats',
        });
    }
}
