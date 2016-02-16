@echo off

cd %~dp0
py -3 driverStationServer.py --host 10.14.18.2

REM The page order is so random...
start http://localhost:8888/Robot.html http://localhost:8888 http://localhost:8888/Aton.html --window-size=1366,570 --window-position=0,0

pause
