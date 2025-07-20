import { Dispatch, FC, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Select, Space } from '@douyinfe/semi-ui';
import { IconAt, IconCreditCard, IconRefresh, IconSearch, IconUserCircle } from '@douyinfe/semi-icons';
import { getWalletMembersOption } from '../../api/utils/wallets-option';
import dayjs from "dayjs";
import {
    DEFAULT_TRANSACTION_QUERY_PARAMS,
    MY_WALLET_UID,
    TRANSACTION_STATUS_OPTIONS,
    TRANSACTION_TYPE_OPTIONS,
    TransactionQueryParams
} from './transaction.constant';
import { ListWalletResponseItemData } from '../../api/generated';

interface TransactionFiltersProps {
    fetching: boolean;
    wallets: ListWalletResponseItemData[];
    isWalletOwnerView: boolean;
    filters: TransactionQueryParams;
    setFilters: Dispatch<SetStateAction<TransactionQueryParams>>;
    onSearch: (newFilters: TransactionQueryParams) => Promise<void>;
}

const TransactionFilters: FC<TransactionFiltersProps> = (props: TransactionFiltersProps) => {
    const {
        fetching,
        wallets,
        isWalletOwnerView,
        filters,
        setFilters,
        onSearch,
    } = props;

    // 钱包成员选项
    const [memberOptions, setMemberOptions] = useState<{ label: ReactNode; value: string; }[]>([]);

    // 钱包选项
    const walletOptions = useMemo(() => {
        const iconStyle = { color: 'var(--semi-color-text-1)' };
        return [
            {
                text: '个人账户',
                label: <Space><IconUserCircle style={iconStyle} />个人账户</Space>,
                value: MY_WALLET_UID,
                isOwner: true,
            },
            ...wallets.map(w => ({
                text: w.displayName,
                label: (
                    <Space>
                        {w.isOwner ? <IconCreditCard style={iconStyle} /> : <IconAt style={iconStyle} />}{w.displayName}
                    </Space>
                ),
                value: w.uid,
                isOwner: w.isOwner,
            })),
        ];
    }, [wallets]);

    // 获取钱包成员选项
    useEffect(() => {
        const fetchMemberOptions = async (walletUid: string) => {
            const options = await getWalletMembersOption(walletUid);
            setMemberOptions(options);
        };

        if (isWalletOwnerView && filters.walletUid && filters.walletUid !== MY_WALLET_UID) {
            fetchMemberOptions(filters.walletUid).catch();
        } else {
            setMemberOptions([]);
            setFilters((prev) => ({ ...prev, memberUid: undefined }));
        }

    }, [isWalletOwnerView, filters.walletUid, setFilters, setMemberOptions]);

    const isResetDisabled = useMemo(() => {
        // 只包含 walletUid 
        return Object.keys(filters).filter(v => v !== undefined).length <= 1;
    }, [filters]);

    // 缓存当前时间，避免在回调中重复创建
    const now = dayjs();

    // 处理筛选条件变化
    const handleFilterChange = async (key: keyof TransactionQueryParams, value: unknown) => {
        let newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // 钱包(查询范围)变化时，追加清除成员筛选并发起查询
        if (key === 'walletUid') {
            newFilters = { ...newFilters, memberUid: undefined };
            setFilters(newFilters);

            await onSearch(newFilters);
        }
    };

    // 重置筛选条件(钱包除外)并发起查询
    const handleReset = async () => {
        const newFilters = { ...DEFAULT_TRANSACTION_QUERY_PARAMS };
        setFilters(newFilters);

        await onSearch(newFilters);
    };

    return (
        <div style={{
            padding: '16px 20px',
            backgroundColor: 'var(--semi-color-fill-0)',
            borderRadius: '8px',
            border: '1px solid var(--semi-color-border)',
        }}>
            <Space spacing='loose' align='end' wrap>

                {/* 查看范围 */}
                <Select
                    value={filters.walletUid}
                    onChange={async (v) => await handleFilterChange('walletUid', v)}
                    style={{ width: 160 }}
                    showClear={false}
                    optionList={walletOptions}
                    disabled={fetching}
                />

                {/* 交易类型 */}
                <Select
                    placeholder="选择类型"
                    style={{ width: 108 }}
                    optionList={TRANSACTION_TYPE_OPTIONS}
                    showClear={!fetching}
                    value={filters.type}
                    onChange={async (value) => await handleFilterChange('type', value)}
                    disabled={fetching}
                />

                {/* 交易状态 */}
                <Select
                    placeholder="选择状态"
                    style={{ width: 108 }}
                    showClear={!fetching}
                    optionList={TRANSACTION_STATUS_OPTIONS}
                    value={filters.status}
                    onChange={async (value) => await handleFilterChange('status', value)}
                    disabled={fetching}
                />

                {/* 开始时间 */}
                <DatePicker
                    type="dateTime"
                    style={{ width: 192 }}
                    placeholder="选择开始时间"
                    format="yyyy-MM-dd HH:mm:ss"
                    insetInput
                    showClear={!fetching}
                    disabledDate={(date) => dayjs(date).isAfter(now)}
                    value={filters.startTime ? new Date(filters.startTime) : undefined}
                    onChange={async (value) => {
                        if (value && value instanceof Date) {
                            await handleFilterChange('startTime', value.toISOString());
                        } else {
                            await handleFilterChange('startTime', undefined);
                        }
                    }}
                    disabled={fetching}
                />

                {/* 结束时间 */}
                <DatePicker
                    type="dateTime"
                    style={{ width: 192 }}
                    placeholder="选择结束时间"
                    format="yyyy-MM-dd HH:mm:ss"
                    insetInput
                    showClear={!fetching}
                    disabledDate={(date) => {
                        if (dayjs(date).isAfter(now, 'day')) {
                            return true;
                        }

                        const startTime = filters.startTime;

                        // 如果开始时间已选，结束日期不能早于开始日期 (精确到天)
                        return !!(startTime && dayjs(date).isBefore(dayjs(startTime), 'day'));
                    }}
                    disabledTime={(date) => {
                        const startTime = filters.startTime;

                        // 当天, 禁止之后的时间
                        if (dayjs(date as Date).isSame(dayjs(), 'day')) {
                            return {
                                disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter(i => i > dayjs().hour()),
                                disabledMinutes: (hour) => dayjs(now).hour() === hour ? Array.from({ length: 60 }, (_, i) => i).filter(i => i > dayjs().minute()) : [],
                                disabledSeconds: () => []
                            };
                        }

                        // 是开始时间那天
                        if (startTime && dayjs(date as Date).isSame(dayjs(startTime), 'day')) {
                            return {
                                disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter(i => i > dayjs(startTime).hour()),
                                disabledMinutes: (hour) => dayjs(startTime).hour() === hour ? Array.from({ length: 60 }, (_, i) => i).filter(i => i > dayjs(startTime).minute()) : [],
                                disabledSeconds: () => []
                            };
                        }

                        // 其他情况不禁用任何时间
                        return {
                            disabledHours: () => [],
                            disabledMinutes: () => [],
                            disabledSeconds: () => []
                        };
                    }}
                    value={filters.endTime ? new Date(filters.endTime) : undefined}
                    onChange={async (value) => {
                        if (value && value instanceof Date) {
                            await handleFilterChange('endTime', value.toISOString());
                        } else {
                            await handleFilterChange('endTime', undefined);
                        }
                    }}
                    disabled={fetching}
                />

                {/* 用户筛选（仅钱包所有者显示） */}
                {isWalletOwnerView && (
                    <Select
                        placeholder="选择成员"
                        style={{ width: 192 }}
                        showClear={!fetching}
                        optionList={memberOptions}
                        value={filters.memberUid}
                        onChange={async (value) => await handleFilterChange('memberUid', value)}
                    />
                )}

                {/* 操作按钮 */}
                <Space>
                    <Button
                        icon={<IconSearch />}
                        loading={fetching}
                        onClick={() => onSearch(filters)}
                    >
                        查询
                    </Button>

                    <Button
                        icon={<IconRefresh />}
                        onClick={handleReset}
                        disabled={fetching || isResetDisabled}
                    >
                        重置
                    </Button>
                </Space>
            </Space>
        </div>
    );
};

export default TransactionFilters;
