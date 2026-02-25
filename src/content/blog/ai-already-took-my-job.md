---
title: AI Already Took My Job
description: AI already took my job. I just adapted fast enough that nobody noticed.
pubDate: '2026-02-18'
tags:
  - devops
  - ai
  - aiops
  - claude-code
  - career
  - opinion
  - blog
category: devops
created: '2026-02-18'
---
# AI Already Took My Job

AI already took my job.

Not in the way the think pieces warned about. There was no dramatic layoff, no robot showing up with a box for my things. It was quieter than that. Over the last six months, the work I was hired to do simply stopped being the work I do. The job description didn't change. I did.

I used to write CI/CD pipelines by hand. Jenkins, GitHub Actions, Groovy shared libraries, the whole stack. I maintained my Neovim config like a bonsai tree: LSPs, plugins, keybindings, all hand-tuned because I was the one in the editor eight hours a day writing and debugging code. When a Kubernetes cluster misbehaved, I was in the trenches with `kubectl` and `strace`, tracing the problem through RBAC, networking, certificates, and whatever else decided to break at 2 AM.

That was the job, and in a very real sense, AI took it.

But because I adapted, I wasn't replaced.

## The Shift

Six months ago, AI crossed a line. It went from "neat party trick that helps juniors write boilerplate" to "genuinely too useful to ignore." The vibe coding memes were funny, but underneath the jokes, something real was happening. Engineers who leaned in were shipping faster. Engineers who didn't were starting to fall behind.

I decided I wasn't going to be in the second group.

I'd been a senior engineer for years. I had the fundamentals. I'd done the grunt work: years of debugging network policies at 3 AM, learning why that certificate expired even though you *just* renewed it, building the muscle memory that lets you look at a failing deployment and know it's DNS before you even check. (It's always DNS.)

What I didn't realize was how much that experience would matter in the age of AI.

## Why Experience Still Matters

People keep saying AI is an equalizer. In my experience, it is leverage, and leverage amplifies whatever foundation you already built.

A newer engineer can move much faster with AI than any of us could a few years ago. That part is awesome.

A senior engineer with years of incidents, postmortems, and architecture scars can move faster too, but with a different kind of accuracy. They already know where the sharp edges are.

That is the gap I keep seeing: not who can type faster, but who can catch bad assumptions early.

AI doesn't replace experience. It *compounds* it.

## What AI Still Can't Do

When people outside of operations think about DevOps, they picture someone writing YAML and pushing buttons. The reality is that real DevOps means holding an entire system in your head at once.

Not just the application: the application, the container it runs in, the Kubernetes cluster that orchestrates it, the RBAC policies that control access, the internal networking, the external networking, the load balancer, TLS termination, egress rules, PKI infrastructure, authentication flows, the actual hardware underneath all of it, and how all of these things interact with each other under load, at scale, when something inevitably fails.

AI is fantastic at going deep on any one of these. Ask it to write a NetworkPolicy, and it'll nail it. Ask it to debug a certificate chain, and it'll walk you through it step by step. Ask it to document an entire architecture, and it'll produce something impressive.

But ask it to hold the *whole picture*, and it struggles. Ask it to reason about how a change to your egress policy might cascade through your service mesh, affect your mTLS configuration, and break an integration that depends on a specific certificate trust chain. That's where it falls apart. The context window isn't just a technical limitation. It's a conceptual one. These systems are too interconnected, too layered, too dependent on institutional knowledge that lives in an engineer's head rather than in documentation.

That's where senior engineers earn their keep in the AI age. Not by writing the code (AI does that now) but by knowing *which* code needs to be written, *why* it needs to be written that way, and *what's going to break* if you get it wrong.

## How the Role Changed

Call it whatever you want. The work itself changed.

I spend less time typing every line from scratch and more time reviewing, steering, and tightening guardrails around AI-generated output.

The infrastructure still matters. You still need someone who understands networking, security, distributed systems, and all the sharp edges that come with running things in production. But the *how* has fundamentally changed. Instead of writing a Terraform module from scratch, you're reviewing one that an AI generated in seconds and catching the three things it got wrong. Instead of manually debugging a cluster, you're directing an AI agent through the troubleshooting process while keeping the big picture in your head, the part the AI can't hold.

The engineers who thrive in this world aren't the ones who memorized the most `kubectl` flags. They're the ones who understand systems deeply enough to be effective directors. The ones who can look at AI output and know, from experience and years of doing it the hard way, whether it's right.

## The Tinkerer's Edge

There's a difference between using a tool and understanding it.

I've always been a tinkerer. My [dotfiles repo](https://github.com/techdufus/dotfiles) exists because I obsess over understanding how my tools work. Neovim, tmux, shell configs: I don't just install plugins. I read the source, understand the architecture, and customize until it fits exactly how I think.

When AI tools showed up, I brought the same energy. I didn't just use Claude Code out of the box. I built [oh-my-claude](https://oh-my-claude.techdufus.com), a plugin framework that gives Claude Code orchestration superpowers. I write custom hooks, skills, and configurations that shape how AI works *for me*, not how it works for everyone.

There's nothing wrong with using vanilla tools. Most people should start there. But the tinkerer's instinct, that curiosity to open the hood and understand *why* something works, is what separates users from power users. And in a world where everyone has access to the same AI, being a power user is a competitive advantage.

If you treat AI like a black box, you can still move fast. If you understand it deeply enough to steer and extend it, you can move fast without gambling production.

## The New Skill Stack

If I had to distill what matters now for this style of engineering, it's this:

**Systems thinking over syntax memorization.** AI can generate a perfect NetworkPolicy in seconds. What it can't do is tell you that your new egress rule will break the service three hops downstream because of how your mTLS trust chain is configured. That's not a syntax problem. That's a "you need to understand the whole system" problem. You don't need to memorize every Kubernetes API field. You need to understand how the pieces fit together and what happens when one of them breaks.

**Prompt engineering is just engineering.** When I ask AI to build a CI pipeline, I don't type "make me a CI pipeline." I tell it which registry we're pushing to, that we need image scanning before the push, that the Helm values need to be environment-specific, and that the rollback strategy matters because our last bad deploy took down staging for two hours. That prompt works because I've built those pipelines by hand for years. A good prompt comes from the same place as a good architecture decision: deep understanding of the problem space.

**Review skills over writing skills.** An [IEEE Spectrum article from January 2026](https://spectrum.ieee.org/ai-coding-degrades) highlighted something I've been seeing firsthand: newer AI models are producing code that *looks* right, runs without errors, but silently does the wrong thing. It skips safety checks, fakes output formats, avoids crashing by hiding failures instead of surfacing them. That's worse than broken code because broken code announces itself. Silent failures lurk. Your job is increasingly to catch what AI won't tell you is wrong, and that requires taste, judgment, and experience: things you can't shortcut.

**Curiosity as a career strategy.** The tooling is changing monthly. I built [oh-my-claude](https://oh-my-claude.techdufus.com) because the default Claude Code experience wasn't enough. Not because it was bad, but because I knew it could be shaped into something better for how I work. That same instinct applies to every tool in the stack right now. If you're not actively experimenting, customizing, and pushing the boundaries of what's possible, you're already falling behind.

## The Uncomfortable Truth for Juniors

I want to be honest here, even though it's not what people want to hear.

This is an incredible time to be a junior engineer. AI gives you access to capabilities that would have taken years to develop. You can build things today that I couldn't have built in my first five years.

But the seniors who already did those years of grunt work are benefiting *more*. Not because they're smarter, but because they have more for AI to multiply. A decade of production incidents, architecture debates, and hard-won opinions about how systems should be built? That's not a liability in the AI age. It's the most valuable asset you can have.

The gap between a junior with AI and a senior with AI isn't closing. It's widening.

That doesn't mean juniors should give up. It means the path has changed. The fundamentals matter more than ever because AI is only as good as the person directing it. Learn networking. Understand security. Break things in a homelab and fix them yourself before asking AI to do it. Build the foundation that AI will eventually multiply.

The grunt work was never the punishment. It was the investment.

## The Bottom Line

DevOps isn't dead. It's evolving into something new.

The infrastructure still needs to run. The clusters still need to be secure. The pipelines still need to ship code safely. But the engineer sitting at the center of all that has a fundamentally different job now: not doing the work, but directing it. Not writing the automation, but automating *with* AI.

I didn't see this shift coming. I just refused to get left behind when it arrived.

AI took my old job. I'm too busy doing my new one to miss it.
