---
layout: post
section-type: post
title: How to organize your powershell functions into a module - Part 2
category: powershell
tags: [ 'module' ]
---

## In this post, we will be diving into a more advanced way of creating and structuring our PowerShell modules.

If you haven't yet, please head over and check out my [How to organize your powershell functions into a module - Part 1](https://matthewjdegarmo.com/powershell/2020/07/28/how-to-organize-your-powershell-functions-into-a-module-part-1.html) post where we look into the bare necessities of creating a PowerShell module. The example module, public functions, and private functions used in this post will be the example **MyADUtils** module we used in the Part 1 post.

Before we get into the details, I want to make this statement; There is no "best" way to create a module...

Well.. really it depends. There certainly are some best practices, but which best practice you use depends on the complexity and requirements of your module. If you are making a module with only three functions, you are probably okay to just create a **.psm1** and **.psd1** file pair. For more complex modules, like the Azure module with hundreds of functions, and who knows how many private functions, classes, formats, help files, etc. are being used also. It's hard to manage that in just a couple files!

Although there are many different structures, I'd like to share my standard structure that my modules will be using going forward, and will deviate from it where I feel I need to. This may not be what you need, but it really helps me understand the structure of my modules, and makes it easier to manage my code, add functions, hide others, etc.

So, let us begin.

We will be discussing the following topics:
- Dot-sourcing
- Public vs Private folder structure
- License Information


## Dot-Sourcing Technique

This module structure relies on **dot-sourcing** other powershell **.ps1** files. Instead of placing all of our functions into a large single **.psm1** file, we will be creating a separate **.ps1** file for each function that we create, with the function definition inside.

Dot-Sourcing is a technique that allows you to bring the content of a file into the session where it is dot-sourced. When you dot-source a file, it is as if you crack open that file, and copy/paste it into your powershell session. This is called dot-sourcing due to how it is actually implemented, you literally put a dot (period) before the path to the file you are waiting to "copy/paste" into your session.

![](/img/posts/dotsourcing_screenshot.jpg) ![](/img/posts/dotsourcing_example.jpg)

**Figure 1-2 - Dot-Sourcing a Function from a File**

As you can see, the function and variable is defined within the **.ps1** file, and after we dot-source that file, we are able to use that function and the variable that was defined. This technique will be the core of how we import our module. Let's take a look at the full module structure, and we can tackle these concepts piece by piece.


## Public vs Private Folder Structure

![](/img/posts/module_advancedstructure_toplevel.jpg) ![](/img/posts/module_advancedstructure_functions.jpg)

**Figure 3-4 - Module File & Folder Structure**

```powershell
└───MyADUtils
    │   changelog.md
    │   LICENSE
    │   MyADUtils.psd1
    │   MyADUtils.psm1
    │
    └───Tests
    └───Functions
        ├───ArgCompleter
        ├───Private
        └───Public
```


As you can see, we have our same **MyADUtils.psd1** and **MyADUtils.psm1** files together, as well as some folders, and even more 'metadata' in the form of a License and a changelog to track your changes. Since there are many other types of tools, objects, tests, and resources that we can package up with our module, I like having a **Functions** folder, where we will be keeping our functions, both Public ones that we will export, and Private ones which are our **helper** functions. I also like having a **Tests** folder where I keep my Pester tests, but Pester is a topic for another blog post.

Again, This is a topic for another blog post, but I also include an **ArgCompleter** folder within my Functions folder. This is where I can define custom **Tab-Completion** for my functions and parameters.

## OKAY NO MORE RABBIT HOLES

Let's discuss how our functions and files will fit into this new architecture. if we reference **Figure 1**, we can see that inside of the file is the function definition. So to continue with our **MyADUtils** example, we will make three files, and place them into the \Functions\Public folder like so.

![](/img/posts/module_publicfunctions_screenshot.jpg)
**Figure 5 - Public Function Files**

Once we have these files, we will place their respective functions inside each file.

![](/img/posts/module_publicfunctions_definitions.jpg)
**Figure 6 - Public Function Definitions**

In **Figure 6**, I have each of the files open, and have put the function definition inside and saved each file. Now when we dot-source these files, we will be able to use the functions within each.

But how are we going to dot-source these functions exactly? Certainly not manually? This is where the **.psm1** module file comes in. Since we are defining the module functions in their own files, we will use the module file to do the dot-sourcing for us. That will look something like this...

Inside of the **MyADUtils.psm1** file...
```powershell
$PublicFunctionsFiles = [System.IO.Path]::Combine($PSScriptRoot,"Functions","Public","*.ps1")
Get-ChildItem -Path $PublicFunctionsFiles -Exclude *.tests.ps1, *profile.ps1 | ForEach-Object {
    try {
        . $_.FullName
    } catch {
        Write-Warning "$($_.Exception.Message)"
    }
}
```

There are several things going on here, but at the core, we are getting all files inside of our Functions\Public folder using `Get-ChildItem` and dot-sourcing each of them using a `ForEach-Object` loop. The reason I create the module path using `$PublicFunctionsFiles` is so that no matter what Operating System is using this module, it will work. Since Windows uses the backslash '\' and the rest of the world uses a forwardslash '/' in paths, using this method will automatically create a path no matter what OS we are on, using the correct slashes.

Once we have this in place, we will be able to run `Import-Module` for this module, and the **.psm1** file will dot-source all of our public functions for us!

![](/img/posts/module_privatefunction_notdefined.jpg)
**Figure 7 - Importing a Dot-Sourcing Module**

Horray! We are successfully able to Import and use our functions! Instead of having to crack open the **.psm1** file and find where the function is defined to make any changes, we can simply locate the public **.ps1** file and make our changes there. For only three functions, this is a bit overkill, but imaging we have 60 different functions, each in their own files, some are public, some are private, others are pester tests, class definitions, format files, etc. You can see how having a structure like this makes it so easy to have a bird's eye view of what is going on, and when you need to change, or add anything, you know exactly where to go.

BUT, notice the error in **Figure 7** when we call `FirstADUtilsFunction`, There is no function `HelperFunction` defined. Let's take care of this by creating a Private file for this function.







