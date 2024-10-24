import { PhotoCapture } from "@/components/PhotoCapture";

export function App() {
  return (
    <PhotoCapture
      wsUrl="ws://localhost:8000/ws"
      uploadUrl="http://localhost:8000/upload/"
      onPhotoCapture={(blob) => {
        console.log("Photo captured:", blob);
      }}
    />
  );
}
