'use client';

import { Combobox } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingItems, setIsExportingItems] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const calendarUrlRef = useRef<HTMLInputElement>(null);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [timezones] = useState(() => {
    // Get unique timezone names using Intl API
    const timezonesSet = new Set(
      Intl.supportedValuesOf('timeZone').sort((a, b) => {
        // Sort by region, then city
        const [regionA, ...cityA] = a.split('/');
        const [regionB, ...cityB] = b.split('/');
        if (regionA === regionB) {
          return cityA.join('/').localeCompare(cityB.join('/'));
        }
        return regionA.localeCompare(regionB);
      })
    );
    return Array.from(timezonesSet);
  });
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    if (typeof window !== 'undefined') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return 'UTC';
  });
  const [isUpdatingTimezone, setIsUpdatingTimezone] = useState(false);
  const [query, setQuery] = useState('');

  const filteredTimezones =
    query === ''
      ? timezones
      : timezones.filter((timezone) => {
          return timezone.toLowerCase().replace(/_/g, ' ').includes(query.toLowerCase());
        });

  useEffect(() => {
    // Check if user has an existing calendar token and timezone
    async function loadUserSettings() {
      try {
        const [calendarResponse, timezoneResponse] = await Promise.all([
          fetch('/api/calendar/token'),
          fetch('/api/settings/timezone'),
        ]);

        if (calendarResponse.ok) {
          const data = await calendarResponse.json();
          setCalendarToken(data.token);
        }

        if (timezoneResponse.ok) {
          const data = await timezoneResponse.json();
          setSelectedTimezone(data.timezone);
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    }
    loadUserSettings();
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);

      const response = await fetch('/api/export');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename =
        contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'homedocs-export.json';

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportItems = async () => {
    try {
      setIsExportingItems(true);
      setError(null);

      const response = await fetch('/api/export/items');
      if (!response.ok) {
        throw new Error('Failed to export items');
      }

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'items.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting items:', error);
      setError(error instanceof Error ? error.message : 'Failed to export items');
    } finally {
      setIsExportingItems(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setError(null);

      // Read the file
      const text = await file.text();
      const data = JSON.parse(text);

      // Send the data to the API
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import data');
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload the page to show the imported data
      window.location.reload();
    } catch (error) {
      console.error('Error importing data:', error);
      setError(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleGenerateToken = async () => {
    try {
      setIsGeneratingToken(true);
      setError(null);

      const response = await fetch('/api/calendar/token', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate calendar token');
      }

      const data = await response.json();
      setCalendarToken(data.token);
    } catch (error) {
      console.error('Error generating calendar token:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate calendar token');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleRevokeToken = async () => {
    if (
      !confirm(
        'Are you sure you want to revoke this calendar token? All calendar subscriptions using this URL will stop working.'
      )
    ) {
      return;
    }

    try {
      setIsGeneratingToken(true);
      setError(null);

      const response = await fetch('/api/calendar/token', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke calendar token');
      }

      setCalendarToken(null);
    } catch (error) {
      console.error('Error revoking calendar token:', error);
      setError(error instanceof Error ? error.message : 'Failed to revoke calendar token');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCopyCalendarUrl = () => {
    if (calendarUrlRef.current) {
      calendarUrlRef.current.select();
      document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      alert('Calendar URL copied to clipboard!');
    }
  };

  const getCalendarUrl = () => {
    if (!calendarToken) return '';
    return `${window.location.origin}/api/calendar/tasks?token=${calendarToken}`;
  };

  const handleTimezoneChange = async (newTimezone: string | null) => {
    if (!newTimezone) return;

    const originalTimezone = selectedTimezone;

    try {
      setIsUpdatingTimezone(true);
      setError(null);
      setSelectedTimezone(newTimezone);

      const response = await fetch('/api/settings/timezone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timezone: newTimezone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update timezone');
      }
    } catch (error) {
      // Revert the timezone if the update failed
      setSelectedTimezone(originalTimezone);

      // Set the error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to update timezone';
      console.error('Error updating timezone:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsUpdatingTimezone(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Data Management
          </button>
        </nav>
      </div>

      <div className="space-y-8">
        {activeTab === 'general' && (
          <>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Preferences
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Theme
                  </label>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Timezone
                  </label>
                  <div className="relative mt-1">
                    <Combobox
                      value={selectedTimezone}
                      onChange={handleTimezoneChange}
                      disabled={isUpdatingTimezone}
                    >
                      <div className="relative">
                        <Combobox.Input
                          className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          onChange={(event) => setQuery(event.target.value)}
                          displayValue={(timezone: string) => timezone.replace(/_/g, ' ')}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Combobox.Button>
                      </div>
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredTimezones.length === 0 && query !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                            Nothing found.
                          </div>
                        ) : (
                          filteredTimezones.map((timezone) => (
                            <Combobox.Option
                              key={timezone}
                              value={timezone}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                                    : 'text-gray-900 dark:text-white'
                                }`
                              }
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                  >
                                    {timezone.replace(/_/g, ' ')}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-blue-600 dark:text-blue-500'
                                      }`}
                                    >
                                      <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Combobox>
                    {isUpdatingTimezone && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Current time:{' '}
                    {new Date().toLocaleTimeString('en-US', { timeZone: selectedTimezone })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Calendar Integration
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Subscribe to your tasks in your favorite calendar application. Tasks will
                automatically sync and update.
              </p>
              <div className="space-y-4">
                {calendarToken ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        ref={calendarUrlRef}
                        readOnly
                        value={getCalendarUrl()}
                        className="flex-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                      <button
                        onClick={handleCopyCalendarUrl}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Copy URL
                      </button>
                    </div>
                    <div className="flex space-x-4">
                      <a
                        href={`webcal://${window.location.host}/api/calendar/tasks?token=${calendarToken}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Subscribe in Calendar
                      </a>
                      <button
                        onClick={handleRevokeToken}
                        disabled={isGeneratingToken}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Revoke Access
                      </button>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>To add this calendar:</p>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Copy the URL above</li>
                        <li>Open your calendar application</li>
                        <li>Add a new calendar subscription</li>
                        <li>Paste the URL when prompted</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Generate a secure URL to access your tasks in your calendar application.
                    </p>
                    <button
                      onClick={handleGenerateToken}
                      disabled={isGeneratingToken}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isGeneratingToken ? 'Generating...' : 'Generate Calendar URL'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'data' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Data Export
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Download all your data in JSON format. This includes your homes, rooms, items,
                  tasks, and more.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Exporting...
                      </>
                    ) : (
                      'Export All Data (JSON)'
                    )}
                  </button>
                  <button
                    onClick={handleExportItems}
                    disabled={isExportingItems}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExportingItems ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Exporting...
                      </>
                    ) : (
                      'Export Items (CSV)'
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Data Import
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Import data from a previously exported JSON file. This will add any new homes and
                  their contents to your account.
                </p>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImport}
                    accept=".json"
                    disabled={isImporting}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-600 file:text-white
                      file:dark:bg-blue-500
                      hover:file:bg-blue-700
                      dark:hover:file:bg-blue-600
                      file:disabled:opacity-50 file:disabled:cursor-not-allowed"
                  />
                  {isImporting && (
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
}
