---
layout: post
section-type: post
title: 'How to Import a Locally Defined Function into a Remote PowerShell Session'
category: powershell
tags: [ 'powershell' ]
---

# Wouldn't it be nice if you could use a local function in a remote PowerShell session? Then this is the post for you!

I ran into a scenario that seemed simple, but was a bit frustrating to figure out. I have a locally defined function called `Write-Status`, which takes a status type, and a message. Depending on the status type, a different symbol and message color will be used. 
<style>
r { color: Red}
o { color: Orange}
g { color: Green}
y { color: Yellow}
</style>
- <y>[-] Info Message.</y>
- <o>[!] Warning Message.</o>
- <g>[+] Success Message.</g>
- <r>\[X] Error Message.</r>

I wanted this function to provide colorized output even when running commands in a remote PowerShell session. The issue is that this function lives on my machine and not the remote machine.

I could manually define the definition of the `Write-Status` command inside of each `Invoke-Command` ScriptBlock I was running, but I knew there had to be a better way, expecially since I wanted to run a large code-block and not just a single command at a time.

I came across [this solution](https://duffney.io/run-local-functions-remotely-in-powershell/) provided by [Josh Duffney](https://twitter.com/joshduffney), but it provided a way to run a single command at a time, when I needed to inject my function into a whole code-block remotely.

## Here is my solution for this.

I created a function called `Invoke-LoadFunctionRemotely` which takes two parameters, `-FunctionName` and `-Session`. The session is provided by using the `New-PSSession` cmdlet.

Instead of having to load my function each time I use `Invoke-Command`, I thought I'll create a session to the remote machine instead, load my command once, and all subsequent commands ran using that session will have access to my 'local' function!

```powershell
Function Invoke-LoadFunctionRemotely() {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory)]
        [System.String[]] $FunctionName,

        $Session
    )

    Begin {}

    Process {
        $FunctionName | Foreach-Object {
            $Function = Get-Command -Name $_ -ErrorAction SilentlyContinue
            If ($Function) {
                $Definition = @"
                    Function $_() {
                        $($Function.Definition)
                    }
"@
                Invoke-Command -Session $Session -ScriptBlock {
                    Param($LoadMe)
                    . ([ScriptBlock]::Create($LoadMe))
                } -ArgumentList $Definition
            }
        }
    }
}
```

Since my `Write-Status` function is already defined locally, I am able to run the following commands to load this.

```powershell
$Session = New-PSSession -ComputerName Some-Remote-PC
Invoke-LoadFunctionRemotely -FunctionName 'Write-Status' -Session $Session
```

This creates the remote session and stores it in the `$Session` variable. Then I run my loading function and provide this session.

I'm then able to run the following command and use my `Write-Status` cmdlet!

```powershell
Invoke-Command -Session $Session -ScriptBlock {
    Write-Status Info "I'm about to get some services."
    Try {
      $NotepadService = Get-Service | Where-Object {$_.Name -eq 'notepad'}
      If ($NotepadService) {
          Write-Status Success "Notepad is running!"
      } Else {
          Write-Status Warning "Notepad is not running!"
      }
    } Catch {
        Write-Status Error $_
    }
}
```

With this solution, I'm able to use my local function in a remote session without having to paste in the function code into the scriptblock, making my code look that much cleaner!

## That's all for this one. If you have any questions that I can answer in future posts, or any comments, please reach out!

Here's my basic `Write-Status` cmdlet I'm refering to in this post.

```powershell
Function Write-Status() {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory,Position=0)]
        [ValidateSet('Info','Warning','Success','Error')]
        $Type,

        [Parameter(Mandatory,Position=1)]
        $Message
    )

    Process {
        $Status = Switch($Type) {
            'Info' {
                @{
                    Symbol = '-'
                    Color = 'Yellow'
                }
            }
            'Warning' {
                @{
                    Symbol = '!'
                    Color = 'DarkYellow'
                }
            }
            'Success' {
                @{
                    Symbol = '+'
                    Color = 'Green'
                }
            }
            'Error' {
                @{
                    Symbol = 'X'
                    Color = 'Red'
                }
            }
        }

        Write-Host "[$($Status.Symbol)] $Message" -ForegroundColor $Status.Color
    }
}
```

**Another quick note**: This does **NOT** work with compiled cmdlets or compiled modules. For example. If you run the following command `(Get-Command Get-ADUser).Definition`, a command from the `ActiveDirectory` module, you do not get the actual code definition back. That is because this module is most likely written in C# and the compiled into a .dll file.

BUT when you want to load a module that comes as a .psm1, or has .ps1 files dot-sourced that actually contain the PowerShell definition, this will work.

## Okay, now I'm done. 😎