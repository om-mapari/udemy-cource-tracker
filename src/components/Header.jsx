import React from "react";

const Header = ({ darkMode, setDarkMode, allCollapsed, toggleAllCollapse, showOnlyFavorites, setShowOnlyFavorites }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      <button
        onClick={toggleAllCollapse}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        {allCollapsed ? "📂 Expand All" : "📁 Collapse All"}
      </button>
      <button
        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        {showOnlyFavorites ? "📖 Show All" : "⭐️ Show Favorites"}
      </button>
    </div>
  );
};

export default Header;
