import React, { useEffect, useState } from "react";

function App() {
  const [courseContent, setCourseContent] = useState([]);
  const [completedLectures, setCompletedLectures] = useState(() => {
    const saved = localStorage.getItem("completedLectures");
    return saved ? JSON.parse(saved) : [];
  });
  const [bookmarkedLectures, setBookmarkedLectures] = useState(() => {
    const saved = localStorage.getItem("bookmarkedLectures");
    return saved ? JSON.parse(saved) : [];
  });
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored !== null ? stored === "true" : true;
  });
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
    localStorage.setItem("bookmarkedLectures", JSON.stringify(bookmarkedLectures));
  }, [bookmarkedLectures]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleCompletion = (lectureId) => {
    setCompletedLectures((prev) =>
      prev.includes(lectureId) ? prev.filter((id) => id !== lectureId) : [...prev, lectureId]
    );
  };

  const toggleBookmark = (lectureId) => {
    setBookmarkedLectures((prev) =>
      prev.includes(lectureId) ? prev.filter((id) => id !== lectureId) : [...prev, lectureId]
    );
  };

  const toggleChapterCompletion = (chapterId, isComplete) => {
    const lectureIds = courseContent
      .find((chapter) => chapter.id === chapterId)
      .lectures.map((lec) => lec.id);
    setCompletedLectures((prev) =>
      isComplete ? [...new Set([...prev, ...lectureIds])] : prev.filter((id) => !lectureIds.includes(id))
    );
  };

  const toggleAllCollapse = () => {
    const newCollapsed = {};
    courseContent.forEach((chapter) => {
      newCollapsed[chapter.id] = !allCollapsed;
    });
    setCollapsedChapters(newCollapsed);
    setAllCollapsed(!allCollapsed);
  };

  const totalTimeForChapter = (lectures) =>
    lectures.reduce((total, lec) => total + (lec.asset?.time_estimation || 0), 0);

  const totalLectures = courseContent.reduce((acc, chapter) => acc + chapter.lectures.length, 0);
  const completedCount = completedLectures.length;
  const completionPercent = totalLectures
    ? Math.round((completedCount / totalLectures) * 100)
    : 0;

  const remainingTime = courseContent
    .flatMap((ch) => ch.lectures)
    .filter((lec) => !completedLectures.includes(lec.id))
    .reduce((acc, lec) => acc + (lec.asset?.time_estimation || 0), 0);

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-white"} transition-colors duration-500`}>
      <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 shadow-md p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          📚 Udemy Tracker
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="btn-control">
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button onClick={toggleAllCollapse} className="btn-control">
            {allCollapsed ? "📂 Expand All" : "📁 Collapse All"}
          </button>
          <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} className="btn-control">
            {showOnlyFavorites ? "📖 Show All" : "⭐️ Favorites"}
          </button>
        </div>
      </header>

      <main className="p-4 max-w-5xl mx-auto text-gray-800 dark:text-gray-100">
        <section className="mb-6 text-center">
          <h2 className="text-xl font-semibold mb-2">
            ✅ {completedCount}/{totalLectures} completed ({completionPercent}%)
          </h2>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            ⏱ Time left: {Math.ceil(remainingTime / 60)} mins
          </p>
        </section>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-separate border-spacing-y-2">
            <thead>
              <tr className="text-sm font-medium bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <th className="px-4 py-2 text-left">Lecture/Chapter</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Done</th>
              </tr>
            </thead>
            <tbody>
              {courseContent.map((chapter) => {
                const isCollapsed = collapsedChapters[chapter.id];
                const chapterTime = totalTimeForChapter(chapter.lectures);
                const allComplete = chapter.lectures.every((lec) => completedLectures.includes(lec.id));
                return (
                  <React.Fragment key={chapter.id}>
                    <tr className="bg-blue-100 dark:bg-blue-900 text-lg font-semibold">
                      <td
                        colSpan="1"
                        onClick={() =>
                          setCollapsedChapters((prev) => ({
                            ...prev,
                            [chapter.id]: !prev[chapter.id],
                          }))
                        }
                        className="px-4 py-2 cursor-pointer"
                      >
                        {isCollapsed ? "📁" : "📂"} {chapter.title}
                      </td>
                      <td className="px-4 py-2 text-sm text-blue-700 dark:text-blue-200">
                        {Math.ceil(chapterTime / 60)} min
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={allComplete}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleChapterCompletion(chapter.id, !allComplete);
                          }}
                          className="h-5 w-5 text-green-500"
                        />
                      </td>
                    </tr>
                    {!isCollapsed &&
                      chapter.lectures
                        .filter((lec) => !showOnlyFavorites || bookmarkedLectures.includes(lec.id))
                        .map((lec) => {
                          const completed = completedLectures.includes(lec.id);
                          return (
                            <tr
                              key={lec.id}
                              className={`transition duration-200 ${
                                completed
                                  ? "bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800"
                                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                              }`}
                            >
                              <td className="px-4 py-2">
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
                              <td className="px-4 py-2 text-sm">
                                {Math.ceil((lec.asset?.time_estimation || 0) / 60)} min
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="checkbox"
                                  checked={completed}
                                  onChange={() => toggleCompletion(lec.id)}
                                  className="h-5 w-5 text-green-500"
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
      </main>
    </div>
  );
}

export default App;
