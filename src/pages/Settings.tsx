import { Skeleton } from '@douyinfe/semi-ui';
import {FC} from "react";

const Settings: FC = () => {
    return (
        <div
            style={{
                borderRadius: '10px',
                border: '1px solid var(--semi-color-border)',
                height: '100%',
                padding: '32px',
            }}
        >
            <h1 style={{ marginBottom: '24px' }}>设置</h1>
            <Skeleton placeholder={<Skeleton.Paragraph rows={4} />} loading={false}>
                <p>这是设置页面</p>
                <p>可以在这里进行各种系统设置</p>
            </Skeleton>
        </div>
    );
};

export default Settings; 