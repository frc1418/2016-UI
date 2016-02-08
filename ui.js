var currentSeconds = 150;
var timerVar;
var gameStarted = false;

$(document).ready(function() {
	// sets a function that will be called when the websocket connects/disconnects
	NetworkTables.addWsConnectionListener(onNetworkTablesConnection, true);
	// sets a function that will be called when the robot connects/disconnects
	NetworkTables.addRobotConnectionListener(onRobotConnection, true);
	// sets a function that will be called when any NetworkTables key/value changes
	NetworkTables.addGlobalListener(onValueChanged, true);

	$('.autoButton').click(function() {
		var $thisButton = $(this);
		var activeState = $thisButton.attr('activeState');
		if (activeState === true || activeState == 'true') {
			activeState = false;
		} else if (activeState === false || activeState == 'false') {
			activeState = true;
			//set all of the other values to false
			$('.autoButton').not(document.getElementById($thisButton.attr("id"))).each(function() {
				NetworkTables.setValue("/SmartDashboard/"+$(this).attr("id"),false);

			});
		} else {
		}
		NetworkTables.setValue("/SmartDashboard/"+$thisButton.attr('id'), activeState); //onclick set the things id to true

	});
	var EncoderSlider = $('#EncoderSlider');
	var min = EncoderSlider.attr('min');
	var max = EncoderSlider.attr('max');
	var dataList = $('#stepList');
	var tickDistance = 25;
	var numberOfTicks = (parseInt(max) - parseInt(min)) / tickDistance;
	var newVal = parseInt(min);
	for (var a = 0; a < numberOfTicks; a++) {
		dataList.append('<option>' + newVal + '</option>');
		newVal += tickDistance;
	}
	$('#encoder').hide().show(0); //element refresh
	$("#EncoderSlider").change(function(){
		var encoderVal=$("#EncoderSlider").val();
		$("#encoderValueDisplaySpan").text("EncoderValue:"+encoderVal);
		NetworkTables.setValue("/SmartDashboard/EncoderSliderValue",parseInt(encoderVal));

	});
});
// called when the websocket connects/disconnects
function onRobotConnection(connected) {
	//config.frontcam should be set to http://roborio-1418-frc.local:5800/
}

function onNetworkTablesConnection(connected) {
	// TODO: change some indicator
}

function onValueChanged(key, value, isNew) {
	console.log("valueChange",key,value);

	if (isNew) {} else {
		// similarly, use keySelector to convert the key to a valid jQuery
		// selector. This should work for class names also, not just for ids
	}
	switch (key) {
		//raw arm value and is the ball in
		case '/SmartDashboard/ballIn': //not the actual networktablesValue
			if (value) { //BOOLEANS ARE NOT WORKING WITH NETWORKTABLES AT THE MOMENT(or with testing at the very least)
				$('#ballWidget').attr('visibility', 'visible');
			} else {
				console.log('visibilityFalse');
				$('#ballWidget').attr('visibility', 'hidden');
			}
			break;
		case '/SmartDashboard/NavX | Yaw':
			$('#gyroArm').css({
				'transform': 'rotate(' + value + 'deg)'
			});
			break;
		case '/SmartDashboard/Arm | Forward Limit Switch': //checkspelling
			if (value == true || value == 'true') { //recheck valuetype, this display a bool
				$('#forwardEncoderSpan').text("Forward Encoder:True").css({
					'color': 'green'
				});

			} else {
				$('#forwardEncoderSpan').css({
					'color': 'red'
				});
			}
			break;

	case '/SmartDashboard/Arm | Reverse Limit Switch':
			if (value) { //recheck valuetype, this display a bool
				$('#reverseEncoderSpan').css({
					'color': 'green'
				});
			} else {
				$('#reverseEncoderSpan').css({
					'color': 'red'
				});
			}
			break;
		case '/SmartDashboard/Arm | Encoder':
			if (value > 1140) {
				value = 1140;
			} else if (value < 0) {
				value = 0;
			}//0 is back,
			var $robotArm = $('#robotArm');
			var rotationValue =180 - value * 225 / 1200;
			// 0 is direct back, 1200 is 45 degrees foreward
			var rotationPointx = parseInt($robotArm.attr('width')) + parseInt($robotArm.attr('x'));
			$robotArm.attr('transform', 'rotate(' + rotationValue + ' ' + rotationPointx + ' ' + $robotArm.attr('y') + ')');
			break;
		case '/SmartDashboard/chevyButton':
		case '/SmartDashboard/gateButton':
		case '/SmartDashboard/ladderButton':
			//set the images border to something bright like orange if it equals true
			//do acheck to see if all 3 are false, if so, then make them white border and selectable
			var name=key.substring(16,key.length);
			var $button = $('#' + name);
			var autoButtonSelection = $('.autoButton');						//this is a selection of all of the buttons

			if(value==true){
				//if the thing is true than set its css to purple, set its activestate to true, and make it selectable
				$button.attr("activeState",true);
				$button.attr('style',"pointer-events: auto; border-color: rgb(255, 26,140);");
				$('.autoButton').not(document.getElementById(name)).each(function() {
					$(this).css({'pointer-events': 'auto','border-color':"yellow"});
					NetworkTables.setValue("/SmartDashboard/"+$(this).attr('id'),false);
				});				//then set everything else that isn't true and make it red, and set their activeState to false,
			}
			else if(value==false){
				$button.attr("activeState",false);
				var buttonValueList =																	//getting the value of all 3 buttons
					autoButtonSelection.map(function() {
						return $(this).attr('activeState');
					}).get();
				var isButtonActive = false;
				var buttonValueListLength = buttonValueList.length;
				for (var a = 0; a < buttonValueListLength; a++) {
					if (buttonValueList[a]==true ) { //==true is intended, was always returning true without the ==true
						isButtonActive = true;
					}
				}
				if (isButtonActive==true) {										//if one of the buttons is active get every not active button and set their css
					autoButtonSelection.each(function(){
						var thisIsTheButton=$(this);
						var thisActiveState=thisIsTheButton.attr("activeState");
						if(thisActiveState==true||thisActiveState=="true"){

						}
						else{
							thisIsTheButton.css({
								//'pointer-events': 'none',
								//'border-color': 'red'
							});
						}
					});
					$button.attr('style',"pointer-events: none; border-color: rgb(255, 10,16);");

				} else if(isButtonActive==false){					//if they are all false then set the current border to cyan
					/*autoButtonSelection.css({
						//'pointer-events': 'auto',
						//'border-color': 'cyan'
					});*/
					$button.attr('style',"pointer-events: auto; border-color: rgb(255, 200,16);");

				}
				else{
					console.log("terrible things have happened");
				}
				//if the thing is not true, check to see if something else is true, if something else is true, then make it red, else make it cyan
			}
			else{console.log("things gone wrong");}
			break;

	case "/SmartDashboard/startTheTimer":
			if (value) {
				document.getElementById('gameTimer').style.color = 'white';
				timerVar = setInterval(function() {
					currentSeconds--;
					var currentMinutes = parseInt(currentSeconds / 60);
					var actualSeconds = currentSeconds - 60 * currentMinutes;
					if (currentSeconds < 0) {
						window.clearTimeout(timerVar);
						return;
					} else if (currentSeconds < 30) {
						document.getElementById('GameTimer').style.color = '#FF3030';
					}

					document.getElementById("gameTimer").innerHTML =  currentMinutes + ":" + actualSeconds;

				}, 1000);
			}
			NetworkTables.setValue("/SmartDashboard/startTheTimer", "false"); //CHANGE TO A BOOLEAN LATER
			break;
		case "/SmartDashboard/EncoderSliderValue":
			if (value > 1200) {
				value = 1200;
			} else if (value < 0) {
				value = 0;
			} else {}
			$('#EncoderSlider').val(value);
			$('#encoderValueDisplaySpan').text('Encoder value: ' + value);
			break;
		case "/SmartDashboard/EncoderSliderValue":
			if (value > 350) {
				value = 350;
			} else if (value < 150) {
				value = 150;
			}
			$('#EncoderSlider').val(value);
			$('#encoderValueDisplaySpan').text('Encoder value: ' + value);
			break;
	}
}

// **** This is just for demonstration. Remove this once we have actual rotation data from the robot! ****
var gyroRotation = 0;
