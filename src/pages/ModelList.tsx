import { Typography, Card, Table } from '@douyinfe/semi-ui';
import { IconInfoCircle } from '@douyinfe/semi-icons';

const { Title, Paragraph, Text } = Typography;

// 定义模型数据类型
interface ModelItem {
    key: string;
    model: string;
    description: string;
    context: string;
    inputPrice: string;
    outputPrice: string;
    special: boolean;
}

const ModelList = () => {
    // 模型数据
    const modelData: ModelItem[] = [
        {
            key: '1',
            model: 'gpt-4.1',
            description: 'OpenAI最新一代的GPT-4模型，拥有更强的推理能力和知识',
            context: '128k tokens',
            inputPrice: '$0.01 / 1K tokens',
            outputPrice: '$0.03 / 1K tokens',
            special: true
        },
        {
            key: '2',
            model: 'gpt-4o-mini',
            description: 'GPT-4o系列的轻量级模型，提供优秀的性能和更经济的价格',
            context: '128k tokens',
            inputPrice: '$0.005 / 1K tokens',
            outputPrice: '$0.015 / 1K tokens',
            special: false
        },
        {
            key: '3',
            model: 'claude-3.7-sonnet',
            description: 'Anthropic的最新模型，提供均衡的性能和成本',
            context: '200k tokens',
            inputPrice: '$0.003 / 1K tokens',
            outputPrice: '$0.015 / 1K tokens',
            special: false
        },
        {
            key: '4',
            model: 'deepseek-v1',
            description: 'DeepSeek推出的大型语言模型，在中英文能力上表现优异',
            context: '32k tokens',
            inputPrice: '$0.001 / 1K tokens',
            outputPrice: '$0.005 / 1K tokens',
            special: false
        },
        {
            key: '5',
            model: 'deepseek-r3',
            description: 'DeepSeek开源系列R3版，经过增强的推理和数学能力',
            context: '128k tokens',
            inputPrice: '$0.0015 / 1K tokens',
            outputPrice: '$0.006 / 1K tokens',
            special: false
        },
        {
            key: '6',
            model: 'gemini-2.5-pro',
            description: 'Google Gemini系列的专业版本，多模态能力突出',
            context: '128k tokens',
            inputPrice: '$0.0035 / 1K tokens',
            outputPrice: '$0.0135 / 1K tokens',
            special: true
        }
    ];

    // 表格列定义
    const columns = [
        {
            title: '模型名称',
            dataIndex: 'model',
            render: (text: string, record: ModelItem) => (
                <div>
                    <Text strong>{text}</Text>
                    {record.special && (
                        <IconInfoCircle
                            style={{ color: 'var(--semi-color-primary)', marginLeft: 8 }}
                            title="推荐模型"
                        />
                    )}
                </div>
            ),
            width: 200,
        },
        {
            title: '描述',
            dataIndex: 'description',
            width: 300,
        },
        {
            title: '上下文窗口',
            dataIndex: 'context',
            width: 120,
        },
        {
            title: '输入价格',
            dataIndex: 'inputPrice',
            width: 150,
        },
        {
            title: '输出价格',
            dataIndex: 'outputPrice',
            width: 150,
        }
    ];

    return (
        <div>
            <Title heading={2}>模型列表</Title>
            <Paragraph>
                我们提供多种先进的语言模型，您可以根据自己的需求选择合适的模型。
                以下是当前支持的模型列表及价格，价格可能会随时调整，请以实际计费为准。
            </Paragraph>
            <Card style={{ marginTop: 20 }}>
                <Table
                    columns={columns}
                    dataSource={modelData}
                    pagination={false}
                    rowKey="key"
                />
            </Card>
        </div>
    );
};

export default ModelList; 