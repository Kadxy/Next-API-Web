import { FC } from 'react';
import {
    Typography,
    Space,
    Divider,
} from '@douyinfe/semi-ui';

const { Title, Text } = Typography;


const BankTransferTab: FC = () => {
    return (
        <div style={{ width: '100%', maxWidth: 700 }}>
            <Title heading={4}>收款账户信息</Title>

            <Space vertical align="start" style={{ width: '100%', marginTop: 24 }} spacing={24}>
                <Space vertical align="start" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', marginBottom: 12 }}>
                        <Text style={{ width: 110, color: '#666' }}>银行账户名称</Text>
                        <Text strong>XXXX有限公司</Text>
                    </div>
                    <div style={{ display: 'flex', marginBottom: 12 }}>
                        <Text style={{ width: 110, color: '#666' }}>开户银行</Text>
                        <Text strong>招商银行股份有限公司杭州分行</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Text style={{ width: 110, color: '#666' }}>银行账号</Text>
                        <Text strong > <Text link>企业认证</Text>后获取专属账号</Text>
                    </div>
                </Space>
                <Divider />
                <Space vertical style={{ width: '100%' }} spacing={16} align="start">
                    <Title heading={5} type="secondary">注意事项</Title>
                    <Space vertical align="start" spacing={12}>
                        <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                            1. 请在汇款时备注您的注册邮箱或用户ID，以便我们及时确认您的款项。
                        </Text>
                        <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                            2. 对公汇款通常需要1-3个工作日到账，到账后我们会尽快为您充值。
                        </Text>
                        <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                            3. 如有任何疑问，请联系客服 support@example.com。
                        </Text>
                    </Space>
                </Space>
            </Space>
        </div>
    );
};

export default BankTransferTab; 