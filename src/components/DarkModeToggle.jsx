import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative p-3 rounded-full transition-colors duration-500
        ${isDark 
          ? 'bg-night-surface text-night-neonBlue shadow-neon' 
          : 'bg-journal-mint text-journal-accent shadow-soft'
        }
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle dark mode"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 180, opacity: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      >
        {isDark ? (
          <Moon size={22} className="drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
        ) : (
          <Sun size={22} />
        )}
      </motion.div>
    </motion.button>
  );
}