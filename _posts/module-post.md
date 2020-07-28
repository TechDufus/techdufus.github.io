---
layout: post
section-type: post
title: How to organize your powershell functions into a module - Part 1
category: tech
tags: [ 'welcome','firstpost','iblognow' ]
---

## So you've written a few functions in PowerShell... Now what?

Writing functions is a blast. Having a problem, spending time to come up with your own unique way to solve it, gather some information, or even get fancy and make something that works in the pipeline! It's an awesome feeling to finally close those 32 chrome tabs of research trying to build what you've made, and then you move onto the next task.

After a while, it's time to take your PowerShell game to the next level. Taking your separate functions and scripts and to gather and organize them into a single module, making your code much easier to manage and distribute. Not to mention that you immediately become a professional upon making your first module, everyone knows that.

Okay, let's get down to business. A PowerShell module is simply a collection of similar functions, with some metadata thrown in. There are many different camps on the 'correct' way to build a module, and each one has it's pros and cons, as well as added complexity, so we will start with the most basic and build from there.

## Module Bare Necessities

A module is a PowerShell file with the *.psm1* extension that contains your functions, as well as a file with the *.psd1* extension that contains metadata about your module. The *.psm1* file is your Module, and the *psd1* file is called a Manifest. Technically you can get away with *not* having a Manifest file, but it's clunky and remember, we are *professionals* so we want to have a Manifest.

