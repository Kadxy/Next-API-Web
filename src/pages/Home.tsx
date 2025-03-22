import {FC} from "react";
import {Skeleton} from '@douyinfe/semi-ui';

const Home: FC = () => {
    return (
        <div
            style={{
                borderRadius: '10px',
                border: '1px solid var(--semi-color-border)',
                height: '100%',
                padding: '32px',
            }}
        >
            <h1 style={{marginBottom: '24px'}}>首页</h1>
            <Skeleton placeholder={<Skeleton.Paragraph rows={4}/>} loading={false}>
                <p>欢迎来到首页</p>
                <p>这是一个使用Semi UI和React Router的示例应用</p>
            </Skeleton>
        </div>
    );
};

export default Home; 