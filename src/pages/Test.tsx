import { Skeleton } from '@douyinfe/semi-ui';
import {FC} from "react";

const Test: FC = () => {
    return (
        <div
            style={{
                borderRadius: '10px',
                border: '1px solid var(--semi-color-border)',
                height: '100%',
                padding: '32px',
            }}
        >
            <h1 style={{ marginBottom: '24px' }}>测试功能</h1>
            <Skeleton placeholder={<Skeleton.Paragraph rows={4} />} loading={false}>
                <p>这是测试功能页面</p>
                <p>可以在这里测试新开发的功能</p>
            </Skeleton>
        </div>
    );
};

export default Test; 