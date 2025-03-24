import { FC, useState, useEffect } from 'react';
import { Button, Card, Empty, List, Modal, Toast, Typography, Input, Space } from '@douyinfe/semi-ui';
import Icon, { IconDelete, IconEdit } from '@douyinfe/semi-icons';
import { startRegistration, PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';
import { ListPasskeysResponseData } from '../../api/generated';
import { getServerApi, parseResponse } from '../../api/utils';
import { IllustrationNoContent, IllustrationNoContentDark } from '@douyinfe/semi-illustrations';
import dayjs from 'dayjs';
// @ts-expect-error handle svg file
import PasskeyIcon from '@/assets/icons/passkey_24.svg?react';
import { getErrorMsg } from '../../utils';

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
            parseResponse(await api.passkeyAuthentication.passkeyControllerGetUserPasskeys(), {
                onSuccess: (data) => setPasskeys(data || []),
                onError: (errorMsg) => Toast.error({ content: errorMsg })
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
            parseResponse(await api.passkeyAuthentication.passkeyControllerUpdatePasskeyDisplayName({ id, requestBody: { displayName } }), {
                onSuccess: () => {
                    fetchUserPasskeys();
                    Toast.success({ content: '更新成功' });
                    setEditingPasskeyId(null);
                },
                onError: (errorMsg) => Toast.error({ content: errorMsg })
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
            onOk: async () => {
                try {
                    parseResponse(await api.passkeyAuthentication.passkeyControllerDeletePasskey({ id }), {
                        onSuccess: async () => {
                            await fetchUserPasskeys();
                            Toast.success({ content: '删除成功', stack: true });
                        },
                        onError: (errorMsg) => Toast.error({ content: errorMsg, stack: true })
                    });
                } catch (error) {
                    Toast.error({ content: getErrorMsg(error, '删除失败') });
                }
            },
        });
    };

    // 注册新的通行密钥
    const handleRegisterPasskey = async () => {
        setIsRegistering(true);
        try {
            // 1. 获取注册选项
            parseResponse(await api.passkeyAuthentication.passkeyControllerGenerateRegistrationOptions(), {
                onSuccess: async (options) => {
                    if (!options) return;

                    try {
                        // 2. 启动注册流程
                        const registrationResponse = await startRegistration({
                            optionsJSON: options as PublicKeyCredentialCreationOptionsJSON
                        });

                        // 3. 发送注册响应到服务器进行验证
                        parseResponse(await api.passkeyAuthentication.passkeyControllerVerifyRegistrationResponse({
                            requestBody: registrationResponse
                        }), {
                            onSuccess: async () => {
                                await fetchUserPasskeys();
                                Toast.success({ content: '添加成功' });
                            },
                            onError: (errorMsg) => Toast.error({ content: errorMsg })
                        });
                    } catch (error) {
                        Toast.error({ content: getErrorMsg(error, '添加失败') });
                    }
                },
                onError: (errorMsg) => Toast.error({ content: errorMsg })
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
                main={
                    <Space vertical align="start">
                        <Space>
                            <Icon svg={<PasskeyIcon />} size='large' />
                            <Title heading={5} >
                                {passkey.displayName || passkey.id}
                            </Title>
                        </Space>
                        <Text type='tertiary'>
                            添加于: {dayjs(passkey.createdAt).format('YYYY年MM月DD日')} |
                            上次使用: {passkey.lastUsedAt ? dayjs(passkey.lastUsedAt).format('YYYY年MM月DD日') : '-'}
                        </Text>
                    </Space>
                }
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
                    </Space>
                }
            />
        );
    };

    return (
        <Card
            title="通行密钥"
            style={{ width: '100%' }}
            loading={isLoading}
            headerExtraContent={
                <Button
                    // 鼓励用户添加，所以使用 secondary 而非 tertiary
                    type="secondary"
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