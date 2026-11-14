import React from 'react';

export default function LoadingSpinner({ text = 'Loading banking intelligence...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-blue-700/20"></div>
        </div>
      </div>
      {text && <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
}
