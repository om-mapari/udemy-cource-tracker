import React from "react";

const LectureTable = ({
  courseContent,
  collapsedChapters,
  setCollapsedChapters,
  completedLectures,
  toggleCompletion,
  toggleChapterCompletion,
  bookmarkedLectures,
  toggleBookmark,
  showOnlyFavorites,
}) => {
  const totalTimeForChapter = (lectures) =>
    lectures.reduce((total, lec) => total + (lec.asset?.time_estimation || 0), 0);
  console.log('Toggling bookmark')
  return (
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
    e.stopPropagation(); // prevent parent click
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
  );
};

export default LectureTable;
