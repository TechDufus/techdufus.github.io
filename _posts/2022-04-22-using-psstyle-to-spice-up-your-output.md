---
layout: post
section-type: post
title: Using $PSStyle to Spice up your Output
category: tech
tags: [ 'powershell', 'devops' ]
---

# Creating fancy PowerShell output has never been easier with PowerShell v7.2.
With PowerShell v7.2, an automatic variable called `$PSStyle` has been added to the PowerShell environment. This variable is a collection of styles that can be applied to the output of PowerShell commands. Accompanied by a feature called PSAnsiRendering, this allows us to easily inject colors, styles, and other formatting into our output.

After looking into this a bit, I found a simple and easy to understand implimentation of `$PSStyle` to help create cool output.

This post will not be a deep dive into the `$PSStyle` object, but instead will simply show off how I was able to use it to create a nice looking output without a lot of clutter in my code.

Take the following example, without using PSStyle:

```powershell
Write-Host "Hello " -noNewLine -ForegroundColor Cyan
Write-Host "$env:USERNAME" -noNewLine -ForegroundColor Yellow
Write-Host "! You are currently on " -noNewLine -ForegroundColor Cyan
Write-Host "$env:COMPUTERNAME" -noNewLine -ForegroundColor Yellow
Write-Host "!" -ForegroundColor Cyan
```

Simply, this is too much code just to create the below output. There has to be a better way, right?

![](/img/posts/psstyle_output_example.png)
**Figure 1: Output without PSStyle**

Now, imagine a world where you could do the following instead to produce the same output:

```powershell
Write-Host "${CYAN}Hello ${YELLOW}$env:USERNAME${CYAN}! You are currently on ${YELLOW}$env:COMPUTERNAME${CYAN}!"
```

This is what I've been able to achieve with PSStyle.

## $PSStyle Prep

First, we will need to define a few variables that allow us to do this.

```powershell
$CYAN   = "$($PSStyle.Foreground.Cyan)"
$YELLOW = "$($PSStyle.Foreground.Yellow)"
$GREEN  = "$($PSStyle.Foreground.Green)"
$RESET  = "$($PSStyle.Reset)"
```

That's it! Now, we can use the variables to create our output. (See **Figure 1**)

`$RESET` is a special variable that will reset the formatting of the text. I like to include it in my symbol definitions, which we will get to in a bit. If I want some text to be yellow, and then turn off that formatting for the rest of the string, that would look something like this:

```powershell
Write-Host "${YELLOW}This text is yellow, but as soon as I ${RESET}reset it, it will be back to normal."
```

![](/img/posts/psstyle_output_reset_example.png)
**Figure 2: PSStyle Reset Example**

This isn't all that complicated, but it's a good idea to keep in mind that you can use the `$PSStyle` object to create any kind of output you want. What if I want to show some emoji's or symbols? What if I want to write a custom progress indicator? These are all things I lean on when I write output, and I can use `$PSStyle` to do it.

## Symbols

In order to use the $PSStyle object to create symbols, we need to define a variable that contains the symbol we want to use.

```powershell
$ARROW       = "${CYAN}$([char]9654)${RESET}"
$CHECK_MARK  = "${GREEN}$([char]8730)${RESET}"
$RIGHT_ANGLE = "${GREEN}$([char]8735)${RESET}"
$PIN         = "$(([char]55357) + ([char]56524))"
$WARNING     = "$(([char]55357) + ([char]57000))"
```

Notice above, how some of the symbols leverage the color variables we defined above. This is because by themselves (usually) the symbols are not colored.

For example, this is the `$ARROW` symbol by itself:

![](/img/posts/psstyle_arrow_plain.png)

But if we want to show the `$ARROW` symbol in Cyan, we would simply wrap the `([char]9654)` in the `$CYAN` variable.

![](/img/posts/psstyle_arrow_cyan.png)

I like to have my output messages written in CYAN, so I want to start with a CYAN arrow.

```powershell
Write-Host "${ARROW} ${CYAN}You are currently on ${YELLOW}$env:COMPUTERNAME"
Write-Host "${ARROW} ${CYAN}The current date is ${YELLOW}$((Get-Date).AddHours(-10))"
$Files = Get-ChildItem -Path C:\Temp -File
Write-Host "${ARROW} ${CYAN}You have ${GREEN}$($Files.Count)${CYAN} files are in your ${YELLOW}C:\Temp${CYAN} directory:"
$Files | Foreach-Object {
    Write-Host "  ${RIGHT_ANGLE} ${YELLOW}$($_.Name)"
}
Write-Host "${PIN} ${CYAN}You should consider cleaning these up!"
```

![](/img/posts/psstyle_output_symbols_example.png)
**Figure 3: PSStyle Symbol Example**

## Wrapping Up

If we think back to our first example of writing a single line of output without using `$PSStyle`, we can see that we had to use a lot of `Write-Host` commands. Now, we can use the `$PSStyle` object to create a nice looking output with much less code, and it's honestly easier to read when you have simple formatting inside the text itself.

In my next post, I'll show off an in-line progress indicator, which will be useful when writing long running scripts, or just to show that the script is still alive.

Until then, thank you for tuning in and supporting me! All feedback is welcome!

Cheers.
