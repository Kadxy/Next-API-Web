import { FC } from 'react';
import AccountInfo from './AccountInfo';
import AccountLinks from './AccountLinks';
import PasskeyManager from './Passkey';
import { Space } from '@douyinfe/semi-ui';
import DangerArea from './DangerArea';

const Account: FC = () => {
    return (
        <Space vertical spacing={'medium'}>
            {/* 账户信息 */}
            <AccountInfo />

            {/* 账号关联 */}
            <AccountLinks />

            {/* Passkey管理 */}
            <PasskeyManager />

            {/* 危险操作 */}
            <DangerArea />
        </Space>
    );
};

export default Account; 