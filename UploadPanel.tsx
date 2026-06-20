
import React, { useState, useCallback } from 'react';
import type { UploadedFile } from '../types';
import { ALLOWED_FILE_TYPES } from '../constants';
import { UploadIcon } from './Icons';
import { enhanceImageFile } from '../src/utils/canvasEnhance';

interface UploadPanelProps {
  onFileUpload: (file: UploadedFile) => void;
  setError: (error: string | null) => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({ onFileUpload, setError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileProcessing = useCallback(async (file: File | null) => {
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(`Invalid file type. Please upload one of: ${ALLOWED_FILE_TYPES.map(t => t.split('/')[1]).join(', ')}`);
      return;
    }
    
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const canvas = await enhanceImageFile(file);
      const enhancedDataURL = canvas.toDataURL("image/jpeg", 0.95);
      const base64 = enhancedDataURL.split(",")[1];
      
      const enhancedBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!enhancedBlob) {
        throw new Error("Could not create blob from enhanced image.");
      }

      const nameParts = file.name.split('.');
      nameParts.pop();
      const newName = `${nameParts.join('.')}-enhanced.jpg`;

      onFileUpload({
        name: newName,
        type: 'image/jpeg',
        size: enhancedBlob.size,
        base64,
        previewUrl: enhancedDataURL,
      });
    } catch (err) {
      console.error("Error processing file:", err);
      setError("Could not process the file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUpload, setError]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if(e.dataTransfer.files.length > 1) {
        setError("Please upload only one file at a time.");
        return;
      }
      handleFileProcessing(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcessing(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative w-full max-w-lg mx-auto border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${ isProcessing ? 'cursor-wait' : 'cursor-pointer' } ${
        isDragging ? 'bg-[rgba(164,130,63,0.1)] border-solid' : 'border-[var(--radd-gold)] hover:bg-[rgba(164,130,63,0.05)]'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="radd-file-input"
        className="absolute w-0 h-0 opacity-0"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFileChange}
        disabled={isProcessing}
      />
      <label htmlFor="radd-file-input" className={`${isProcessing ? 'cursor-wait' : 'cursor-pointer'} flex flex-col items-center`}>
        {isProcessing ? (
            <>
                <div className="w-12 h-12 border-4 border-[var(--radd-gold)] border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--radd-gold)] font-medium text-lg">Enhancing image...</p>
                <p className="text-sm opacity-75 mt-1">
                    Applying auto-correction & sharpening.
                </p>
            </>
        ) : (
            <>
                <UploadIcon className="w-12 h-12 text-[var(--radd-gold)] opacity-75 mb-4" />
                <p className="text-[var(--radd-gold)] font-medium text-lg">
                Click to upload or drag and drop
                </p>
                <p className="text-sm opacity-75 mt-1">
                PNG, JPG, WEBP, HEIC, or AVIF (Max 10 MB)
                </p>
            </>
        )}
      </label>
    </div>
  );
};

export default UploadPanel;
