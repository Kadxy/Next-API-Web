import { FC, useState } from 'react';
import {
    Form,
    Button,
    Space,
    DatePicker,
    useFormApi,
    Select,
    Typography
} from '@douyinfe/semi-ui';
import { IconSearch, IconRefresh, IconUser, IconCreditCard } from '@douyinfe/semi-icons';

const { Text } = Typography;

interface TransactionFiltersProps {
    onFilter: (filters: {
        startTime?: string;
        endTime?: string;
        type?: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT' | 'SUBSCRIPTION' | 'OTHER';
        status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
        userUid?: string;
    }) => void;
    loading?: boolean;
    showUserFilter?: boolean;
    walletOptions: { label: string; value: string; isOwner: boolean }[];
    selectedWallet: string;
    onWalletChange: (walletUid: string) => void;
}

// 交易类型选项
const TRANSACTION_TYPE_OPTIONS = [
    { label: '充值', value: 'RECHARGE' },
    { label: '兑换', value: 'REDEMPTION' },
    { label: '消费', value: 'CONSUME' },
    { label: '退款', value: 'REFUND' },
    { label: '调整', value: 'ADJUSTMENT' },
    { label: '订阅', value: 'SUBSCRIPTION' },
    { label: '其他', value: 'OTHER' }
];

// 交易状态选项
const TRANSACTION_STATUS_OPTIONS = [
    { label: '待处理', value: 'PENDING' },
    { label: '处理中', value: 'PROCESSING' },
    { label: '已完成', value: 'COMPLETED' },
    { label: '失败', value: 'FAILED' },
    { label: '已取消', value: 'CANCELLED' }
];

// 内部组件，用于访问 Form API
const FilterFormContent: FC<{
    onFilter: TransactionFiltersProps['onFilter'];
    loading: boolean;
    showUserFilter: boolean;
    hasFilters: boolean;
    setHasFilters: (value: boolean) => void;
    walletOptions: TransactionFiltersProps['walletOptions'];
    selectedWallet: string;
    onWalletChange: TransactionFiltersProps['onWalletChange'];
}> = ({ onFilter, loading, showUserFilter, hasFilters, setHasFilters, walletOptions, selectedWallet, onWalletChange }) => {
    const formApi = useFormApi();

    // 处理筛选提交
    const handleSubmit = (values: Record<string, unknown>) => {
        const filters: {
            startTime?: string;
            endTime?: string;
            type?: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT' | 'SUBSCRIPTION' | 'OTHER';
            status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
            userUid?: string;
        } = {};

        // 处理日期范围
        if (values.dateRange && Array.isArray(values.dateRange) && values.dateRange.length === 2) {
            const dateRange = values.dateRange as Array<Date>;
            // 使用 ISO 字符串格式
            filters.startTime = dateRange[0].toISOString();
            filters.endTime = dateRange[1].toISOString();
        }

        // 处理其他筛选条件
        if (values.type) filters.type = values.type as typeof filters.type;
        if (values.status) filters.status = values.status as typeof filters.status;
        if (values.userUid) filters.userUid = values.userUid as string;

        setHasFilters(Object.keys(filters).length > 0);
        onFilter(filters);
    };

    // 重置筛选
    const handleReset = () => {
        formApi.reset();
        setHasFilters(false);
        onFilter({});
    };

    const handleSubmitClick = () => {
        const values = formApi.getValues();
        handleSubmit(values);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'end', gap: '16px', flexWrap: 'wrap' }}>
            {/* 查看范围 */}
            <div>
                <Text type="secondary" strong style={{ fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                    查看范围
                </Text>
                <Select
                    value={selectedWallet}
                    onChange={(value) => onWalletChange(value as string)}
                    style={{ width: 160 }}
                    optionList={walletOptions.map(option => ({
                        ...option,
                        label: (
                            <Space>
                                {option.value === 'self' ?
                                    <IconUser size="small" /> :
                                    <IconCreditCard size="small" />
                                }
                                {option.label}
                            </Space>
                        )
                    }))}
                />
            </div>

            {/* 交易类型 */}
            <div>
                <Text type="secondary" strong style={{ fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                    交易类型
                </Text>
                <Form.Select
                    field="type"
                    placeholder="选择类型"
                    style={{ width: 140 }}
                    optionList={TRANSACTION_TYPE_OPTIONS}
                    showClear
                />
            </div>

            {/* 交易状态 */}
            <div>
                <Text type="secondary" strong style={{ fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                    交易状态
                </Text>
                <Form.Select
                    field="status"
                    placeholder="选择状态"
                    style={{ width: 140 }}
                    optionList={TRANSACTION_STATUS_OPTIONS}
                />
            </div>

            {/* 日期范围 */}
            <div>
                <Text type="secondary" strong style={{ fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                    时间范围
                </Text>
                <DatePicker
                    type="dateTimeRange"
                    style={{ width: 320 }}
                    placeholder={['开始时间', '结束时间']}
                    format="yyyy-MM-dd HH:mm"
                    onChange={(dateRange) => {
                        formApi.setValue('dateRange', dateRange);
                    }}
                />
            </div>

            {/* 用户UID筛选（仅钱包所有者显示） */}
            {showUserFilter && (
                <div>
                    <Text type="secondary" strong style={{ fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                        用户UID
                    </Text>
                    <Form.Input
                        field="userUid"
                        placeholder="输入用户UID"
                        style={{ width: 140 }}
                    />
                </div>
            )}

            {/* 操作按钮 */}
            <div style={{ marginLeft: 'auto' }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<IconSearch />}
                        loading={loading}
                        onClick={handleSubmitClick}
                    >
                        查询
                    </Button>

                    {hasFilters && (
                        <Button
                            icon={<IconRefresh />}
                            onClick={handleReset}
                            disabled={loading}
                        >
                            重置
                        </Button>
                    )}
                </Space>
            </div>
        </div>
    );
};

const TransactionFilters: FC<TransactionFiltersProps> = ({
    onFilter,
    loading = false,
    showUserFilter = false,
    walletOptions,
    selectedWallet,
    onWalletChange
}) => {
    const [hasFilters, setHasFilters] = useState(false);

    return (
        <div style={{
            padding: '16px 20px',
            backgroundColor: 'var(--semi-color-fill-0)',
            borderRadius: '8px',
            border: '1px solid var(--semi-color-border)'
        }}>
            <Form
                layout="horizontal"
                style={{ marginBottom: 0 }}
            >
                <FilterFormContent
                    onFilter={onFilter}
                    loading={loading}
                    showUserFilter={showUserFilter}
                    hasFilters={hasFilters}
                    setHasFilters={setHasFilters}
                    walletOptions={walletOptions}
                    selectedWallet={selectedWallet}
                    onWalletChange={onWalletChange}
                />
            </Form>
        </div>
    );
};

export default TransactionFilters;
