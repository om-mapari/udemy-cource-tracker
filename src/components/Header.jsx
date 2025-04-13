import React, { useState } from "react";

const Header = ({
  darkMode,
  setDarkMode,
  allCollapsed,
  toggleAllCollapse,
  showOnlyFavorites,
  setShowOnlyFavorites,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Settings Toggle Button */}
      <div className="p-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded shadow hover:bg-gray-400 dark:hover:bg-gray-600 transition"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Slide-in Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex flex-col gap-3">
          {/* Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="self-end text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
          >
            ❌
          </button>

          {/* Control Buttons */}
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              setSidebarOpen(false);
            }}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <button
            onClick={() => {
              toggleAllCollapse();
              setSidebarOpen(false);
            }}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {allCollapsed ? "📂 Expand All" : "📁 Collapse All"}
          </button>

          <button
            onClick={() => {
              setShowOnlyFavorites(!showOnlyFavorites);
              setSidebarOpen(false);
            }}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {showOnlyFavorites ? "📖 Show All" : "⭐️ Show Favorites"}
          </button>
        </div>
      </div>

      {/* Optional Overlay when Sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Header;
