'use client';

import { useEffect, useState } from 'react';

import packageJson from '../../../package.json';

interface GitHubRelease {
  tag_name: string;
  html_url: string;
}

export function VersionCheck() {
  const [latestVersion, setLatestVersion] = useState<GitHubRelease | null>(null);
  const currentVersion = packageJson.version;

  useEffect(() => {
    async function checkVersion() {
      try {
        const response = await fetch(
          'https://api.github.com/repos/jhofker/homedocs/releases/latest'
        );
        if (response.ok) {
          const data = await response.json();
          const tagName = data.tag_name.replace('v', '');
          setLatestVersion({ tag_name: tagName, html_url: data.html_url });
        }
      } catch (error) {
        console.error('Failed to fetch latest version:', error);
      }
    }

    checkVersion();
  }, []);

  const isOutdated = latestVersion && latestVersion.tag_name !== currentVersion;

  return isOutdated ? (
    <a
      href={latestVersion.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 text-sm ml-2"
      title="Click to view the latest release"
    >
      v{currentVersion} ({latestVersion.tag_name} available)
    </a>
  ) : (
    <a
      href="https://github.com/jhofker/homedocs"
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm ml-2"
    >
      v{currentVersion}
    </a>
  );
}
