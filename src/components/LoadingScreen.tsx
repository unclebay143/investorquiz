"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  minDisplayTime?: number; // Minimum time to show loading screen in milliseconds
  onMinimumTimeReached?: () => void; // Callback when minimum time is reached
  allowPause?: boolean; // Allow users to pause the loading screen
  allowSkip?: boolean; // Allow users to skip the loading screen
  onSkip?: () => void; // Callback when user skips
  onComplete?: () => void; // Callback when loading is complete (minimum time reached AND progress complete)
  isReady?: boolean; // External signal that loading is ready (e.g., data loaded)
}

const investmentQuotes = [
  "The stock market is a device for transferring money from the impatient to the patient. - Warren Buffett",
  "Investing is not about beating others at their game. It's about controlling yourself at your own game. - Benjamin Graham",
  "The four most dangerous words in investing are: 'This time it's different.' - Sir John Templeton",
  "Time in the market beats timing the market. - Unknown",
  "Risk comes from not knowing what you're doing. - Warren Buffett",
  "The best investment you can make is in yourself. - Warren Buffett",
  "Don't put all your eggs in one basket. - Diversification principle",
  "Compound interest is the eighth wonder of the world. - Albert Einstein",
  "Be fearful when others are greedy and greedy when others are fearful. - Warren Buffett",
  "The market is a voting machine in the short run, but a weighing machine in the long run. - Benjamin Graham",
  "It's not how much money you make, but how much money you keep. - Robert Kiyosaki",
  "The biggest risk is not taking any risk. In a world that's changing really quickly, the only strategy that is guaranteed to fail is not taking risks. - Mark Zuckerberg",
];

export const investmentTips = [
  "Start investing early - time is your greatest asset in building wealth.",
  "Diversify your portfolio across different asset classes and sectors.",
  "Don't try to time the market - focus on time in the market instead.",
  "Invest regularly through dollar-cost averaging to reduce volatility.",
  "Keep your investment costs low - fees can significantly impact returns.",
  "Stay informed but don't let daily market noise affect your long-term strategy.",
  "Have an emergency fund before you start investing.",
  "Understand the difference between investing and speculating.",
  "Review and rebalance your portfolio periodically, but not too frequently.",
  "Consider your risk tolerance and investment timeline before making decisions.",
];

export default function LoadingScreen({
  message = "Loading exam",
  showProgress = true,
  progress = 0,
  minDisplayTime = 60000, // Default 6 seconds minimum
  onMinimumTimeReached,
  allowPause = true, // Default to allowing pause
  allowSkip = true, // Default to allowing skip
  onSkip,
  onComplete,
  isReady = false,
}: LoadingScreenProps) {
  const [currentQuote, setCurrentQuote] = useState("");
  const [currentTip, setCurrentTip] = useState("");
  const [progressWidth, setProgressWidth] = useState(0);
  const [startTime] = useState(Date.now());
  const [minimumTimeReached, setMinimumTimeReached] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showQuote, setShowQuote] = useState(true); // Alternate between quote and tip

  useEffect(() => {
    // Set initial quote and tip
    setCurrentQuote(
      investmentQuotes[Math.floor(Math.random() * investmentQuotes.length)]
    );
    setCurrentTip(
      investmentTips[Math.floor(Math.random() * investmentTips.length)]
    );

    // Rotate quotes and tips every 4 seconds (only when not paused)
    const interval = setInterval(() => {
      if (!isPaused) {
        setShowQuote((prev) => {
          const newShowQuote = !prev;
          // Update content based on what will be shown next
          if (newShowQuote) {
            setCurrentQuote(
              investmentQuotes[
                Math.floor(Math.random() * investmentQuotes.length)
              ]
            );
          } else {
            setCurrentTip(
              investmentTips[Math.floor(Math.random() * investmentTips.length)]
            );
          }
          return newShowQuote;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle minimum display time (accounting for paused time)
  useEffect(() => {
    if (minimumTimeReached) return;

    const checkMinimumTime = () => {
      const now = Date.now();
      const elapsedTime = now - startTime - totalPausedTime;

      if (elapsedTime >= minDisplayTime) {
        setMinimumTimeReached(true);
        onMinimumTimeReached?.();
      }
    };

    // Check immediately
    checkMinimumTime();

    // Set up interval to check periodically
    const interval = setInterval(checkMinimumTime, 100);

    return () => clearInterval(interval);
  }, [
    minDisplayTime,
    onMinimumTimeReached,
    startTime,
    totalPausedTime,
    minimumTimeReached,
  ]);

  // Check if loading is complete (both minimum time reached and ready)
  useEffect(() => {
    if (minimumTimeReached && isReady && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [minimumTimeReached, isReady, isComplete, onComplete]);

  const togglePause = () => {
    if (isPaused) {
      // Resuming - add the pause duration to total paused time
      if (pauseStartTime) {
        const pauseDuration = Date.now() - pauseStartTime;
        setTotalPausedTime((prev) => prev + pauseDuration);
        setPauseStartTime(null);
      }
    } else {
      // Pausing - record the start time of the pause
      setPauseStartTime(Date.now());
    }
    setIsPaused(!isPaused);
  };

  const handleSkip = () => {
    setMinimumTimeReached(true);
    setIsComplete(true);
    onSkip?.();
    onComplete?.();
  };

  useEffect(() => {
    if (showProgress) {
      // Animate progress bar
      const timer = setTimeout(() => {
        setProgressWidth(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, showProgress]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6 relative overflow-hidden'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-5'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl' />
        <div className='absolute bottom-20 right-20 w-40 h-40 bg-indigo-500 rounded-full blur-3xl' />
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500 rounded-full blur-3xl' />
      </div>

      <div className='w-full max-w-2xl mx-auto relative z-10'>
        {/* Main Loading Content */}
        <div className='text-center mb-12'>
          <div className='flex items-center justify-center gap-6 mb-6'>
            <h2
              className={`text-4xl font-bold text-slate-900 font-serif transition-all duration-500 ${
                isComplete ? "text-emerald-700" : ""
              }`}
            >
              {message}
              {isComplete && (
                <span className='ml-4 text-emerald-600 text-3xl'>✓</span>
              )}
            </h2>

            {allowPause && (
              <button
                onClick={togglePause}
                className={`p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isPaused
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                    : "bg-white hover:bg-slate-50 text-slate-700 shadow-slate-200 border border-slate-200"
                }`}
                title={isPaused ? "Resume reading" : "Pause to read"}
              >
                {isPaused ? (
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
              </button>
            )}
          </div>

          {isPaused && (
            <div className='mb-8 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl shadow-lg'>
              <p className='text-base text-emerald-800 font-semibold flex items-center justify-center gap-3'>
                <span className='text-2xl'>📖</span>
                Paused - Take your time to read!
              </p>
            </div>
          )}

          {allowSkip && (minimumTimeReached || isReady) && (
            <div className='mt-8'>
              <button
                onClick={handleSkip}
                className='px-8 py-4 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-800 rounded-2xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-slate-300'
              >
                Continue →
              </button>
            </div>
          )}

          {showProgress && (
            <div className='mt-10'>
              {/* Progress Bar */}
              <div className='w-full bg-slate-200 rounded-full h-5 overflow-hidden shadow-inner border border-slate-300'>
                <div
                  className='h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-sm relative'
                  style={{ width: `${progressWidth}%` }}
                >
                  {/* Shimmer effect */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse' />
                </div>
              </div>
              <p className='text-base text-slate-700 mt-4 font-semibold'>
                {Math.round(progress)}% complete
                {isComplete && (
                  <span className='ml-3 text-emerald-600 font-bold text-lg'>
                    • Ready to continue
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Content Section - Alternating between Quote and Tip */}
        <div className='min-h-[280px] flex items-center justify-center'>
          <div
            className={`w-full rounded-3xl shadow-2xl p-10 border-2 transition-all duration-700 transform backdrop-blur-sm ${
              showQuote
                ? isPaused
                  ? "bg-gradient-to-br from-blue-50/90 to-indigo-100/90 border-blue-300 scale-105 shadow-blue-200"
                  : "bg-gradient-to-br from-white/95 to-blue-50/95 border-blue-200 scale-100 shadow-slate-200"
                : isPaused
                ? "bg-gradient-to-br from-emerald-50/90 to-green-100/90 border-emerald-300 scale-105 shadow-emerald-200"
                : "bg-gradient-to-br from-white/95 to-emerald-50/95 border-emerald-200 scale-100 shadow-slate-200"
            }`}
          >
            <div className='text-center'>
              <div className='flex items-center justify-center mb-8'>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                    showQuote
                      ? isPaused
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-300"
                        : "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-400"
                      : isPaused
                      ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-300"
                      : "bg-gradient-to-br from-emerald-600 to-green-700 shadow-emerald-400"
                  }`}
                >
                  {showQuote ? (
                    <svg
                      className='w-8 h-8 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : (
                    <svg
                      className='w-8 h-8 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </div>
              </div>

              <h3
                className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                  showQuote
                    ? isPaused
                      ? "text-blue-900"
                      : "text-slate-800"
                    : isPaused
                    ? "text-emerald-900"
                    : "text-slate-800"
                }`}
              >
                {showQuote ? "Investment Wisdom" : "Pro Tip"}
                {isPaused && (
                  <span className='ml-3 text-2xl'>
                    {showQuote ? "📖" : "💡"}
                  </span>
                )}
              </h3>

              <p
                className={`text-lg leading-relaxed transition-colors duration-500 max-w-2xl mx-auto ${
                  showQuote
                    ? isPaused
                      ? "text-blue-800 italic"
                      : "text-slate-700 italic"
                    : isPaused
                    ? "text-emerald-800"
                    : "text-slate-700"
                }`}
              >
                {showQuote ? `"${currentQuote}"` : currentTip}
              </p>

              {/* Content indicator dots */}
              <div className='flex items-center justify-center gap-3 mt-8'>
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    showQuote
                      ? "bg-blue-500 scale-125 shadow-lg shadow-blue-300"
                      : "bg-slate-300 scale-100"
                  }`}
                />
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    !showQuote
                      ? "bg-emerald-500 scale-125 shadow-lg shadow-emerald-300"
                      : "bg-slate-300 scale-100"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className='absolute top-16 left-16 w-20 h-20 bg-blue-400/20 rounded-full animate-pulse blur-sm' />
        <div
          className='absolute bottom-16 right-16 w-16 h-16 bg-indigo-400/20 rounded-full animate-pulse blur-sm'
          style={{ animationDelay: "1s" }}
        />
        <div
          className='absolute top-1/3 right-20 w-12 h-12 bg-slate-400/15 rounded-full animate-pulse blur-sm'
          style={{ animationDelay: "2s" }}
        />
        <div
          className='absolute bottom-1/3 left-20 w-14 h-14 bg-emerald-400/20 rounded-full animate-pulse blur-sm'
          style={{ animationDelay: "0.5s" }}
        />
      </div>
    </div>
  );
}
