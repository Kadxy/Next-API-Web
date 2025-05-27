import { useState, useRef, useEffect } from 'react';
import {
    Button,
    Modal,
    Space,
    Toast,
} from '@douyinfe/semi-ui';
import { IconCamera, IconRefresh } from '@douyinfe/semi-icons';
import jsQR from 'jsqr';

// 二维码扫描器组件
const QrCodeScanner = ({
    visible,
    onClose,
    onScan
}: {
    visible: boolean,
    onClose: () => void,
    onScan: (code: string) => void
}) => {
    const [cameraReady, setCameraReady] = useState(false);
    const [scanningActive, setScanningActive] = useState(false);
    const [debugImage, setDebugImage] = useState<string | null>(null);
    const [scanAttempts, setScanAttempts] = useState(0);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 初始化摄像头
    const initCamera = async () => {
        try {
            setScanningActive(true);
            setScanAttempts(0);
            setCameraError(null);
            setDebugImage(null);

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play()
                            .then(() => setCameraReady(true))
                            .catch(err => {
                                console.error("视频播放失败:", err);
                                setCameraError("视频播放失败，请尝试重新打开扫描器");
                            });
                    }
                };
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            Toast.error("无法访问摄像头，请检查权限设置");
            setCameraError("无法访问摄像头，请检查浏览器权限设置");
            setScanningActive(false);
        }
    };

    // 拍照并识别
    const captureAndScan = () => {
        if (!scanningActive || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const snapshotUrl = canvas.toDataURL('image/png');
        setDebugImage(snapshotUrl);

        try {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "attemptBoth"
            });

            if (code) {
                handleSuccess(code.data);
            } else {
                setScanAttempts(prev => prev + 1);
            }
        } catch (error) {
            console.error("二维码解析错误:", error);
            Toast.error("解析过程中出错");
        }
    };

    // 处理成功识别
    const handleSuccess = (codeData: string) => {
        onScan(codeData);
        closeScanner();
    };

    // 关闭扫描器并清理资源
    const closeScanner = () => {
        setScanningActive(false);
        cleanupCamera();
        onClose();
    };

    // 清理相机资源
    const cleanupCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // 重置扫描
    const resetScan = () => {
        setDebugImage(null);
        setScanAttempts(0);
    };

    // 监听visible属性变化，当模态框打开时重新初始化相机
    useEffect(() => {
        if (visible) {
            // 重置状态
            setCameraReady(false);
            setScanningActive(false);
            setDebugImage(null);
            setScanAttempts(0);
            setCameraError(null);

            // 延迟启动摄像头，确保模态框已完成渲染
            setTimeout(() => {
                initCamera();
            }, 500);
        } else {
            // 关闭时清理资源
            cleanupCamera();
        }

        // 组件卸载时清理资源
        return () => {
            cleanupCamera();
        };
    }, [visible]);

    return (
        <Modal
            title="扫描二维码"
            visible={visible}
            onCancel={closeScanner}
            footer={
                <Space>
                    <Button onClick={closeScanner}>取消</Button>
                    {debugImage ? (
                        <Button
                            icon={<IconRefresh />}
                            type="primary"
                            onClick={resetScan}
                        >
                            重试
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={captureAndScan}
                            disabled={!cameraReady}
                            icon={<IconCamera />}
                        >
                            拍照识别
                        </Button>
                    )}
                </Space>
            }
            style={{ width: 320, maxWidth: '95%' }}
            bodyStyle={{ padding: '16px' }}
            centered
            closable={false}
        >
            <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '100%', margin: '0 auto' }}>
                    {/* 视频预览区域 */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: 240,
                        backgroundColor: '#000',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: cameraError ? '2px solid red' : '2px solid transparent'
                    }}>
                        <video
                            ref={videoRef}
                            style={{ display: cameraReady ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
                            playsInline // 自动播放
                        />
                        {!cameraReady && !cameraError && (
                            <div style={{ color: 'white', textAlign: 'center' }}>
                                <p>正在启动摄像头...</p>
                            </div>
                        )}
                        {cameraError && (
                            <div style={{ color: 'white', textAlign: 'center', padding: '10px' }}>
                                <p>{cameraError}</p>
                                <Button type="primary" onClick={initCamera} style={{ marginTop: '10px' }}>重试摄像头</Button>
                            </div>
                        )}
                    </div>

                    {/* 扫描区域指示（可选） */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '60%',
                        height: '60%',
                        border: '2px dashed rgba(255, 255, 255, 0.7)',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none' // 确保不阻挡视频
                    }}></div>

                    {/* 调试信息 */}
                    {process.env.NODE_ENV === 'development' && scanAttempts > 0 && !debugImage && (
                        <p style={{ color: 'orange', marginTop: '8px' }}>
                            尝试扫描次数: {scanAttempts}，未识别到二维码。
                        </p>
                    )}

                    {/* 调试用，显示快照 */}
                    {debugImage && (
                        <div style={{ marginTop: '10px' }}>
                            <p>调试快照:</p>
                            <img src={debugImage} alt="Debug Snapshot" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
                        </div>
                    )}

                    {/* 绘制二维码检测的Canvas（不可见） */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            </div>
        </Modal>
    );
};

export default QrCodeScanner; 