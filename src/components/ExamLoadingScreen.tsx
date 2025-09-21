"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

interface ExamLoadingScreenProps {
  examTitle?: string;
  currentStep?: string;
  onComplete?: () => void;
}

export default function ExamLoadingScreen({
  examTitle = "Loading exam",
  currentStep = "Preparing questions...",
  onComplete,
}: ExamLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(currentStep);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());

  const loadingSteps = [
    { text: "Connecting to server...", progress: 15 },
    { text: "Authenticating user...", progress: 25 },
    { text: "Loading exam questions...", progress: 45 },
    { text: "Shuffling options...", progress: 65 },
    { text: "Setting up timer...", progress: 80 },
    { text: "Preparing interface...", progress: 90 },
    { text: "Almost ready...", progress: 95 },
    { text: "Ready to start!", progress: 100 },
  ];

  useEffect(() => {
    let currentStepIndex = 0;
    const minLoadingTime = 5000; // Minimum 5 seconds

    const interval = setInterval(() => {
      if (currentStepIndex < loadingSteps.length) {
        setStep(loadingSteps[currentStepIndex].text);
        setProgress(loadingSteps[currentStepIndex].progress);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);

        // Ensure minimum loading time of 5 seconds
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        setTimeout(() => {
          onComplete?.();
        }, remainingTime + 500); // Add 500ms for final state display
      }
    }, 600); // Change step every 600ms for smoother experience

    return () => clearInterval(interval);
  }, [onComplete, startTime]);

  return (
    <LoadingScreen
      message={isComplete ? "Ready!" : examTitle}
      showProgress={true}
      progress={progress}
      onMinimumTimeReached={onComplete}
    />
  );
}
