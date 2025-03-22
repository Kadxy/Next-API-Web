import {Component, ErrorInfo, ReactNode} from 'react';
import {Button, Empty, Typography} from '@douyinfe/semi-ui';
import {IconRefresh} from '@douyinfe/semi-icons';

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
        console.error('Error boundary caught an error:', error, errorInfo);
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
                        title="Error"
                        description={
                            <div>
                                <Typography.Text type="danger">
                                    {this.state.error?.message || 'An unknown error has occurred.'}
                                </Typography.Text>
                                <div style={{marginTop: '20px'}}>
                                    <Button
                                        theme="solid"
                                        icon={<IconRefresh/>}
                                        onClick={this.handleReload}
                                    >
                                        Refresh the page
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