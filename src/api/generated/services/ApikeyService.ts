/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateApiKeyRequestDto } from '../models/CreateApiKeyRequestDto';
import type { CreateApiKeyResponseDto } from '../models/CreateApiKeyResponseDto';
import type { ListApiKeyResponseDto } from '../models/ListApiKeyResponseDto';
import type { UpdateApiKeyDisplayNameResponseDto } from '../models/UpdateApiKeyDisplayNameResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ApikeyService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * 获取用户API密钥列表
     * @returns ListApiKeyResponseDto
     * @throws ApiError
     */
    public apikeyControllerGetApiKeys(): CancelablePromise<ListApiKeyResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/apikey',
        });
    }
    /**
     * 创建API密钥
     * @returns CreateApiKeyResponseDto
     * @throws ApiError
     */
    public apikeyControllerCreateApiKey({
        requestBody,
    }: {
        requestBody: CreateApiKeyRequestDto,
    }): CancelablePromise<CreateApiKeyResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/apikey',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 更新API密钥名称
     * @returns UpdateApiKeyDisplayNameResponseDto
     * @throws ApiError
     */
    public apikeyControllerUpdateApiKeyDisplayName({
        hashKey,
        requestBody,
    }: {
        hashKey: string,
        requestBody: CreateApiKeyRequestDto,
    }): CancelablePromise<UpdateApiKeyDisplayNameResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/apikey/{hashKey}',
            path: {
                'hashKey': hashKey,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 删除API密钥
     * @returns any
     * @throws ApiError
     */
    public apikeyControllerDeleteApiKey({
        hashKey,
    }: {
        hashKey: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/apikey/{hashKey}',
            path: {
                'hashKey': hashKey,
            },
        });
    }
}
