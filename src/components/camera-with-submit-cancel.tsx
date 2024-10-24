import { useRef, useEffect, useState } from 'preact/hooks'
import { Button } from '@/components/ui/button'
import { CameraIcon, CheckIcon, XIcon } from 'lucide-react'

export function CameraWithSubmitCancel() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [photoTaken, setPhotoTaken] = useState(false)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current!.videoWidth
              canvasRef.current.height = videoRef.current!.videoHeight
            }
          }
        }
      } catch (err) {
        setCameraError('カメラの起動に失敗しました。カメラへのアクセスを許可してください。')
        console.error('カメラエラー:', err)
      }
    }

    startCamera()

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const takePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d')
      context?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
      setPhotoTaken(true)
    }
  }

  const cancelPhoto = () => {
    setPhotoTaken(false)
  }

  const submitPhoto = () => {
    if (canvasRef.current) {
      const imageDataUrl = canvasRef.current.toDataURL('image/jpeg')
      console.log('Submitting photo:', imageDataUrl)
      // Here you would typically send the image data to a server
      // For now, we'll just log it to the console
      alert('写真が送信されました！')
      setPhotoTaken(false)
    }
  }

  return (
    <div 
      className="relative w-full h-screen overflow-hidden p-4"
      style={{
        animation: 'gradientAnimation 10s ease infinite',
        background: 'linear-gradient(270deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
        backgroundSize: '800% 800%',
      }}
    >
      <style jsx>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
      `}</style>
      <div className="relative w-full h-full bg-black overflow-hidden rounded-3xl">
        {cameraError ? (
          <p className="text-red-500 text-center p-4" role="alert">{cameraError}</p>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className={`absolute inset-0 w-full h-full object-cover rounded-3xl ${photoTaken ? 'hidden' : ''}`}
            />
            <canvas 
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover rounded-3xl ${photoTaken ? '' : 'hidden'}`}
            />
          </>
        )}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          {photoTaken ? (
            <>
              <Button 
                onClick={submitPhoto} 
                className="rounded-full w-16 h-16 flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-colors duration-300 shadow-lg"
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
              disabled={!!cameraError} 
              className="rounded-full w-16 h-16 flex items-center justify-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-colors duration-300 shadow-lg"
            >
              <CameraIcon className="w-8 h-8 text-white" />
              <span className="sr-only">写真を撮影</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}