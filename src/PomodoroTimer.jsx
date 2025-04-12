import React, { useEffect, useRef, useState } from "react";

function PomodoroTimer() {
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);

  const [customFocusMinutes, setCustomFocusMinutes] = useState(25);
  const [customBreakMinutes, setCustomBreakMinutes] = useState(5);
  const [sessionHistory, setSessionHistory] = useState(() => {
    const saved = localStorage.getItem("pomodoroSessions");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [pomodoroPos, setPomodoroPos] = useState(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      x: width - 240, // adjust to match width of the timer box
      y: height - 180, // adjust to match height
    };
  });
    const pomodoroRef = useRef(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });


 

  // Countdown logic
  useEffect(() => {
    if (!isPomodoroRunning) return;

    const interval = setInterval(() => {
      setPomodoroTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const nextIsBreak = !isOnBreak;
          setIsPomodoroRunning(false);
          setIsOnBreak(nextIsBreak);
          const newTime = nextIsBreak
            ? customBreakMinutes * 60
            : customFocusMinutes * 60;
          setPomodoroTime(newTime);


          if (!isOnBreak) {
            const now = new Date();
            const session = {
              date: now.toLocaleDateString(),
              time: now.toLocaleTimeString(),
            };
        
            setSessionHistory((prevHistory) => {
              const updated = [session, ...prevHistory];
              localStorage.setItem("pomodoroSessions", JSON.stringify(updated));
              return updated;
            });
          }
          return newTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPomodoroRunning, isOnBreak, customFocusMinutes, customBreakMinutes]);

  // Dragging logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      setPomodoroPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const formattedTime = `${String(Math.floor(pomodoroTime / 60)).padStart(
    2,
    "0"
  )}:${String(pomodoroTime % 60).padStart(2, "0")}`;

  return (
    <div
      ref={pomodoroRef}
      style={{
        left: pomodoroPos.x,
        top: pomodoroPos.y,
      }}
      className="absolute bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg p-4 text-center z-50 cursor-move"
      onMouseDown={(e) => {
        const rect = pomodoroRef.current.getBoundingClientRect();
        offset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        isDragging.current = true;
      }}
    >
      <h3 className="text-lg font-semibold mb-1">
        {isOnBreak ? "🌴 Break Time" : "🍅 Focus Time"}
      </h3>
      <div className="text-2xl font-mono mb-2">{formattedTime}</div>

      <div className="flex justify-center gap-2 mb-3">
        <button
          onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPomodoroRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => {
            setIsPomodoroRunning(false);
            setIsOnBreak(false);
            setPomodoroTime(customFocusMinutes * 60);
          }}
          className="px-2 py-1 text-sm bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
        >
          Reset
        </button>
      </div>

      {/* Custom Input */}
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <div>
          <label className="mr-2">Focus:</label>
          <input
            type="number"
            min="1"
            className="w-14 px-2 py-1 rounded border dark:border-gray-600 bg-white dark:bg-gray-700"
            value={customFocusMinutes}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setCustomFocusMinutes(value);
              if (!isOnBreak) setPomodoroTime(value * 60);
            }}
          />
          <span className="ml-1">min</span>
        </div>
        <div>
          <label className="mr-2">Break:</label>
          <input
            type="number"
            min="1"
            className="w-14 px-2 py-1 rounded border dark:border-gray-600 bg-white dark:bg-gray-700"
            value={customBreakMinutes}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setCustomBreakMinutes(value);
              if (isOnBreak) setPomodoroTime(value * 60);
            }}
          />
          <span className="ml-1">min</span>
        </div>


      </div>
    </div>
  );
}

export default PomodoroTimer;
