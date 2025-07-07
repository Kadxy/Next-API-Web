import { FC } from 'react';
import { useParams } from 'react-router-dom';
import WalletList from './WalletList';
import WalletDetail from './WalletDetail';

const Wallets: FC = () => {
    const { uid } = useParams<{ uid: string }>();

    if (uid) {
        return <WalletDetail walletUid={uid} />;
    }

    return <WalletList />;
};

export default Wallets;
