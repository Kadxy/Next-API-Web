/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FishAudioService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * 获取模型列表（透传）
     * @returns any
     * @throws ApiError
     */
    public fishAudioControllerGetModels(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/fish-audio/model',
        });
    }
    /**
     * TTS（流式透传）
     * @returns any
     * @throws ApiError
     */
    public fishAudioControllerHandleTts({
        xApiGripExternalTraceId,
        userAgent,
    }: {
        xApiGripExternalTraceId: string,
        userAgent: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/fish-audio/v1/tts',
            headers: {
                'X-APIGrip-ExternalTraceId': xApiGripExternalTraceId,
                'user-agent': userAgent,
            },
        });
    }
    /**
     * ASR（完全透传）
     * @returns any
     * @throws ApiError
     */
    public fishAudioControllerHandleAsr({
        xApiGripExternalTraceId,
        userAgent,
    }: {
        xApiGripExternalTraceId: string,
        userAgent: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/fish-audio/v1/asr',
            headers: {
                'X-APIGrip-ExternalTraceId': xApiGripExternalTraceId,
                'user-agent': userAgent,
            },
        });
    }
}
