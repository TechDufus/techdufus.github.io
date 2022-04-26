$script:YELLOW = "$($PSStyle.Foreground.Yellow)"
    $script:RED = "$($PSStyle.Foreground.Red)"
    $script:GREEN = "$($PSStyle.Foreground.Green)"
    $script:CYAN = "$($PSStyle.Foreground.Cyan)"
    $script:RESET = "$($PSStyle.Reset)"
    
    # [char] codes found with help from http://www.mauvecloud.net/charsets/CharCodeFinder.html
    $script:ARROW = "${CYAN}$([char]9654)${RESET}"
    $script:CHECK_MARK = "${GREEN}$([char]8730)${RESET}"
    $script:RIGHT_ANGLE = "${GREEN}$([char]8735)${RESET}"
    $script:PIN = "$(([char]55357) + ([char]56524))"
    $script:WARNING = "$(([char]55357) + ([char]57000))"
    $script:NOTEBOOK = "$(([char]55357) + ([char]56541))"
    $script:YES_NO = "${YELLOW}[${GREEN}Y${YELLOW}/${RED}N${YELLOW}]${RESET}"
    $script:SPACE = "$([char]32)"
    $script:SPINNER = @(
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

#Region Write-Spinner
Function Write-Spinner() {
    # This function will write a spinner to the console.
    # It will be used to show the user that something is happening.
    $script:SPINNER | Foreach-Object {
        Write-Host "`b`b$_ " -NoNewline
        Start-Sleep -m 65
    }
}
#EndRegion Write-Spinner


Write-Host "${ARROW} ${CYAN}I'm doing a heckin think...   " -n;1..30 | %{Write-Spinner};Write-Host "`b`b${CHECK_MARK}"