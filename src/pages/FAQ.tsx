import { Typography, Card, Collapse } from '@douyinfe/semi-ui';
import { IconChevronDown } from '@douyinfe/semi-icons';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const FAQ = () => {
    // 常见问题列表
    const faqItems = [
        {
            key: '1',
            header: '如何获取API Key？',
            content: '登录账户后，访问"API Keys"页面，您可以创建和管理您的API密钥。请妥善保管您的API Key，不要泄露给他人。'
        },
        {
            key: '2',
            header: '支持哪些付款方式？',
            content: '我们支持信用卡、支付宝、微信支付等多种支付方式。具体支付方式可在"账户充值"页面查看。'
        },
        {
            key: '3',
            header: '如何计费？',
            content: '我们按照token使用量计费，不同模型有不同的费率。您可以在"用量信息"页面查看详细的使用记录和费用明细。'
        },
        {
            key: '4',
            header: '请求超时怎么办？',
            content: '请求超时可能是由网络延迟或服务器负载过高引起的。您可以尝试重新发送请求，或者使用stream模式减少超时风险。如果问题持续存在，请联系我们的客服。'
        },
        {
            key: '5',
            header: '如何提高响应质量？',
            content: '要提高响应质量，请尝试：1) 使用更高级的模型；2) 优化您的提示词；3) 为模型提供足够的上下文信息；4) 在需要详细回答的场景下增加最大token限制。'
        },
        {
            key: '6',
            header: '可以进行哪些自定义设置？',
            content: '您可以设置温度(temperature)、最大输出长度(max_tokens)、top_p等参数来自定义模型输出。详细参数说明请查看"接入文档"页面。'
        },
        {
            key: '7',
            header: '如何解决内容审核问题？',
            content: '确保您的请求内容符合我们的使用政策。避免包含有害、侵犯版权或违反法律法规的内容。如果您认为误触发了内容审核，请调整您的提示词，避免敏感术语或表达方式。'
        },
        {
            key: '8',
            header: '如何获取技术支持？',
            content: '您可以通过邮件、在线客服或社区论坛获取技术支持。我们的技术团队会在工作时间内尽快回复您的问题。'
        }
    ];

    return (
        <div>
            <Title heading={2}>常见问题</Title>
            <Paragraph>
                以下是用户常见的问题和解答，如果您没有找到想要的答案，请联系客服获取更多帮助。
            </Paragraph>
            <Card style={{ marginTop: 20 }}>
                <Collapse
                    accordion
                    defaultActiveKey={['1']}
                    collapseIcon={<IconChevronDown />}
                    expandIconPosition="right"
                >
                    {faqItems.map(item => (
                        <Panel
                            key={item.key}
                            header={item.header}
                            itemKey={item.key}
                        >
                            <Paragraph>{item.content}</Paragraph>
                        </Panel>
                    ))}
                </Collapse>
            </Card>
        </div>
    );
};

export default FAQ; 