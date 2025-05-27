/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ListWalletResponseDto } from '../models/ListWalletResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class WalletService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * 获取用户可访问的钱包列表
     * @returns ListWalletResponseDto
     * @throws ApiError
     */
    public walletControllerGetWallets(): CancelablePromise<ListWalletResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/wallet',
        });
    }
}
