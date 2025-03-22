import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const ErrorPage: React.FC = () => (
    <ErrorBoundary>
        <div>出错了</div>
    </ErrorBoundary>
);

export default ErrorPage; 