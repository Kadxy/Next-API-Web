import { FC, useState } from 'react';
import {
    Form,
    Button,
    Space,
    Card,
    useFormApi
} from '@douyinfe/semi-ui';
import { IconSearch, IconRefresh } from '@douyinfe/semi-icons';



interface TransactionFiltersProps {
    onFilter: (filters: {
        startDate?: string;
        endDate?: string;
        type?: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT' | 'SUBSCRIPTION' | 'OTHER';
        status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
        userId?: number;
    }) => void;
    loading?: boolean;
    showUserFilter?: boolean;
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
}> = ({ onFilter, loading, showUserFilter, hasFilters, setHasFilters }) => {
    const formApi = useFormApi();

    // 处理筛选提交
    const handleSubmit = (values: Record<string, unknown>) => {
        const filters: {
            startDate?: string;
            endDate?: string;
            type?: 'RECHARGE' | 'REDEMPTION' | 'CONSUME' | 'REFUND' | 'ADJUSTMENT' | 'SUBSCRIPTION' | 'OTHER';
            status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
            userId?: number;
        } = {};
        
        // 处理日期范围
        if (values.dateRange && Array.isArray(values.dateRange) && values.dateRange.length === 2) {
            const dateRange = values.dateRange as Array<{ format: (format: string) => string }>;
            filters.startDate = dateRange[0].format('YYYY-MM-DD');
            filters.endDate = dateRange[1].format('YYYY-MM-DD');
        }
        
        // 处理其他筛选条件
        if (values.type) filters.type = values.type as typeof filters.type;
        if (values.status) filters.status = values.status as typeof filters.status;
        if (values.userId) filters.userId = values.userId as number;

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
        <Space wrap spacing="medium" align="end">
                    {/* 交易类型 */}
                    <Form.Select
                        field="type"
                        label="交易类型"
                        placeholder="选择交易类型"
                        style={{ width: 140 }}
                        optionList={TRANSACTION_TYPE_OPTIONS}
                    />

                    {/* 交易状态 */}
                    <Form.Select
                        field="status"
                        label="交易状态"
                        placeholder="选择交易状态"
                        style={{ width: 140 }}
                        optionList={TRANSACTION_STATUS_OPTIONS}
                    />

                    {/* 日期范围 */}
                    <Form.DatePicker
                        field="dateRange"
                        label="日期范围"
                        type="dateRange"
                        placeholder={['开始日期', '结束日期']}
                        style={{ width: 280 }}
                        format="YYYY-MM-DD"
                    />

                    {/* 用户ID筛选（仅钱包视图显示） */}
                    {showUserFilter && (
                        <Form.InputNumber
                            field="userId"
                            label="用户ID"
                            placeholder="输入用户ID"
                            style={{ width: 120 }}
                            min={1}
                            precision={0}
                        />
                    )}

                    {/* 操作按钮 */}
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
                </Space>
    );
};

const TransactionFilters: FC<TransactionFiltersProps> = ({
    onFilter,
    loading = false,
    showUserFilter = false
}) => {
    const [hasFilters, setHasFilters] = useState(false);

    return (
        <Card
            bodyStyle={{ padding: '16px 20px' }}
            style={{ backgroundColor: 'var(--semi-color-fill-0)' }}
        >
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
                />
            </Form>
        </Card>
    );
};

export default TransactionFilters;
