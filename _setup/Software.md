---
---
## Software

My entire development environment lives in my [dotfiles repository](https://github.com/techdufus/dotfiles) - 76 Ansible roles that configure everything from terminal emulators to cloud CLIs. Rather than list every tool, let me walk you through how I actually work.

## The Terminal is Home

I spend 95% of my time in the terminal. My setup is designed for speed and muscle memory - the same keybinds work whether I'm on my Ubuntu workstation or MacBook.

### Starting a Session

When I sit down to work, I open **[Ghostty](https://ghostty.org/)** - a GPU-accelerated terminal that's fast enough to keep up with my typing. From there, I hit `<prefix>-o` to launch **[sesh](https://github.com/joshmedeski/sesh)** - a session manager that ties everything together.

### The sesh + tmux Workflow

Sesh is the command center for my tmux workflow. `<prefix>-o` opens an fzf popup where I can:
- **`^a`** - List all sessions
- **`^t`** - Filter to tmux sessions only
- **`^x`** - Browse zoxide's frecent directories (create new session on select)
- **`^g`** - Jump to config directories
- **`^f`** - fd-based directory search for anywhere else
- **`^d`** - Kill a session without leaving the picker

![sesh picker showing fzf interface with keybind hints and session list](/img/setup/tmux-sesh-picker.png)

This means I never manually create sessions or `cd` around. I just hit `<prefix>-o`, fuzzy find where I want to be, and sesh either attaches to an existing session or creates one in that directory.

Sessions persist through reboots thanks to **tmux-resurrect** and **tmux-continuum** - I never lose my window layouts or working directories.

For navigation within tmux:
- **`Ctrl+hjkl`** - Navigate panes (vim-tmux-navigator makes this seamless with neovim splits)
- **`<prefix>-S`** - Synchronize panes (type in all panes at once)

### The Status Bar

My tmux status bar shows:
- Current session name (highlights red when prefix is active)
- Current directory + git branch
- Zoom indicator when a pane is maximized
- **Claude status** - shows whether Claude Code is working, done, or idle
- Online/offline indicator

![tmux status bar showing session name, directory, window tabs, Claude status, and online indicator](/img/setup/tmux-statusline-information.png)

### The Editor: Neovim

I live in **[Neovim](https://neovim.io/)** with a heavily customized config. My setup includes:
- **Telescope** for fuzzy finding files, grep, and LSP symbols
- **LSP** configured for Go, Terraform, YAML, Bash, and more
- **Treesitter** for syntax highlighting and text objects
- **vim-tmux-navigator** for seamless pane/split navigation

I don't use a file tree - Telescope is faster. My most-used keybinds:
- `<leader>fs` - **F**ile **S**earch (uses git files when available)
- `<leader>gs` - **G**rep **S**earch (live ripgrep across project)
- `<leader>b` - Switch **B**uffers
- `<leader>fr` - **F**iles **R**ecent
- `/` - Fuzzy search in current buffer

### Window Management

I use **[AwesomeWM](https://github.com/techdufus/dotfiles/tree/main/roles/awesomewm)** on Linux and **[Hammerspoon](https://github.com/techdufus/dotfiles/tree/main/roles/hammerspoon)** on macOS - but not as traditional tiling window managers. Instead, I built a **cell-based system** where I predefine screen regions and assign apps to specific cells.

**The concept**: An 80x40 virtual grid (resolution-independent) with named cells. Each app is assigned a cell and a **summon key**.

**Summon**: Press `Hyper+letter` and the app instantly appears in its designated cell. If it's already running, it focuses and repositions. If it's not running, it launches directly into position. No hunting through windows, no Alt+Tab cycling - just summon what you need, where you need it.

**4K Workspace layout:**

![Cell-based window layout showing 5 predefined screen regions](/img/setup/window-management-cell-layout-1-5.png)

| Cell | App | Summon |
|------|-----|--------|
| 1 | Terminal | `t` |
| 2 | Browser | `b` |
| 3 | Discord | `d` |
| 4 | Spotify / 1Password | `s` / `o` |
| 5 | FileManager | `f` |
| 6 | Obsidian | `n` |

I can switch between layouts (4K Workspace, Standard Dev, Fullscreen) and all apps reposition to their new cells. No dragging, no resizing - just instant, predictable window placement.

## The Shell Stack

My shell is **zsh** with a customized **[Powerlevel10k](https://github.com/romkatv/powerlevel10k)** prompt. The real power comes from [custom functions](https://github.com/techdufus/dotfiles/tree/main/roles/zsh/files/zsh) I've written that wrap complex workflows into single commands.

**[Git functions](https://github.com/techdufus/dotfiles/blob/main/roles/zsh/files/zsh/git_functions.zsh)** (fzf-powered with previews):
- `gs` - Quick git status
- `gss` - Enhanced status showing branch, PR status, worktrees, stash count
- `gtags` - Interactive tag browser
- `glog` - Commit browser with full diff preview
- `gacp <msg>` - Add all → commit (signed) → push in one command

**[Kubernetes aliases](https://github.com/techdufus/dotfiles/blob/main/roles/zsh/files/zsh/k8s_aliases.zsh)**:
- `kgp` - kubectl get pods (args pass through: `kgp -A`, `kgp -n foo`)
- `kgn` - kubectl get nodes
- `kc` - kubectl config use-context (with tab completion)
- **[k9s](https://k9scli.io/)** - My go-to for cluster interaction

**[Remote editing](https://github.com/techdufus/dotfiles/blob/main/roles/zsh/files/zsh/neovim_functions.zsh)**:
- `nisshfs <server>` - Mount via SSHFS → open in neovim → auto-unmount on exit

## Development Tools

For day-to-day development, my most-used tools are:

- **[gh](https://cli.github.com/)** - GitHub CLI for PRs, issues, and Actions
- **[podman](https://podman.io/)** - Container runtime (no Docker, no GUIs)

## Agentic Engineering Toolchain

### Claude Code

**[Claude Code](https://claude.ai/code)** is integrated into my terminal workflow with a [custom configuration](https://github.com/techdufus/dotfiles/tree/main/roles/claude) that includes:
- Custom hooks that update my tmux status bar (working/done/idle)
- Slash commands for common workflows
- Skills for specialized tasks
- Memory files for project context

The tmux integration means I always know at a glance whether Claude is processing something. This fits the keyboard-first philosophy — it's a terminal-native tool, not a GUI sidebar. It runs inside tmux, respects the same workflow as Neovim and shell tools, and stays out of the way until I need it.

### oh-my-claude

**[oh-my-claude](https://github.com/TechDufus/oh-my-claude)** is a plugin framework for Claude Code — think of it as treating AI coding the way dotfiles treat terminal config. Opinionated defaults with full customizability.

It provides curated agents for specialized tasks (code review, codebase exploration, validation), subagent delegation patterns that protect your main context window, workflow skills for common operations, and a structured way to extend Claude Code without reinventing the wheel every session.

### openkanban

**[openkanban](https://github.com/TechDufus/openkanban)** is a TUI Kanban board built for managing multi-agent workflows. When I'm running several Claude Code agents in parallel across different tmux panes, openkanban tracks what each agent is working on and where things stand across competing priorities.

### MCP (Model Context Protocol)

MCP extends Claude Code with external tool access — browser automation via Playwright, documentation lookup through Context7, and whatever custom integrations I wire up. MCP servers are the plugin system that connects Claude Code to external services, turning it from a code assistant into something closer to a general-purpose automation layer.

## Infrastructure Tools

Working in DevOps, I interact with infrastructure constantly:

- **[Terraform](https://www.terraform.io/)** + **[Terragrunt](https://terragrunt.gruntwork.io/)** - Infrastructure as Code
- **[Helm](https://helm.sh/)** - Kubernetes package management
- **[kubectl](https://kubernetes.io/docs/reference/kubectl/)** - Kubernetes CLI
- **AWS/Azure CLIs** - Cloud provider interaction

## The Philosophy

My setup optimizes for:
1. **Speed** - Every tool is chosen for performance
2. **Consistency** - Same experience on any machine
3. **Keyboard-first** - Mouse is a last resort
4. **Reproducibility** - [`dotfiles`](https://github.com/techdufus/dotfiles/blob/main/bin/dotfiles) rebuilds everything
5. **AI-amplified** — AI multiplies what I already know how to do. The expertise comes first; the agents accelerate it.

Everything is documented and version controlled. If my laptop dies tomorrow, I can have an identical environment running in under an hour.

---

*Want the actual configs? Check out my [dotfiles repo](https://github.com/techdufus/dotfiles) - it's all there.*
