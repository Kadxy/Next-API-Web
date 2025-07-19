import {CSSProperties, useState} from 'react';
import { Typography, Card, Tabs, TabPane, Input, Button, Toast, CodeHighlight, Switch, AutoComplete } from '@douyinfe/semi-ui';
import { IconCopy } from '@douyinfe/semi-icons';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-bash.js';

const { Title, Paragraph, Text } = Typography;

// 模型选项
const MODEL_OPTIONS = [
    { value: 'gpt-4.1', label: 'gpt-4.1' },
    { value: 'gpt-4o-mini', label: 'gpt-4o-mini' },
    { value: 'claude-3.7-sonnet', label: 'claude-3.7-sonnet' },
    { value: 'deepseek-v1', label: 'deepseek-v1' },
    { value: 'deepseek-r3', label: 'deepseek-r3' },
    { value: 'gemini-2.5-pro', label: 'gemini-2.5-pro' },
];

const Access = () => {
    const [apiKey, setApiKey] = useState<string>('YOUR_API_KEY');
    const [model, setModel] = useState<string>('gpt-4.1');
    const [stream, setStream] = useState<boolean>(false);
    const baseUrl = 'https://cn.api-grip.com';

    // 复制代码到剪贴板
    const CopyButton = ({ text, style }: { text: string, style: CSSProperties }) => {
        const copyToClipboard = (text: string) => {
            navigator.clipboard.writeText(text)
                .then(() => Toast.success({ content: '复制成功', stack: true }))
                .catch(() => Toast.error({ content: '复制失败', stack: true }));
        };

        return (
            <Button
                icon={<IconCopy />}
                onClick={() => copyToClipboard(text)}
                style={style}
                theme='borderless'
            />
        );
    };

    // 生成JavaScript示例
    const javascriptExample = `import OpenAI from "openai";
const client = new OpenAI({
    apiKey: "${apiKey}",
    baseURL: "${baseUrl}/v1"
});

const completion = await client.chat.completions.create({
    model: "${model}",
    messages: [
        {
            role: "user",
            content: "Write a one-sentence bedtime story about a unicorn.",
        },
    ],
    stream: ${stream}
});

${stream ?
            `// Handle stream response
for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
` :
            `console.log(completion.choices[0].message.content);`}`;

    // 生成Python示例
    const pythonExample = `from openai import OpenAI
client = OpenAI(
    api_key="${apiKey}",
    base_url="${baseUrl}/v1"
)

completion = client.chat.completions.create(
    model="${model}",
    messages=[
        {
            "role": "user",
            "content": "Write a one-sentence bedtime story about a unicorn."
        }
    ],
    stream=${stream}
)

${stream ?
            `# Handle stream response
for chunk in completion:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)
`:
            `print(completion.choices[0].message.content)`}`;

    // 生成cURL示例
    const curlExample = `curl "${baseUrl}/v1/chat/completions" \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${apiKey}" \\
    -d '{
        "model": "${model}",
        "messages": [
            {
                "role": "user",
                "content": "Write a one-sentence bedtime story about a unicorn."
            }
        ],
        "stream": ${stream}
    }'`;

    return (
        <div>
            <Title heading={2}>API 接入示例</Title>
            <Paragraph>
                您可以使用以下示例代码快速集成我们的服务，示例遵循 OpenAI 格式规范。
            </Paragraph>
            <Card style={{ marginTop: 20 }}>
                <div style={{ marginBottom: 20 }}>
                    <Text strong>请设置以下参数，示例代码将自动更新：</Text>
                    <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                        <div>
                            <Text style={{ display: 'block', marginBottom: 4 }}>API Key</Text>
                            <Input
                                value={apiKey}
                                onChange={setApiKey}
                                style={{ width: 300 }}
                                placeholder="请输入您的API Key"
                            />
                        </div>
                        <div>
                            <Text style={{ display: 'block', marginBottom: 4 }}>Model</Text>
                            <AutoComplete
                                data={MODEL_OPTIONS}
                                value={model}
                                onChange={(value) => setModel(value as string)}
                                style={{ width: 200 }}
                                placeholder="选择或输入模型"
                            />
                        </div>
                        <div>
                            <Text style={{ display: 'block', marginBottom: 4 }}>Stream</Text>
                            <Switch
                                checked={stream}
                                onChange={setStream}
                                aria-label="Enable stream mode"
                            />
                        </div>
                    </div>
                </div>

                <Tabs type="card" >
                    <TabPane tab="curl" itemKey="curl">
                        <div style={{ position: 'relative' }}>
                            <CodeHighlight
                                language="bash"
                                code={curlExample}
                                lineNumber={false}
                            />
                            <CopyButton
                                text={curlExample}
                                style={{ position: 'absolute', top: 10, right: 10 }}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab="python" itemKey="python">
                        <div style={{ position: 'relative' }}>
                            <CodeHighlight
                                language="python"
                                code={pythonExample}
                                lineNumber={false}
                            />
                            <CopyButton
                                text={pythonExample}
                                style={{ position: 'absolute', top: 10, right: 10 }}
                            />
                        </div>
                    </TabPane>
                    <TabPane tab="javascript" itemKey="javascript">
                        <div style={{ position: 'relative' }}>
                            <CodeHighlight
                                language="javascript"
                                code={javascriptExample}
                                lineNumber={false}
                            />
                            <CopyButton
                                text={javascriptExample}
                                style={{ position: 'absolute', top: 10, right: 10 }}
                            />
                        </div>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default Access; 