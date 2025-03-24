import { FC } from 'react';
import ProfileCard from './ProfileCard';
import AccountLinks from './AccountLinks';
import PasskeyManager from './Passkey';
import { Space } from '@douyinfe/semi-ui';

const Account: FC = () => {
    return (
        <Space vertical spacing={'medium'}>
            {/* 个人信息 */}
            <ProfileCard />

            {/* 账号关联 */}
            <AccountLinks />

            {/* Passkey管理 */}
            <PasskeyManager />
        </Space>
    );
};

export default Account; 