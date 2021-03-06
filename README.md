# 2016 User Interface
[Robot Code](https://github.com/frc1418/2016-robot) | **UI** | [Image Processing](https://github.com/frc1418/2016-vision) | [Oculus Rift](https://github.com/frc1418/2016-oculus)

**FRC Dashboard, a cleaned-up dashboard framework designed for easy forking and use by other teams can be found [here](https://github.com/FRCDashboard/FRCDashboard).**

**A revamped version of _this_ UI, based off of the above framework and used in our offseason competitions, can be found [here](https://github.com/frc1418/FRCDashboard/tree/2016).**

![Screenshot of UI](screenshot.png)

## Introduction
------------

HTML5 & Javascript driver station interface. The
UI features:

* Touchscreen web browser interface provides richer control interface for secondary robot operator
* Provides full access to robot functionality
  * SVG diagram of robot
  * Enable and disable automatic functions of the robot
  * Tuning section to tweak autonomous modes and other robot parameters in the pits
  * Select one of multiple autonomous modes
* Two live streaming camera views to assist operators when view is blocked

The HTML/JavaScript interface is made possible by using [pynetworktables2js](https://github.com/robotpy/pynetworktables2js) to forward NetworkTables traffic to the webpage. pynetworktables2js was initially prototyped by [Leon Tan](https://github.com/lleontan), our UI lead, but it is now maintained by the [RobotPy](https://github.com/robotpy) project so that other teams can benefit from our work.

Please note that this version of the UI is designed for a 1119x485 resolution. Since it's not designed to be responsive, you may have to play around with the CSS a bit to make it optimally fit your screen.

## Running the code

### Dependencies

python 3 must be installed!

Make sure you have pynetworktables2 installed:

    pip3 install pynetworktables2js

### Connect to a local simulation

Run this command:

    python3 driverStationServer.py

### View UI

Open a web browser (preferably Chrome), and go to:

    http://localhost:8888


## Authors
* [Leon Tan](https://github.com/lleontan), UI Lead
* [Erik Boesen](https://github.com/ErikBoesen), design & code
* [Tim Winters](https://github.com/Twinters007), code
* [Aki Maher](https://github.com/17mahera), art

Special Thanks to [Dustin Spicuzza](https://github.com/virtuald), mentor and head of the [RobotPy](http://github.com/robotpy) project.
