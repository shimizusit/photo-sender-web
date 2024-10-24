import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { signal } from "@preact/signals";
import classNames from "classnames";
import { CameraIcon, CheckIcon, WifiIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "preact/hooks";

// 状態管理
const isConnected = signal(false);
const isCapturing = signal(false);
const uploadProgress = signal(0);

// WebSocketクライアント
let ws: WebSocket | null = null;

interface PhotoCaptureProps {
  wsUrl: string;
  uploadUrl: string;
  onPhotoCapture?: (imageBlob: Blob) => void;
}

export function PhotoCapture({
  wsUrl,
  uploadUrl,
  onPhotoCapture,
}: PhotoCaptureProps) {
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // WebSocket接続の管理
  const connectWebSocket = () => {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      isConnected.value = true;
      setError(null);
    };

    ws.onclose = () => {
      isConnected.value = false;
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
      setError("サーバーとの接続に失敗しました");
    };
  };

  // カメラの初期化
  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current!.videoWidth;
            canvasRef.current.height = videoRef.current!.videoHeight;
          }
        };
      }
      setError(null);
    } catch (err) {
      setError(
        "カメラの起動に失敗しました。カメラへのアクセスを許可してください。"
      );
      console.error(err);
    }
  };

  // 写真撮影
  const takePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      context?.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      setPhotoTaken(true);
    }
  };

  // 写真のキャンセル
  const cancelPhoto = () => {
    setPhotoTaken(false);
  };

  // 写真の送信
  const submitPhoto = async () => {
    if (!canvasRef.current || !isConnected.value) return;

    isCapturing.value = true;
    uploadProgress.value = 0;

    try {
      // Canvas画像をBlobに変換
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current?.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      });

      // コールバックがある場合は呼び出し
      if (onPhotoCapture) {
        onPhotoCapture(blob);
      }

      // FormDataの作成
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");
      formData.append("description", "Live camera capture");

      // 画像のアップロード
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("アップロードに失敗しました");
      }

      setError(null);
      setPhotoTaken(false);
    } catch (err) {
      setError("画像の送信に失敗しました");
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

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden p-4"
      style={{
        animation: "gradientAnimation 10s ease infinite",
        background:
          "linear-gradient(270deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)",
        backgroundSize: "800% 800%",
      }}
    >
      <style jsx>{`
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <header className="absolute top-4 left-0 right-0 z-10 flex justify-between items-center px-6">
        <h1 className="text-xl font-bold text-white">Photo Sender</h1>
        <div className="flex items-center space-x-2">
          <WifiIcon
            className={classNames("w-5 h-5", {
              "text-green-400": isConnected.value,
              "text-red-400": !isConnected.value,
            })}
          />
          <span className="text-white text-sm">
            {isConnected.value ? "接続済み" : "未接続"}
          </span>
        </div>
      </header>

      {error && (
        <Alert
          variant="destructive"
          className="absolute top-16 left-4 right-4 z-10"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative w-full h-full bg-black overflow-hidden rounded-3xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={classNames(
            "absolute inset-0 w-full h-full object-cover rounded-3xl",
            {
              hidden: photoTaken,
            }
          )}
        />
        <canvas
          ref={canvasRef}
          className={classNames(
            "absolute inset-0 w-full h-full object-cover rounded-3xl",
            {
              hidden: !photoTaken,
            }
          )}
        />

        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          {photoTaken ? (
            <>
              <Button
                onClick={submitPhoto}
                disabled={!isConnected.value || isCapturing.value}
                className={classNames(
                  "rounded-full w-16 h-16 flex items-center justify-center transition-colors duration-300 shadow-lg",
                  {
                    "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600":
                      isConnected.value && !isCapturing.value,
                    "bg-gray-400": !isConnected.value || isCapturing.value,
                  }
                )}
              >
                <CheckIcon className="w-8 h-8 text-white" />
                <span className="sr-only">写真を送信</span>
              </Button>
              <Button
                onClick={cancelPhoto}
                className="rounded-full w-16 h-16 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-colors duration-300 shadow-lg"
              >
                <XIcon className="w-8 h-8 text-white" />
                <span className="sr-only">写真をキャンセル</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={takePhoto}
              disabled={!!error}
              className="rounded-full w-16 h-16 flex items-center justify-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-colors duration-300 shadow-lg"
            >
              <CameraIcon className="w-8 h-8 text-white" />
              <span className="sr-only">写真を撮影</span>
            </Button>
          )}
        </div>

        {isCapturing.value && uploadProgress.value > 0 && (
          <div className="absolute bottom-24 left-4 right-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${uploadProgress.value}%` }}
              />
            </div>
            <p className="text-sm text-white text-center mt-2">
              アップロード中... {Math.round(uploadProgress.value)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
