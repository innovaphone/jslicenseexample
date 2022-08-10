# innovaphone javascript-service build script v1.0
# (c) 2020 innovaphone AG
# All rights reserved
#
# This script will copy and create all files needed to have a running JavaScript based service.
#
# The command line parameters are 
#  -temp       DIR     ((optional) the directory the files will be temporary copied to, before adding it to the zip file. Nite that obj will be added to the path)
#  -out        DIR     (the output directory, where the final file (innovaphoneApp.zip) will be stored)
#  -project    Name    (the project name)
#  -rtm        file    (the runtime binary file to use)
#  -files      LIST    (A commna seperated list of files to include into the )
#  -copyRTM    BOOL    (Flag to define whether the RTM binaries should be copied to or not.)
#

param (
    [string]$temp    = [System.IO.Path]::GetTempPath(),
    [string]$prjout  = "",
    [string]$project = "",
    [string]$rtm     = "",
    [string]$files   = "",
    [string]$copyRTM = "1"
)


if (([string]::IsNullOrEmpty($prjout) -eq $true) -or ([string]::IsNullOrEmpty($files) -eq $true) -or ([string]::IsNullOrEmpty($project) -eq $true) -or ([string]::IsNullOrEmpty($rtm) -eq $true)) {
    Write-Host 'Creates the innovaphone App Platform Java-Script app by adding all files to a zip and combining'
    Write-Host 'it with the runtime executable to use. The created files must be compiled togheter in order'
    Write-Host 'to run on the innovaphone App Platform.'
    Write-Host
    Write-Host 'Usage: build.ps1 [parameter]'
    Write-Host
    Write-Host 'Parameters:'
    Write-Host '    -project <name>     Define the name of the project.'
    Write-Host '    -out     <outdir>   Project output directory.'
    Write-Host '    -temp    <tempdir>  Temp-Directory to use. Default is the system temp directory.'
    Write-Host '    -rtm     <file>     The runtime file (app-generic) to use.'
    Write-Host '    -copyRTM <value>    If set to flase / 0, the RTM file will not be copied (value can be 0 or 1).'
    Write-Host '    -files   <list>     A comma seperated list of files to add to the output zip.'
    Write-Host
    exit;
}

$temp     = Join-Path $temp $project
$outdir   = Join-Path $prjout $project
$fileList = $files.Split(',');
$rtmDest  = Join-Path $prjout $project; 
$zipFile  = Join-Path $prjout "/httpfiles.zip"
$iconDest = Join-Path $prjout "/$project.png"
$iconFile = "${project}/$project.png";

Write-Host "Building project $prjoect...";
Write-Host "    Project output dirctory : $prjout";
Write-Host "    Temp directory          : $temp";
if ($copyRTM -eq "1") {
    Write-Host "    Runtime binary          : $rtm";
}
else {
    Write-Host "    Runtime binary          : won't be deployed";
}

if ((Test-Path env:BUILD) -eq $true) {
    Set-Content -Path "${project}\build.txt" -Value $env:BUILD
    Write-Host "    Build Number            : $env:BUILD";
}
else {
    Copy-Item -Path "build.txt" -Destination "${project}" -Force
}

if ((Test-Path env:RELEASE_STATE) -eq $true) {
    Set-Content -Path "${project}\label.txt" -Value $env:RELEASE_STATE
    Write-Host "    Release State Label     : $env:RELEASE_STATE";
}
else {
    Set-Content -Path "${project}\label.txt" -Value "dvl"
}

Write-Host "";

$rtmDate = 0;
$zipDate = 0;

if ((Test-Path $rtmDest) -eq $true) {
    $rtmDate = (Get-Item $rtmDest).LastWriteTime.Ticks;
}

if ((Test-Path $zipFile) -eq $true) {
    $zipDate = (Get-Item $zipFile).LastWriteTime.Ticks;
}

if ((Test-Path $iconDest) -eq $true) {
    $iconDate = (Get-Item $iconDest).LastWriteTime.Ticks;
}


if ($copyRTM -eq "1") {
    if ((Test-Path $rtm) -eq $false) {
        Write-Host "ERROR: JavaScriptApp Runtime ${rtm} not found.";
        exit 1;
    }
    else {
        if ((Get-Item $rtm).LastWriteTime.Ticks -gt $rtmDate) {
            Write-Host "Copying runtime $rtm to $rtmDest...";
            $tmpPath = Split-Path $rtmDest;
            if ((Test-Path $tmpPath) -eq $false) {
                New-Item -Path $tmpPath -ItemType "directory" -Force -ErrorAction Stop | Out-Null;
            }
            Copy-Item -Path $rtm -Destination $rtmDest -Recurse -Force -ErrorAction Stop;

            $rtmDebug = Join-Path $rtm ".debug";
            if ((Test-Path $rtmDebug) -eq $true) {
                $rtmDebugTest = Join-Path $rtmDest ".debug";
                Copy-Item -Path $rtmDebug -Destination $rtmDebugDest -Recurse -Force -ErrorAction Stop;
            }
        }

        if ((Get-Item $iconFile).LastWriteTime.Ticks -gt $iconDate) {
            Write-Host "Copying icon $iconFile to $iconDest...";
            Copy-Item -Path $iconFile -Destination $iconDest -Recurse -Force -ErrorAction Stop;
        }
    }
}

Write-Host "Removing old files from $temp...";
Remove-Item -Path $temp -Recurse -Force -ErrorAction Ignore;
Write-Host "Creating directories...";

New-Item -Path $prjout -ItemType "directory" -Force -ErrorAction stop | Out-Null;
New-Item -Path $temp -ItemType "directory" -Force -ErrorAction stop | Out-Null;

Write-Host "Checking for new items to add...";

$createdPaths = "";
$cnt = 0;

foreach ($src in $fileList) {
    $src = $src.Trim();
    if ([string]::IsNullOrEmpty($src) -eq $false) {
        if ($src.StartsWith("sdk/") -eq $true) {
            $dst = $src -replace "sdk/", "";
        }
        elseif ($src.StartsWith("httpfiles/") -eq $true) {
            $dst = $src -replace "httpfiles/", "";
            $src = Join-Path $project $src;
        }
        elseif ($src.StartsWith("../web1/") -eq $true) {
            $dst = $src -replace "../web1/", "web1/";
            $src = Join-Path $project $src;
        }
        else {
            $dst = $src;
            $src = Join-Path $project $src;
        }

        $dst = Join-Path $temp $dst;
        $destPath = Split-Path $dst;

        $src = Join-Path . $src;
        if ((Test-Path $src) -eq $false) {
            Write-Host "ERROR: File ${src} doesn't exist!";
            exit 1;
        }

        Write-Host "    $src => $destPath";

        if ($createdPaths.Contains($destPath) -eq $false) {
            New-Item -Path $destPath -ItemType "directory" -Force -ErrorAction Stop | Out-Null;
            $createdPaths += "$destPath ";
        }

        Copy-Item -Path $src -Destination $destPath -Recurse -Force -ErrorAction Stop;
        ++$cnt;
    }
}

Write-Host "";
$temp = Join-Path $temp "/*"
Write-Host "Compressing files to $zipFile...";
Remove-Item -Path $zipFile -Recurse -Force -ErrorAction Ignore;
Compress-Archive -Path $temp -DestinationPath $zipFile;
