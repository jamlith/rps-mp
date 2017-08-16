var fb = firebase.database();
var cxsRef = fb.ref('cxs/');
var usrRef = fb.ref('usr/');
var msgRef = fb.ref('msgs/');
var moveRef = fb.ref('moves/');
var conMon = fb.ref('.info/connected');

var rps = {
    p1id: null,
    p1name: null,
    p1wins: null,
    p1losses: null,
    p1ties: null,
    p2id: null,
    p2name: null,
    p2wins: null,
    p2losses: null,
    p2ties: null
};
var uname = null;
var uid = null;
var slotnum = null;

// cxs/ <uid>:true, ...
// usr/ {<slot>, <uid>, <name>, <wins>, <losses>, <ties>}, ...
// msgs/ ukey: {<from>, <msg>}, ...
// moves/ {<slot>: <move>, slot: <move>}

function init() {
    // Set everything to its initial state.
    $('#p1-input').hide();
	$('#p1-controls').hide();
	$('#p2-input').hide();
	$('#p2-controls').hide();
	$('#chat-form').hide();
    $('.p1-buttons').hide();
    $('.p2-buttons').hide();
	conMon.on('value', function(ss) {
		// monitor connection status for changes...
		if (ss.val()) {
			//true means connected. add yourself to cxs list
			var key = cxsRef.push(true);
			uid = key.key;
			key.onDisconnect().remove();
			$('#p1-input').fadeIn();
			$('#p2-input').fadeIn();
            outputMessage("Connected to the database, id is " + uid + ".");
		}
	});
    usrRef.once('value').then(function(ss) {
        if (ss.child('slot1').exists()) {
            console.log("Slot 1 full");
            $('#p1-input').fadeOut();
            $('#p1-controls').fadeIn();
            $('.p1-labels').text(ss.val().slot1.name)
        }
        else {
            console.log('Slot 1 empty');
            $('#p1-input').fadeIn();
        }
        if (ss.child('slot2').exists()) {
            console.log('Slot 2 full');
            $('#p2-input').fadeOut();
            $('#p2-controls').fadeIn();
            $('.p2-labels').text(ss.val().slot2.name)
        }
        else {
            console.log('Slot 2 empty');
            $('#p2-input').fadeIn();
        }
    });
	usrRef.on('child_added', function() {
        console.log("child added usrRef");
        fb.ref().once("value").then(function(ss) {
    		if (ss.child('usr').child('slot1').exists()) {
                console.log("slot 1 exists");
    			rps.p1id = ss.val().usr.slot1.id;
    			rps.p1name = ss.val().usr.slot1.name;
    			rps.p1wins = ss.val().usr.slot1.wins;
    			rps.p1losses = ss.val().usr.slot1.losses;
    			rps.p1ties = ss.val().usr.slot1.ties;
    			$('.p1-labels').text(rps.p1name);
    			$('#p1-wins').text(rps.p1wins);
    			$('#p1-losses').text(rps.p1losses);
    			$('#p1-ties').text(rps.p1ties);
    			if (uid == rps.p1id) {
    				// I am occpying slot 1.
    			}
    			$('#p1-input').fadeOut();
                $('#p1-controls').fadeIn();
    		} else {
                console.log('slot 1 empty');
            }
    		if (ss.child('usr').child('slot2').exists()) {
    			rps.p2id = ss.val().usr.slot2.id;
    			rps.p2name = ss.val().usr.slot2.name;
    			rps.p2wins = ss.val().usr.slot2.wins;
    			rps.p2losses = ss.val().usr.slot2.losses;
    			rps.p2ties = ss.val().usr.slot2.ties;
    			$('.p2-labels').text(rps.p2name);
    			$('#p2-wins').text(rps.p2wins);
    			$('#p2-losses').text(rps.p2losses);
    			$('#p2-ties').text(rps.p2ties);
    			if (uid == rps.p2id) {
    				// I am occpying slot 2.
    			}
    			$('#p2-input').fadeOut();

    		}
        });
	});  // end usrRef child_added
	usrRef.on('child_removed', function(ss) {
        outputMessage('A user disconnected.');
        $('#chat-form').fadeOut();
        slotnum = null;
		if (!ss.hasChild('slot1')) {
			$('.p1-labels').text('N/A');
			$('#p1-wins').text(0);
			$('#p1-losses').text(0);
			$('#p1-ties').text(0);
			$('#p1-controls').fadeOut();
			if (slotnum === null && uid !== null) {
				$('#p1-input').fadeIn();
			} else {
				$('#p1-input').fadeOut();
			}
			rps.p1name = null;
			rps.p1uid = null;
			rps.p1wins = null;
			rps.p1Losses = null;
			rps.p1ties = null;
		}
		if (!ss.hasChild('slot2')) {
			$('.p2-labels').text('N/A');
			$('#p2-wins').text(0);
			$('#p2-losses').text(0);
			$('#p2-ties').text(0);
			$('#p2-controls').fadeOut();
			if (slotnum === null && uid !== null) {
				$('#p2-input').fadeIn();
			} else {
				$('#p2-input').fadeOut();
			}
			rps.p2name = null;
			rps.p2uid = null;
			rps.p2wins = null;
			rps.p2Losses = null;
			rps.p2ties = null;
		}
	});  // end usrRef child_removed
    moveRef.on('child_added', function(ss) {
        console.log('move added');
        moveRef.once('value').then(function(ss) {
            if (ss.child('slot1').exists() && ss.child('slot2').exists()) {
                if (ss.val().slot1 == 'Rock') {
                    if (ss.val().slot2 == 'Rock') {
                        outputMessage('Rock vs Rock... round ended in a tie!  Make your next move...');
                        rps.p1ties++;
                        rps.p2ties++;
                        $('#p1-ties').text(rps.p1ties);
                        $('#p2-ties').text(rps.p2ties);
                        moveRef.remove();
                    }
                    if (ss.val().slot2 == 'Paper') {
                        outputMessage('Paper vs Rock... Player 2 wins!  Make your next move...');
                        rps.p1losses++;
                        rps.p2wins++;
                        $('#p1-losses').text(rps.p1losses);
                        $('#p2-wins').text(rps.p2wins);
                        moveRef.remove();
                    }
                    if (ss.val().slot2 == 'Scissors') {
                        outputMessage('Rock vs Scissors... Player 1 wins!  Make your next move...');
                        rps.p2losses++;
                        rps.p1wins++;
                        $('#p2-losses').text(rps.p2losses);
                        $('#p1-wins').text(rps.p1wins);
                        moveRef.remove();
                    }
                }
                if (ss.val().slot1 == 'Paper') {
                    if (ss.val().slot2 == 'Paper') {
                        outputMessage('Paper vs Paper... round ended in a tie!  Make your next move...');
                        rps.p1ties++;
                        rps.p2ties++;
                        $('#p1-ties').text(rps.p1ties);
                        $('#p2-ties').text(rps.p2ties);
                        moveRef.remove();
                    }
                    if (ss.val().slot2 == 'Scissors') {
                        outputMessage('Scissors vs Paper... Player 2 wins!  Make your next move...');
                        rps.p1losses++;
                        rps.p2wins++;
                        $('#p1-losses').text(rps.p1losses);
                        $('#p2-wins').text(rps.p2wins);
                        moveRef.remove();
                    }
                    if (ss.val().slot2 == 'Rock') {
                        outputMessage('Paper vs Rock... Player 1 wins!  Make your next move...');
                        rps.p2losses++;
                        rps.p1wins++;
                        $('#p2-losses').text(rps.p2losses);
                        $('#p1-wins').text(rps.p1wins);
                        moveRef.remove();
                    }
                }
                if (ss.val().slot1 == 'Scissors') {
                    if (ss.val().slot2 == 'Scissors') {
                        outputMessage('Scissors vs Scissors... round ended in a tie!  Make your next move...');
                        rps.p1ties++;
                        rps.p2ties++;
                        $('#p1-ties').text(rps.p1ties);
                        $('#p2-ties').text(rps.p2ties);
                        moveRef.remove();
                    }
                    if (ss.val().slot2 == 'Rock') {
                        outputMessage('Rock vs Scissors... Player 2 wins!  Make your next move...');
                        rps.p1losses++;
                        rps.p2wins++;
                        $('#p1-losses').text(rps.p1losses);
                        $('#p2-wins').text(rps.p2wins);
                        moveRef.remove();
                    }
                    if (ss.val().slot2 == 'Paper') {
                        outputMessage('Scissors vs Paper... Player 1 wins!  Make your next move...');
                        rps.p2losses++;
                        rps.p1wins++;
                        $('#p2-losses').text(rps.p2losses);
                        $('#p1-wins').text(rps.p1wins);
                        moveRef.remove();
                    }
                }
            }
        });
    });
    msgRef.on('child_added', function(ss) {
        outputMessage(ss.val().msg, ss.val().from)
    });

}

function bindUser(slot, name) {
	console.log("bindUser()...");
	usrRef.once('value').then(function(ss) {
		if (ss.child('slot' + slot).exists()) {
			console.log('player slot is occupied... aborting!');
			return false;
		}
		if (name.length < 1) {
			name = "Unnamed" + slot;
		}

		uname = name;
		slotnum = slot;
		if (slot == 1) {
			usrRef.update({ 'slot1': { 'id': uid, 'name': name, 'wins': 0, 'losses': 0, 'ties': 0 } });
            $('#p1-input').fadeOut();
            $('#p2-input').fadeOut();
            $('#chat-form').fadeIn();
            $('#p1-controls').fadeIn();
            $('#p2-controls').fadeIn();
            $('.p1-buttons').fadeIn();
		} else if (slot == 2) {
			usrRef.update({ 'slot2': { 'id': uid, 'name': name, 'wins': 0, 'losses': 0, 'ties': 0 } });
            $('#p1-input').fadeOut();
            $('#p2-input').fadeOut();
            $('#chat-form').fadeIn();
            $('#p1-controls').fadeIn();
            $('#p2-controls').fadeIn();
            $('.p2-buttons').fadeIn();
        }

		usrRef.onDisconnect().remove();
	});
}
function outputMessage(message, header=null, header_classes="text-primary chat-text", classes="text-dark") {
	// prints to the chat box.  the only mandatory argument is the message.  the
    // behavior can be radically different base on the options you send along...
    //
    // outputMessage(<msg>) will display a lightweight system notice, italic
    // ...(<msg>, alert) will highlight the text and add weight to the data
    // ...(<msg>, <username>) will write "<user>: msg", the header in blue
    // ...(<msg>, alert, danger ) will change the alert to red
    // ...(<msg>, <header>)
	var outputObj, headerObj, contentObj, modifiedHdr, modifiedContent;
	var colors = [ 'default', 'primary', 'success', 'info', 'warning', 'danger', 'light', 'dark' ];

	if (header !== null) {
        // if a header was supplied
		if (header == "alert") {
            // make this an alert
			if (colors.indexOf(classes) !== -1) {
				classes = 'alert alert-' + classes;
			} else {
				classes = 'alert alert-info';
			}
            classes += " chat-alert"
			outputObj = $("<span>").addClass(classes + " font-weight-bold").append(message);
			$("#chat").prepend(outputObj);
			return true;
		} else {
            //
			if (colors.indexOf(header_classes) !== -1) {
				header_classes = "text-" + header_classes + " chat-text";
			} else if (header_classes === null || header_classes === '') {
				header_classes = "text-primary chat-text";
			}

			if (colors.indexOf(classes) !== -1) {
				classes = "text-" + classes;
			} else if (header_classes === null || header_classes === '') {
				classes = "";
			}
			contentObj = $('<p>').addClass(classes).append($('<span>').addClass(header_classes).append(header + ": ")).append(message);
			$('#chat').prepend(contentObj);
			return true;
		}
	} else {
		outputObj = $("<span>").addClass('text-info font-italic chat-alert').append(message)
		$('#chat').prepend(outputObj);
	}
}

$('#p1-join').click(function(event) {
		console.log('CLICK! p1-join.');
		var name_input = $('#p1-name').val();
		bindUser(1, name_input);

});
$('#p2-join').click(function(event) {
		console.log('CLICK! p2-join.');
		var name_input = $('#p2-name').val();
		bindUser(2, name_input);
});
$('#p1-rock').click(function(event) {
    moveRef.once('value').then(function(ss) {
        if (!ss.child('slot1').exists()) {
            moveRef.update({'slot1': 'Rock'});
            moveRef.onDisconnect().remove();
            if (ss.child('slot2').exists()) {
                outputMessage('You chose Rock.');
            } else {
                outputMessage("You chose Rock... waiting for opponent's move");
            }
        }
    });
});
$('#p2-rock').click(function(event) {
    moveRef.once('value').then(function(ss) {
        if (!ss.child('slot2').exists()) {
            moveRef.update({'slot2': 'Rock'});
            moveRef.onDisconnect().remove();
            if (ss.child('slot1').exists()) {
                outputMessage('You chose Rock.');
            } else {
                outputMessage("You chose Rock... waiting for opponent's move");
            }
        }
    });
});
$('#p1-paper').click(function(event) {
    moveRef.once('value').then(function(ss) {
        if (!ss.child('slot1').exists()) {
            moveRef.update({'slot1': 'Paper'});
            moveRef.onDisconnect().remove();
            if (ss.child('slot2').exists()) {
                outputMessage('You chose Paper.');
            } else {
                outputMessage("You chose Paper... waiting for opponent's move");
            }
        }
    });
});
$('#p2-paper').click(function(event) {
    moveRef.once('value').then(function(ss) {
        if (!ss.child('slot2').exists()) {
            moveRef.update({'slot2': 'Paper'});
            moveRef.onDisconnect().remove();
            if (ss.child('slot1').exists()) {
                outputMessage('You chose Paper.');
            } else {
                outputMessage("You chose Paper... waiting for opponent's move");
            }
        }
    });
});
$('#p1-scissors').click(function(event) {
    moveRef.once('value').then(function(ss) {
        if (!ss.child('slot1').exists()) {
            moveRef.update({'slot1': 'Scissors'});
            moveRef.onDisconnect().remove();
            if (ss.child('slot2').exists()) {
                outputMessage('You chose Scissors.');
            } else {
                outputMessage("You chose Scissors... waiting for opponent's move");
            }
        }
    });
});
$('#p2-scissors').click(function(event) {
    moveRef.once('value').then(function(ss) {
        if (!ss.child('slot2').exists()) {
            moveRef.update({'slot2': 'Scissors'});
            moveRef.onDisconnect().remove();
            if (ss.child('slot1').exists()) {
                outputMessage('You chose Scissors.');
            } else {
                outputMessage("You chose Scissors... waiting for opponent's move");
            }
        }
    });
});

$('#send-btn').click(function(event) {
    var msg = $('#chat-msg').val();
    $('#chat-msg').val('');
    if (msg !== "") {
        msgRef.push({ 'from': uname, 'msg': msg });
    }
    msgRef.onDisconnect().remove();
});

$(document).ready(function() {
		init();
});
