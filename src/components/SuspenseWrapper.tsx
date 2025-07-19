import { Suspense, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface SuspenseWrapperProps {
    children: ReactNode;
}

const SuspenseWrapper = ({ children }: SuspenseWrapperProps) => (
    <Suspense fallback={<LoadingSpinner />}>
        {children}
    </Suspense>
);

export default SuspenseWrapper;
