import React from "react";

const ProgressBar = ({ completedCount, totalLectures, completionPercent, timeLeftMinutes }) => {
  return (
    <div className="mb-6 sticky top-0 bg-gray-50 dark:bg-gray-900 py-4 z-10">
      <h2 className="text-xl font-semibold text-center mb-2">
        Progress: {completedCount}/{totalLectures} lectures completed ({completionPercent}%)
        <p className="text-center text-md text-gray-600 dark:text-gray-300">
          ⏱ Estimated time remaining: {timeLeftMinutes} minutes
        </p>
      </h2>
      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
