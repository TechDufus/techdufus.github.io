---
layout: post
section-type: post
title: The basics of creating PowerShell Functions
category: powershell
tags: [ 'function' ]
---
# If you've read my previous posts ([Module Creation - Part 1](https://matthewjdegarmo.com/powershell/2020/07/28/how-to-organize-your-powershell-functions-into-a-module-part-1.html), [Module Creation - Part 2](https://matthewjdegarmo.com/powershell/2020/08/03/how-to-organize-your-powershell-functions-into-a-module-part-2.html)), then you know how to organize functions to create your own PowerShell module, but how do we go about making our own functions in the first place?

That is what I want to discuss in this post. We will go into some of the basics of function creation, as well as some other basics of parameter creation, and even making your function an **Advanced Function**, which are things that took me a good while to wrap my head around, so I think the earlier you are exposed to them in your PowerShell journey the better!

It goes without saying that these concepts can be as complex or as simple as you need them to be, depending on what your needs are. I will be sharing what my most common techniques, and you can continue to learn from there!

I would like to demonstrate how a function can be useful by using my `New-Folder` command that I wrote for my [AdminToolkit](https://github.com/matthewjdegarmo/AdminToolkit/blob/master/Functions/Public/New-Folder.ps1) module.

We will discuss:
+ The difference between a function and a script.
+ How to create a function.
+ How to create parameters for your function.
+ Pro's to making your function an **Advanced Function**.

## What is the difference between a function and a script?

If you've ever created a PowerShell script before, you know that a script is simple PowerShell code that is stored inside of a file with the extension **.ps1**. A function is a way for us to take some of your code that you feel would be useful to to reuse and give it a name. Whenever we call that name, it will call the code that we have stored behind that name. 

But how is that any different than just re-calling the script that we've made? Well, the difference between a script and a function os that a function is meant to be flexible, meaning the code it runs can be used for multiple different scenarios. It is when you provide the function with specific information (by using parameters) will the function be able to perform tasks that the non-flexible script wouldn't be able to do.

## How to create a function

In my example, I created a function called `New-Folder` to help me create folders more quickly. The basic PowerShell command for this is this.
```powershell
New-Item -Name "FolderName" -Path "path\to\folder\" -ItemType Directory
```

As you can see, every time I want to create a folder, I have to give the Name, Path, and the item type for PowerShell to create. Well... I'm a lazy guy, so I want to wrap this code in a function. Let's create a function called `New-Folder`. You can do this directly from within a PowerShell console, or fire up your favorite code editor (#VSCodeForTheWin!) and then simply copy/paste into a PowerShell session from there.

I will be defining this code from VSCode, and to test, I'll copy/paste it into a console. To define a function, you just type `function` before the name you want to give it, like this.

```powershell
function New-Folder {

}
```

Great! We have a function! All we have to do to call this function is type out it's name. If you tried this out, you'll notice that it doesn't do anything. That's because there is no code defined behind this function. Let's add the above PowerShell code to create a folder.

```powershell
function New-Folder {
    New-Item -Name "FolderName" -ItemType Directory
}
```

If we leave out the `-Path` option, PowerShell assumes we want to create this item in our current directory.

Let's copy/paste this function into a PowerShell console and then call it!

![](/img/posts/functions_new-folder_basic1.png)
**Figure 1 - Calling our function**

