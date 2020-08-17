---
layout: post
section-type: post
title: PowerShell Functions: The Basics of Creating PowerShell Functions
category: powershell
tags: [ 'function' ]
---
# If you've read my previous posts ([Module Creation - Part 1](https://matthewjdegarmo.com/powershell/2020/07/28/how-to-organize-your-powershell-functions-into-a-module-part-1.html), [Module Creation - Part 2](https://matthewjdegarmo.com/powershell/2020/08/03/how-to-organize-your-powershell-functions-into-a-module-part-2.html)), then you know how to organize functions to create your own PowerShell module, but how do we go about making our own functions in the first place?

That is what I want to discuss in this post. We will go into some of the basics of creating functions, as well as some other basics of parameter creation, and even making your function an **Advanced Function**, which are things that took me a good while to wrap my head around, so I think the earlier you are exposed to them in your PowerShell journey the better!

It goes without saying that these concepts can be as complex or as simple as you want them to be, depending on what your needs are. I will be sharing some of my most common techniques, and you can continue to learn from there!

I would like to demonstrate how a function can be useful by using my `New-Folder` command that I wrote for my [AdminToolkit](https://github.com/matthewjdegarmo/AdminToolkit/blob/master/Functions/Public/New-Folder.ps1) module.

We will discuss:
+ The difference between a function and a script.
+ How to create a function.
+ How to create parameters for your function.
+ Pro's of making your function an **Advanced Function**.

## What is the difference between a function and a script?

If you've ever created a PowerShell script before, you know that a script is simply PowerShell code that is stored inside of a file with the extension **.ps1**. A function is a way for us to take some of your code that we feel would be useful to reuse and give it a name. Whenever we call that name, it will call the code that we have stored behind that name. 

But how is that any different than just re-calling the script that we've made? Well, the difference between a script and a function is that a function is meant to be flexible, meaning the code it runs can be used for multiple different scenarios. It is when you provide the function with specific information (by using parameters) will the function be able to perform tasks that the non-flexible script wouldn't be able to do.

## How to create a function

In my example, I created a function called `New-Folder` to help me create folders more quickly. Here is the basic PowerShell command for this.
```powershell
New-Item -Name "FolderName" -Path "path\to\folder\" -ItemType Directory
```

As you can see, every time I want to create a folder, I have to give the **Name**, **Path**, and the **ItemType** for PowerShell to create. Well... I'm a lazy guy, so I want to wrap this code in a function. Let's create a function called `New-Folder`. You can do this directly from within a PowerShell console, or fire up your favorite code editor (#VSCodeForTheWin!) and then simply copy/paste into a PowerShell session from there.

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

As you can see, this function `New-Folder` did exactly what it was supposed to do. It substituted our call of `New-Folder` for the code that is defined within.

Great! We are done!... Or are we? What's the issue with leaving this function the way it is?

Answer: It will create a folder called `FolderName` every time. Wouldn't it be nice if we could have this function make a folder, but we specify the folder name we want it to create when we call it? That is where we will benefit from adding a parameter!

## How to create parameters for your function

We want to be able to manipulate how this function operates by supplying information that it knows how to receive and use. Inside of the function, we can define how many parameters we want the function to be able to recieve, their names, and a whole host of other information depending on your needs.

Here is how we create a parameter for this function.

```powershell
function New-Folder {
    param (
        $FolderName
    )
    New-Item -Name "FolderName" -ItemType Directory
}
```

At the beginning of the function, we add a `param()` section, and inside we name the variable that will store the value we supply. You will notice that the name of the variable will correspond to how we reference the parameter.

```powershell
New-Folder -FolderName DifferentFolderName
```

If we run this, you'll notice that it still tries to create a folder called `FolderName`, but why? Well, we need to substitute the hard-coded value of `FolderName` in the function with our new parameter, like this.

```powershell
function New-Folder {
    param (
        $FolderName
    )
    New-Item -Name $FolderName -ItemType Directory
}
```

Now this function will create a new folder dynamically based on what value we supply the function with! Our code is a generic 'make a folder' command, but adding a parameter helps us re-use this code no matter what folder we need to create!

We are not quite done yet. We are going to get fancy and add some metadata to our parameter. For example, what if someone tries to call `New-Folder` without supplying a `-FolderName` value? We want to make this a **Mandatory** parameter, meaning it always needs to have a value specified. We do that like this.

```powershell
function New-Folder {
    param (
        [Parameter(Mandatory)]
        $FolderName
    )
    New-Item -Name $FolderName -ItemType Directory
}
```

Before the variable name, we add a section `[Parameter()]`, and inside of the parentheses we add our features. In this case we add the word **Mandatory** to tell this function that you must always provide a value for this parameter.

Now if you try to call `New-Folder` as-is, you will be prompted to enter a value.

![](/img/posts/functions_new-folder_mandatoryparameter.png)

**Figure 2 - Mandatory Parameter**

If you enter a value the function will use it, if you just press enter without specifying the value you will get an error since the function now knows **not** to proceed without that value.

Since this is the only parameter defined, we can ommit listing the parameter `-FolderName` and just provide it's value. PowerShell assumes we are providing a value for this one parameter, but just to be sure, let's add another piece of metadata to our parameter like this.

```powershell
function New-Folder {
    param (
        [Parameter(Mandatory,Position=0)]
        $FolderName
    )
    New-Item -Name $FolderName -ItemType Directory
}
```

We can add multiple pieces of information to the `[Parameter()]` section as long as we seperate them with commas. I've added `Position=0` which tells PowerShell, "If the parameter is not named, assume the first value is for this parameter".

Whether we add `Position=0` or not, we can use the following command.

```powershell
New-Folder SomeOtherName
```

## Pro's to making your function an **Advanced Function**

Congratulations! You now have a working function, that takes input to help customize how it is used! You rock. But we can go one step further and turn our function into an **Advanced Function**. An advanced function can utilize many built-in parameters that PowerShell automatically adds to your function, such as Debug, ErrorAction, ErrorVariable, InformationAction, InformationVariable, OutVariable, OutBuffer, PipelineVariable, Verbose, WarningAction, and WarningVariable.

The one we will be using is the `-Verbose` parameter provided in the Advanced Function. When you call a function that supports the `-Verbose`, all `Write-Verbose` messages within the function are displayed when you call the function. This really helps when something may not be working properly and you want to see more information from the function that doesn't normally display. Let's add the following messages.

```powershell
function New-Folder {
    param (
        [Parameter(Mandatory,Position=0)]
        $FolderName
    )
    Write-Verbose "Attempting to create folder: $FolderName"
    New-Item -Name $FolderName -ItemType Directory
    if (Test-Path $FolderName) {
        Write-Verbose "Successfully created folder: $FolderName"
    }
}
```

I added a little flava-flave by adding an `If` statement using `Test-Path`. `Test-Path` does exactly as it sounds, it tests to see if a file or folder exists and simply returns True or False. If it returns true, it will write the `Write-Verbose` message (assuming that you specified `-Verbose` when calling the function.)

```powershell
New-Folder YouRock -Verbose
```

This is a very simplified example, but hopefully you can see the value of using an Advanced Function just for the `Write-Verbose` messages. Your function will work and show the proper output normally, and can be as detailed as you want when using `-Verbose`.

Well, hopefully you now have a good handle on how to take your beautiful PowerShell code that you've written and turn it into a function, or functions! There are many more aspects to functions, like Begin Process and End blocks, accepting pipeline input, etc. but like I said they only need to be as complex as you need them to be. Feel free to explore some of the functions in either my [HelpDesk](https://github.com/matthewjdegarmo/HelpDesk.git) module or my [AdminToolkit](https://github.com/matthewjdegarmo/AdminToolkit.git) module on GitHub. If you like what you see, these are also published to the PowerShell Gallery for you to easily install! (Shameless plug).

Well, that's all I have for this one. Until next time, here is a picture of some of my code ducks that live on my desk. They are the reason I know any PowerShell at all!

![](/img/posts/functions_codeducks.png)
