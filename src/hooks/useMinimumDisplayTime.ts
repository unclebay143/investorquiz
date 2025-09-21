import { useEffect, useState } from "react";

interface UseMinimumDisplayTimeProps {
  minDisplayTime: number;
  onComplete?: () => void;
}

export function useMinimumDisplayTime({
  minDisplayTime,
  onComplete,
}: UseMinimumDisplayTimeProps) {
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const checkMinimumTime = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      if (remainingTime > 0) {
        setTimeout(() => {
          setIsComplete(true);
          onComplete?.();
        }, remainingTime);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    // Check if minimum time has passed
    checkMinimumTime();
  }, [minDisplayTime, onComplete, startTime]);

  return { isComplete };
}
