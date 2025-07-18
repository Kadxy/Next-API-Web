/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OpenAiService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * chat completion api
     * @returns any
     * @throws ApiError
     */
    public openAiControllerHandleChatCompletions({
        xApiGripExternalTraceId,
        userAgent,
    }: {
        xApiGripExternalTraceId: string,
        userAgent: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/openai/v1/chat/completions',
            headers: {
                'X-APIGrip-ExternalTraceId': xApiGripExternalTraceId,
                'user-agent': userAgent,
            },
        });
    }
}
