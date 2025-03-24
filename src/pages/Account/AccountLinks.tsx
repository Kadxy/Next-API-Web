import { FC, useState } from 'react';
import { Button, Card, List, Space, Tag, Typography } from '@douyinfe/semi-ui';
import Icon, { IconGithubLogo, IconLink, IconMail, IconUnlink } from '@douyinfe/semi-icons';
import { useAuth } from '../../lib/context/hooks';
// @ts-expect-error handle svg file
import GoogleIcon from '@/assets/icons/google.svg?react';

const { Text } = Typography;

interface AccountLinkItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    bound: boolean;
}
const AccountLinks: FC = () => {
    const { user } = useAuth();
    // 为未来的异步操作预留状态，但目前未使用
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

    const dataSource: AccountLinkItem[] = [
        {
            id: 'email',
            name: '邮箱',
            icon: <IconMail style={{ color: '#1677ff' }} />,
            bound: !!user?.email
        },
        {
            id: 'github',
            name: 'GitHub',
            icon: <IconGithubLogo style={{ color: '#24292e' }} />,
            bound: !!user?.gitHubId
        },
        {
            id: 'google',
            name: 'Google',
            icon: <Icon svg={<GoogleIcon />} />,
            bound: !!user?.googleId
        }
    ]

    const renderAccountLinkItem = (item: AccountLinkItem) => {
        return (
            <List.Item
                header={
                    <Space align="center">
                        {item.icon}
                        <Text strong>
                            {item.name}
                        </Text>
                        {item.bound && <Tag color="green">已绑定</Tag>}
                    </Space>
                }
                extra={
                    <Button
                        // 鼓励用户绑定，所以使用 secondary 而非 tertiary
                        type={item.bound ? 'danger' : 'secondary'}
                        icon={item.bound ? <IconUnlink /> : <IconLink />}
                        onClick={() => handleBindAccount(item.id)}
                        loading={isLoading[item.id]}
                        disabled={item.bound}
                    />
                }
            />
        )
    }

    // 绑定/解绑账号的处理函数（预留）
    const handleBindAccount = (type: string) => {
        // 实现绑定逻辑
        setIsLoading(prev => ({ ...prev, [type]: true }));
        console.log(`绑定 ${type} 账号`);
        // 模拟操作完成
        setTimeout(() => {
            setIsLoading(prev => ({ ...prev, [type]: false }));
        }, 1000);
    };

    return (
        <Card
            title="第三方账号"
            style={{ width: '100%' }}
        >
            <List
                size="small"
                split={false}
                dataSource={dataSource}
                renderItem={renderAccountLinkItem}
            />
        </Card>
    );
};

export default AccountLinks; 