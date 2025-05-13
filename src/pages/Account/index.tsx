import { FC } from 'react';
import AccountInfo from './AccountInfo';
import AccountLinks from './AccountLinks';
import PasskeyManager from './Passkey';
import { Space } from '@douyinfe/semi-ui';
const Account: FC = () => {
    return (
        <Space vertical spacing={'medium'}>
            {/* 账户信息 */}
            <AccountInfo />

            {/* 账号关联 */}
            <AccountLinks />

            {/* Passkey管理 */}
            <PasskeyManager />
        </Space>
    );
};

export default Account; 