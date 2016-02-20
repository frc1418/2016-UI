@echo off

cd %~dp0
start py -3 driverStationServer.py

start http://localhost:8888/Robot.html http://localhost:8888 http://localhost:8888/Aton.html --window-size=1366,570 --window-position=0,0
