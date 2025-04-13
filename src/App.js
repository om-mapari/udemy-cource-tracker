import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import LectureTable from "./components/LectureTable";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

function App() {
  const [courseContent, setCourseContent] = useState([]);
  const [completedLectures, setCompletedLectures] = useState(() => {
    const saved = localStorage.getItem("completedLectures");
    return saved ? JSON.parse(saved) : [];
  });
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored !== null ? stored === "true" : true;
  });
  const [bookmarkedLectures, setBookmarkedLectures] = useState(() => {
    const saved = localStorage.getItem("bookmarkedLectures");
    return saved ? JSON.parse(saved) : [];
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        const grouped = [];
        let currentChapter = null;
        for (const item of data.results || []) {
          if (item._class === "chapter") {
            currentChapter = { ...item, lectures: [] };
            grouped.push(currentChapter);
          } else if (item._class === "lecture" && currentChapter) {
            currentChapter.lectures.push(item);
          }
        }
        setCourseContent(grouped);
        const initCollapsed = {};
        grouped.forEach((ch) => {
          const allLecturesCompleted = ch.lectures.every((lec) =>
            completedLectures.includes(lec.id)
          );
          initCollapsed[ch.id] = allLecturesCompleted; // true = collapsed
        });
        setCollapsedChapters(initCollapsed);
      });
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
    setCompletedLectures((prev) => {
      const isCompleted = prev.includes(lectureId);
      const updated = isCompleted
        ? prev.filter((id) => id !== lectureId)
        : [...prev, lectureId];

      toast(isCompleted ? "Lecture marked incomplete ⛔️" : "Lecture marked complete ✅");
      return updated;
    });
  };


  const toggleChapterCompletion = (chapterId, isComplete) => {
    const chapter = courseContent.find((ch) => ch.id === chapterId);
    const lectureIds = chapter.lectures.map((lec) => lec.id);
    setCompletedLectures((prev) =>
      isComplete ? [...new Set([...prev, ...lectureIds])] : prev.filter((id) => !lectureIds.includes(id))
    );
  };

  const toggleAllCollapse = () => {
    const newState = {};
    courseContent.forEach((ch) => (newState[ch.id] = !allCollapsed));
    setCollapsedChapters(newState);
    setAllCollapsed(!allCollapsed);
  };

  const toggleBookmark = (lectureId) => {
    setBookmarkedLectures((prev) => {
      const isBookmarked = prev.includes(lectureId);
      const updated = isBookmarked
        ? prev.filter((id) => id !== lectureId)
        : [...prev, lectureId];

      toast(isBookmarked ? "Removed from bookmarks ❌" : "Lecture bookmarked ⭐️");
      return updated;
    });
  };


  const totalLectures = courseContent.reduce((acc, ch) => acc + ch.lectures.length, 0);
  const completedCount = completedLectures.length;
  const allLectures = courseContent.flatMap((ch) => ch.lectures);

  const totalTimeSeconds = allLectures.reduce(
    (acc, lec) => acc + (lec.asset?.time_estimation || 0),
    0
  );

  const completedTimeSeconds = allLectures
    .filter((lec) => completedLectures.includes(lec.id))
    .reduce((acc, lec) => acc + (lec.asset?.time_estimation || 0), 0);

  const totalTimeHours = (totalTimeSeconds / 3600).toFixed(1);
  const completedTimeHours = (completedTimeSeconds / 3600).toFixed(1);


  const completionPercent = totalTimeSeconds
    ? Math.round((completedTimeSeconds / totalTimeSeconds) * 100)
    : 0;

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-white"}`}>
      <div className="p-4 max-w-5xl mx-auto bg-gray-50 dark:bg-gray-900 shadow-lg rounded-lg text-gray-800 dark:text-gray-100">
        <Toaster position="top-right" toastOptions={{ duration: 2000 }} />

        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          allCollapsed={allCollapsed}
          toggleAllCollapse={toggleAllCollapse}
          showOnlyFavorites={showOnlyFavorites}
          setShowOnlyFavorites={setShowOnlyFavorites}
        />
        <ProgressBar
          completedCount={completedCount}
          totalLectures={totalLectures}
          completionPercent={completionPercent}
          completedTimeHours={completedTimeHours}
          totalTimeHours={totalTimeHours}
        />

        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
          📚 Udemy Course Tracker ✅
        </h1>
        <LectureTable
          courseContent={courseContent}
          collapsedChapters={collapsedChapters}
          setCollapsedChapters={setCollapsedChapters}
          completedLectures={completedLectures}
          toggleCompletion={toggleCompletion}
          toggleChapterCompletion={toggleChapterCompletion}
          bookmarkedLectures={bookmarkedLectures}
          toggleBookmark={toggleBookmark}
          showOnlyFavorites={showOnlyFavorites}
        />
      </div>
    </div>
  );
}

export default App;
