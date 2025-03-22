import { Skeleton } from '@douyinfe/semi-ui';

const Data: React.FC = () => {
    return (
        <div
            style={{
                borderRadius: '10px',
                border: '1px solid var(--semi-color-border)',
                height: '100%',
                padding: '32px',
            }}
        >
            <h1 style={{ marginBottom: '24px' }}>基础数据</h1>
            <Skeleton placeholder={<Skeleton.Paragraph rows={4} />} loading={false}>
                <p>这是基础数据页面</p>
                <p>这里可以展示各种数据分析图表</p>
            </Skeleton>
        </div>
    );
};

export default Data; 