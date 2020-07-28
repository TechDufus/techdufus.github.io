---
layout: post
section-type: post
title: How to organize your powershell functions into a module - Part 1
category: powershell
tags: [ 'module' ]
---

## So you've written a few functions in PowerShell... Now what?

Writing functions is a blast. Having a problem, spending time to come up with your own unique way to solve it, gather some information, or even get fancy and make something that works in the pipeline! It's an awesome feeling to finally close those 32 chrome tabs of research trying to build what you've made, and then you move onto the next task.

After a while, it's time to take your PowerShell game to the next level. Taking your separate functions and scripts and to gather and organize them into a single module, making your code much easier to manage and distribute. Not to mention that you immediately become a professional upon making your first module, everyone knows that.

Okay, let's get down to business. A PowerShell module is simply a collection of similar functions, with some metadata thrown in. There are many different camps on the 'correct' way to build a module, and each one has it's pros and cons, as well as added complexity, so we will start with the most basic and build from there.

## Module Bare Necessities

A module is a PowerShell file with the **.psm1** extension that contains your functions, as well as a file with the **.psd1** extension that contains metadata about your module. The **.psm1** file is your Module, and the **.psd1** file is called a Manifest. Technically you can get away with **not** having a Manifest file, but it's clunky and remember, we are **professionals** so we want to have a Manifest!

Say I've written 6 functions that all have to do with ActiveDirectory tasks and would like to create a module out of them to share with my teammates, it will go something like this.

You will want to gather all of the function definitions and paste them into your **ModuleName.psm1** file. The file name must be your desired module name. In this example I will use the module name **MyADUtils**. So, let's get our functions pasted into our **MyADUtils.psm1** file like this.

![](/img/posts/myadutils_functions_screenshot.jpg)

Now that we have our functions assembled, we need to tell the module to export these functions. When you do an `Import-Module ModuleName`, you only import the functions that the module is told to export. For example, I can export the first-third functions of MyADUtils, and even though there are more functions defined in the **MyADUtils.psm1** module, I won't be able to use them since they were not speficically exported.

Here is how we export the functions that we want to use. At the bottom of the module, we want to use the `Export-ModuleMember` cmdlet and specify which `-Function` we want to export.

![](/img/posts/myadutils_exportmodulemember_screenshot.jpg)

We can clean this up by adding a backtick to the end of each line (except the last line) and placing the next function on the next line, like this.

![](/img/posts/myadutils_exportmodulememberbacktick_screenshot.jpg)

Then we save the file and can now import this module manually like this: `Import-Module path\to\module\MyADUtils.psm1`

![](/img/posts/myadutils_importmodule_screenshot.jpg)

Notice after we import, we can use the functions that are exported successfully! Also, we are **not** able to use the functions in the module that aren't exported, like `FourthADUtilsFunction`.

Even though the non-exported functions are not brought out of the module to be used in your current PowerShell session, they can however reference eachother within the module itself. Let's say you write a function, and it's only purpose is to assist another function within your module, but you don't necessarily want the user to be able to use it. We can do something like this.

![](/img/posts/myadutils_privatefunctionreference_screenshot.jpg)

Notice how `FirstADUtilsFunction` is able to call `HelperFunction`, but we are not able to call it from our session. Technically we can export all modules like this: `Export-ModuleMember -Function *`, but then we do not get any control over which functions stay 'private' and which ones we specifically want to export.

---

## Congratulations!! You just created and imported your own module!

![](/img/posts/butwaittheresmore.jpg)

Remember that Manifest (**.psd1**) file we talked about earlier? Here's where we gird up our loins and become professional.