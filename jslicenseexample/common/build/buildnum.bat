if not exist build.txt echo 100 > build.txt
set /P NBUILD= < build.txt
set /A NBUILD= NBUILD + 1
echo %NBUILD% > build.txt
set BUILD=13C%NBUILD%
set DEVELOPER=
if exist ..\..\developer.txt set /P DEVELOPER= < ..\..\developer.txt
set RELEASESTATE=dvl%DEVELOPER%
make -j %NUMBER_OF_PROCESSORS% -f %1 %2 %3 %4 %5
