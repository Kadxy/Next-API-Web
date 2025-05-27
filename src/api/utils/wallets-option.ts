import { getServerApi, handleResponse } from ".";

export const getWalletsOption = async (onError?: (msg: string) => void) => {
    let options: { label: string; value: string }[] = [];
    
    await handleResponse(getServerApi().wallet.walletControllerGetWallets(), {
        onSuccess: (data) => {
            options = data.map((wallet) => ({
                label: wallet.displayName,
                value: wallet.uid,
            }));
        },
        onError: (msg) => {
            onError?.(msg);
        }
    });
    
    return options;
}