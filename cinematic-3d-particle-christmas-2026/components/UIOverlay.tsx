
import React from 'react';
import { AppState, TreeDisplayMode, UserPhoto } from '../types';

interface UIOverlayProps {
  appState: AppState;
  treeMode: TreeDisplayMode;
  userPhotos: UserPhoto[];
  onStart: () => void;
  onToggleMode: () => void;
  onAddPhoto: (url: string) => void;
  onSelectPhoto: (id: string) => void;
  onClosePhoto: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  appState,
  treeMode,
  userPhotos,
  onStart,
  onToggleMode,
  onAddPhoto,
  onSelectPhoto,
  onClosePhoto
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onAddPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 text-white">
      {/* Top Section */}
      <div className="flex justify-end items-start pointer-events-auto">
        {appState === AppState.INTERACTIVE_TREE && (
          <div className="flex flex-col gap-4 items-end">
            <button 
              onClick={onToggleMode}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 transition-all text-xs uppercase tracking-widest"
            >
              Mode: {treeMode === TreeDisplayMode.COMPACT ? 'ASSEMBLED' : treeMode === TreeDisplayMode.SCATTERED ? 'SCATTERED' : 'PHOTO FOCUS'}
            </button>
            <label className="cursor-pointer bg-yellow-500/80 hover:bg-yellow-500 px-6 py-2 rounded-full text-black font-bold text-xs uppercase tracking-widest transition-all">
              Upload Photo
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        )}
      </div>

      {/* Middle */}
      <div className="flex-1 flex items-center justify-center">
        {appState === AppState.INTRO && (
          <div className="text-center pointer-events-auto">
            <button 
              onClick={onStart}
              className="px-12 py-4 bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all rounded-full uppercase tracking-[0.3em] text-sm font-bold"
            >
              Enter Experience
            </button>
          </div>
        )}

        {treeMode === TreeDisplayMode.PHOTO_FOCUS && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto">
             <button 
               onClick={onClosePhoto}
               className="px-8 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 uppercase text-xs tracking-widest"
             >
               Return to Scattering
             </button>
          </div>
        )}
      </div>

      {/* Bottom: Only show gallery if not in compact mode */}
      {appState === AppState.INTERACTIVE_TREE && treeMode !== TreeDisplayMode.COMPACT && treeMode !== TreeDisplayMode.PHOTO_FOCUS && (
        <div className="flex gap-4 overflow-x-auto pb-4 pointer-events-auto no-scrollbar mask-fade-edges">
          {userPhotos.map(photo => (
            <div 
              key={photo.id}
              onClick={() => onSelectPhoto(photo.id)}
              className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-white/20 hover:border-yellow-500 cursor-pointer transition-all"
            >
              <img src={photo.url} alt="User" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
