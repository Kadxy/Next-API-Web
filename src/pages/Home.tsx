import {FC} from "react";
import {Button, Card, Col, Row, Space, Typography} from '@douyinfe/semi-ui';
import {
    IconArrowRight,
    IconTick,
    IconCode,
    IconCreditCard,
    IconGlobeStroke,
    IconHelpCircle,
    IconHistogram,
    IconKey,
    IconLayers,
    IconShield,
    IconStar,
    IconActivity,
    IconUser
} from '@douyinfe/semi-icons';
import {useNavigate} from 'react-router-dom';
import {Path} from '../lib/constants/paths';

const {Title, Text, Paragraph} = Typography;

const Home: FC = () => {
    const navigate = useNavigate();

    // 功能卡片数据
    const featureCards = [
        {
            icon: <IconKey size="extra-large" style={{color: 'var(--semi-color-primary)'}}/>,
            title: 'API Keys 管理',
            description: '安全便捷的API密钥管理，支持多密钥轮换和权限控制',
            path: Path.API_KEYS,
            color: 'var(--semi-color-primary)'
        },
        {
            icon: <IconCreditCard size="extra-large" style={{color: 'var(--semi-color-success)'}}/>,
            title: '钱包管理',
            description: '灵活的余额管理和充值方案，支持多种支付方式',
            path: Path.WALLETS,
            color: 'var(--semi-color-success)'
        },
        {
            icon: <IconHistogram size="extra-large" style={{color: 'var(--semi-color-warning)'}}/>,
            title: '用量统计',
            description: '详细的API调用统计和费用分析，助您优化成本',
            path: Path.USAGE,
            color: 'var(--semi-color-warning)'
        },
        {
            icon: <IconLayers size="extra-large" style={{color: 'var(--semi-color-tertiary)'}}/>,
            title: '模型列表',
            description: '丰富的AI模型选择，覆盖各种应用场景',
            path: Path.MODEL_LIST,
            color: 'var(--semi-color-tertiary)'
        }
    ];

    // 产品特色数据
    const highlights = [
        {
            icon: <IconShield style={{color: 'var(--semi-color-success)'}}/>,
            title: '企业级安全',
            description: '多重安全防护，保障您的数据安全'
        },
        {
            icon: <IconActivity style={{color: 'var(--semi-color-primary)'}}/>,
            title: '高性能稳定',
            description: '99.9%可用性保证，毫秒级响应速度'
        },
        {
            icon: <IconGlobeStroke style={{color: 'var(--semi-color-warning)'}}/>,
            title: '全球部署',
            description: '多地域节点部署，就近访问更快速'
        },
        {
            icon: <IconStar style={{color: 'var(--semi-color-tertiary)'}}/>,
            title: '专业服务',
            description: '7x24小时技术支持，专业团队护航'
        }
    ];

    return (
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
            {/* 欢迎横幅 */}
            <Card
                style={{
                    background: 'linear-gradient(135deg, var(--semi-color-primary) 0%, var(--semi-color-primary-light-default) 100%)',
                    border: 'none',
                    marginBottom: '32px'
                }}
                bodyStyle={{padding: '48px 32px'}}
            >
                <Row align="middle">
                    <Col span={16}>
                        <Title heading={1} style={{color: 'white', marginBottom: '16px', fontSize: '2.5rem'}}>
                            欢迎使用 {import.meta.env.VITE_APP_NAME || 'API Grip'}
                        </Title>
                        <Paragraph style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '18px',
                            marginBottom: '32px',
                            lineHeight: '1.6'
                        }}>
                            强大的AI API管理平台，为您提供稳定、高效的人工智能服务接入能力。
                            <br/>
                            支持多种主流AI模型，灵活的计费方式，企业级的安全保障。
                        </Paragraph>
                        <Space spacing="loose">
                            <Button
                                theme="solid"
                                type="primary"
                                size="large"
                                icon={<IconCode/>}
                                style={{
                                    backgroundColor: 'white',
                                    color: 'var(--semi-color-primary)',
                                    fontWeight: 600
                                }}
                                onClick={() => navigate(Path.ACCESS)}
                            >
                                开始接入
                            </Button>
                            <Button
                                theme="borderless"
                                type="primary"
                                size="large"
                                icon={<IconLayers/>}
                                style={{
                                    color: 'white',
                                    borderColor: 'white',
                                    fontWeight: 600
                                }}
                                onClick={() => navigate(Path.MODEL_LIST)}
                            >
                                查看模型
                            </Button>
                        </Space>
                    </Col>
                    <Col span={8} style={{textAlign: 'center'}}>
                        <div style={{
                            fontSize: '120px',
                            color: 'rgba(255,255,255,0.3)',
                            lineHeight: 1
                        }}>
                            🚀
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* 功能模块卡片 */}
            <div style={{marginBottom: '48px'}}>
                <Title heading={2} style={{marginBottom: '24px', textAlign: 'center'}}>
                    核心功能
                </Title>
                <Row gutter={[24, 24]}>
                    {featureCards.map((card, index) => (
                        <Col span={12} key={index}>
                            <div
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => navigate(card.path)}
                            >
                                <Card
                                    shadows={"hover"}
                                    style={{
                                        height: '100%',
                                        border: '1px solid var(--semi-color-border)'
                                    }}
                                    bodyStyle={{padding: '32px 24px'}}
                                >
                                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                                    {card.icon}
                                </div>
                                <Title heading={4} style={{textAlign: 'center', marginBottom: '12px'}}>
                                    {card.title}
                                </Title>
                                <Text style={{
                                    color: 'var(--semi-color-text-1)',
                                    textAlign: 'center',
                                    display: 'block',
                                    lineHeight: '1.5'
                                }}>
                                    {card.description}
                                </Text>
                                <div style={{textAlign: 'center', marginTop: '20px'}}>
                                    <Button
                                        theme="borderless"
                                        type="primary"
                                        icon={<IconArrowRight/>}
                                        iconPosition="right"
                                    >
                                        立即使用
                                    </Button>
                                </div>
                            </Card>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 产品特色 */}
            <div style={{marginBottom: '48px'}}>
                <Title heading={2} style={{marginBottom: '24px', textAlign: 'center'}}>
                    产品特色
                </Title>
                <Row gutter={[24, 24]}>
                    {highlights.map((highlight, index) => (
                        <Col span={6} key={index}>
                            <Card
                                style={{
                                    height: '100%',
                                    textAlign: 'center',
                                    border: 'none',
                                    backgroundColor: 'var(--semi-color-fill-0)'
                                }}
                                bodyStyle={{padding: '24px 16px'}}
                            >
                                <div style={{marginBottom: '16px', fontSize: '32px'}}>
                                    {highlight.icon}
                                </div>
                                <Title heading={5} style={{marginBottom: '8px'}}>
                                    {highlight.title}
                                </Title>
                                <Text style={{
                                    color: 'var(--semi-color-text-1)',
                                    fontSize: '14px',
                                    lineHeight: '1.4'
                                }}>
                                    {highlight.description}
                                </Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* 快速统计 */}
            <Card style={{marginBottom: '48px'}}>
                <Title heading={3} style={{textAlign: 'center', marginBottom: '32px'}}>
                    平台数据概览
                </Title>
                <Row gutter={[24, 24]}>
                    <Col span={6}>
                        <div style={{textAlign: 'center'}}>
                            <Title heading={1} style={{color: 'var(--semi-color-primary)', marginBottom: '8px'}}>
                                50+
                            </Title>
                            <Text style={{color: 'var(--semi-color-text-1)'}}>支持模型</Text>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div style={{textAlign: 'center'}}>
                            <Title heading={1} style={{color: 'var(--semi-color-success)', marginBottom: '8px'}}>
                                99.9%
                            </Title>
                            <Text style={{color: 'var(--semi-color-text-1)'}}>服务可用性</Text>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div style={{textAlign: 'center'}}>
                            <Title heading={1} style={{color: 'var(--semi-color-warning)', marginBottom: '8px'}}>
                                &lt;100ms
                            </Title>
                            <Text style={{color: 'var(--semi-color-text-1)'}}>平均响应时间</Text>
                        </div>
                    </Col>
                    <Col span={6}>
                        <div style={{textAlign: 'center'}}>
                            <Title heading={1} style={{color: 'var(--semi-color-tertiary)', marginBottom: '8px'}}>
                                24/7
                            </Title>
                            <Text style={{color: 'var(--semi-color-text-1)'}}>技术支持</Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* 快速导航 */}
            <Card>
                <Title heading={3} style={{marginBottom: '24px'}}>
                    快速导航
                </Title>
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Button
                            block
                            size="large"
                            icon={<IconCode/>}
                            onClick={() => navigate(Path.ACCESS)}
                            style={{height: '60px'}}
                        >
                            接入文档
                        </Button>
                    </Col>
                    <Col span={8}>
                        <Button
                            block
                            size="large"
                            icon={<IconHelpCircle/>}
                            onClick={() => navigate(Path.FAQ)}
                            style={{height: '60px'}}
                        >
                            常见问题
                        </Button>
                    </Col>
                    <Col span={8}>
                        <Button
                            block
                            size="large"
                            icon={<IconUser/>}
                            onClick={() => navigate(Path.ACCOUNT)}
                            style={{height: '60px'}}
                        >
                            个人中心
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* 底部提示 */}
            <div style={{
                textAlign: 'center',
                marginTop: '48px',
                padding: '24px',
                backgroundColor: 'var(--semi-color-fill-0)',
                borderRadius: '8px'
            }}>
                <Space align="center">
                    <IconTick style={{color: 'var(--semi-color-success)'}}/>
                    <Text style={{color: 'var(--semi-color-text-1)'}}>
                        开始您的AI之旅，体验强大的API服务能力
                    </Text>
                </Space>
            </div>
        </div>
    );
};

export default Home;