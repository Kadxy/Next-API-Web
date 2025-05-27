import { FC } from 'react';
import {
    Typography,
    Space,
    Input,
    Button,
    Divider,
} from '@douyinfe/semi-ui';
import { IconScan } from '@douyinfe/semi-icons';

const { Title, Text } = Typography;

export interface RedeemCodeTabProps {
    redeemCode: string;
    setRedeemCode: (value: string) => void;
    handleRedeem: () => void;
    setShowScanner: (show: boolean) => void;
    loading: boolean;
}

const RedeemCodeTab: FC<RedeemCodeTabProps> = ({
    redeemCode,
    setRedeemCode,
    handleRedeem,
    setShowScanner,
    loading,
}) => {
    return (
        <div style={{ width: '100%', maxWidth: 700 }}>
            <Title heading={4} style={{ marginBottom: 24 }}>使用兑换码</Title>

            <Space vertical align="start" style={{ width: '100%' }} spacing={24}>
                <Space spacing='tight' style={{ width: '100%' }}>
                    <Input
                        size="large"
                        value={redeemCode}
                        onChange={(value) => setRedeemCode(value)}
                        placeholder="请输入兑换码"
                        style={{ maxWidth: 286 }}
                        maxLength={24}
                        disabled={loading}
                        suffix={
                            <IconScan
                                style={{ cursor: 'pointer', color: '#0052d9', fontSize: 20 }}
                                onClick={() => setShowScanner(true)}
                            />
                        }
                    />
                    <Button
                        size="large"
                        type="primary"
                        onClick={handleRedeem}
                        loading={loading}
                        disabled={!redeemCode || loading} // also disable if loading
                    >
                        确认兑换
                    </Button>
                </Space>
                <Divider />
                <Space vertical style={{ width: '100%' }} spacing={16} align="start">
                    <Title heading={5} type="secondary">兑换说明</Title>
                    <Space vertical align="start" spacing={12}>
                        <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                            1. 兑换额度将充值到个人钱包中。
                        </Text>
                        <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                            2. 兑换成功后您将获得兑换码所含额度。
                        </Text>
                        <Text type="tertiary" style={{ lineHeight: 1.6 }}>
                            3. 每个兑换码仅限兑换一次，且兑换成功后不支持退款，请您谨慎操作。
                        </Text>
                    </Space>
                </Space>
            </Space>
        </div>
    );
};

export default RedeemCodeTab; 