import { useTheme } from '@/contexts/theme-context';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="py-1">
      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Theme</div>
      <div className="px-1">
        <button
          onClick={() => setTheme('light')}
          className={`w-full text-left px-4 py-2 text-sm ${
            theme === 'light'
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Light
          </div>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`w-full text-left px-4 py-2 text-sm ${
            theme === 'dark'
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            Dark
          </div>
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`w-full text-left px-4 py-2 text-sm ${
            theme === 'system'
              ? 'bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            System
          </div>
        </button>
      </div>
    </div>
  );
}
