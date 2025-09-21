"use client";

import { useEffect, useState } from "react";

interface QuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const investmentTips = [
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

export default function QuotesModal({ isOpen, onClose }: QuotesModalProps) {
  const [activeTab, setActiveTab] = useState<"quotes" | "tips">("quotes");
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentContent =
    activeTab === "quotes" ? investmentQuotes : investmentTips;
  const currentItem = currentContent[currentIndex];

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % currentContent.length);
  };

  const prevItem = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + currentContent.length) % currentContent.length
    );
  };

  // Reset index when switching tabs
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex gap-2'>
            <button
              onClick={() => setActiveTab("quotes")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "quotes"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Investment Wisdom
            </button>
            <button
              onClick={() => setActiveTab("tips")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "tips"
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Pro Tips
            </button>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='p-8'>
          <div className='text-center'>
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${
                activeTab === "quotes"
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                  : "bg-gradient-to-br from-emerald-500 to-green-600"
              }`}
            >
              {activeTab === "quotes" ? (
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

            {/* Content */}
            <h3 className='text-2xl font-bold text-gray-900 mb-6'>
              {activeTab === "quotes" ? "Investment Wisdom" : "Pro Tip"}
            </h3>

            <div className='min-h-[120px] flex items-center justify-center'>
              <p
                className={`text-lg leading-relaxed ${
                  activeTab === "quotes"
                    ? "italic text-gray-700"
                    : "text-gray-700"
                }`}
              >
                {activeTab === "quotes" ? `"${currentItem}"` : currentItem}
              </p>
            </div>

            {/* Navigation */}
            <div className='flex items-center justify-center gap-4 mt-8'>
              <button
                onClick={prevItem}
                className='p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>

              <div className='flex gap-2'>
                {currentContent.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? activeTab === "quotes"
                          ? "bg-blue-500 scale-125"
                          : "bg-emerald-500 scale-125"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextItem}
                className='p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>

            {/* Counter */}
            <p className='text-sm text-gray-500 mt-4'>
              {currentIndex + 1} of {currentContent.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
