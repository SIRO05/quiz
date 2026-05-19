import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ExamControls({ mode, tasksLength, onFinish }) {
  // mode: "all" or "custom"
  const INITIAL_TIME = mode === 'all' ? 45 * 60 : tasksLength * 5 * 60;

  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1 && !isOvertime) {
          setIsOvertime(true);
          return 0; // jump to 0 and switch to count up
        }
        return isOvertime ? prev + 1 : prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOvertime]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formattedStr = isOvertime ? `+${formatTime(timeLeft)}` : formatTime(timeLeft);
  const colorClass = isOvertime ? 'text-red-500 font-bold' : 'text-gray-800 dark:text-gray-200';

  return (
    <div className="fixed bottom-0 w-full left-0 bg-white dark:bg-night-surface border-t border-gray-200 dark:border-white/10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition text-sm font-medium"
        >
          Назад
        </Link>
        <div className={`text-xl font-mono ${colorClass}`}>
          {formattedStr}
        </div>
        <button
          onClick={() => onFinish({ isOvertime, timeValue: timeLeft, totalMaxTime: INITIAL_TIME })}
          className="px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-600 text-white transition text-sm font-medium"
        >
          Завершить тест
        </button>
      </div>
    </div>
  );
}
