import React, { useEffect, useState } from "react";

function App() {
  const [courseContent, setCourseContent] = useState([]);
  const [completedLectures, setCompletedLectures] = useState(() => {
    const saved = localStorage.getItem("completedLectures");
    return saved ? JSON.parse(saved) : [];
  });

  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored !== null ? stored === "true" : true; // default to dark mode
  });
  
  const [bookmarkedLectures, setBookmarkedLectures] = useState(() => {
    const saved = localStorage.getItem("bookmarkedLectures");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("bookmarkedLectures", JSON.stringify(bookmarkedLectures));
  }, [bookmarkedLectures]);

  const toggleBookmark = (lectureId) => {
    setBookmarkedLectures((prev) =>
      prev.includes(lectureId)
        ? prev.filter((id) => id !== lectureId)
        : [...prev, lectureId]
    );
  };
  
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const [collapsedChapters, setCollapsedChapters] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        const results = data.results || [];
        const grouped = [];
        let currentChapter = null;

        for (const item of results) {
          if (item._class === "chapter") {
            currentChapter = {
              id: item.id,
              title: item.title,
              object_index: item.object_index,
              lectures: [],
            };
            grouped.push(currentChapter);
          } else if (item._class === "lecture" && currentChapter) {
            currentChapter.lectures.push(item);
          }
        }

        setCourseContent(grouped);

        // Set all chapters expanded initially
        const initialCollapsed = {};
        grouped.forEach((ch) => {
          initialCollapsed[ch.id] = false;
        });
        setCollapsedChapters(initialCollapsed);
      })
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("completedLectures", JSON.stringify(completedLectures));
  }, [completedLectures]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleCompletion = (lectureId) => {
    setCompletedLectures((prev) =>
      prev.includes(lectureId)
        ? prev.filter((id) => id !== lectureId)
        : [...prev, lectureId]
    );
  };

  const toggleChapterCompletion = (chapterId, isComplete) => {
    setCompletedLectures((prev) => {
      const lectureIds = courseContent
        .find((chapter) => chapter.id === chapterId)
        .lectures.map((lec) => lec.id);
      return isComplete
        ? [...new Set([...prev, ...lectureIds])]
        : prev.filter((id) => !lectureIds.includes(id));
    });
  };

  const toggleAllCollapse = () => {
    const newCollapsed = {};
    courseContent.forEach((chapter) => {
      newCollapsed[chapter.id] = !allCollapsed;
    });
    setCollapsedChapters(newCollapsed);
    setAllCollapsed(!allCollapsed);
  };

  const totalTimeForChapter = (lectures) => {
    return lectures.reduce((total, lec) => total + (lec.asset?.time_estimation || 0), 0);
  };

  const totalLectures = courseContent.reduce(
    (acc, chapter) => acc + chapter.lectures.length,
    0
  );
  const completedCount = completedLectures.length;
  const completionPercent = totalLectures
    ? Math.round((completedCount / totalLectures) * 100)
    : 0;

    return (
      <div className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-white"}`}>
        <div className="p-4 max-w-5xl mx-auto bg-gray-50 dark:bg-gray-900 shadow-lg rounded-lg text-gray-800 dark:text-gray-100">
          {/* ... rest of your code ... */}
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

        {/* Sticky Progress */}
        <div className="mb-6 sticky top-0 bg-gray-50 dark:bg-gray-900 py-4 z-10">
          <h2 className="text-xl font-semibold text-center mb-2">
            Progress: {completedCount}/{totalLectures} lectures completed ({completionPercent}%)
<p className="text-center text-md text-gray-600 dark:text-gray-300">
  ⏱ Estimated time remaining: {Math.ceil(
    courseContent
      .flatMap((ch) => ch.lectures)
      .filter((lec) => !completedLectures.includes(lec.id))
      .reduce((acc, lec) => acc + (lec.asset?.time_estimation || 0), 0) / 60
  )} minutes
</p>

          </h2>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
          📚 Udemy Course Tracker ✅
        </h1>

        <div className="overflow-x-auto px-4 py-3">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800">
                <th className="px-4 py-2 text-left">Lecture/Chapter Name</th>
                <th className="px-4 py-2 text-left">Time (min)</th>
                <th className="px-4 py-2 text-left">Mark Complete</th>
              </tr>
            </thead>
            <tbody>
              {courseContent.map((chapter) => {
                const chapterTotalTime = totalTimeForChapter(chapter.lectures);
                const allLecturesCompleted = chapter.lectures.every((lec) =>
                  completedLectures.includes(lec.id)
                );
                const isCollapsed = collapsedChapters[chapter.id];
                return (
                  <React.Fragment key={chapter.id}>
                    {/* Chapter Row */}
                    <tr className="bg-blue-200 dark:bg-blue-900 font-semibold text-lg">
  <td
    className="px-4 py-2 text-gray-700 dark:text-gray-100 cursor-pointer"
    onClick={() =>
      setCollapsedChapters((prev) => ({
        ...prev,
        [chapter.id]: !prev[chapter.id],
      }))
    }
  >
    {isCollapsed ? "📁" : "📂"} <strong>{chapter.title}</strong>
  </td>
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-300">
                        {Math.ceil(chapterTotalTime / 60)} min
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={allLecturesCompleted}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleChapterCompletion(chapter.id, !allLecturesCompleted);
                          }}
                        />
                      </td>
                    </tr>

                    {/* Lecture Rows */}
                    {!isCollapsed &&
                        chapter.lectures
                        .filter((lec) => !showOnlyFavorites || bookmarkedLectures.includes(lec.id))
                        .map((lec) => {
                        const isCompleted = completedLectures.includes(lec.id);
                        return (
                          <tr
                            key={lec.id}
                            className={`${
                              isCompleted
                                ? "bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800"
                                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                            } transition-all duration-200`}
                          >
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-100">
                            <span
  className="cursor-pointer mr-2"
  onClick={(e) => {
    e.stopPropagation();
    toggleBookmark(lec.id);
  }}
>
  {bookmarkedLectures.includes(lec.id) ? "⭐️" : "☆"}
</span>
🎥 {lec.title}
                            </td>
                            <td className="px-4 py-2 text-gray-500 dark:text-gray-300">
                              {Math.ceil((lec.asset?.time_estimation || 0) / 60)} min
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={isCompleted}
                                onChange={() => toggleCompletion(lec.id)}
                                                              />
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
