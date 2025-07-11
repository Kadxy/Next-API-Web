import {FC, useState} from 'react';
import {Avatar, Button, Card, Col, Input, Modal, Row, Space, Toast, Typography} from '@douyinfe/semi-ui';
import {useLocation, useNavigate} from 'react-router-dom';
import {Path} from '../../lib/constants/paths';
import {useAuth} from '../../lib/context/hooks';
import {getDayjsEasyRead, getDayjsFormat, getDefaultAvatar, getErrorMsg} from '../../utils';
import {IconClose, IconEdit, IconSpin, IconTick} from "@douyinfe/semi-icons";
import {getServerApi, handleResponse} from '../../api/utils';

const {Title, Text} = Typography;

const AccountInfo: FC = () => {
    const {user, logout, setUser} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
            Toast.error({content: '用户名不能为空'});
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
                    requestBody: {displayName: newDisplayName.trim()}
                }),
                {
                    onSuccess: (data) => {
                        setUser(data);
                        setIsEditingDisplayName(false);
                        Toast.success({content: '用户名更新成功'});
                    },
                    onError: (errorMsg) => {
                        Toast.error({content: errorMsg});
                    }
                }
            );
        } catch (error) {
            Toast.error({content: getErrorMsg(error, '更新用户名失败')});
        } finally {
            setIsChangingDisplayName(false)
        }
    };

    const handleLogout = async (isLogoutAll = false) => {
        Modal.error({
            centered: true,
            title: `确定要${isLogoutAll ? '从所有设备' : ''}登出吗?`,
            content: `您在${isLogoutAll ? '所有已登录设备' : '当前设备'}上的登录将被登出，下次登录时需要重新登录`,
            onOk: async () => {
                await logout(isLogoutAll);
                navigate(Path.LOGIN, {state: {from: location}});
            },
            cancelButtonProps: {theme: 'borderless'}
        });
    };

    if (!user) {
        return null;
    }

    return (
        <Card
            title="账户信息"
            style={{width: '100%'}}
        >
            <Row gutter={16}>
                {/* 基本信息 */}
                <Col span={16}>
                    <Space spacing='medium' align='start'>
                        {/* 头像 */}
                        {user.avatar ? (
                            <Avatar style={{width: 48, height: 48}} shape="circle" src={user?.avatar}/>
                        ) : (
                            getDefaultAvatar(user.displayName)
                        )}
                        {/* 用户名 和 UID */}
                        <Space vertical align="start">
                            <Space>
                                {isEditingDisplayName ? (
                                    <Space>
                                        <Input
                                            value={newDisplayName}
                                            onChange={setNewDisplayName}
                                            placeholder="请输入用户名"
                                            style={{width: 200}}
                                            disabled={isChangingDisplayName}
                                        />
                                        {isChangingDisplayName ?
                                            <IconSpin spin/>
                                            :
                                            (
                                                <>
                                                    <IconTick
                                                        style={{cursor: 'pointer', color: '#52c41a'}}
                                                        onClick={handleSaveDisplayName}
                                                    />
                                                    <IconClose
                                                        style={{cursor: 'pointer', color: '#ff4d4f'}}
                                                        onClick={handleCancelEdit}
                                                    />
                                                </>)}
                                    </Space>
                                ) : (
                                    <>
                                        <Title heading={3}>
                                            {user.displayName}
                                        </Title>
                                        <IconEdit
                                            style={{cursor: 'pointer'}}
                                            onClick={handleEditDisplayName}
                                        />
                                    </>
                                )}
                            </Space>
                            <Text type="secondary" copyable>
                                {user.uid}
                            </Text>
                        </Space>
                    </Space>
                </Col>

                {/* 注册时间和登出按钮 */}
                <Col span={8}>
                    <Space vertical align="end" style={{width: '100%'}}>
                        <Space vertical align='start'>
                            <Text type="tertiary" size="small">
                                注册时间: {getDayjsFormat(user.createdAt, 'YYYY年MM月DD日')}
                            </Text>
                            <Text type="tertiary" size="small">
                                上次登录: {getDayjsEasyRead(user.lastLoginAt)}
                            </Text>
                        </Space>
                        <Space>
                            <Button
                                type="danger"
                                onClick={() => handleLogout(false)}
                            >
                                退出登录
                            </Button>
                            <Button
                                type="danger"
                                onClick={() => handleLogout(true)}
                            >
                                从所有设备登出
                            </Button>
                        </Space>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
};

export default AccountInfo; 