import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès dans votre navigateur ou importer une image depuis la galerie.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const handleTakeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
        onClose();
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800 text-white border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">Capture Photo Terrain</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-amber-300 space-y-2">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-400" />
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover max-h-[500px]"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera overlay watermark */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] px-2.5 py-1 rounded-full border border-white/20">
            📷 Mode Appareil Photo {facingMode === 'environment' ? 'Arrière' : 'Avant'}
          </div>
        </div>

        {/* Modal Controls */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={toggleFacingMode}
            className="flex items-center space-x-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-2 rounded-xl transition-all"
            title="Changer de caméra (Avant / Arrière)"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Pivoter</span>
          </button>

          <button
            onClick={handleTakeSnapshot}
            disabled={!!error}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            <span>Prendre la Photo</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-3 py-2 rounded-xl"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};
