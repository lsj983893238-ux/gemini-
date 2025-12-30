
import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { AppState, TreeDisplayMode, UserPhoto } from './types';
import { COUNTDOWN_SEQUENCE } from './constants';
import Experience from './components/Experience';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [treeMode, setTreeMode] = useState<TreeDisplayMode>(TreeDisplayMode.COMPACT);
  const [countdownIndex, setCountdownIndex] = useState(-1);
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [focusedPhotoId, setFocusedPhotoId] = useState<string | null>(null);

  // Logic to handle countdown
  useEffect(() => {
    if (appState === AppState.COUNTDOWN) {
      if (countdownIndex < COUNTDOWN_SEQUENCE.length - 1) {
        const timer = setTimeout(() => {
          setCountdownIndex(prev => prev + 1);
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        // End of countdown
        setTimeout(() => setAppState(AppState.TRANSITION_TO_2026), 1200);
      }
    }
  }, [appState, countdownIndex]);

  const handleStart = () => {
    setAppState(AppState.COUNTDOWN);
    setCountdownIndex(0);
  };

  const handleTransitionComplete = (newState: AppState) => {
    setAppState(newState);
    if (newState === AppState.TREE_ASSEMBLE) {
        setTimeout(() => setAppState(AppState.INTERACTIVE_TREE), 3000);
    }
  };

  const toggleTreeMode = () => {
    if (treeMode === TreeDisplayMode.COMPACT) {
      setTreeMode(TreeDisplayMode.SCATTERED);
      setFocusedPhotoId(null);
    } else if (treeMode === TreeDisplayMode.SCATTERED) {
      setTreeMode(TreeDisplayMode.COMPACT);
      setFocusedPhotoId(null);
    } else {
      // Return to compact from photo focus
      setTreeMode(TreeDisplayMode.COMPACT);
      setFocusedPhotoId(null);
    }
  };

  const addPhoto = (url: string) => {
    setUserPhotos(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url }]);
  };

  const selectPhoto = (id: string) => {
    setFocusedPhotoId(id);
    setTreeMode(TreeDisplayMode.PHOTO_FOCUS);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ antialias: false, stencil: false, depth: true }}
        dpr={[1, 2]}
      >
        <Experience 
          appState={appState}
          treeMode={treeMode}
          countdownValue={COUNTDOWN_SEQUENCE[countdownIndex] || ''}
          userPhotos={userPhotos}
          focusedPhotoId={focusedPhotoId}
          onTransitionComplete={handleTransitionComplete}
          onPhotoClick={selectPhoto}
        />
        
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.4}
          />
        </EffectComposer>
      </Canvas>

      <UIOverlay 
        appState={appState}
        treeMode={treeMode}
        userPhotos={userPhotos}
        onStart={handleStart}
        onToggleMode={toggleTreeMode}
        onAddPhoto={addPhoto}
        onSelectPhoto={selectPhoto}
        onClosePhoto={() => {
            setFocusedPhotoId(null);
            setTreeMode(TreeDisplayMode.SCATTERED);
        }}
      />
    </div>
  );
};

export default App;
