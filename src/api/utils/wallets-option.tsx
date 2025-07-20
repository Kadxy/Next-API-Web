import { Space, Avatar, Typography } from "@douyinfe/semi-ui";
import { getServerApi, handleResponse } from ".";
import { getDefaultAvatar } from "../../utils";
import { ReactNode } from "react";

export const getWalletsOption = async (onError?: (msg: string) => void, includeMore = false) => {
    let options: { label: string; value: string; isOwner?: boolean }[] = [];

    if (includeMore) {
        // 使用 listWallets 获取更多信息
        await handleResponse(getServerApi().wallet.walletControllerGetWallets(), {
            onSuccess: (data) => {
                options = data.map((wallet) => ({
                    label: wallet.displayName,
                    value: wallet.uid,
                    isOwner: wallet.isOwner,
                }));
            },
            onError: (msg) => {
                onError?.(msg);
            }
        });
    } else {
        // 保持原有行为
        await handleResponse(getServerApi().wallet.walletControllerGetWallets(), {
            onSuccess: (data) => {
                options = data.map((wallet) => ({
                    label: wallet.displayName,
                    value: wallet.uid,
                }));
            },
            onError: (msg) => {
                onError?.(msg);
            }
        });
    }

    return options;
}

export const getWalletsOptionV2 = async (includeMore: boolean, onError?: (msg: string) => void) => {
    let options: { label: string; value: string; isOwner?: boolean }[] = [];

    await handleResponse(getServerApi().wallet.walletControllerGetWallets(), {
        onSuccess: (data) => {
            options = data.map((wallet) => ({
                label: wallet.displayName,
                value: wallet.uid,
                ...(includeMore ? { isOwner: wallet.isOwner } : {}),
            }));
        },
        onError: (msg) => {
            onError?.(msg);
        }
    });

    return options;
}

// 获取钱包成员选项
export const getWalletMembersOption = async (walletUid: string, onError?: (msg: string) => void) => {
    let options: { label: ReactNode; value: string; }[] = [];

    await handleResponse(getServerApi().wallet.walletControllerGetWalletDetail({ walletUid }), {
        onSuccess: (data) => {
            options = data.members.map((member) => ({
                value: member.user.uid,
                label: (
                    <Space>
                        {member.user.avatar ?
                            <Avatar size="extra-extra-small" src={member.user.avatar} /> :
                            getDefaultAvatar(member.user.displayName, 'extra-extra-small')
                        }
                        <Typography.Text strong>{member.user.displayName}</Typography.Text>
                    </Space>
                )
            }));
        },
        onError: (msg) => {
            onError?.(msg);
        }
    });

    return options;
}