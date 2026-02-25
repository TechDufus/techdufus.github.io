const starsCache = new Map<string, number | null>();
const GITHUB_TIMEOUT_MS = 2600;

const parseRepoPath = (repoUrl: string): string | null => {
  try {
    const url = new URL(repoUrl);
    if (url.hostname !== 'github.com') {
      return null;
    }

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) {
      return null;
    }

    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
};

export const getGitHubStarsByRepoUrl = async (repoUrl: string): Promise<number | null> => {
  const repoPath = parseRepoPath(repoUrl);
  if (!repoPath) {
    return null;
  }

  if (starsCache.has(repoPath)) {
    return starsCache.get(repoPath) ?? null;
  }

  try {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), GITHUB_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(`https://api.github.com/repos/${repoPath}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'techdufus-github-pages-site'
        },
        signal: abortController.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      starsCache.set(repoPath, null);
      return null;
    }

    const payload = (await response.json()) as { stargazers_count?: number };
    const stars = typeof payload.stargazers_count === 'number' ? payload.stargazers_count : null;
    starsCache.set(repoPath, stars);
    return stars;
  } catch {
    starsCache.set(repoPath, null);
    return null;
  }
};
