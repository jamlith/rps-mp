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
}
var uname = null;
var uid = null;
var slotnum = null;

// cxs/ <uid>:true, ...
// usr/ {<slot>, <uid>, <name>, <wins>, <losses>, <ties>}, ...
// msgs/ ukey: {<from>, <msg>, <tstamp>, <color>}, ...
// moves/ {<pnum>: <move>, pnum: <move>}

function init() {
    // Set everything to its initial state.
    $('#p1-input').hide();
	$('#p1-controls').hide();
	$('#p2-input').hide();
	$('#p2-controls').hide();
	$('#chat-form').hide();
	conMon.on('value', function(ss) {
		// monitor connection status for changes...
		if (ss.val()) {
			//true means connected. add yourself to cxs list
			var key = cxsRef.push(true);
			uid = key.key;
			key.onDisconnect().remove();
			$('#p1-input').fadeIn();
			$('#p2-input').fadeIn();
		}
	});
	usrRef.on('child_added', function(ss) {
		if (ss.child('slot1').exists()) {
			rps.p1id = ss.val().slot1.id;
			rps.p1name = ss.val().slot1.name;
			rps.p1wins = ss.val().slot1.wins;
			rps.p1losses = ss.val().slot1.losses;
			rps.p1ties = ss.val().slot1.ties;
			$('.p1-labels').text(rps.p1name);
			$('#p1-wins').text(rps.p1wins);
			$('#p1-losses').text(rps.p1losses);
			$('#p1-ties').text(rps.p1ties);
			if (uid == rps.p1id) {
				// I am occpying slot 1.
			}
			$('#p1-input').fadeOut();
			$('#p1-controls').fadeOut();
		}
		if (ss.child('slot2').exists()) {
			rps.p2id = ss.val().slot2.id;
			rps.p2name = ss.val().slot2.name;
			rps.p2wins = ss.val().slot2.wins;
			rps.p2losses = ss.val().slot2.losses;
			rps.p2ties = ss.val().slot2.ties;
			$('.p2-labels').text(rps.p2name);
			$('#p2-wins').text(rps.p2wins);
			$('#p2-losses').text(rps.p2losses);
			$('#p2-ties').text(rps.p2ties);
			if (uid == rps.p2id) {
				// I am occpying slot 2.
			}
			$('#p2-input').fadeout();
			$('#p2-controls').fadeout();
		}
	});  // end usrRef child_added
	usrRef.on('child_removed', function(ss) {
		if (ss.child('slot1').exists() != true) {
			$('.p1-labels').text('Player 1');
			$('#p1-wins').text(0);
			$('#p1-losses').text(0);
			$('#p1-ties').text(0);
			$('#p1-controls').fadeOut();
			if (pnum === null && uid !== null) {
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
		if (ss.child('slot2').exists() != true) {
			$('.p2-labels').text('Player 1');
			$('#p2-wins').text(0);
			$('#p2-losses').text(0);
			$('#p2-ties').text(0);
			$('#p2-controls').fadeOut();
			if (pnum === null && uid !== null) {
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
		} else if (slot == 2) {
			usrRef.update({ 'slot2': { 'id': uid, 'name': name, 'wins': 0, 'losses': 0, 'ties': 0 } });
		}

		usrRef.onDisconnect().remove();
	});
}
function outputMessage(message, header=null, classes="chat-text", header_classes="text-danger") {
	// the function responsible for creating, formatting, and appending the text
	// in the chatbar. an example of a classes setting: 'alert alert-info'
	// the entire element is wrapped in a p tag, and the header and content are
	// each wrapped in their own classes, where the classes you passed in the
	// arguments will be applied. if you pass only 2 arguments, as (msg, author)
	// the default settings will output the name in blue, and the text in a dark
	// grey (close to black.)  you can set the third arg to a simple 'keyword' to
	// modify the shader used on the name... Keywords are: (default: dk grey, primary:
	// purple-blue, success: green, info: cyan, warning; ylw, danger:red.)
	var outputObj, headerObj, contentObj, modifiedHdr, modifiedContent;
	var colors = [ 'default', 'primary', 'success', 'info', 'warning', 'danger' ];

	if (header !== null) {
		if (header == "alert") {
			if (colors.indexOf(classes) !== -1) {
				classes = 'alert alert-' + classes;
			} else {
				classes = 'alert alert-info';
			}
			outputObj = $("<span>").addClass(classes + " font-weight-bold").append(message);
			$("#chat").prepend(outputObj);
			return true;
		} else {
			if (colors.indexOf(header_classes) !== -1) {
				header_classes = "text-" + header_classes + " chat-text";
			} else if (header_classes === null || header_classes === '') {
				header_classes = "text-primary chat-text";
			}
			headerObj=$('<span>').addClass(header-classes).append($(header))
			if (colors.indexOf(classes) !== -1) {
				classes = "text-" + classes;
			} else if (header_classes === null || header_classes === '') {
				classes = "";
			}
			contentObj = $('<p>').addClass(classes).append(headerObj).append(message);
			$('#chat').prepend(contentObj);
			return true;
		}
	} else {
		outputObj = $("<span>").addClass(classes).append(message)
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
		bindUser(1, name_input);
});

$(document).ready(function() {
		init();
});
