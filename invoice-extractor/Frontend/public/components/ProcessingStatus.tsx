'use client';

import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message: string;
  progress: number;
}

export default function ProcessingStatus({ status, message, progress }: ProcessingStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 font-medium">{message}</span>
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            status === 'completed'
              ? 'bg-green-500'
              : status === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Processing Steps */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="mt-3 text-sm opacity-75">
          <div className="flex justify-between">
            <span className={progress >= 25 ? 'font-medium' : ''}>
              {progress >= 25 ? '✓' : '○'} Upload file
            </span>
            <span className={progress >= 50 ? 'font-medium' : ''}>
              {progress >= 50 ? '✓' : '○'} AI processing
            </span>
            <span className={progress >= 75 ? 'font-medium' : ''}>
              {progress >= 75 ? '✓' : '○'} Extract data
            </span>
            <span className={progress >= 100 ? 'font-medium' : ''}>
              {progress >= 100 ? '✓' : '○'} Complete
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
