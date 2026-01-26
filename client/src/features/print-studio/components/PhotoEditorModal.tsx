import React, { useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Cropper, { Area } from 'react-easy-crop';
import { ImagePosition } from '../config/printConfig.types';

interface Props {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  initialCrop?: Area; // Pixel crop
  initialZoom?: number;
  onSave: (croppedArea: Area, zoom: number) => void;
}

export function PhotoEditorModal({ open, onClose, imageUrl, initialCrop, initialZoom = 1, onSave }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(initialCrop || null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = () => {
    if (croppedAreaPixels) {
      onSave(croppedAreaPixels, zoom);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/90" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-zinc-900 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900 z-10">
            <h3 className="text-white font-medium">Edit Photo</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Editor Area */}
          <div className="relative flex-1 bg-black">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3} // Default aspect ratio, maybe make configurable later
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              objectFit="contain"
            />
          </div>

          {/* Controls */}
          <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex items-center gap-6">
            <div className="flex-1 flex items-center gap-4">
              <span className="text-zinc-400 text-sm font-medium">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-zinc-300 hover:text-white font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-bold flex items-center gap-2 transition"
              >
                <CheckIcon className="w-5 h-5" />
                Apply Changes
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
