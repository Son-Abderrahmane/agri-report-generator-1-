import React, { useRef, useState, useEffect } from 'react';
import { PenTool, X, Trash2, Check, Upload } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (dataUrl: string) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        initCanvas();
      }, 100);
    }
  }, [isOpen]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
      }
    }
  };

  const clearCanvas = () => {
    initCanvas();
    setHasDrawn(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const { x, y } = getCoordinates(e);
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const { x, y } = getCoordinates(e);
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature(dataUrl);
      onClose();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onSaveSignature(reader.result as string);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#EBE9E1] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-[#344E41] text-[#E9EDC9]">
          <div className="flex items-center space-x-2">
            <PenTool className="w-5 h-5 text-[#A3B18A]" />
            <h3 className="font-serif italic font-bold text-sm sm:text-base">Signature Numérique Consultant</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#A3B18A] hover:text-white rounded-lg hover:bg-[#5A6352]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#F9F8F5]">
          <p className="text-xs text-[#8C8F85] mb-2 font-medium">
            Dessinez votre signature à la souris ou au doigt sur l'écran tactile :
          </p>

          <div className="border-2 border-[#CCD5AE] rounded-2xl bg-white overflow-hidden shadow-inner touch-none">
            <canvas
              ref={canvasRef}
              width={450}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full cursor-crosshair"
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={clearCanvas}
              className="flex items-center space-x-1 text-xs text-[#5A6352] hover:text-red-700 bg-[#EBE9E1] hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-all font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>

            <label className="cursor-pointer flex items-center space-x-1 text-xs text-[#344E41] bg-[#E9EDC9] hover:bg-[#CCD5AE] px-3.5 py-1.5 rounded-xl border border-[#CCD5AE] font-bold">
              <Upload className="w-3.5 h-3.5" />
              <span>Importer Fichier</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-[#EBE9E1] flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 text-[#5A6352] hover:bg-[#F9F8F5] rounded-xl"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!hasDrawn}
            className="flex items-center space-x-1 bg-[#5A6352] hover:bg-[#344E41] text-[#E9EDC9] text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Valider la Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
};
