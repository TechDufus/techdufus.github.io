import { featuredRepos, featuredReposAsOf } from '../data/site';
import { fmtDate } from '../components/ui/format';

const GITHUB_TIMEOUT_MS = 2600;

export type RepoMeta = {
  owner: string;
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  languageColor: string | null;
  license: string | null;
  stars: number;
  forks: number;
  pushedAt: string | null;
  topics: string[];
  live: boolean;
};

export type FeaturedRepoMeta = RepoMeta & { tag: string; status: string; summary: string; why: string };

/** GitHub linguist colours for the languages that show up on my repos. */
export const languageColors: Record<string, string> = {
  Shell: '#89e051',
  Python: '#3572A5',
  Go: '#00ADD8',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  PowerShell: '#012456',
  HCL: '#844FBA',
  Lua: '#000080',
  Rust: '#dea584',
  Astro: '#ff5a03',
  Dockerfile: '#384d54',
  Makefile: '#427819'
};

export const getLanguageColor = (language: string | null | undefined): string | null =>
  language ? (languageColors[language] ?? null) : null;

type GitHubRepoPayload = {
  name?: string;
  owner?: { login?: string };
  html_url?: string;
  description?: string | null;
  language?: string | null;
  license?: { spdx_id?: string | null; name?: string | null } | null;
  stargazers_count?: number;
  forks_count?: number;
  pushed_at?: string | null;
  topics?: string[];
};

// One in-flight/settled request per repo for the whole build.
const repoCache = new Map<string, Promise<GitHubRepoPayload | null>>();

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

const readGitHubToken = (): string | undefined => {
  const fromVite = import.meta.env?.GITHUB_TOKEN as string | undefined;
  if (fromVite) return fromVite;
  const nodeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return nodeProcess?.env?.GITHUB_TOKEN || undefined;
};

const requestRepo = async (repoPath: string): Promise<GitHubRepoPayload | null> => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'techdufus-github-pages-site'
  };
  const token = readGitHubToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), GITHUB_TIMEOUT_MS);
  try {
    const response = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers,
      signal: abortController.signal
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as GitHubRepoPayload;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchRepo = (repoPath: string): Promise<GitHubRepoPayload | null> => {
  const key = repoPath.toLowerCase();
  let pending = repoCache.get(key);
  if (!pending) {
    pending = requestRepo(repoPath);
    repoCache.set(key, pending);
  }
  return pending;
};

export const getGitHubStarsByRepoUrl = async (repoUrl: string): Promise<number | null> => {
  const repoPath = parseRepoPath(repoUrl);
  if (!repoPath) {
    return null;
  }

  const payload = await fetchRepo(repoPath);
  return typeof payload?.stargazers_count === 'number' ? payload.stargazers_count : null;
};

const licenseName = (license: GitHubRepoPayload['license']): string | null => {
  if (!license) return null;
  if (license.spdx_id && license.spdx_id !== 'NOASSERTION') return license.spdx_id;
  return license.name ?? null;
};

/** Build-time repo metadata. Falls back to `fallback` (and `live: false`) when offline, rate-limited or slow. */
export async function getRepoMeta(url: string, fallback: Partial<RepoMeta>): Promise<RepoMeta> {
  const repoPath = parseRepoPath(url);
  const [pathOwner = '', pathName = ''] = repoPath ? repoPath.split('/') : [];
  const payload = repoPath ? await fetchRepo(repoPath) : null;

  if (payload && typeof payload.stargazers_count === 'number') {
    const language = payload.language ?? null;
    return {
      owner: payload.owner?.login ?? pathOwner,
      name: payload.name ?? pathName,
      url: payload.html_url ?? url,
      description: payload.description ?? null,
      language,
      languageColor: getLanguageColor(language),
      license: licenseName(payload.license),
      stars: payload.stargazers_count,
      forks: payload.forks_count ?? 0,
      pushedAt: payload.pushed_at ?? null,
      topics: Array.isArray(payload.topics) ? payload.topics : [],
      live: true
    };
  }

  const language = fallback.language ?? null;
  return {
    owner: fallback.owner ?? pathOwner,
    name: fallback.name ?? pathName,
    url: fallback.url ?? url,
    description: fallback.description ?? null,
    language,
    languageColor: fallback.languageColor ?? getLanguageColor(language),
    license: fallback.license ?? null,
    stars: fallback.stars ?? 0,
    forks: fallback.forks ?? 0,
    pushedAt: fallback.pushedAt ?? null,
    topics: fallback.topics ?? [],
    live: false
  };
}

/** `featuredRepos` merged with GitHub metadata, sorted by stars (desc). */
export async function getFeaturedRepos(): Promise<FeaturedRepoMeta[]> {
  const repos = await Promise.all(
    featuredRepos.map(async (repo) => {
      const meta = await getRepoMeta(repo.url, { name: repo.name, ...repo.fallback });
      return {
        ...meta,
        tag: repo.tag,
        status: repo.status,
        summary: repo.summary,
        why: repo.whyItMatters
      };
    })
  );
  return repos.sort((a, b) => b.stars - a.stars);
}

/** Section aside: "Live from GitHub · built <date>" when every repo came from the API, else the snapshot date. */
export const featuredReposNote = (repos: readonly RepoMeta[]): string =>
  repos.length > 0 && repos.every((repo) => repo.live)
    ? `Live from GitHub · built ${fmtDate(new Date())}`
    : `GitHub data as of ${fmtDate(featuredReposAsOf)}`;
