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

We will be discussing the following topics:
- Dot-sourcing
- Public vs Private folder structure
- License Information
- 

This module structure relies on **dot-sourcing** other powershell **.ps1** files. Instead of placing all of our functions into a large single **.psm1** file, we will be creating a separate **.ps1** file for each function that we create, with the function definition inside.

Dot-Sourcing is a technique that allows you to bring the content of a file into the session where it is dot-sourced. When you dot-source a file, it is as if you crack open that file, and copy/paste it into your powershell session. This is called dot-sourcing due to how it is actually implemented, you literally put a dot (period) before the path to the file you are waiting to "copy/paste" into your session.

![]()
**Figure ? - Dot-Sourcing a function from a file

As you can see, the function is defined within the **.ps1** file, and after we dot-source that file, we are able to use that function. This technique will be the core of how we import our module. Let's take a look at the full module structure, and we can tackle these concepts piece by piece.

![]()
**Figure ? - Module File & Folder Structure

As you can see, we have our same **MyADUtils.psd1** and **MyADUtils.psm1** files together, as well as some folders, and even more 'metadata' in the form of a License and a changelog to track your changes. Since there are many other types of tools, objects, and resources that we can package up with our module, I like having a Functions folder, where we will be keeping our functions, both Public ones that we will export, and Private ones which are our **helper** functions.


