---
layout: post
section-type: post
title: Creating a Progress Indicator for your PowerShell Processes
category: tech
tags: [ 'powershell', 'devops' ]
---

# Have you ever wondered if your script is still running, or did it just freeze?

Fear not! We can create a progress indicator for your PowerShell processes to show your script is alive and well, and show off a little bit too. 😎

Here is a quick example of what I mean.

![](/img/posts/progress_indicator.gif)
**Figure 1 - Progress Indicator Example**

This is very simple, but at any point in your script, if you would like some simple kind of visual feedback to let you know your script is running, this is very effective.

## The Setup

This section builds on my [previous post](https://matthewjdegarmo.com/powershell/2022/04/22/using-psstyle-to-spice-up-your-output.html), where we are able to leverage the `$PSStyle` object to create a nice looking output. We will use this to define this progress indicator, turning it green (or any other color you'd like.)

First, we have to define these symbols, in a similar manner to how we did it in the previous post.

```powershell
$script:GREEN      = "$($PSStyle.Foreground.Green)"
$script:CYAN       = "$($PSStyle.Foreground.Cyan)"
$script:RESET      = "$($PSStyle.Reset)"
$script:ARROW      = "${CYAN}$([char]9654)${RESET}"
$script:CHECK_MARK = "${GREEN}$([char]8730)${RESET}"
$script:SPINNER    = @(
    "${GREEN}$([char]10251)${RESET}",
    "${GREEN}$([char]10265)${RESET}",
    "${GREEN}$([char]10297)${RESET}",
    "${GREEN}$([char]10296)${RESET}",
    "${GREEN}$([char]10300)${RESET}",
    "${GREEN}$([char]10292)${RESET}",
    "${GREEN}$([char]10278)${RESET}",
    "${GREEN}$([char]10279)${RESET}",
    "${GREEN}$([char]10247)${RESET}",
    "${GREEN}$([char]10255)${RESET}"
)
```

Once we have this `SPINNER` variable defined, which is an array of green characters, in the order they should be displayed, we can use it to create a progress indicator.

```powershell
Function Write-Spinner() {
    $script:SPINNER | Foreach-Object {
        Write-Host "`b`b$_ " -NoNewline
        Start-Sleep -m 65
    }
}
```

This function will write out the `SPINNER` variable, one character at a time, waiting 65 milliseconds after each character. Notice the `` `b`b `` syntax. This is used to write these symbols 'in place' on the console. This is essnetially typing a `backspace` and then typing the symbol. Instead of displaying the characters side by side (as shown in **Figure 2**), we are displaying them in a 'spiral' pattern.

![](/img/posts/spinner_chars.png)
**Figure 2 - Spinner Characters**

Now if we call the `Write-Spinner` function, we will see a single rotation of our spinner, and that will be it.

# Usage

Now that we have the groundwork laid for this, here is a simple implimentation of how you might use this.

Let's say you have a script that, for some reason, needs to wait for a human to create a certain file before it can continue. We would display a message letting the human know, and then use this indicator to show the script is still running.

```powershell
$script:GREEN      = "$($PSStyle.Foreground.Green)"
$script:CYAN       = "$($PSStyle.Foreground.Cyan)"
$script:RESET      = "$($PSStyle.Reset)"
$script:ARROW      = "${CYAN}$([char]9654)${RESET}"
$script:CHECK_MARK = "${GREEN}$([char]8730)${RESET}"
$script:SPINNER    = @(
    "${GREEN}$([char]10251)${RESET}",
    "${GREEN}$([char]10265)${RESET}",
    "${GREEN}$([char]10297)${RESET}",
    "${GREEN}$([char]10296)${RESET}",
    "${GREEN}$([char]10300)${RESET}",
    "${GREEN}$([char]10292)${RESET}",
    "${GREEN}$([char]10278)${RESET}",
    "${GREEN}$([char]10279)${RESET}",
    "${GREEN}$([char]10247)${RESET}",
    "${GREEN}$([char]10255)${RESET}"
)
Function Write-Spinner() {
    $script:SPINNER | Foreach-Object {
        Write-Host "`b`b$_ " -NoNewline
        Start-Sleep -m 65
    }
}
$File = "C:\Temp\Your_File.txt"
Write-Host "${ARROW} ${CYAN}Waiting for file ${YELLOW}$File${CYAN} to be created...   " -noNewline
Do {
    Write-Spinner
} Until (Test-Path $File)
Write-Host "`b`b${CHECK_MARK}"
Write-Host "${ARROW} ${GREEN}Thank you for creating the file!${RESET}"
```

I'm doing a fancy thing here. I'm using the `Do` loop to keep the script running until the file is created. I'm using the `Write-Spinner` function to display the spinner, and then I'm using the `Test-Path` function to check if the file exists. If it does, then the loop will exit, and the `Write-Host` will display the check mark. I like to use the `Write-Host` function to display the check mark, because it will make the output look a little cleaner, and not leave the leftover spinner symbol in the console.

The above code would look like this, spinning until the file exists.

![](/img/posts/progress_indicator_success.gif)
**Figure 3 - Progress Indicator Success**

I like this effect, where the spinner gets replaced with a check mark. 

Similarly, there's wizzardry we can do to replace this with a warning symbol. Let's say the human sent an interrupt signal, like pressing `CTRL + C` to close the script early. That might look something like this.

```powershell
$script:GREEN      = "$($PSStyle.Foreground.Green)"
$script:CYAN       = "$($PSStyle.Foreground.Cyan)"
$script:RESET      = "$($PSStyle.Reset)"
$script:ARROW      = "${CYAN}$([char]9654)${RESET}"
$script:CHECK_MARK = "${GREEN}$([char]8730)${RESET}"
$script:WARNING = "$(([char]55357) + ([char]57000))"
$script:SPINNER    = @(
    "${GREEN}$([char]10251)${RESET}",
    "${GREEN}$([char]10265)${RESET}",
    "${GREEN}$([char]10297)${RESET}",
    "${GREEN}$([char]10296)${RESET}",
    "${GREEN}$([char]10300)${RESET}",
    "${GREEN}$([char]10292)${RESET}",
    "${GREEN}$([char]10278)${RESET}",
    "${GREEN}$([char]10279)${RESET}",
    "${GREEN}$([char]10247)${RESET}",
    "${GREEN}$([char]10255)${RESET}"
)
Function Write-Spinner() {
    $script:SPINNER | Foreach-Object {
        Write-Host "`b`b$_ " -NoNewline
        Start-Sleep -m 65
    }
}
$File = "C:\Temp\Your_File.txt"
Write-Host "${ARROW} ${CYAN}Waiting for file ${YELLOW}$File${CYAN} to be created...   " -noNewline
Try {
    Do {
        Write-Spinner
    } Until (Test-Path $File)
    Write-Host "`b`b${CHECK_MARK}"
    Write-Host "${ARROW} ${GREEN}Thank you for creating the file!${RESET}"
    $script:FileExists = $true
} Finally {
    If ($script:FileExists -ne $true) {
        Write-Host "`b`b${WARNING}"
        Write-Host "${WARNING} ${RED}The file was not created!${RESET}"
    }
}
```

![](/img/posts/progress_indicator_interrupt.gif)
**Figure 4 - Progress Indicator Interrupt**

When we press `CTRL + C` during the `Do` loop, we immediately exit the `Try {}` block and head to the `Finally {}` block. Because of this, we never set the `$script:FileExists` variable to `$true`, and the `Write-Host` at the end of the `Finally {}` block will display the warning symbol, and the final warning message.

Note, the ``Write-Host "`b`b${WARNING}"`` line in the `Finally {}` block is able to write this symbol on the same line becase the `Write-Spinner` function writes each line with the `-NoNewline` flag. So any line we write next will be on the same line as the original waiting message.

# BONUS

I hope everything up to this point has made sense so far. But I wanted bring up a situation I ran into recently with this spinner and offer my solution.

`The problem:` What if the `Until ()` condition takes a long time to evaluate?

In the above examples, we are simply running a `Test-Path` check, and then the spinner starts over again. Because of how quickly this check runs, our brains don't really notice the delay between each rotation. But what if our check took 1 second to generate a result for? Our spinner would look more like this...

![](/img/posts/progress_indicator_delay.gif)
**Figure 5 - Progress Indicator Delay**

Notice that the `Write-Spinner` is still running, but it can't restart until the `Until ()` condition comes back as True or False before the next iteration of the `Do` loop, or exiting the loop.

My solution to this is to run your `Until ()` condition as a job. This will run in the background, and then the spinner will continue to run.

I'm not going to deep dive into jobs right now, but what you can do when you create a job is you can check the status of the job with the `Get-Job` command. Once our job is complete, we will be able to continue with our script.

In your scenario where your `Until ()` condition takes a long time to evaluate, you can use the `Get-Job` command to check the status of the job. If the job is still running, then the spinner will continue to run. If the job is complete, then the spinner will stop. Checking the status of a job is probably **much** faster than whatever condition you are checking for is.

[Here is an example of this](https://gist.github.com/matthewjdegarmo/c4b5dc80f83afdb9861ff0bea0ec18e7). To keep things simple I'm using `Start-Sleep` to simulate a check that takes 1 second to evaluate.

![](/img/posts/progress_indicator_jobless.gif)
**Figure 6 - Jobless Progress Indicator**

Now we see the same slow check, but it's thrown into a job instead.

![](/img/posts/progress_indicator_job.gif)
**Figure 7 - Job Progress Indicator**

## Farewell

And there you have it. I hope you enjoyed this post and see the value in adding something like this to your scripts where it makes sense. Functionally, it doesn't really add any value, it's all asthetic. But if your scripts don't look cool, is it really a good script? 😎

Thanks for tuning in! If you have any questions or comments, feel free to reach out to me on Twitter or GitHub.
