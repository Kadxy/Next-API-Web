import { FC } from 'react';
import { Spin } from '@douyinfe/semi-ui';
import {SpinProps} from "@douyinfe/semi-ui/lib/es/spin";

interface LoadingSpinnerProps {
    tip?: SpinProps["tip"];
    size?: SpinProps["size"];
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
    tip = 'Loading...', 
    size = 'large' 
}) => {
    return (
        <Spin
            style={{ height: '100%', width: '100%' }}
            size={size}
            tip={
                <div style={{ marginTop: 24 }}>
                    {tip}
                </div>
            }
        />
    );
};

export default LoadingSpinner;
