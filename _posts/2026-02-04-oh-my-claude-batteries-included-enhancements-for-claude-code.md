---
layout: post
section-type: post
title: 'oh-my-claude: Batteries-Included Enhancements for Claude Code'
category: devops
tags: ['ai', 'claude-code']
---

<img src="/img/posts/oh-my-claude-og.png" alt="oh-my-claude" style="float: right; max-width: 400px; margin: 0 0 1rem 1.5rem;">

Hey folks. I built a thing.

If you've used [Claude Code](https://code.claude.com/docs) for any non-trivial task, you've probably hit conversation compaction - that moment where Claude summarizes the session to free up context, and suddenly you're working through a black box. No visibility into what decisions were made or why.

After a few sessions where Claude completely lost track of what we were building halfway through, I started paying attention to what was eating my context. Turns out, reading files was the biggest culprit. Every time I asked Claude to "look at" a file, that entire file got loaded into memory. Do that a few times while tracing a bug, and suddenly there's no room left for actual reasoning.

I wanted to stay in control of the planning and guidance while still finishing tasks before compaction even becomes necessary.

## The Backstory

I'd actually switched from Claude Code to [opencode](https://github.com/anomalyco/opencode) specifically to use the [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) plugin. Then January 2026 happened. There'd been an OAuth workaround that let you use your Claude subscription with non-Claude CLI tools - technically against the ToS but not really enforced. The oh-my-opencode plugin changed that equation. It ramped up orchestration capabilities so dramatically that folks using their subscriptions were burning through way more compute than [Anthropic](https://anthropic.com) was getting paid for. Enforcement followed.

Fair enough. But it meant folks locked into Claude Code (enterprise users, teams with compliance requirements) were stuck without these capabilities. I happened to be in Hawaii when this went down, and the vibe was strong. So I vibed harder and built [oh-my-claude](https://oh-my-claude.techdufus.com).

## The Philosophy: Conductor, Not Musician

After a few weeks of iteration (127 commits, a lot of reverts, and some hard lessons), here's what I landed on: your context window is precious. Use it for reasoning, not storage.

When you dump a 500-line file into your session to "understand" it, you've just burned context you'll need later. When you read three more files to trace a bug, that's more context gone. Eventually Claude forgets what you were even trying to do.

The fix is delegation. You're the conductor. Agents play the music.

**Enhance, don't replace.** Claude Code is already capable. The plugin adds quality gates and coordination, not overrides.

**Delegate aggressively.** Specialized agents handle the heavy lifting. A librarian reads and summarizes large files. Workers implement focused tasks. Validators run your tests. Your main session stays sharp.

**Context protection.** Large file reads get automatically delegated. You never accidentally bloat your context with raw file dumps.

The pattern looks like this:

```
Explore finds → Librarian reads → You reason → Workers implement → Validator checks
```

You orchestrate. Agents execute.

## What You Get

The plugin works invisibly once installed. Even if you never explicitly call an agent, hooks protect your context and validate your commits automatically. But when you need more control:

- **Specialized agents** for different tasks. A librarian reads and summarizes large files so you don't have to. A critic catches problems in your plans before you execute them. A validator runs your tests and gives you a clear pass/fail.
- **Context protection** that actually works. Large file reads get delegated automatically. Your main session stays focused on reasoning, not storing raw file contents.
- **Ultrawork mode** for aggressive parallel execution when you need to move fast.
- **Enhanced planning** that persists through the conversation instead of getting lost.

The plugin keeps evolving as Claude Code itself changes. The first version had 30+ components, magic keywords, and agents for everything. I built LSP support, then ripped it out when Claude Code added native support. I added clever "trivial request detection," then reverted it because consistent behavior beats smart behavior. I cut down from seven custom agents to just the essentials when I realized the built-in Explore and Plan agents already covered a lot of ground.

The lesson that kept repeating: build on top of Claude Code's native features, not around them. The plugin enhances what's already there.

## Wrapping Up

- **Context is the real constraint.** Not speed, not capability. How long Claude can stay coherent on your task.
- **Delegation beats documentation.** Instead of trying to give Claude perfect instructions, give it specialized tools and let them handle the details.
- **Build with, not around.** Every time I tried to replace Claude Code's native behavior, I created maintenance headaches. The stuff that stuck enhances what's already there.

## Try It

Add the marketplace and install:

```bash
claude plugin marketplace add TechDufus/oh-my-claude
claude plugin install oh-my-claude
```

Docs and source at [oh-my-claude.techdufus.com](https://oh-my-claude.techdufus.com) and [GitHub](https://github.com/techdufus/oh-my-claude).

I'm still iterating on this, so if you run into issues or have ideas, I'd genuinely like to hear them. Maybe you'll save me from learning another lesson the hard way.

Until next time - go ship something.
