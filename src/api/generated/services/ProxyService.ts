/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ProxyService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * 获取可用的模型列表
     * @returns any
     * @throws ApiError
     */
    public proxyControllerGetModels(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/models',
        });
    }
    /**
     * chat completion api
     * @returns any
     * @throws ApiError
     */
    public proxyControllerHandleChatCompletions({
        xApiGripExternalTraceId,
    }: {
        xApiGripExternalTraceId: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/chat/completions',
            headers: {
                'X-APIGrip-ExternalTraceId': xApiGripExternalTraceId,
            },
        });
    }
}
