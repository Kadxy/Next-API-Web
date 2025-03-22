import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Empty, Typography } from '@douyinfe/semi-ui';
import { IconRefresh } from '@douyinfe/semi-icons';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('错误边界捕获到错误:', error, errorInfo);
    }

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Empty
                        title="页面出错了"
                        description={
                            <div>
                                <Typography.Text type="danger">
                                    {this.state.error?.message || '发生未知错误'}
                                </Typography.Text>
                                <div style={{ marginTop: '20px' }}>
                                    <Button
                                        theme="solid"
                                        icon={<IconRefresh />}
                                        onClick={this.handleReload}
                                    >
                                        刷新页面
                                    </Button>
                                </div>
                            </div>
                        }
                    />
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 