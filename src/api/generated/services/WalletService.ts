/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddMemberDto } from '../models/AddMemberDto';
import type { BaseResponse } from '../models/BaseResponse';
import type { ListWalletResponseDto } from '../models/ListWalletResponseDto';
import type { UpdateMemberDto } from '../models/UpdateMemberDto';
import type { WalletDetailResponseDto } from '../models/WalletDetailResponseDto';
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
            url: '/wallets',
        });
    }
    /**
     * 获取钱包详情
     * @returns WalletDetailResponseDto
     * @throws ApiError
     */
    public walletControllerGetWalletDetail({
        walletUid,
    }: {
        walletUid: string,
    }): CancelablePromise<WalletDetailResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/wallets/{walletUid}',
            path: {
                'walletUid': walletUid,
            },
        });
    }
    /**
     * 添加钱包成员
     * @returns BaseResponse
     * @throws ApiError
     */
    public walletControllerAddMember({
        walletUid,
        memberUid,
        requestBody,
    }: {
        walletUid: string,
        memberUid: string,
        requestBody: AddMemberDto,
    }): CancelablePromise<BaseResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/wallets/{walletUid}/members/{memberUid}',
            path: {
                'walletUid': walletUid,
                'memberUid': memberUid,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 移除钱包成员
     * @returns BaseResponse
     * @throws ApiError
     */
    public walletControllerRemoveMember({
        walletUid,
        memberUid,
    }: {
        walletUid: string,
        memberUid: string,
    }): CancelablePromise<BaseResponse> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/wallets/{walletUid}/members/{memberUid}',
            path: {
                'walletUid': walletUid,
                'memberUid': memberUid,
            },
        });
    }
    /**
     * 更新钱包成员
     * @returns BaseResponse
     * @throws ApiError
     */
    public walletControllerUpdateMember({
        walletUid,
        memberUid,
        requestBody,
    }: {
        walletUid: string,
        memberUid: string,
        requestBody: UpdateMemberDto,
    }): CancelablePromise<BaseResponse> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/wallets/{walletUid}/members/{memberUid}',
            path: {
                'walletUid': walletUid,
                'memberUid': memberUid,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
