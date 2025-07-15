import { FC, useState } from 'react';
import { Avatar, Card, Col, Input, Row, Space, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import { useAuth } from '../../lib/context/hooks';
import { getDayjsEasyRead, getDayjsFormat, getDefaultAvatar, getErrorMsg } from '../../utils';
import { IconClose, IconEdit, IconIdentity, IconSpin, IconTick } from "@douyinfe/semi-icons";
import { getServerApi, handleResponse } from '../../api/utils';

const { Title, Text, Paragraph } = Typography;

const AccountInfo: FC = () => {
    const { user, setUser } = useAuth();

    // 用户名编辑状态
    const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
    const [isChangingDisplayName, setIsChangingDisplayName] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');

    // 开始编辑用户名
    const handleEditDisplayName = () => {
        setNewDisplayName(user?.displayName || '');
        setIsEditingDisplayName(true);
    };

    // 取消编辑用户名
    const handleCancelEdit = () => {
        setIsEditingDisplayName(false);
        setNewDisplayName('');
    };

    // 保存用户名
    const handleSaveDisplayName = async () => {
        if (!newDisplayName.trim()) {
            Toast.error({ content: '用户名不能为空' });
            return;
        }

        if (newDisplayName.trim() === user?.displayName) {
            setIsEditingDisplayName(false);
            return;
        }

        setIsChangingDisplayName(true)

        try {
            await handleResponse(
                getServerApi().authentication.authControllerUpdateDisplayName({
                    requestBody: { displayName: newDisplayName.trim() }
                }),
                {
                    onSuccess: (data) => {
                        setUser(data);
                        setIsEditingDisplayName(false);
                        Toast.success({ content: '用户名更新成功' });
                    },
                    onError: (errorMsg) => {
                        Toast.error({ content: errorMsg });
                    }
                }
            );
        } catch (error) {
            Toast.error({ content: getErrorMsg(error, '更新用户名失败') });
        } finally {
            setIsChangingDisplayName(false)
        }
    };

    if (!user) {
        return null;
    }

    return (
        <Card
            title="账户信息"
            style={{ width: '100%' }}
        >
            <Row gutter={16}>
                {/* 基本信息 */}
                <Col span={16}>
                    <Space spacing='medium' align='center'>
                        {/* 头像 */}
                        {user.avatar ? (
                            <Avatar style={{ width: 60, height: 60 }} shape="circle" src={user?.avatar} />
                        ) : (
                            getDefaultAvatar(user.displayName)
                        )}
                        {/* 用户名 和 UID */}
                        <Space vertical align="start" >
                            <Space align="center">
                                {isEditingDisplayName ? (
                                    <Space>
                                        <Input
                                            value={newDisplayName}
                                            onChange={setNewDisplayName}
                                            placeholder="请输入用户名"
                                            style={{ width: 200 }}
                                            disabled={isChangingDisplayName}
                                        />
                                        {isChangingDisplayName ?
                                            <IconSpin spin />
                                            :
                                            (
                                                <>
                                                    <IconTick
                                                        style={{ cursor: 'pointer', color: 'var( --semi-color-success)' }}
                                                        onClick={handleSaveDisplayName}
                                                    />
                                                    <IconClose
                                                        style={{ cursor: 'pointer', color: 'var( --semi-color-danger)' }}
                                                        onClick={handleCancelEdit}
                                                    />
                                                </>)}
                                    </Space>
                                ) : (
                                    <Space>
                                        <Title heading={3}>
                                            {user.displayName}
                                        </Title>
                                        <Text link={{ onClick: handleEditDisplayName }}>
                                            <IconEdit style={{ color: 'var(--semi-color-text-2)' }} />
                                        </Text>
                                    </Space>
                                )}
                            </Space>
                            <Paragraph
                                copyable={{
                                    content: user.uid,
                                    render: (copied, doCopy, config) => {
                                        return (
                                            <Tag
                                                color='grey'
                                                prefixIcon={copied ? <IconTick /> : <IconIdentity />}
                                                onClick={doCopy}
                                                style={{ cursor: 'pointer' }}
                                                size='large'
                                            >
                                                {copied ? '复制成功！' : config.content}&nbsp;
                                            </Tag>
                                        );
                                    }
                                }}
                            />
                        </Space>
                    </Space>
                </Col>

                {/* 注册时间和登出按钮 */}
                <Col span={8}>
                    <Space vertical align="end" style={{ width: '100%' }}>
                        <Space vertical align='start'>
                            <Text type="tertiary" size="small">
                                上次登录: {getDayjsEasyRead(user.lastLoginAt)}
                            </Text>
                            <Text type="tertiary" size="small">
                                注册时间: {getDayjsFormat(user.createdAt, 'YYYY年MM月DD日')}
                            </Text>
                        </Space>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
};

export default AccountInfo; 