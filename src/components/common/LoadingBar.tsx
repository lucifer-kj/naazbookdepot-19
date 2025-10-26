import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Progress } from '../ui/progress';

export function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const increment = Math.random() * 10;
        return Math.min(oldProgress + increment, 90);
      });
    }, 300);

    return () => {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    };
  }, [location]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress value={progress} className="h-1 rounded-none" />
    </div>
  );
}