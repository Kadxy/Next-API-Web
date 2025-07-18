import { FC, useState, useEffect } from 'react';
import { Button, Card, Empty, List, Modal, Toast, Typography, Input, Space } from '@douyinfe/semi-ui';
import Icon, { IconDelete, IconEdit } from '@douyinfe/semi-icons';
import { startRegistration, PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';
import { ListPasskeysResponseData } from '../../api/generated';
import { getServerApi, handleResponse } from '../../api/utils';
import { IllustrationNoContent, IllustrationNoContentDark } from '@douyinfe/semi-illustrations';
// @ts-expect-error handle svg file
import PasskeyIcon from '@/assets/icons/passkey.svg?react';
import { getDayjsEasyRead, getDayjsFormat, getErrorMsg } from '../../utils';

const { Text, Title } = Typography;

const PasskeyManager: FC = () => {
    const [passkeys, setPasskeys] = useState<ListPasskeysResponseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [editingPasskeyId, setEditingPasskeyId] = useState<string | null>(null);
    const [newDisplayName, setNewDisplayName] = useState('');
    const api = getServerApi();

    // 加载用户的passkey列表
    useEffect(() => {
        fetchUserPasskeys().then();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 获取用户的passkey列表
    const fetchUserPasskeys = async () => {
        setIsLoading(true);
        try {
            await handleResponse(api.passkeyAuthentication.passkeyControllerGetUserPasskeys(), {
                onSuccess: (data) => setPasskeys(data || []),
                onError: (errorMsg) => {
                    Toast.error({ content: errorMsg })
                }
            });
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '获取通行密钥列表失败') });
        } finally {
            setIsLoading(false);
        }
    };

    // 更新passkey名称
    const handleUpdatePasskeyDisplayName = async (id: string, displayName: string) => {
        try {
            await handleResponse(api.passkeyAuthentication.passkeyControllerUpdatePasskeyDisplayName({ id, requestBody: { displayName } }), {
                onSuccess: async () => {
                    await fetchUserPasskeys();
                    setEditingPasskeyId(null);
                    Toast.success({ content: '更新成功' });
                },
                onError: (errorMsg) => {
                    Toast.error({ content: errorMsg })
                }
            });
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '更新失败') });
        }
    };

    // 打开编辑名称对话框
    const openEditNameModal = (passkey: ListPasskeysResponseData) => {
        setEditingPasskeyId(passkey.id);
        setNewDisplayName(passkey.displayName || '');
    };

    // 删除通行密钥
    const handleDeletePasskey = async (id: string) => {
        Modal.confirm({
            title: '确定要删除这个通行密钥吗?',
            content: '删除后将无法使用此通行密钥登录',
            centered: true,
            onOk: async () => {
                try {
                    await handleResponse(api.passkeyAuthentication.passkeyControllerDeletePasskey({ id }), {
                        onSuccess: async () => {
                            await fetchUserPasskeys();
                            Toast.success({ content: '删除成功', stack: true });
                        },
                        onError: (errorMsg) => {
                            Toast.error({ content: errorMsg, stack: true })
                        }
                    });
                } catch (error) {
                    Toast.error({ content: getErrorMsg(error, '删除失败') });
                }
            },
            cancelButtonProps: { theme: 'borderless' }
        });
    };

    // 注册新通行密钥
    const handleRegisterPasskey = async () => {
        setIsRegistering(true);
        try {
            // 1. 获取注册选项
            await handleResponse(api.passkeyAuthentication.passkeyControllerGenerateRegistrationOptions(), {
                onSuccess: async (options) => {
                    if (!options) return;

                    try {
                        // 2. 启动注册流程
                        const registrationResponse = await startRegistration({
                            optionsJSON: options as PublicKeyCredentialCreationOptionsJSON
                        });

                        // 3. 发送注册响应到服务器进行验证
                        await handleResponse(api.passkeyAuthentication.passkeyControllerVerifyRegistrationResponse({
                            requestBody: registrationResponse
                        }), {
                            onSuccess: async () => {
                                await fetchUserPasskeys();
                                Toast.success({ content: '添加成功' });
                            },
                            onError: (errorMsg) => {
                                Toast.error({ content: errorMsg })
                            }
                        });
                    } catch (error) {
                        Toast.error({ content: getErrorMsg(error, '添加失败') });
                    }
                },
                onError: (errorMsg) => {
                    Toast.error({ content: errorMsg })
                }
            });
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '无法启动通行密钥注册') });
        } finally {
            setIsRegistering(false);
        }
    };

    // 渲染通行密钥列表项
    const renderPasskeyItem = (passkey: ListPasskeysResponseData) => {
        return (
            <List.Item
                style={{ padding: 10 }}
                main={(
                    <Space align='center'>
                        <Icon
                            svg={<PasskeyIcon style={{ width: 24, height: 24 }} />}
                            style={{ margin: '0 4px' }}
                        />
                        <Space vertical align="start" spacing={2}>
                            <Title heading={6}>
                                {passkey.displayName || passkey.id}
                            </Title>
                            <Text type='tertiary' size="small">
                                添加于: {getDayjsFormat(passkey.createdAt)} | 上次使用: {getDayjsEasyRead(passkey.lastUsedAt)}
                            </Text>
                        </Space>
                    </Space>
                )}
                extra={
                    <Space>
                        <Button
                            type="tertiary"
                            icon={<IconEdit />}
                            onClick={() => openEditNameModal(passkey)}
                        />
                        <Button
                            type="danger"
                            icon={<IconDelete />}
                            onClick={() => handleDeletePasskey(passkey.id)}
                        />
                    </Space >
                }
            />
        );
    };

    return (
        <Card
            title="通行密钥"
            style={{ width: '100%' }}
            // 防止模态框打开时因fetchUserPasskeys触发loading状态导致不必要渲染和模态框提前关闭问题
            loading={isLoading && !editingPasskeyId}
            headerExtraContent={
                <Button
                    loading={isRegistering}
                    onClick={handleRegisterPasskey}
                    style={{ margin: '-10px 0' }}
                >
                    添加通行密钥
                </Button>
            }
        >
            <>
                {passkeys.length > 0 ? (
                    <List
                        size='small'
                        dataSource={passkeys}
                        renderItem={renderPasskeyItem}
                        style={{ margin: -16 }}
                    />
                ) : (
                    <Empty
                        title='您还没有添加通行密钥'
                        description='通行密钥是使用触摸、人脸识别、设备密码或 PIN 验证您身份的 WebAuthn 凭据。它们可以用作密码的替代或作为双因素身份验证的方法。'
                        image={<IllustrationNoContent style={{ width: 90, height: 90 }} />}
                        darkModeImage={<IllustrationNoContentDark style={{ width: 90, height: 90 }} />}
                        style={{ padding: 24 }}
                        layout="horizontal"
                    />
                )}
            </>

            {/* 编辑名称对话框 */}
            <Modal
                title="编辑通行密钥名称"
                visible={!!editingPasskeyId}
                onOk={() => handleUpdatePasskeyDisplayName(editingPasskeyId!, newDisplayName)}
                onCancel={() => setEditingPasskeyId(null)}
                centered
                cancelButtonProps={{ theme: 'borderless' }}
            >
                <Input
                    placeholder="请输入新的名称"
                    value={newDisplayName}
                    onChange={setNewDisplayName}
                />
            </Modal>
        </Card >
    );
};

export default PasskeyManager;

