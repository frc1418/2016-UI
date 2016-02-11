var currentSeconds = 150;
var timerVar;
var gameStarted = false;
var zeroTheGyro = 0; //if this is true, set the gyro offset to the current value,gyro offset
var defenseNames = ['A', 'B', 'C', 'D'];
var realDefenseNames = [
	['porticulis', 'seesaw'],
	['moat', 'ramparts'],
	['gate', 'drawbridge'],
	['wall', 'roughterrain']
];
var attackerNames = ['empty', 'allied', 'us'];
var displayInTuning=['/SmartDashboard/'];		//if it starts with these strings add to tuning page
function hashCode(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}
$(document).ready(function() {
	var gyroRotation = 0;

	document.getElementById('setButton').onclick = function() {
		var setValue = document.getElementById('value').value;
		if (setValue == 'true') { // ¯\_(ツ)_/¯
			NetworkTables.setValue(document.getElementById('name').value, true);
		} else if (setValue == 'false') {
			NetworkTables.setValue(document.getElementById('name').value, false);
		} else {
			NetworkTables.setValue(document.getElementById('name').value,
				document.getElementById('value').value);
		}
	};
	document.getElementById('get').onclick = function() {
		document.getElementById('value').value = NetworkTables.getValue(
			document.getElementById('name').value);
	};
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
			$('.autoButton').not(document.getElementById($thisButton.attr('id'))).each(function() {
				NetworkTables.setValue('/SmartDashboard/' + $(this).attr('id'), false);

			});
		} else {}
		NetworkTables.setValue('/SmartDashboard/' + $thisButton.attr('id'), activeState); //onclick set the things id to true

	});
	var EncoderSlider = $('#EncoderSlider');
	var min = EncoderSlider.attr('min');
	var max = EncoderSlider.attr('max');
	var dataList = $('#stepList');
	var tickDistance = 50;
	var numberOfTicks = (parseInt(max) - parseInt(min)) / tickDistance;
	var newVal = parseInt(min);
	for (var a = 0; a < numberOfTicks; a++) {
		dataList.append('<option>' + newVal + '</option>');
		newVal += tickDistance;
	}
	$('#encoder').hide().show(0); //element refresh
	$('#EncoderSlider').change(function() {
		var encoderVal = $('#EncoderSlider').val();
		$('#encoderValueDisplaySpan').text('EncoderValue:' + encoderVal);
		NetworkTables.setValue('/SmartDashboard/EncoderSliderValue', parseInt(encoderVal));

	});
	$('#autonomousOptionSelect').change(function() {
		NetworkTables.setValue('/SmartDashboard/currentlySelectedMode', $(this).val());
	});

	//for every of the 5 attacking positions give the image the attacking toggleswitchcyclethroughimagesthing
	//thing onclick and make it update networktables

	var everyOffensiveToggleImage = $('.attackerState');
	everyOffensiveToggleImage.each(function(a) {
		//set a default value, add the onclick listener, update networktables
		//
		var thisImage = $(this);
		thisImage.attr('id', 'attackerState' + a).attr('state', 0).attr('position', a).attr('src', 'img/defaultImg.png');
		//if(NetworkTables.isRobotConnected()){}
		thisImage.click(function() {
			var theImage = $(this);
			var currentState = theImage.attr('state');
			if (currentState == 2) {
				currentState = 0;
			} else {
				currentState++;
			}
			theImage.attr('state', currentState);
			NetworkTables.setValue('/SmartDashboard/' + theImage.attr('id'), attackerNames[currentState]);
		});
	});

	//for every selection Div, make the stuff, add a listener to each arrow, the toggleBox,
	//set the value from networkTables or if no networkTables, get the default value
	var everyDefenseSelector = $('.DefenseSelector'); //get every defenseDefenseSelector(the div that contains the stuff)
	everyDefenseSelector.each(function(a) {
		//for every DefenseSelector add the triangles, set the id, 'a' is the index in the list of divs
		var thisDiv = $(this);
		thisDiv.attr('defenseClass', a);
		thisDiv.attr('id', 'defenseDefenseSelector' + a);
		var defenseNumber = 0;
		thisDiv.attr('defenseNumber', defenseNumber);
		thisDiv.before().click(function() {
			console.log('downarrow');
			//onclick take the value of the current defense from this div, ex'defenseName=(3,0)', ++1
			var currentDefenseClass = thisDiv.attr('defenseClass');

			if (currentDefenseClass >= 3) {
				currentDefenseClass = 0;
			} else {
				currentDefenseClass++;
			}
			thisDiv.attr('defenseclass', currentDefenseClass);
			thisDiv.children('.selectionToggleBox') //.find('.selectionToggleBox')
				.attr('src', 'img/' + defenseNames[currentDefenseClass] + '' + defenseNumber + '.png');

			NetworkTables.setValue('/SmartDashboard/' + thisDiv.attr('id'), realDefenseNames[currentDefenseClass][defenseNumber]);
		});
		thisDiv.append($('<img>')
			.addClass('selectionToggleBox')
			//.attr('id','selectionToggleBox'+a)
			.attr('src', 'img/defaultImg.png')
			.click(function() {
				var currentDefenseNumber = thisDiv.attr('defensenumber');

				if (currentDefenseNumber >= 1) {
					currentDefenseNumber = 0;
				} else {
					currentDefenseNumber++;
				}
				thisDiv.attr('defensenumber', currentDefenseNumber);
				thisDiv.children('.selectionToggleBox'); //.find('.selectionToggleBox')
				//.attr('src','img/'+defenseNames[thisDiv.attr('defenseClass')]+''+currentDefenseNumber+'.png');

				NetworkTables.setValue('/SmartDashboard/' + thisDiv.attr('id'), realDefenseNames[thisDiv.attr('defenseClass')][currentDefenseNumber]);
			})
		);
		thisDiv.after().click(function(i, b) { //right now both are being clicked
			console.log('uparrow clicked');
			//onclick take the value of the current defense from this div, ex'defenseName=(3,0)', ++1
			var currentDefenseClass = parseInt(thisDiv.attr('defenseclass'));
			//console.log(thisDiv.attr('id'),currentDefenseClass);

			if (currentDefenseClass <= 0) {
				currentDefenseClass = 3;
			} else {
				currentDefenseClass--;
			}
			thisDiv.attr('defenseclass', currentDefenseClass);
			thisDiv.children('.selectionToggleBox') //.find('.selectionToggleBox')
				.attr('src', 'img/' + defenseNames[currentDefenseClass] + defenseNumber + '.png');
			NetworkTables.setValue('/SmartDashboard/' + thisDiv.attr('id'), realDefenseNames[currentDefenseClass][defenseNumber]);
			//console.log('stuff happened',currentDefenseClass);
			//console.log('/SmartDashboard/' + thisDiv.attr('id'), realDefenseNames[currentDefenseClass][defenseNumber]);

		});
		if (defenseNumber == 0) {
			defenseNumber = 1;
		} else {
			defenseNumber = 0;
		}
	});
});
// called when the websocket connects/disconnects
function onRobotConnection(connected) {
	//config.frontcam should be set to http://roborio-1418-frc.local:5800/
	console.log('Robot connected: ' + connected);
	$('#robotstate').text(connected ? 'Connected!' : 'Disconnected');
}

function onNetworkTablesConnection(connected) {
	// TODO: change some indicator
	if (connected) {
		$('#connectstate').text('Connected!');
		// clear the table
		$('#nt tbody > tr').remove();
	} else {
		$('#connectstate').text('Disconnected!');
	}
}

function onValueChanged(key, value, isNew) {
	console.log('valueChange', key, value);
	var propName = key.substring(16, key.length);
	//$("Tuning"+NetworkTables.keyToId(key)).children("input").first().val(value keyto id is currently broken

	switch (key) {
		//raw arm value and is the ball in
		case '/SmartDashboard/ballIn': //not the actual networktablesValue
			if (value) { //BOOLEANS ARE NOT WORKING WITH NETWORKTABLES AT THE MOMENT(or with testing at the very least)
				$('#ball').attr('visibility', 'visible');
			} else {
				console.log('visibilityFalse');
				$('#ball').attr('visibility', 'hidden');
			}
			break;
		case '/SmartDashboard/NavX | Yaw':
			var gyroVal = value + zeroTheGyro;
			$('#gyroArm').css({
				'transform': 'rotate(' + gyroVal + 'deg)'
			});
            $('gyroLabel').innerHTML(gyroVal + 'º');
			break;
		case '/SmartDashboard/Arm | Forward Limit Switch': //checkspelling
			if (value == true || value == 'true') { //recheck valuetype, this display a bool
				$('#forwardEncoderSpan').text('Forward Encoder:True').css({
					'color': 'green'
				});

			} else {
				$('#forwardEncoderSpan').text('Forward Encoder:False').css({
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
			} //0 is back,
			var $robotArm = $('#robotArm');
			var rotationValue = 180 - value * 225 / 1200;
			// 0 is direct back, 1200 is 45 degrees foreward
			var rotationPointx = parseInt($robotArm.attr('width')) + parseInt($robotArm.attr('x'));
			$robotArm.attr('transform', 'rotate(' + rotationValue + ' ' + rotationPointx + ' ' + $robotArm.attr('y') + ')');
			break;
		case '/SmartDashboard/chevyButton':
		case '/SmartDashboard/gateButton':
		case '/SmartDashboard/ladderButton':
			//set the images border to something bright like orange if it equals true
			//do acheck to see if all 3 are false, if so, then make them white border and selectable
			var name = key.substring(16, key.length);
			var $button = $('#' + name);
			var autoButtonSelection = $('.autoButton'); //this is a selection of all of the buttons

			if (value == true) {
				//if the thing is true than set its css to purple, set its activestate to true, and make it selectable
				$button.attr('activeState', true);
				$button.css({
                    'pointer-events': 'auto',
                    'border-color': 'aqua',
                });
				$button.attr("src",'/img/'+$button.attr("baseSrc")+'.gif');
				console.log($button.attr("src"));
				$('.autoButton').not(document.getElementById(name)).each(function() {
					var thisButton=$(this)
					thisButton.attr("src",'/img/'+thisButton.attr("baseSrc")+'.png');
					thisButton.css({
						'pointer-events': 'auto',
						'border-color': 'rgb(255, 200,16)',
					});
					NetworkTables.setValue('/SmartDashboard/' + thisButton.attr('id'), false);
				}); //then set everything else that isn't true and make it red, and set their activeState to false,
			} else if (value == false) {
				$button.attr('activeState', false);
				var buttonValueList = //getting the value of all 3 buttons
					autoButtonSelection.map(function() {
						return $(this).attr('activeState');
					}).get();
				var isButtonActive = false;
				var buttonValueListLength = buttonValueList.length;
				for (var a = 0; a < buttonValueListLength; a++) {
					if (buttonValueList[a] == true) { //==true is intended, was always returning true without the ==true
						isButtonActive = true;
					}
				}
				if (isButtonActive == true) { //if one of the buttons is active get every not active button and set their css
					autoButtonSelection.each(function() {
						var thisIsTheButton = $(this);
						var thisActiveState = thisIsTheButton.attr('activeState');
						if (thisActiveState == true || thisActiveState == 'true') {

						} else {
							thisIsTheButton.css({
								//'pointer-events': 'none',
								//'border-color': 'red'
							});
						}
					});
					$button.attr('style', 'pointer-events: none; border-color: rgb(255, 10,16);');

				} else if (isButtonActive == false) { //if they are all false then set the current border to cyan
					/*autoButtonSelection.css({
						//'pointer-events': 'auto',
						//'border-color': 'cyan'
					});*/
					$button.attr("src",'/img/'+$button.attr("baseSrc")+'.png');
					$button.attr('style', 'pointer-events: auto; border-color: rgb(255, 200,16);');

				} else {
					console.log('terrible things have happened');
				}
				//if the thing is not true, check to see if something else is true, if something else is true, then make it red, else make it cyan
			} else {
				console.log('things gone wrong');
			}
			break;
		case '/SmartDashboard/startTheTimer':
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

					document.getElementById('gameTimer').innerHTML = currentMinutes + ':' + actualSeconds;

				}, 1000);
			}
			NetworkTables.setValue('/SmartDashboard/startTheTimer', 'false'); //CHANGE TO A BOOLEAN LATER
			break;
		case '/SmartDashboard/EncoderSliderValue':
			if (value > 1200) {
				value = 1200;
			} else if (value < 0) {
				value = 0;
			} else {}
			$('#EncoderSlider').val(value);
			$('#encoderValueDisplaySpan').text('EncoderValue: ' + value);
			break;
		case '/SmartDashboard/EncoderSliderValue':
			if (value > 350) {
				value = 350;
			} else if (value < 150) {
				value = 150;
			}
			$('#EncoderSlider').val(value);
			$('#encoderValueDisplaySpan').text('EncoderValue: ' + value);
			break;
		case '/SmartDashboard/defenseDefenseSelector0':
		case '/SmartDashboard/defenseDefenseSelector1':
		case '/SmartDashboard/defenseDefenseSelector2':
		case '/SmartDashboard/defenseDefenseSelector3':

			var theChangedDiv = $('#' + propName);
			var realDefenseNamesLength = realDefenseNames.length;
			var defenseNum = -1;
			var defenseClass = -1;
			for (var i = 0; i < realDefenseNamesLength; i++) {
				//search through the defense classes, check each one for the mode, return the defenseclass=(a) and the defenseNum=(b)

				for (var j = 0; j < 2; j++) {
					if (realDefenseNames[i][j] == value) {

						defenseClass = i;
						defenseNum = j;
						break;
					}
				}
		}
			if (defenseClass == -1) {
				break;
			}
			theChangedDiv.attr('defenseClass', defenseClass)
				.attr('defenseNumber', defenseNum);
			theChangedDiv.children('.selectionToggleBox')
				.attr('src', 'img/' + defenseNames[defenseClass] + defenseNum + '.png');

			break; //in case we want to add another listener to the swtich afterwards
		case '/SmartDashboard/Autonomous Mode/options':

			//if there is a change in the names of the autonomous modes check the select,clear it and rewrite
			var autonomousOptionSelect = $('#autonomousOptionSelect');
			autonomousOptionSelect.empty();
			//autonomousOptionSelect.append('<option id='defaultAutonomousNoMove'>Do Nothing</option>'); //temporarily commented out
			var autonomousModeArrayLength = value.length;
			for (var n = 0; n < autonomousModeArrayLength; n++) {
				//for each entry, make a option, get the value of currentlySelectedMode if it exists, if not then use the first
				autonomousOptionSelect.append('<option id=' + value[n] + 'AutoMode' + '>' + value[n] + '</option>');
			}
			//if(NetworkTables.containsKey('currentlySelectedMode')){
			autonomousOptionSelect.val(NetworkTables.getValue('/SmartDashboard/currentlySelectedMode'));
			//}       //temporary commenting out
			//else{
			//autonomousOptionSelect.val($('#autonomousOptionSelect option:first').val());
			//}
			break;
		case '/SmartDashboard/currentlySelectedMode':
			$('#autonomousOptionSelect').val(value);
			break;
		case '/SmartDashboard/attackerState0':
		case '/SmartDashboard/attackerState1':
		case '/SmartDashboard/attackerState2':
		case '/SmartDashboard/attackerState3':
		case '/SmartDashboard/attackerState4':
			var attackerImage = $('#' + propName);
			if (value == 'us') {
				console.log('attackerStateChanged');

				//if value is us then get all of the other things and set anything equal to us to none
				$('.attackerState').not(document.getElementById(propName)).each(function() {
					var thisAttacker = $(this);
					if (attackerNames[thisAttacker.attr('state')] == 'us') {
						NetworkTables.setValue('/SmartDashboard/' + thisAttacker.attr('id'), 'empty');
					}
				});
				var attackerIndex = attackerImage.attr('position');
				if (attackerIndex == 0) {
					NetworkTables.setValue('/SmartDashboard/robotDefense', 'lowbar');
				} else {
					var newPosition = parseInt(attackerIndex) - 1;
					var $defense = $('#defenseDefenseSelector' + newPosition);
					//defenseclass and defensenumber
					var defenseValue = realDefenseNames[$defense.attr('defenseclass')][$defense.attr('defensenumber')];
					NetworkTables.setValue('/SmartDashboard/robotDefense', defenseValue);
				}
			}
			attackerImage.attr('state', attackerNames.indexOf(value)).attr('src', 'img/' + value + '.png');
			break;
	}
	if (isNew) {
		/*iterate through each value in displayInTuning, if the key starts
		 with the current value of displayInTuning display it, if not then do nothing */
		var displayInTuningLength=displayInTuning.length;
		var addToTuning=false;
		for(var a=0;a<displayInTuningLength;a++){
			var currentString=displayInTuning[a];
			if(key.substring(0,currentString.length)==currentString){
				addToTuning=true;
				break;
			}
		}
		if(addToTuning){
			var div = $('<div></div>').appendTo($('.settings'));
			$('<p></p>').text(key).appendTo(div);
			if (value === true || value === false) {
				var boolSlider = $('<div class="bool-slider ' + value + '" id="tuning'+hashCode(key)+'"></div>');
				var innerInset = $('<div class="inset"></div>');
				innerInset.append('<div class="control"></div>')
					.click(function() {
						if (boolSlider.hasClass('true')) {

							NetworkTables.setValue(key, false);
							boolSlider.addClass('false').removeClass('true');
						} else {
							NetworkTables.setValue(key, true);
							boolSlider.addClass('true').removeClass('false');
						}
					});
				innerInset.appendTo(boolSlider);
				boolSlider.appendTo(div);
			} else if (!isNaN(value)) {
				if (!isNaN(value)) {
					$('<input type="number">')
						.attr('id', "tuning"+hashCode(key))
						.attr('value', value)
						.appendTo(div);
				}
			} else {
				$('<input type="text">')
					.attr('id', 'tuning'+hashCode(key))
					.attr('value', value)
					.appendTo(div);
			}
		}
	}
	else{
		var $tuningDiv=$('#tuning'+hashCode(key));
		if (value === true || value === false) {
			//$tuningDiv.trigger("click");
			if ($tuningDiv.hasClass('true')) {
				$tuningDiv.addClass('false').removeClass('true');
			}
			else{
				$tuningDiv.addClass('true').removeClass('false');
			}
			console.log('valueChangebool',value);

		}
		else{

			$tuningDiv.val(value);
			console.log('valueChange',$tuningDiv.val());
		}
	}
}
$('#set').click(function() {
	var childInputs = $('#settingsContainerDiv input');
	childInputs.each(function(a) {
		var thisChild = $(this);
		NetworkTables.setValue(thisChild.attr('id'), thisChild.val());
	});
});

$('#teleopButton').click(function() {
	$('#tuning').hide();
	$('#autonomousSelection').hide();
	$(this).addClass('active');
	$('#tuningButton').removeClass('active');
	$('#autonomousButton').removeClass('active');
});
$('#tuningButton').click(function() {
	$('#tuning').show();
	$('#autonomousSelection').hide();
	$('#teleopButton').removeClass('active');
	$(this).addClass('active');
	$('#autonomousButton').removeClass('active');
});
$('#autonomousButton').click(function() {
	$('#tuning').hide();
	$('#autonomousSelection').show();
	$('#teleopButton').removeClass('active');
	$('#tuningButton').removeClass('active');
	$(this).addClass('active');
});

var gyroRotation = 0;
$('#gyro').click(function(e) {
	e.stopPropagation();

	//onclick, visually set the offset of the gyro to the current value, if offset != 0 then set to 0
	if(zeroTheGyro==0){
		zeroTheGyro=$("#gyro").val();

	}else{
		zeroTheGyro=0;
	}
	var gyroVal=zeroTheGyro+parseInt(NetworkTables.getValue('/SmartDashboard/NavX | Yaw'));
	$('#gyroArm').css({
		'transform': 'rotate(' + gyroVal+')'
	});
}
);

$('#robotDiagram').on("click",function(e) {
	e.stopPropagation();

    $('.winch').toggle();
});
