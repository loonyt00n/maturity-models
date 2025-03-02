<#
.SYNOPSIS
Processes input files in a specified source folder, parsing file markers and writing corresponding content to target files under an output folder.

.DESCRIPTION
This script processes all files in a given source folder, reading each file for file markers that indicate target file paths.
Each file marker is expected to be on a single line formatted as one of these:
   // some/path/to/file.ext
   // some/path/to/file.ext - Description text (this descriptive text will be ignored)
or, for files that should be written directly to the output folder, as:
   // root file.ext
In the "root" case, the literal word "root" is stripped out and the remainder is used as the relative path under the OutputFolder.
The content following a marker (until another marker is encountered or the end of the file) is written to the corresponding file.
If necessary, the script creates directories under the output folder.

.PARAMETER SourceFolder
Specifies the folder containing the input files that need to be processed.

.PARAMETER OutputFolder
Specifies the folder where the target files (as defined in the input file markers) will be created.

.PARAMETER Help
Displays this help information.

.EXAMPLE
    .\create-file-content.ps1 -SourceFolder "C:\Path\To\InputFiles" -OutputFolder "C:\Path\To\OutputFolder"

This command processes every file in "C:\Path\To\InputFiles" and creates/updates target files under "C:\Path\To\OutputFolder"
based on the file markers found in the input files.
#>

param (
    [switch]$Help,
    [string]$SourceFolder,
    [string]$OutputFolder
)

# Display help if requested or if required parameters are missing.
if ($Help -or -not $SourceFolder -or -not $OutputFolder) {
    Get-Help -Full $MyInvocation.MyCommand.Path
    exit
}

# Ensure the SourceFolder exists.
if (-Not (Test-Path $SourceFolder)) {
    Write-Error "Source folder '$SourceFolder' does not exist."
    exit 1
}

# Ensure the OutputFolder exists; if not, create it.
if (-Not (Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Force -Path $OutputFolder | Out-Null
    Write-Output "Created output folder: $OutputFolder"
}

# Define the regex pattern to match file markers.
# Expected formats:
#   // some/path/to/file.ext
#   // some/path/to/file.ext - Description text (description will be ignored)
#   // root file.ext
$pattern = '^\s*//\s*(?<filepath>.+?\.\w+)(?:\s*-\s*.*)?\s*$'

# Process each input file in the specified source folder.
foreach ($inputFile in Get-ChildItem -Path $SourceFolder -File) {
    Write-Output "Processing input file: $($inputFile.FullName)"
    $lines = Get-Content -Path $inputFile.FullName

    $currentFile = $null
    $fileContent = @()

    foreach ($line in $lines) {
        if ($line -match $pattern) {
            # Write out current file block if a file marker was active.
            if ($currentFile) {
                $parentDir = Split-Path $currentFile
                if (-Not (Test-Path $parentDir)) {
                    New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
                }
                $fileContent | Set-Content -Path $currentFile
                Write-Output "Created/Updated: $currentFile"
            }
            # Extract the relative file path from the marker.
            $relativePath = $matches["filepath"].Trim()

            # Special handling: for markers that start with "root" (case-insensitive)
            if ($relativePath -match '^(?i)root\s+(.*)$') {
                $relativePath = $Matches[1].Trim()
            }

            $currentFile = Join-Path -Path $OutputFolder -ChildPath $relativePath
            $fileContent = @()
        }
        else {
            # Accumulate content only if we're inside a file block.
            if ($currentFile) {
                $fileContent += $line
            }
        }
    }

    # Write out the last file block (if any) from the input file.
    if ($currentFile -ne $null) {
        $parentDir = Split-Path $currentFile
        if (-Not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
        }
        $fileContent | Set-Content -Path $currentFile
        Write-Output "Created/Updated: $currentFile"
    }
}

Write-Output "Processing complete."
