---
layout: post
section-type: post
title: How to organize your powershell functions into a module - Part 2
category: powershell
tags: [ 'module' ]
---

## In this post, we will be diving into a more advanced way of creating and structuring our PowerShell modules.

If you haven't yet, please head over and check out my [How to organize your powershell functions into a module - Part 1](https://matthewjdegarmo.com/powershell/2020/07/28/how-to-organize-your-powershell-functions-into-a-module-part-1.html) post where we look into the bare necessities of creating a PowerShell module.

Before we get into the details, I want to make this statement; There is no "best" way to create a module...

Well.. really it depends. There certainly are some best practices, but which best practice you use depends on the complexity and requirements of your module. If you are making a module with only three functions, you are probably okay to just create a **.psm1** and **.psd1** file pair. For more complex modules, like the Azure module with hundreds of functions, and who knows how many private functions, classes, formats, help files, etc. are being used also. It's hard to manage that in just a couple files!

Although there are many different structures, I'd like to share my standard structure that my modules will be using going forward, and will deviate from it where I feel I need to. This may not be what you need, but it really helps me understand the structure of my modules, and makes it easier to manage my code, add functions, hide others, etc.

So, let us begin.

This module structure relies on **dot-sourcing** other powershell **.ps1** files. Instead of placing all of our functions into a large single **.psm1** file, we will be creating a separate **.ps1** file for each function that we create, with the function definition inside.

Dot-Sourcing is a technique that allows you to bring the content of a file into the sessions where it is dot-sourced. When you dot-source a file, it is as if you crack open that file, and copy/paste it into your powershell session.