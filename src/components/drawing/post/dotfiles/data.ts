/**
 * The words in "I Rebuilt My Dotfiles for the Agent That Writes Them"'s four figures (in reading
 * order: YearOfChanges, TheSaturday, TheRoles, WhoWrites), kept apart from the drawing code so the
 * copy can be checked in one place. Numbers come from the dotfiles repo's git history and the
 * migration sessions of 2026-10-10; quotes are the owner's, verbatim. The figures only lay it out.
 */
import type { Bar, Card, Tone } from '../../../../lib/drawing/figure';

export type Who = 'me' | 'agent';

/* ------------------------------------------------------ FIG 1 · A year of changes, by kind */

/** Lines changed (added + deleted, `git log --numstat`) in the year to 2026-10-10, 531 commits. */
export const yearOfChanges = {
  title: 'A year of changes, by kind',
  caption: 'The Ansible was 11% of it. The engine was never the busy part.',
  unit: 'lines',
  bars: [
    { id: 'yr-files', label: 'Config files', sub: 'what the roles deployed', value: 64069, display: '64,069' },
    { id: 'yr-md', label: 'Markdown', sub: 'docs, skills and prompts', value: 52890, display: '52,890' },
    { id: 'yr-tests', label: 'Tests', value: 28261, display: '28,261' },
    { id: 'yr-ansible', label: 'The Ansible', sub: 'tasks, vars, bootstrap', value: 17419, display: '17,419 · 11%', tone: 'removed' },
  ] as Bar[],
};

/* ------------------------------------------------------------------- FIG 2 · One Saturday */

/** One moment of the day; `quote` events are the owner's words, drawn as speech. */
export type Moment = { time: string; event: string; who: Who; quote?: boolean };

export const theSaturday = {
  title: 'One Saturday',
  foot: 'About nine hours from the first question to the lessons, with a break in the middle.',
  gap: 'a break in the middle',
  /** Before the break, then after it. */
  parts: [
    [
      { time: '1:52 PM', event: 'i want to completely rethink what this project could look like', who: 'me', quote: true },
      { time: '1:55 PM', event: 'Seven research agents, chezmoi to Nix', who: 'agent' },
      { time: '2:09 PM', event: 'Four questions: engine, audience, machines, migration', who: 'agent' },
      { time: '2:11 PM', event: 'Four answers: mise, a personal repo, three machines, big-bang', who: 'me' },
      { time: '3:03 PM', event: 'The plan, after a critic found six blockers', who: 'agent' },
      { time: '4:09 PM', event: 'Ansible deleted in one commit', who: 'agent' },
    ],
    [
      { time: '9:51 PM', event: 'done', who: 'me', quote: true },
      { time: '9:52 PM', event: 'it looks like it errored when trying to install gopls?', who: 'me', quote: true },
      { time: '9:59 PM', event: 'Cutover finished from its side, branch pushed', who: 'agent' },
      { time: '10:00 PM', event: 'are you claiming that this is whole and a complete reimplementation of my ENTIRE set of configs for all roles?', who: 'me', quote: true },
      { time: '10:10 PM', event: 'Six auditors: where all 90 roles went', who: 'agent' },
      { time: '10:26 PM', event: 'just making sure you didn’t just rewrite the vehicle', who: 'me', quote: true },
      { time: '10:54 PM', event: '55 files switched to symlinks', who: 'agent' },
      { time: '11:05 PM', event: 'Issue #159: the lessons, for the next agent', who: 'agent' },
    ],
  ] as Moment[][],
};

/* ------------------------------------------------------------ FIG 3 · Where the 90 roles went */

export const theRoles = {
  title: 'Where the 90 roles went',
  caption: 'None of the 24 dropped roles ran in a normal run on any of my machines.',
  unit: 'roles',
  bars: [
    {
      id: 'rl-module', label: 'Their own module', value: 38, display: '38', tone: 'new',
      card: { title: 'Their own module', kind: 'Kept', lines: ['zsh, git, neovim, tmux, starship and friends.', 'omp, claude, codex, cursor, opencode, tern.', 'omarchy, plasma, steam, hammerspoon.'] },
    },
    {
      id: 'rl-folded', label: 'Folded in', sub: 'packages, devtools, secrets', value: 28, display: '28', tone: 'keep',
      card: { title: 'Folded in', kind: 'Kept, smaller', lines: ['One-line installs became one line each in packages.', 'Runtimes and CLIs became mise tools; mise’s node replaced nvm.'] },
    },
    {
      id: 'rl-dropped', label: 'Dropped', value: 24, display: '24', tone: 'removed',
      card: { title: 'Dropped', kind: 'Gone', lines: ['AwesomeWM, Vicinae, Fabric: my old Ubuntu desktop.', 'Docker, Rust, Ruby, PowerShell, kind, Nomad…', 'Their config lives on in git history.'] },
    },
  ] as Bar[],
};

/* ------------------------------------------------------------- FIG 4 · Who writes the file? */

/** One deploy mode: the condition that picks it (`when`), the mode, and its card. */
export type Mode = { id: string; when: string; label: string; sub: string; tone?: Tone; card: Card };

export const whoWrites = {
  title: 'Who writes the file?',
  caption: 'Most copies had no reason to be copies. Now one question picks the mode.',
  question: { id: 'wr-q', label: 'Who writes it?', sub: 'asked of every file' },
  modes: [
    {
      id: 'wr-link', when: 'Only I do; the app just reads it', label: 'Symlink', sub: 'a live edit is a repo edit', tone: 'new',
      card: { title: 'Symlink', kind: 'The default', lines: ['Edit it anywhere: the change is already in git.', '55 copies on the laptop switched: zsh, Ghostty, kitty, lsd, the Taskfile…', 'Each matched the repo byte for byte first.'] },
    },
    {
      id: 'wr-merge', when: 'The app writes some keys too', label: 'Merge', sub: 'only the keys I own',
      card: { title: 'Merge', kind: 'JSON, TOML, YAML', lines: ['The repo owns the keys it lists. The app keeps the rest.', 'herdr moved here: every run was undoing its settings screen.', 'Tern, Codex, Cursor and jj merge too.'] },
    },
    {
      id: 'wr-lines', when: 'The app writes it, any other format', label: 'Line edits', sub: 'only the marked lines',
      card: { title: 'Line and block edits', kind: 'Everything else', lines: ['npm login writes its token into ~/.npmrc. The old copy deleted it on every run.', 'A symlink would have put that token in a public repo.', 'Blocks work the same way: one marked block in Hyprland’s autostart.'] },
    },
    {
      id: 'wr-copy', when: 'A link can’t survive the app', label: 'Copy', sub: 'with the reason written down',
      card: { title: 'Copy', kind: 'Last resort', lines: ['btop rewrites its config on exit.', 'fcitx5 saves by temp file and rename.', 'Karabiner and Codex agents ignore links.'] },
    },
  ] as Mode[],
};
