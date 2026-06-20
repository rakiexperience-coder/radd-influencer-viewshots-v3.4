import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 border-4 border-[var(--radd-gold)] border-t-transparent border-solid rounded-full animate-spin"></div>
      <p className="mt-4 text-xl font-medium text-[var(--radd-gold)]">
        Creating your cinematic views...
      </p>
      <p className="mt-1 text-[var(--radd-gold)] opacity-80">
        This may take a moment. Please wait.
      </p>
    </div>
  );
};

export default LoadingSpinner;