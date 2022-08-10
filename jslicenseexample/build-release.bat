@echo off

set PROJECT=jslicenseexample

set BUILD=1001
set RELEASE_STATE=sr1
set MANUF=company

if not [%1]==[] (set BUILD=%1)
if not [%2]==[] (set RELEASE_STATE=%2)
if not [%3]==[] (set MANUF=%3)

if not exist "release" mkdir "release"
if not exist "release\%BUILD%" mkdir "release\%BUILD%"

echo|set /p=%MANUF%-%PROJECT%,%MANUF%-%PROJECT%.png,httpfiles.zip> "release\%BUILD%\%MANUF%-%PROJECT%_files"

set PATH=%PATH%;%INNOVAPHONE-SDK%\app-platform-buildtls;%INNOVAPHONE-SDK%\arm-7.2.0-linux-gnu\bin;%INNOVAPHONE-SDK%\x86_64-7.2.0-linux-gnu\bin;%INNOVAPHONE-SDK%\aarch64-7.2.0-linux-gnu\bin;

make -j5 -f %PROJECT%.mak arm

make -j5 -f %PROJECT%.mak arm64

make -j5 -f %PROJECT%.mak x86_64

if not exist "release\%BUILD%\arm" mkdir "release\%BUILD%\arm"
if not exist "release\%BUILD%\arm\%MANUF%-%PROJECT%" mkdir "release\%BUILD%\arm\%MANUF%-%PROJECT%"
copy "arm\%PROJECT%\%PROJECT%" "release\%BUILD%\arm\%MANUF%-%PROJECT%\%MANUF%-%PROJECT%"
copy "arm\%PROJECT%\%PROJECT%.png" "release\%BUILD%\arm\%MANUF%-%PROJECT%\%MANUF%-%PROJECT%.png"
copy "arm\%PROJECT%\httpfiles.zip" "release\%BUILD%\arm\%MANUF%-%PROJECT%\httpfiles.zip"

if not exist "release\%BUILD%\arm64" mkdir "release\%BUILD%\arm64"
if not exist "release\%BUILD%\arm64\%MANUF%-%PROJECT%" mkdir "release\%BUILD%\arm64\%MANUF%-%PROJECT%"
copy "arm64\%PROJECT%\%PROJECT%" "release\%BUILD%\arm64\%MANUF%-%PROJECT%\%MANUF%-%PROJECT%"
copy "arm64\%PROJECT%\%PROJECT%.png" "release\%BUILD%\arm64\%MANUF%-%PROJECT%\%MANUF%-%PROJECT%.png"
copy "arm64\%PROJECT%\httpfiles.zip" "release\%BUILD%\arm64\%MANUF%-%PROJECT%\httpfiles.zip"

if not exist "release\%BUILD%\x86_64" mkdir "release\%BUILD%\x86_64"
if not exist "release\%BUILD%\x86_64\%MANUF%-%PROJECT%" mkdir "release\%BUILD%\x86_64\%MANUF%-%PROJECT%"
copy "x86_64\%PROJECT%\%PROJECT%" "release\%BUILD%\x86_64\%MANUF%-%PROJECT%\%MANUF%-%PROJECT%"
copy "x86_64\%PROJECT%\%PROJECT%.png" "release\%BUILD%\x86_64\%MANUF%-%PROJECT%\%MANUF%-%PROJECT%.png"
copy "x86_64\%PROJECT%\httpfiles.zip" "release\%BUILD%\x86_64\%MANUF%-%PROJECT%\httpfiles.zip"
