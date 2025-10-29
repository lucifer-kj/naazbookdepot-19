import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Progress } from '../ui/progress';
import { Loader2 } from 'lucide-react';

interface LoadingBarProps {
  showFullScreen?: boolean;
  message?: string;
}

export function LoadingBar({ showFullScreen = false, message }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    setLoadingStage('Loading...');

    // Simulate realistic loading stages
    const stages = [
      { progress: 20, message: 'Loading resources...' },
      { progress: 40, message: 'Fetching data...' },
      { progress: 60, message: 'Rendering components...' },
      { progress: 80, message: 'Finalizing...' },
      { progress: 100, message: 'Complete!' }
    ];

    let currentStage = 0;
    const timer = setInterval(() => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        setProgress(stage.progress);
        setLoadingStage(stage.message);
        currentStage++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, [location]);

  if (!isLoading) return null;

  if (showFullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <Loader2 className="w-8 h-8 animate-spin text-naaz-green mx-auto" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-naaz-green">
              {message || loadingStage}
            </p>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">{progress}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress value={progress} className="h-1 rounded-none" />
      {message && (
        <div className="bg-white/90 backdrop-blur-sm border-b px-4 py-2 text-center">
          <p className="text-xs text-naaz-green font-medium">{message}</p>
        </div>
      )}
    </div>
  );
}

// Enhanced loading component for heavy operations
export function ChunkLoadingIndicator({ 
  isLoading, 
  chunkName, 
  progress = 0 
}: { 
  isLoading: boolean; 
  chunkName?: string; 
  progress?: number; 
}) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-naaz-green" />
          <span className="text-sm font-medium">
            Loading {chunkName || 'component'}...
          </span>
        </div>
        {progress > 0 && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 text-center">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Skeleton loading component for content
export function ContentSkeleton({ 
  lines = 3, 
  showImage = false,
  className = ""
}: { 
  lines?: number; 
  showImage?: boolean;
  className?: string;
}) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {showImage && (
        <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`bg-gray-200 rounded h-4 ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}