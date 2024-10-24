import { useEffect, useRef, useState } from 'preact/hooks';
import { signal } from '@preact/signals';
import ky from 'ky';
import classNames from 'classnames';

// 状態管理
const isConnected = signal(false);
const isCapturing = signal(false);
const uploadProgress = signal(0);

// WebSocketクライアント
let ws: WebSocket | null = null;

export function App() {
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // WebSocket接続の管理
  const connectWebSocket = () => {
    ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      isConnected.value = true;
      setError(null);
    };
    
    ws.onclose = () => {
      isConnected.value = false;
      // 再接続を試みる
      setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = () => {
      setError('WebSocket接続エラー');
    };
  };

  // カメラストリームの初期化
  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError('カメラの初期化に失敗しました');
      console.error(err);
    }
  };

  // 画像のキャプチャと送信
  const captureAndSend = async () => {
    if (!canvasRef.current || !videoRef.current || !isConnected.value) return;

    isCapturing.value = true;
    uploadProgress.value = 0;

    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) throw new Error('Canvas context is null');

      // 現在のビデオフレームをキャプチャ
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Canvas画像をBlobに変換
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob(blob => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.9);
      });

      // FormDataの作成
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      formData.append('description', 'Live camera capture');

      // 画像のアップロード
      await ky.post('http://localhost:8000/upload/', {
        body: formData,
        onUploadProgress: (progress) => {
          uploadProgress.value = progress.percent;
        },
      });

      setError(null);
    } catch (err) {
      setError('画像の送信に失敗しました');
      console.error(err);
    } finally {
      isCapturing.value = false;
      uploadProgress.value = 0;
    }
  };

  // コンポーネントのマウント時の処理
  useEffect(() => {
    initializeCamera();
    connectWebSocket();

    // クリーンアップ
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Photo Sender</h1>
          <p className="mt-2 text-gray-600">
            {isConnected.value ? 
              <span className="text-green-600">接続済み</span> : 
              <span className="text-red-600">未接続</span>
            }
          </p>
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full"
            />
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="hidden"
            />
          </div>

          <div className="p-4">
            <button
              onClick={captureAndSend}
              disabled={!isConnected.value || isCapturing.value}
              className={classNames(
                'w-full py-3 px-4 rounded-lg font-semibold text-white transition',
                {
                  'bg-primary-600 hover:bg-primary-700': isConnected.value && !isCapturing.value,
                  'bg-gray-400': !isConnected.value,
                  'bg-primary-400 animate-pulse-slow': isCapturing.value
                }
              )}
            >
              {isCapturing.value ? '送信中...' : '写真を撮影・送信'}
            </button>

            {isCapturing.value && uploadProgress.value > 0 && (
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className="h-full bg-primary-600 rounded transition-all duration-300"
                    style={{ width: `${uploadProgress.value}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1 text-right">
                  {Math.round(uploadProgress.value)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
