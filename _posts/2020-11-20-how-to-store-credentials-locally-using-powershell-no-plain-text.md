---
layout: post
section-type: post
title: 'How to store credentials locally using PowerShell. NO PLAIN TEXT.'
category: powershell
tags: [ 'function' ]
---

# When scripting authenticated tasks, it's very important to make sure that you are handling credentials properly and not storing plain text passwords in your scripts or modules.

In my new position as a DevOps Engineer, I find myself scripting more and more authenticated tasks. Data gathering from a firewall, ordering signed web certificates against an API, etc... These tasks, amoung many others, require passwords and API keys to get the job done.

So I write modules and tools that are used by others internally to do these same tasks, so my solution needed to solve this problem for all users using my tools, with their unique credentials, using the same source code. Currently the SecretsManagement module for PowerShell is still in preview so I'm not interested in scripting with those tools until there is a GA release.

After thinking about it for a bit, this is what I came up with. PowerShell can read in a secure string, and securely handles this secure string while in memory. I thought what if I save this encrypted string to a local location? In the past I had sought to do this, and it always came back to, "Encrypting takes a secret key, and where do I store the secret? Oh, I know! I'll just encrypt the secret too! But where do I store that secret's secret?"

You can easily see how this can go on forever and never solves the problem. But recently I thought, 
"Well how does PowerShell encrypt it in the first place?" When using `Read-Host -AsSecureString`, `ConvertTo-SecureString`, or even `Get-Credential`, PowerShell by default will use the **Windows Data Protection API** (DPAPI) to encrypt the string. (See `Get-Help ConvertTo-SecureString` for more information.) This encrypted data is only readable by the user that encrypted it, on the computer it was encrypted on, making it a pretty secure way to handle all of this, assuming the password you are storing is strong.

This was it, the information I needed to leap over this hurdle and finally start securely scripting authenticated actions! I still need to decide on a few more things..

* How will I store these encrypted credentials?
* Where will I store them?
* How will I retrieve them in an automated way?

Let's tackle these one by one, and finally show off some code. 😊

I thought it would be a good idea to create a private function to handle the retrieving from the user, storing, and retrieving from storage when needed, all in the same function.

Let's invent an overly simplified example and say that we have an Administrator account (**ADMIN-matthewjdegarmo**), that is seperate from a non-admin standard account (**matthewjdegarmo**) in a domain. You want to be able to run scripted tasks that run using the admin credentials, without having to do a **run as** or log in with the admin account. Here we go.

## How to store PowerShell Encrypted Credentials

In the context of a module, you are able to create Public and Private functions. (For more information on this, see [How to Organize your PowerShell Functions Into a Module - Part 2](https://matthewjdegarmo.com/powershell/2020/08/03/how-to-organize-your-powershell-functions-into-a-module-part-2.html))

Let's create a Private function called `Get-MyAdminCredential`.

```powershell
Function Get-MyAdminCredential() {
    [CmdletBinding()]
    Param()
    #Do cool stuff here
}
```

Sweet! We are almost done! 😂

Remember, I said this would need to be a solution that worked for all of my teammates using the same code, so the thing that would change between us would be our usernames. Let's add that as a parameter.

```powershell
Function Get-MyAdminCredential() {
    [CmdletBinding()]
    Param(
        # Default to the username calling the function
        [System.String] $Username = $env:USERNAME
    )
    #Do cool stuff here
}
```

Next, let's prompt the user for the credentials we want to store..

```powershell
Function Get-MyAdminCredential() {
    [CmdletBinding()]
    Param(
        # Default to the username calling the function
        [System.String] $Username = $env:USERNAME
    )

    Process {
        # Notice for username I'm adding 'ADMIN-' to the beginning, since in our scenario
        # this is the format for admin accounts for myself and my teammates.
        $CredentialParams = @{
            Message  = "Enter Admin Credentials:"
            Username = "ADMIN-$($Username.ToLower())"
            Title    = "Admin Credentials"
        }
        # I'm cool, so I'll use some splatting here.
        # Feel free to google 'PowerShell Splatting' if you are not familiar. Very handy.
        $Credential = Get-Credential @CredentialParams
    }
}
```

Awesome, we have a [PSCredential] stored in `$Credential`. Now what do we do with it? Well, PowerShell has several data conversion cmdlets built-in. Recently I had some luck using XML conversion, so that's what I decided to try first with these credentials and it worked. We can take the `$Credential` and pipe it into `Export-Clixml` and give it a file path. This will create an xml file and store the [PSCredential] content therein.

```powershell
$Credential | Export-Clixml -Path $SomePathWeDecidedOn
```

## Where to Store PowerShell Encrypted Credentials

This is a problem that has many solutions. I picked a location that I knew would exist on all of my teammates computers.

`C:\Users\Public`

I picked this because I was too lazy to write to profile locations. Like I said there are many places these files can be stored; Each profile, APPDATA, etc... In the `C:\Users\Public` folder, I'll have my function check for, and create a folder called `Creds`, (how creative...) I'll also define the path to the XML file we will be creating.

Let's add that code now.

```powershell
Function Get-MyAdminCredential() {
    [CmdletBinding()]
    Param(
        # Default to the username calling the function
        [System.String] $Username = $env:USERNAME
    )

    Begin {
        $CredDirectory = "C:\Users\Public\Creds"
        #Invent some clever unique name for this credential
        #Also I use [System.IO.Path]::Combine() instead of Join-Path. Fight me.
        $CredFile = [System.IO.Path]::Combine($CredDirectory,"Admin_$Username`_cred.xml")
        if (-Not(Test-Path $CredDirectory)) {
            New-Item -Path $CredDirectory -ItemType Directory
        }
    }

    Process {
        $CredentialParams = @{
            Message  = "Enter Admin Credentials:"
            Username = "ADMIN-$($Username.ToLower())"
            Title    = "Admin Credentials"
        }
        # I'm cool, so I'll use some splatting here.
        # Feel free to google 'PowerShell Splatting' if you are not familiar. Very handy.
        $Credential = Get-Credential @CredentialParams

        #Export Credential to .xml file path from our Begin {} block.
        $Credential | Export-Clixml -Path $CredFile
    }
}
```

## How to Retrieve PowerShell Encrypted Credentials

Very cool! This is starting to be more and more robust! One thought that may come to mind right away is, "If I run this, it will prompt me for credentials, and store the password in a file. What happens if I run it again?"

Good catch there, Author. 😎

Yes, right now this function will prompt us every time for credentials, but the whole point of this is "set it and forget it." I want the function to check if the file already exists, and if it does, then just grab the stored credentials instead of asking me every time.

This is simple.
```powershell
Function Get-MyAdminCredential() {
    [CmdletBinding()]
    Param(
        # Default to the username calling the function
        [System.String] $Username = $env:USERNAME
    )

    Begin {
        $CredDirectory = "C:\Users\Public\Creds"
        #Invent some clever unique name for this credential
        #Also I use [System.IO.Path]::Combine() instead of Join-Path. Fight me.
        $CredFile = [System.IO.Path]::Combine($CredDirectory,"Admin_$Username`_cred.xml")
        if (-Not(Test-Path $CredDirectory)) {
            New-Item -Path $CredDirectory -ItemType Directory
        }
    }

    Process {
        If (-Not(Test-Path $CredFile)) {
            $CredentialParams = @{
                Message  = "Enter Admin Credentials:"
                Username = "ADMIN-$($Username.ToLower())"
                Title    = "Admin Credentials"
            }
            # I'm cool, so I'll use some splatting here.
            # Feel free to google 'PowerShell Splatting' if you are not familiar. Very handy.
            $Credential = Get-Credential @CredentialParams
    
            #Export Credential to .xml file path from our Begin {} block.
            $Credential | Export-Clixml -Path $CredFile
        }
        #Return the Credential information from the XML file
        [PSCredential] (Import-Clixml -Path $CredFile)
    }
}
```

Notice I just slapped an `If` statement around the `Get-Credential` section, and I used the `Import-Clixml` to convert the stored XML content back into a PowerShell object, [PSCredential].


## The fruits of our labor - Implimentation

Let's say that our function that we are too lazy to **run as** admin for was unlocking an AD account. We can write a public function in our module called `Unlock-Account` that will automatically handle using our Admin credentials.

```powershell
Function Unlock-Account() {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory,Position=0)]
        [System.String] $Identity,

        [PSCredential] $Credential = (Get-MyAdminCredential -Username $env:USERNAME)
    )

    Process {
        $UnlockParams = @{
            Identity = $Identity
            Credential = $Credential
        }
        Unlock-ADAccount @UnlockParams
    }
}
```

So here we have the `Unlock-Account` cmdlet, which is basically a fancy wrapper around the `Unlock-ADAccount` cmdlet. Notice that the default value for `$Credential` is the output of our `Get-MyAdminCredential` Private function.

If this was our first time calling this `Unlock-Account` cmdlet, we would be prompted for our admin credentials, they would be stored in an XML file, and the credentials would be returned to the `$Credential` parameter and used.

The second time we call this cmdlet, `$Credential` would automatically be filled with the encrypted admin credentials and automatically used.

Basically, we are done. Our goal was to securly script an authenticated action, and we have done that. But for this specific AD example, I wanted to offer a bonus feature, free of charge. 🤑🤑🤑

## Bonus Code

What if we typo our credentials, wouldn't it be nice to have the `Get-MyAdminCredential` cmdlet automatically tell us if the credential we entered was invalid? Without this check, the bad credential would be stored in the file, and to fix this, you would have to locate the file and delete it. Too much work for a PowerShell person if you ask me.

We could include that functionality like this.
```powershell
Function Get-MyAdminCredential() {
    [CmdletBinding()]
    Param(
        # Default to the username calling the function
        [System.String] $Username = $env:USERNAME
    )

    Begin {
        $CredDirectory = "C:\Users\Public\Creds"
        #Invent some clever unique name for this credential
        #Also I use [System.IO.Path]::Combine() instead of Join-Path. Fight me.
        $CredFile = [System.IO.Path]::Combine($CredDirectory,"Admin_$Username`_cred.xml")
        if (-Not(Test-Path $CredDirectory)) {
            New-Item -Path $CredDirectory -ItemType Directory
        }
    }

    Process {
        If (-Not(Test-Path $CredFile)) {
            $CredentialParams = @{
                Message  = "Enter Admin Credentials:"
                Username = "$($Username.ToLower())"
                Title    = "Admin Credentials"
            }
            # I'm cool, so I'll use some splatting here.
            # Feel free to google 'PowerShell Splatting' if you are not familiar. Very handy.
            $Credential = Get-Credential @CredentialParams

            $DomainSystem = New-Object System.DirectoryServices.AccountManagement.PrincipalContext([System.DirectoryServices.AccountManagement.ContextType]::Domain, $env:USERDOMAIN)
            If ($DomainSystem.ValidateCredentials($Credential.Username,$Credential.GetNetworkCredential().Password)) {
                #Export Credential to .xml file path from our Begin {} block.
                $Credential | Export-Clixml -Path $CredFile
            } else {
                $FailedCred = $true
                Write-Error "The credentials you provided are invalid. Please supply valid credentials."
            }
        }
        if (-Not($FailedCred)) {
            #Return the Credential information from the XML file
            [PSCredential] (Import-Clixml -Path $CredFile)
        }
    }
}
```

So there you have it. Now this will error out if the credentials are not valid AD credentials. Obviously if you are scripting against something else, a firewall, or an API, you will have to be creative with how you validate the credentials you supply, if it's even possible that is.

Until next time, keep learning and stay safe!


