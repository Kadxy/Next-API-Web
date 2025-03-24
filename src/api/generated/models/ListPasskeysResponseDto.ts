/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ListPasskeysResponseData } from './ListPasskeysResponseData';
export type ListPasskeysResponseDto = {
    /**
     * Operation Success
     */
    success: boolean;
    /**
     * Error Message, only when success is false
     */
    msg: string;
    /**
     * List Passkeys Response
     */
    data: Array<ListPasskeysResponseData>;
};

