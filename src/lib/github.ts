const starsCache = new Map<string, number | null>();

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
    const response = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'techdufus-github-pages-site'
      }
    });

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
