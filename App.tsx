/**
 * RADD Influencer ViewShots App
 * Copyright (c) 2025 Raki AI Digital DEN
 * ALL rights reserved
 *
 * Licensed under the RADD Proprietary License.
 * Unauthorized copying, modification, distribution, or use
 * of this software, via any medium, is strictly prohibited
 * without prior written permission from Raki AI Digital DEN.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SHOT_ANGLES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, NUM_SHOT_SELECTORS } from './constants';
import { generateImageVariation } from './services/geminiService';
import type { ShotAngle, GeneratedImage } from './types';
import { enhanceImageFile } from './utils/canvasEnhance';

/** ---- Aspect presets & download helpers ---- */
const ASPECTS: Record<'9:16' | '1:1' | '16:9', [number, number]> = {
  '9:16': [9, 16],
  '1:1': [1, 1],
  '16:9': [16, 9],
};

/** Render an image URL onto a canvas with a target aspect (cover fit). */
async function resizeImage(
  src: string,
  aspectLabel: '9:16' | '1:1' | '16:9',
  outWidth = 1080
): Promise<string> {
  const [aw, ah] = ASPECTS[aspectLabel];
  const targetAspect = aw / ah;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;

  if ((img as any).decode) {
    await (img as any).decode();
  } else {
    await new Promise((res, rej) => {
      img.onload = () => res(null);
      img.onerror = rej;
    });
  }

  const width = outWidth;
  const height = Math.round(width / targetAspect);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  // cover-fit crop
  const scale = Math.max(width / img.width, height / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;

  ctx.drawImage(img, dx, dy, drawW, drawH);
  return canvas.toDataURL('image/png');
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// --- Helper Components ---

const UploadIcon: React.FC = () => (
  <svg className="w-12 h-12 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
  </svg>
);

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300" style={{borderTopColor: '#a4823f'}}></div>
);

const GoldCheckIcon: React.FC = () => (
  <svg
    className="w-6 h-6 mr-2 flex-shrink-0"
    style={{ color: '#d4a253' }}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 6L9 17L4 12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DropdownButton: React.FC<{
  label: string;
  options: { value: '9:16' | '16:9' | '1:1'; label: string }[];
  onSelect: (value: '9:16' | '16:9' | '1:1') => void;
  disabled?: boolean;
  buttonClassName?: string;
  menuClassName?: string;
}> = ({ label, options, onSelect, disabled = false, buttonClassName = '', menuClassName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (value: '9:16' | '16:9' | '1:1') => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`${buttonClassName} ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'hover:brightness-110'}`}
        style={{ backgroundColor: disabled ? '' : '#d4a253', boxShadow: '0 2px 5px rgba(0,0,0,0.15)'}}
      >
        {label}
      </button>
      {isOpen && (
        <div className={`origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 ${menuClassName}`}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            {options.map(option => (
              <a
                key={option.value}
                href="#"
                onClick={(e) => { e.preventDefault(); handleOptionClick(option.value); }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main App Component ---

export default function App() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [selectedAngles, setSelectedAngles] = useState<Array<string | null>>(Array(NUM_SHOT_SELECTORS).fill(null));
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bulk aspect selector for "Download All"
  const [bulkAspect, setBulkAspect] = useState<'9:16' | '1:1' | '16:9'>('9:16');

  // Optional: per-card aspect selector (for individual download buttons)
  const [cardAspect, setCardAspect] = useState<Record<string, '9:16' | '1:1' | '16:9'>>({});

  const downloadOptions = [
    { value: '9:16' as const, label: '9:16 (Portrait)' },
    { value: '16:9' as const, label: '16:9 (Landscape)' },
    { value: '1:1' as const, label: '1:1 (Square)' },
  ];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(`Invalid file type. Please upload one of: ${ALLOWED_FILE_TYPES.join(', ')}`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
        return;
      }
      setError(null);
      setGeneratedImages([]);
      setOriginalImageFile(file);
      setOriginalImagePreview(null);
      setIsEnhancing(true);

      try {
        const enhancedCanvas = await enhanceImageFile(file);
        const previewUrl = enhancedCanvas.toDataURL('image/jpeg', 0.95);
        setOriginalImagePreview(previewUrl);

        enhancedCanvas.toBlob((blob) => {
          if (blob) {
            const nameParts = file.name.split('.');
            nameParts.pop();
            const newName = `${nameParts.join('.')}-enhanced.jpg`;
            const enhancedFile = new File([blob], newName, { type: 'image/jpeg' });
            setOriginalImageFile(enhancedFile);
          }
        }, 'image/jpeg', 0.95);
      } catch (err) {
        console.error("Image enhancement failed:", err);
        setError("Could not enhance the uploaded image. Using original.");
        setOriginalImagePreview(URL.createObjectURL(file));
      } finally {
        setIsEnhancing(false);
      }
    }
  };
  
  const handleReset = () => {
    setOriginalImageFile(null);
    setOriginalImagePreview(null);
    setGeneratedImages([]);
    setSelectedAngles(Array(NUM_SHOT_SELECTORS).fill(null));
    setError(null);
    setIsLoading(false);
    setIsEnhancing(false);
  };

  const handleAngleChange = (index: number, value: string) => {
    const newAngles = [...selectedAngles];
    newAngles[index] = value === "null" ? null : value;
    setSelectedAngles(newAngles);
  };

  const isGenerateDisabled = useMemo(() => {
    return isLoading || !originalImageFile || selectedAngles.every(angle => angle === null);
  }, [isLoading, originalImageFile, selectedAngles]);

  const handleGenerateShots = useCallback(async () => {
    if (isGenerateDisabled) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    const anglesToGenerate = selectedAngles
      .filter((angleName): angleName is string => angleName !== null)
      .map(angleName => SHOT_ANGLES.find(sa => sa.name === angleName))
      .filter((shotAngle): shotAngle is ShotAngle => shotAngle !== undefined);

    if (anglesToGenerate.length === 0 || !originalImageFile) {
      setError("Please select at least one shot type to generate.");
      setIsLoading(false);
      return;
    }
    
    setGeneratedImages(anglesToGenerate.map(angle => ({
      id: angle.name,
      angleName: angle.name,
      imageUrl: null,
    })));

    const generationPromises = anglesToGenerate.map(angle => 
      generateImageVariation(originalImageFile, angle)
        .then(imageUrl => ({ id: angle.name, angleName: angle.name, imageUrl }))
        .catch(err => ({ id: angle.name, angleName: angle.name, imageUrl: null, error: err.message }))
    );
    
    const results = await Promise.allSettled(generationPromises);

    const finalImages: GeneratedImage[] = [];
    results.forEach((result, index) => {
      const currentAngleName = anglesToGenerate[index].name;
      if (result.status === 'fulfilled') {
        finalImages.push(result.value as GeneratedImage);
      } else {
        finalImages.push({
          id: currentAngleName,
          angleName: currentAngleName,
          imageUrl: null,
          error: (result.reason as Error)?.message || "Generation failed"
        });
      }
    });

    setGeneratedImages(finalImages);
    setIsLoading(false);

  }, [originalImageFile, selectedAngles, isGenerateDisabled]);
  
  const handleDownloadSingle = useCallback(async (image: GeneratedImage, ratio: '9:16' | '16:9' | '1:1') => {
    if (!image.imageUrl) return;
    try {
        const resizedUrl = await resizeImage(image.imageUrl, ratio);
        const filename = `RADD_ViewShot_${image.angleName.replace(/\s+/g, '_')}_${ratio.replace(':', 'x')}.jpg`;
        triggerDownload(resizedUrl, filename);
    } catch(e) {
        console.error("Failed to resize and download image:", e);
        setError("Could not prepare image for download. Please try again.");
    }
  }, []);

  const handleDownloadAll = useCallback(async () => {
    // Adjust this to match your generatedImages state
    const valid = (generatedImages || []).filter(g => !!g.imageUrl);
    if (!valid.length) return;
  
    // Sequential download to avoid memory spikes
    for (const g of valid) {
      const dataUrl = await resizeImage(g.imageUrl as string, bulkAspect);
      const base = (g.angleName || g.id || 'shot').replace(/\s+/g, '_');
      triggerDownload(dataUrl, `${base}_${bulkAspect}.png`);
    }
  }, [generatedImages, bulkAspect]);

  return (
    <div className="min-h-screen text-black flex flex-col items-center p-4 sm:p-8 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: '#a4823f' }}>
          <span className="font-cursive" style={{ fontWeight: 'normal' }}>R</span>ADD <span className="font-cursive" style={{ fontWeight: 'normal' }}>I</span>nfluencer <span className="font-cursive" style={{ fontWeight: 'normal' }}>V</span>iew<span className="font-cursive" style={{ fontWeight: 'normal' }}>S</span>hots
        </h1>
        <p className="text-lg text-gray-700 mt-2">See your look from every angle.</p>
        <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: '#a4823f' }}>
          Step into the creative lens of RADD — the ultimate AI studio for influencers and creators. Instantly generate consistent, cinematic shots of your look from every perspective — top view, side profile, over-the-shoulder, and more. Upload a single photo, and let RADD Influencer ViewShots transform it into a full gallery of professional, scroll-ready visuals — perfect for content creation, branding, and storytelling.
        </p>
      </header>

      <main className="w-full max-w-5xl flex flex-col items-center">
        {!originalImageFile ? (
          <>
            <div className="w-full max-w-lg">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer bg-white/60 hover:bg-white/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadIcon />
                  <p className="mb-2 text-sm text-gray-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP, HEIC, or AVIF (MAX. 10MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept={ALLOWED_FILE_TYPES.join(',')} />
              </label>
            </div>
            <div className="w-full max-w-lg mt-8 text-center p-4">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#a4823f' }}>What You’ll Get Instantly</h2>
              <ul className="text-left space-y-2 text-gray-700 max-w-md mx-auto">
                <li className="flex items-start"><GoldCheckIcon />No need for prompts — simply upload your photo once, and the AI instantly generates consistent, cinematic angles of your influencer look.</li>
                <li className="flex items-start"><GoldCheckIcon />Maintain your AI twin’s consistency across every output — see your outfit, pose, and scene from every direction: top view, side profile, over-the-shoulder, or close-up — all in seconds.</li>
                <li className="flex items-start"><GoldCheckIcon />Save or share your AI-styled view shots anytime, anywhere — perfect for creating cohesive, scroll-ready content for your brand.</li>
              </ul>
            </div>
            <div className="mt-8 text-center text-xs text-gray-600 max-w-lg">
              <p>By uploading, you agree to use this service responsibly — no harmful or unlawful content.</p>
              <p>RADD is built to inspire creativity, confidence, and AI-powered visual storytelling — always.</p>
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-xl min-h-[300px] flex items-center justify-center">
              {isEnhancing ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-600">
                  <Spinner />
                  <p className="mt-4 font-semibold">Enhancing your image...</p>
                  <p className="text-sm">Applying auto-correction and sharpening.</p>
                </div>
              ) : (
                originalImagePreview && <img src={originalImagePreview} alt="Original upload preview" className="rounded-md w-full h-auto object-contain" style={{ maxHeight: '60vh' }} />
              )}
            </div>
            
            <div className="w-full max-w-3xl mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-center text-black">Select Your Shots</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedAngles.map((_, index) => (
                  <select
                    key={index}
                    value={selectedAngles[index] || "null"}
                    onChange={(e) => handleAngleChange(index, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-black text-sm rounded-full focus:ring-amber-600 focus:border-amber-600 block p-2.5"
                    style={{boxShadow: '0 2px 5px rgba(0,0,0,0.15)'}}
                  >
                    <option value="null">-- Select Shot {index + 1} --</option>
                    {SHOT_ANGLES.map(angle => (
                      <option key={angle.name} value={angle.name}>
                        {angle.name}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mt-8">
              <button 
                onClick={handleReset} 
                className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-110"
                style={{ backgroundColor: '#d4a253', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
              >
                Upload Different Photo
              </button>
              <button 
                onClick={handleGenerateShots} 
                disabled={isGenerateDisabled} 
                className={`px-6 py-3 font-semibold rounded-lg text-white transition-all duration-300 flex items-center justify-center ${isGenerateDisabled ? 'bg-gray-400 cursor-not-allowed' : 'hover:brightness-110'}`} 
                style={{ backgroundColor: isGenerateDisabled ? '' : '#d4a253', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
              >
                {isLoading ? <Spinner /> : 'Generate Shots'}
              </button>
              <button 
                onClick={handleReset} 
                className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-110"
                style={{ backgroundColor: '#d4a253', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
              >
                Start Over
              </button>
              {/* Download All with aspect selector */}
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <select
                  value={bulkAspect}
                  onChange={(e) => setBulkAspect(e.target.value as '9:16' | '1:1' | '16:9')}
                  className="bg-gray-50 border border-gray-300 text-black text-sm rounded-full p-2.5"
                >
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                </select>
                <button
                  onClick={handleDownloadAll}
                  disabled={!generatedImages?.some(g => !!g.imageUrl)}
                  className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
                  style={{ backgroundColor: '#a4823f', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}
                >
                  Download All
                </button>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-6 w-full max-w-2xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {generatedImages.length > 0 && (
          <div className="w-full mt-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-black">Generated Shots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image) => (
                <div key={image.id} className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                  <div className="aspect-[9/16] bg-gray-200 flex items-center justify-center">
                    {image.imageUrl ? (
                      <img src={image.imageUrl} alt={`Generated ${image.angleName}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {isLoading && !image.error ? <Spinner /> : `⚠️ ${image.error || 'Could not generate image.'}`}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="font-bold text-lg mb-2 text-black">{image.angleName}</h4>
                    {image.imageUrl && (
                      <div className="mt-auto">
                        <DropdownButton
                            label="Download ▼"
                            options={downloadOptions}
                            onSelect={(ratio) => handleDownloadSingle(image, ratio)}
                            buttonClassName="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-opacity"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <footer className="w-full text-center mt-8 py-4">
        <p style={{ color: '#a4823f', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          Created by RAKI AI Digital DEN © 2025 RADD Influencer ViewShots App. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
