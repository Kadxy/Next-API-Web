/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ListApiKeyResponseItemData } from './ListApiKeyResponseItemData';
export type UpdateApiKeyDisplayNameResponseDto = {
    /**
     * Operation Success
     */
    success: boolean;
    /**
     * Error Message, only when success is false
     */
    msg: string;
    /**
     * Response data, only when success is true
     */
    data: ListApiKeyResponseItemData;
};

