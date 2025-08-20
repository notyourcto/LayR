import React, { useState, useEffect } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';

interface LoadingIndicatorProps {
  stage?: 'processing' | 'cropping' | 'finalizing';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ stage = 'processing' }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const messages = [
    "🎨 Analyzing your image...",
    "✂️ Removing background with magic...",
    "🔍 Fine-tuning the edges...",
    "✨ Almost ready! Polishing the result...",
    "🎯 Perfect! Just a few more seconds..."
  ];

  const funFacts = [
    "💡 Tip: You can add text both behind and in front of your subject!",
    "🎨 Pro tip: Try different blend modes for creative text effects!",
    "⚡ Fun fact: Our system processes millions of pixels to get the perfect crop!",
    "🌟 Did you know? You can adjust brightness, contrast, and rotation!",
    "🎭 Creative idea: Use shadows and strokes to make text pop!"
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 8000); // Change message every 8 seconds

    const timeInterval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000); // Update time every second

    return () => {
      clearInterval(messageInterval);
      clearInterval(timeInterval);
    };
  }, [messages.length]);

  const getProgressWidth = () => {
    // Simulate progress based on time elapsed (assuming 45 seconds average)
    const progress = Math.min((timeElapsed / 45) * 100, 95); // Cap at 95% until actually done
    return `${progress}%`;
  };

  const getTimeEstimate = () => {
    if (timeElapsed < 20) return "40-60 seconds remaining";
    if (timeElapsed < 35) return "20-30 seconds remaining";
    if (timeElapsed < 50) return "Almost done!";
    return "Just a moment more...";
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-lg border">
      {/* Main loading animation */}
      <div className="flex items-center space-x-3">
        <ReloadIcon className="animate-spin h-6 w-6 text-orange-600" />
        <span className="text-lg font-medium">Processing your image...</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{getTimeEstimate()}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: getProgressWidth() }}
          />
        </div>
      </div>

      {/* Current stage message */}
      <div className="text-center space-y-2">
        <p className="text-base font-medium text-orange-700 dark:text-orange-400">
          {messages[currentMessage]}
        </p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Our AI is carefully removing the background from your image. This usually takes 40-60 seconds for the best quality results.
        </p>
      </div>

      {/* Fun tip */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 max-w-md">
        <p className="text-sm text-orange-800 dark:text-orange-200">
          {funFacts[currentMessage % funFacts.length]}
        </p>
      </div>

      {/* Coffee suggestion */}
      <div className="text-center space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-muted-foreground">
          ☕ Perfect time to grab a coffee or explore our features!
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Text layers</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Blend modes</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">3D effects</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Image filters</span>
        </div>
      </div>

      {/* Time elapsed */}
      <div className="text-xs text-muted-foreground">
        Processing time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default LoadingIndicator;
