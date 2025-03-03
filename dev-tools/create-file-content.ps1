<#
.SYNOPSIS
Processes input files in a specified source folder, parsing file markers and writing corresponding content to target files under a designated output folder.

.DESCRIPTION
This script iterates over all files in the provided SourceFolder, searching each file for file markers that indicate target file paths.
Supported marker formats are:
   • Standard marker: 
         // some/path/to/file.ext
         (Content following this marker will be written to the file.)
   • Marker with description (content is ignored):
         // some/path/to/file.ext - Description text
   • Alternate marker prefix (content is ignored):
         # some/path/to/file.ext

For markers with a description or starting with a '#' symbol, the detected file will be created with no content.
In all cases, the file path is interpreted as relative to the specified OutputFolder. The output directory structure is created if needed.

.PARAMETER SourceFolder
The folder that contains the input files to be processed.

.PARAMETER OutputFolder
The folder under which the target files will be created.

.PARAMETER Help
Displays this help information.

.EXAMPLE
    .\create-file-content.ps1 -SourceFolder "C:\Path\To\InputFiles" -OutputFolder "C:\Path\To\OutputFolder"

This command processes every file in "C:\Path\To\InputFiles" and creates/updates target files under "C:\Path\To\OutputFolder"
according to the file markers found in the input files.
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
# This pattern matches markers starting with "//" or "#" followed by a file that ends with an extension.
# Additionally, if a description is provided after a hyphen, it will be captured.
$pattern = '^\s*(?<marker>(//|#))\s*(?<filepath>.+?\.\w+)(?:\s*-\s*(?<description>.+))?\s*$'

# Process each input file in the specified source folder.
foreach ($inputFile in Get-ChildItem -Path $SourceFolder -File) {
    Write-Output "Processing input file: $($inputFile.FullName)"
    $lines = Get-Content -Path $inputFile.FullName

    $currentFile = $null
    $fileContent = @()
    $ignoreContent = $false  # flag to determine if content should be ignored

    foreach ($line in $lines) {
        if ($line -match $pattern) {
            # Flush previous file block if it exists.
            if ($currentFile) {
                $parentDir = Split-Path $currentFile
                if (-Not (Test-Path $parentDir)) {
                    New-Item -ItemType Directory -Force -Path $parentDir | Out-Null
                }
                # If ignore flag is set, write an empty file; otherwise, write gathered content.
                if ($ignoreContent) {
                    "" | Set-Content -Path $currentFile
                }
                else {
                    $fileContent | Set-Content -Path $currentFile
                }
                Write-Output "Created/Updated: $currentFile"
            }
            # Process new marker.
            $markerType    = $matches["marker"]
            $relativePath  = $matches["filepath"].Trim()
            $description   = $matches["description"]

            # Special handling: markers with a description or starting with '#' ignore content.
            if (($markerType -eq "#") -or ($description -and $description.Trim() -ne "")) {
                $ignoreContent = $true
            }
            else {
                $ignoreContent = $false
            }
            
            # Special handling for the word "root" if present at the beginning (case-insensitive),
            # e.g., "// root package.json" should become just "package.json"
            if ($relativePath -match '^(?i)root\s+(.*)$') {
                $relativePath = $Matches[1].Trim()
            }

            $currentFile = Join-Path -Path $OutputFolder -ChildPath $relativePath
            $fileContent = @()
        }
        else {
            # Only accumulate content if we are inside a file block and not in ignore mode.
            if ($currentFile -and -not $ignoreContent) {
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
        if ($ignoreContent) {
            "" | Set-Content -Path $currentFile
        }
        else {
            $fileContent | Set-Content -Path $currentFile
        }
        Write-Output "Created/Updated: $currentFile"
    }
}

Write-Output "Processing complete."
