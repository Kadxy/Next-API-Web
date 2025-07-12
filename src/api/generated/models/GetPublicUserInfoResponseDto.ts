/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicUserInfoData } from './PublicUserInfoData';
export type GetPublicUserInfoResponseDto = {
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
    data: PublicUserInfoData;
};

