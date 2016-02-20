@echo off

cd %~dp0
start py -3 driverStationServer.py

start http://localhost:8888/UI.html --window-size=1366,570 --window-position=0,0
