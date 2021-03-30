---
layout: post
section-type: post
title: 'Use PowerShell to Detect Running OS'
category: powershell
tags: [ 'function' ]
---

# When developing new PowerShell tools in this day and age, with everything becoming increasingly cross-platform, it's important to keep cross-platform development in mind.

I recently found myself specifically coding against a Windows system, without taking into account that someone on Linux could easily run my code if only I would account for it.

I'd like to quickly share an easy way to detect the running OS, and possibly make tweaks in your code depending on what OS is running your cmdlets.

With the release of PowerShell Core (v6.0), PowerShell comes with new environment variables:
- `$IsLinux`
- `$IsMac`
- `$IsWindows`

Depending on what OS is running, **only** that variable will be set to **True** or `$true`.

After one of my [PowerShell Live Streams](https://www.youtube.com/watch?v=9d_1VubKKB4), [Phonox](https://github.com/Phonox) reached out and gave me a quick solution that improved upon what I was trying to do myself.

```powershell
$DetectedOS = switch($true) {
    $IsWindows {'Windows'}
    $IsLinux   {'Linux'}
    $IsMacOS   {'MacOS'}
    DEFAULT    {'Windows'}
}
```

This check is simple, but effective. It not only tells me when I'm running Windows, but if I need to do something specific if I'm on Linux, I can account for that too!

What's happening is the `Switch()` statement is returning some text based on what is true, and that text gets thrown into the `$DetectedOS` variable.

## Why do we need this check anyway?

Now you may be wondering why this is needed at all, since the variables are built right in to PowerShell when you launch it? The issue is when a user is running on **Windows PowerShell**. Remember, these variables do **not** exist before PowerShell Core (v6.0), so if someone is running v5.1, or even v2.0 for example, it's 100% a fact that they are running on Windows.

This is what the `DEFAULT {}` statement is for. If someone is running Windows PowerShell, none of the variables will be true, so the `Switch()` statement will run the `DEFAULT {}` section, which will always be `'Windows'`

All you need to do now is reference the `$DetectedOS` variable and code based on what you get back!

## That's all for now. Thanks for tuning in!