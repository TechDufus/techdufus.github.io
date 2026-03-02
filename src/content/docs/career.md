---
title: Career
description: My path from PowerShell automation to cleared defense platform engineering, and how I run reliability-first agentic workflows in production.
---
I did not start as a "platform engineer." I started writing PowerShell because I was tired of repetitive clicks and manual runbooks.
That turned into a long path through IT support, DevOps, platform engineering, and now defense-oriented DevSecOps work where reliability and security are non-negotiable.

## Career progression

### 2016 to 2020: automation first, titles later
At Nebraska Public Power District, I learned to treat scripting like a force multiplier in a regulated environment.

- Built and maintained internal PowerShell tooling and shared modules.
- Automated repetitive AD reporting and operational checks.
- Scripted DHCP and DNS migration work, including Azure DNS movement.
- Supported user access and permission workflows with policy discipline (NERC-heavy culture).
- Finished my B.S. in Computer Information Systems and earned Security+.

This was where I built the habit that still drives my work: if a task is repeated, it should be automated, tested, and documented.

### 2020 to 2022: formal DevOps delivery
At Ansira, I shifted from IT scripting to end-to-end DevOps delivery.

- Architected Terraform deployments for Azure infrastructure across environments.
- Built CI/CD flows with TeamCity, PowerShell, and PSake.
- Automated PKI lifecycle work that reduced hours of manual effort to seconds.
- Improved build throughput with parallelization and repeatable release mechanics.
- Worked directly with developers, DBAs, and security stakeholders to keep delivery moving without sacrificing compliance.

I also earned CISSP during this window, which sharpened how I think about tradeoffs between speed and control.

### 2022 to 2024: cloud-native and platform depth
At Lumen (first on a full-stack DevOps team, then on platform engineering), I went deep on Kubernetes operations and internal developer platforms.

- Built APIs and services in Go, and shipped Kubernetes resources via Helm on GKE.
- Used Terraform, Ansible, and Vault to stand up private VPC test environments with user-specific VPN access.
- Created and maintained CI pipelines across a multi-repo platform.
- Implemented Kubewarden admission policies on large clusters.
- Worked with the Kubewarden dev team on policy functionality in Go.
- Automated project and namespace creation through a simple front-end form backed by Ansible, Rancher project setup, resource quotas, and Azure AD group mapping.
- Built and configured AWX/Ansible workflows to scale consistent operations for the team.

This is where I moved from "I can ship code" to "I can build and operate platform guardrails for many teams."

### 2022 to present: ansible-driven scaling projects (InFlux)
In parallel, I also worked on blockchain infrastructure automation at InFlux.

- Rebuilt rigid shell-based install/config processes into Ansible-driven workflows.
- Used Terraform and Ansible to provision and configure Flux node infrastructure.
- Converted single-node assumptions into fleet-oriented automation patterns.
- Focused on idempotent, repeatable config so scaling operations stayed predictable.

That work reinforced the same platform lesson: scale comes from reliable process and automation contracts, not heroics.

### 2024 to present: defense platform and DevSecOps at Raft
As a Senior DevSecOps Engineer at Raft, I support mission-critical platform delivery in high-security environments.

- Run ArgoCD-based GitOps workflows for secure, auditable Kubernetes deployments in sensitive environments.
- Operate in production OpenShift, AKS, and RKE2 ecosystems, plus local Kind workflows for development validation.
- Deploy and maintain platform capabilities in strict environments, including air-gapped operations.
- Scale and manage AKS and EKS infrastructure with Terraform and Terragrunt.
- Built Terraform-focused GitHub pipelines that validate and apply infrastructure changes with consistent controls.
- Handle strict security workflows across contracts with cross-functional teams and clear operational boundaries.
- Work across security, platform, and application roles where context switching is constant and documentation quality matters.

Specific mission details stay private, but the engineering patterns are the same: automate carefully, verify continuously, and keep accountability explicit.

## Agentic engineering in production
I use agent workflows in real work.
They help me move faster without giving up quality or ownership.

- When work gets big, I split it into phases: gather context, implement, then verify.
- AI helps with speed, but I still own the final decision and release.
- I prefer git-first, reproducible workflows because they are easier to review and easier to recover.
- I use the same pattern in public tooling (`oh-my-claude`, `openkanban`) and in my homelab GitOps flow.

## Community, mentoring, and public work
At this point, one of my biggest goals is simple: help people.
I share what worked, what failed, and what I changed.

- I publish practical notes on this site across PowerShell, Kubernetes, incidents, and AI workflow changes.
- I maintain open-source tooling tied directly to my workflow (`dotfiles`, `home.io`, `oh-my-claude`, `openkanban`).
- I stay active in community spaces and share practical patterns there too.

If sharing my work helps people, it is worth it.

## Why this page exists
This page is here for the real version, not polished corporate copy.
It is a straightforward record of what I have done and how I work.
If it helps people, then it did its job.
