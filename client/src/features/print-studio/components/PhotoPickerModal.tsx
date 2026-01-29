import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption: string;
}

interface PhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (photoId: string) => void;
  availablePhotos: Photo[];
  selectedPhotoId?: string | null;
  slotIndex: number;
}

export const PhotoPickerModal: React.FC<PhotoPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  availablePhotos,
  selectedPhotoId,
  slotIndex
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Select Cover Photo</h3>
            <p className="text-xs text-gray-500">Choosing photo for Slot {slotIndex + 1}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {availablePhotos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-gray-400">No photos found in this report's gallery.</p>
              <p className="text-[10px] text-gray-500 mt-1">Upload photos to the Photos section first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {availablePhotos.map((photo) => {
                const isSelected = photo.id === selectedPhotoId;
                return (
                  <div 
                    key={photo.id}
                    onClick={() => {
                      onSelect(photo.id);
                      onClose();
                    }}
                    className={`group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      isSelected 
                        ? 'border-teal-500 ring-4 ring-teal-500/10' 
                        : 'border-transparent hover:border-teal-300'
                    }`}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                      isSelected ? 'bg-teal-500/20' : 'bg-black/0 group-hover:bg-black/20'
                    }`}>
                      {isSelected && (
                        <CheckCircle2 className="text-white drop-shadow-md" size={32} />
                      )}
                    </div>

                    {photo.caption && (
                       <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-[9px] text-white truncate">
                         {photo.caption}
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
