$('#EncoderSlider').change(function() {
	var encoderVal = $('#EncoderSlider').val();
	$('#encoderValueDisplaySpan').text('Encoder value: ' + encoderVal);
	NetworkTables.setValue('EncoderSliderValue', encoderVal);
});

function startTheTimer() { //reminder, find the networktables value, add networktables support
	var d = new Date();

	var mEnd = 2;
	var sEnd = 30;
	var x = document.getElementById('GameTimer');
	for (var i = 0; i < 150; i++) {
		sEnd = sEnd - 1;
		if (sEnd < 0) {
			sEnd = sEnd + 60;
			mEnd = mEnd - 1;
		}
		x.innerHTML = mEnd + ':' + sEnd;
	}
}

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
		} else {
			console.log('activeStateButtonBug');
		}
		NetworkTables.setValue($thisButton.attr('id'), activeState); //onclick set the things id to true
	});
	var EncoderSlider = $('#EncoderSlider');
	var min = EncoderSlider.attr('min');
	var max = EncoderSlider.attr('max');
	var dataList = $('#stepList');
	var tickDistance = 10;
	var numberOfTicks = (parseInt(max) - parseInt(min)) / tickDistance;
	var newVal = parseInt(min);
	for (var a = 0; a < numberOfTicks; a++) {
		dataList.append('<option>' + newVal + '</option>');
		newVal += tickDistance;
	}
	$('#encoder').hide().show(0); //element refresh
});
// called when the websocket connects/disconnects
function onRobotConnection(connected) { // TODO: change some indicator
	//config.frontcam should be set to http://roborio-1418-frc.local:5800/
	//
	if (connected) {
		$('#camOffline').hide();

		$('#camera').prepend('<img class="webcamImage" id="webcamImage" src="" + "http://roborio-1418-frc.local:5800/" + "/?action=stream">');
	} else {
		$('#webcamImage').remove();

		$('#camOfflineImage').show();
	}
}

function onNetworkTablesConnection(connected) {
	// TODO: change some indicator
}

function onValueChanged(key, value, isNew) {
	if (isNew) {} else {
		// similarly, use keySelector to convert the key to a valid jQuery
		// selector. This should work for class names also, not just for ids
	}
	switch (key) {
		//raw arm value and is the ball in
		case 'ballIn': //not the actual networktablesValue
			if (value === true || value == 'true') { //BOOLEANS ARE NOT WORKING WITH NETWORKTABLES AT THE MOMENT(or with testing at the very least)
				$('#ballWidget').attr('visibility', 'visible');
			} else if (value === false || value == 'false') {
				console.log('visibilityFalse');
				$('#ballWidget').attr('visibility', 'hidden');
            }
			break;
		case 'gyro':
			$('#gyroArm').css({
				'transform': 'rotate(' + value + 'deg)'
			});
			break;
		case 'Arm | Forward Limit Switch': //checkspelling
			if (value === true || value == 'true') { //recheck valuetype, this display a bool
				$('#forwardEncoderSpan').css({
					'color': 'green'
				});
			} else if (value === false || value == 'false') {
				$('#forwardEncoderSpan').css({
					'color': 'red'
				});
			}
			break;
		case 'Arm | Reverse Limit Switch':
			if (value === true || value == 'true') { //recheck valuetype, this display a bool
				$('#reverseEncoderSpan').css({
					'color': 'green'
				});
			} else if (value === false || value == 'false') {
				$('#reverseEncoderSpan').css({
					'color': 'red'
				});
			}
			break;
		case 'Arm | Encoder':
			if (value > 1140) {
				value = 1140;
			} else if (value < 0) {
				value = 0;
			}
			var $robotArm = $('#robotArm');
			var rotationValue = -45 + value * 225 / 1140; //-45 plus value*225/1140, value between 0 and 1140
			var rotationPointx = parseInt($robotArm.attr('width')) + parseInt($robotArm.attr('x'));
			$robotArm.attr('transform', 'rotate(' + rotationValue + ' ' + rotationPointx + ' ' + $robotArm.attr('y') + ')');
			break;
		case 'chevyButton':
		case 'gateButton':
		case 'ladderButton':
			//set the images border to something bright like orange if it equals true
			//do acheck to see if all 4 are false, if so, then make them black border and slectable
			var autoButtonSelection = $('.autoButton');

			var buttonValueList =
				autoButtonSelection.map(function() {
					return $(this).attr('activeState');
				}).get();
			var isButtonActive = false;
			var buttonValueListLength = buttonValueList.length;
			for (var a = 0; a < buttonValueListLength; a++) {
				if (buttonValueList[a] === true) { //==true is intended, was always returning true without the ==true
					isButtonActive = true;
				}
			}
			if (isButtonActive) {

			} else {
				autoButtonSelection.css({
					'pointer-events': 'auto',
					'border-color': 'black'
				});
			}

			var setBorderColorTo = 'black';
			$button = $('#' + key);
			if (value === true || value == 'true') { //string check is for testing purposes, remove later
				setBorderColorTo = '#ff66ff';
				$button.attr('activeState', true);
				$('.autoButton').not(document.getElementById(key)).each(function() {
					/*in the event that one of them is true, check the other classes for true
					if there is 2 trues then output a console and keep them both pink,
					set all of the falses to unclickable and grayed out.
					*/
					var theNewButton = $(this);
					theNewButton.css({
						'pointer-events': 'none',
						'border-color': '#306860'
					});
				});
			} else if (value === false || value == 'false') {
				$button.attr('activeState', false);
			}
			$button.css({
				'border-color': setBorderColorTo
			});

			break;
	}
}

// This is just for demonstration. Remove this once we have actual rotation data from the robot! ****
var gyroRotation = 0;
$('#gyro').click(function() {
	gyroRotation += 5;
	onValueChanged('gyro', gyroRotation, false);
});