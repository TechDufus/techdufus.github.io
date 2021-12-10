---
layout: post
section-type: post
title: Playing With Dates in PowerShell
category: powershell
tags:
---

# DateTime Objects

I wanted to share a little bit about date objects with PowerShell, and some cool things you can do with them.

`Get-Date` returns a datetime object that comes with some very cool methods. If you want to see all of the methods available, you can run `Get-Date | Get-Member`. A few that I would like to highlight are `.AddDays()`, `.AddMonths()`, and `.AddYears()`.

These methods are very useful for adding or subtracting days, months, or years from a date, to create a full datetime object at a specific time.

## Method Examples

```ps
$Now = Get-Date
$Yesterday = $Now.AddDays(-1)
$LastYear = $Now.AddYears(-1)
$NextYear = $Now.AddYears(1)
$4MonthsAgo = $Now.AddMonths(-4)
```

## File Threshold Example

In the above example, we see several ways of altering a datetime object. This is useful for creating specific date thresholds. For example, if you needed to delete all files in a directory that haven't been touched for 7 months, after 04:00 AM on that day, that might look something like this.

```ps
# Notice here how I'm editing specific values that Get-Date returns.
# Unless otherwise specified, Get-Date is the CURRENT everything, unless I manually overwrite a value.
$Threshold = (Get-Date -Hour 4 -Minute 0 -Second 0).AddMonths(-7)
Get-ChildItem | Where-Object {$_.LastWriteTime -lt $Threshold} | Remove-Item -Force -Recurse
```

## Comparing Dates

Notice above, how I'm able to compare two different datetime objects as if they were just numbers. The more `FUTURE` date is `GREATER THAN` a date in the past. (`TODAY` -gt `YESTERDAY`) or (`YESTERDAY` -lt `TODAY`) as a basic example.

We can quick test this. All of the following will return True:

```ps
(Get-Date).AddDays(-1) -lt (Get-Date) # Yesterday is less than today
(Get-Date).AddDays(1) -gt (Get-Date) # Tomorrow is greater than today
(Get-Date).AddDays(1) -gt (Get-Date).AddDays(-1) # Tomorrow is greater than yesterday
(Get-Date) -lt (Get-Date).AddYears(1) # Today is less than next year
(Get-Date).AddMonths(-6) -lt (Get-Date).AddMonths(-4) # 6 months ago is less than 4 months ago
```

To make this easier to read, you would probably assign these date values to a variable with a name that cooresponds to it's value, like `$Yesterday`, `$Tomorrow`, `$NextYear`, etc.

## Date Formatting

If you need to visually represent a date, you can change how it's displayed. For example, if you wanted to display the date as `01/01/2021`, you could do this:

```ps
Get-Date -Format "MM/dd/yyyy"
```

There are also many preset formats that you can call without having to create the format yourself. For example, if you want the date in a 24-hour format you can do this:

```ps
Get-Date -UFormat '%R'

17:45
```

For a full list of these `UFormat` formats, see the [official documentation](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-date?view=powershell-7.2#notes).

There are other cool things you can do with dates. It's always best to review the official help documentation which can be found here for [Get-Date](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-date?view=powershell-7.2)

## Thank You

Thanks for checking out this post! If you have any questions, or suggestions on future content, please reach out to me! I'm always open to feedback and suggestions.

Until next time, have a great rest of your day!
