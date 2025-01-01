'use client';

import { useEffect, useRef, useState } from 'react';

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingItems, setIsExportingItems] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const calendarUrlRef = useRef<HTMLInputElement>(null);
  const [calendarToken, setCalendarToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has an existing calendar token
    async function checkCalendarToken() {
      try {
        const response = await fetch('/api/calendar/token');
        if (response.ok) {
          const data = await response.json();
          setCalendarToken(data.token);
        }
      } catch (error) {
        console.error('Error checking calendar token:', error);
      }
    }
    checkCalendarToken();
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="space-y-8">
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

            <div>
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

            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
