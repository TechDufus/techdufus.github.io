#Region Add-BlogPostFromQueue

<#
.SYNOPSIS
    Add a blog post from the queue.
.DESCRIPTION
    Add a blog post from a queue of post files.
.PARAMETER Path
    The path to the queue.
.PARAMETER Destination
    The destination repo folder.
.EXAMPLE
    Add-BlogPostFromQueue -Path "C:\Temp\Queue" -Destination "C:\Temp\Repo"

    Description
    -----------
    This command will add a blog post from the queue.
.NOTES
    Author:  matthewjdegarmo
    GitHub:  https://github.com/matthewjdegarmo
    Sponsor: https://github.com/sponsors/matthewjdegarmo
#>

[CmdletBinding()]
Param(
    [Parameter(Mandatory)]
    [System.String]$Path,

    [Parameter(Mandatory)]
    [System.String]$Destination
)

Begin {}

Process {
    Try {
        #Get a single queue file
        $QueueFile = Get-ChildItem -Path $Path -File | Select-Object -First 1
        # Copy the queue file to the destination
        Copy-Item -Path $QueueFile.FullName -Destination $Destination -Force

        # Commit the queue file and push to the remote repo
        Push-Location $Destination
        git add -A
        git commit -m "Added blog post from queue: $($QueueFile.BaseName)"
        git push
        Pop-Location
    } Catch {
        Throw $_
    }
}

End {}

#EndRegion Add-BlogPostFromQueue