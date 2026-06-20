import React from 'react';
import type { GeneratedImage } from '../types';

interface ResultsGridProps {
  images: GeneratedImage[];
  aspectRatio: string;
}

const aspectRatioClasses: { [key: string]: string } = {
    '9:16': 'aspect-[9/16]',
    '16:9': 'aspect-[16/9]',
    '1:1': 'aspect-square',
};

const ResultCard: React.FC<{ image: GeneratedImage; aspectRatio: string }> = ({ image, aspectRatio }) => {
    
  const handleDownload = async () => {
    try {
        const response = await fetch(image.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `RADD_ViewShot_${image.angleLabel.replace(/\s+/g, '_')}.jpg`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
    } catch (error) {
        console.error("Failed to download image:", error);
        alert("Could not download the image. Please try again.");
    }
  };

  const aspectClass = aspectRatioClasses[aspectRatio] || 'aspect-[9/16]';

  return (
    <div
      className="bg-[var(--radd-bg)] border border-[var(--radd-gold)] rounded-xl shadow-md overflow-hidden flex flex-col items-center p-2 animate-fade-in-scale"
    >
      <img
        src={image.imageUrl}
        alt={image.angleLabel}
        className={`w-full object-cover rounded-lg ${aspectClass}`}
      />
      <p className="text-sm font-medium mt-2 text-[var(--radd-gold)]">{image.angleLabel}</p>
      <button
        onClick={handleDownload}
        className="text-xs mt-1 px-3 py-1 rounded-full bg-[var(--radd-gold)] text-white hover:opacity-90 transition-opacity"
        aria-label={`Download ${image.angleLabel} image`}
      >
        Download
      </button>
    </div>
  );
};

const ResultsGrid: React.FC<ResultsGridProps> = ({ images, aspectRatio }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
        <style>
        {`
          @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-scale { animation: fade-in-scale 0.5s ease-out forwards; }
        `}
        </style>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {images.map((image, index) => (
          <div key={image.id} style={{ animationDelay: `${index * 100}ms` }}>
             <ResultCard image={image} aspectRatio={aspectRatio} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsGrid;