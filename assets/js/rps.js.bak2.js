		/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\
		|   rps.js															  |
		|		multiplayer rock paper scissors 		  |
		|		using firebase and javascript.			  |
		\________________________________________*/

// set vars
var username = null;
var userid = null;



// $(document).ready(function() {
// Wait for the document to load completely before executing any code.
var fb = {
	uid: null,
	db: firebase.database(),
	p1name: false,
	p2name: false,
	wins: 0,
	ties: 0,
	losses: 0,
	stats: { 'count': { 'rock': 0, 'paper': 0, 'scissors': 0, 'total': 0 }},
	init: function() {
		// this is just to set initial values and set listeners where needed
		var cxRef = this.db.ref('cxs/');
		var msgRef = this.db.ref('msgs/');
		var usrRef = this.db.ref('users/');
		var moveRef = this.db.ref('moves/');
		var conRef = this.db.ref('.info/connected');
		// listen for disconnections
		conRef.on('value', function(data) {
			// if connected
			if (data.val()) {
				var cxk = cxRef.push(true);
				this.uid = cxk.key;
				userid = cxk.key;
				cxk.onDisconnect().remove();
			}
		});
		//listen for players joining
		usrRef.on('child_added', function(snapshot) {
			if (snapshot.child('player1').exists()) {
				if (this.uid == snapshot.val().player1.id) {
					username = player1.name;
					$("p1_label_form").text(username);
					$("p1_label_play").text(username);
				}
				$('#p1form').fadeOut();
				$('#p2form').fadeOut();,
				$('#p1unlabel').text(snapshot.val().player1.name);
				$('#p1winlabel').text(snapshot.val().player1.wins);
				$('#p1tielabel').text(snapshot.val().player1.ties);
				$('#p1losslabel').text(snapshot.val().player1.losses);
				$('#p1play').fadeIn();
				$('#chatform').fadeIn();
			}
			if (snapshot.val().child('player2').exists()) {
				this.p2name = snapshot.val().player2.name;
				if (this.uid == snapshot.val().player2.id) {
					username = s:webkitRequestAnimationFrameQw""""""``::HTMLQuoteEle uuuuuuuuuuuuuu
				}
				$('#p2form').fadeOut();
				$('#p1play').fadeOut();				
				$('#p2unlabel').text(snapshot.val().player2.name);
				$('#p2winlabel').text(snapshot.val().player2.wins);
				$('#p2tielabel').text(snapshot.val().player2.ties);
				$('#p2losslabel').text(snapshot.val().player2.losses);
				$('#p2play').fadeIn();
				$('#chatform').fadeIn();
			};
		});
		//listen for players leaving
		usrRef.on('child_removed', function(snapshot) {
			if (! snapshot.child('player1').exists()) {
		 		this.p1name = null;
				$('#p1play').fadeaOut();
				$('#p1form').fadein();
		 		$('#p1unlabel').text('N/A');
				$('#p1winlabel').text(0);
				$('#p1tielabel').text(0);
				$('#p1losslabel').text(0);
	 		}
	  		if (! snapshot.child('player2').exists()) {
				this.p2name = null;
				$('#p2play').fadeOut();
				$('#p2form').fadein();
				$('#p2unlabel').text('N/A');
				$('#p2winlabel').text(0);
				$('#p2tielabel').text(0);
				$('#p2losslabel').text(0);
			 }
		});
		// listen for chat messages
		msgRef.on('child_added', function(snapshot) {
			var author_id = snapshot.val().authid;
			var message = snapshot.val().msg;
			var tstamp = snapshot.val().timestamp;
			this.printMessage(author_id, message, tstamp);
		});
	},
	bindName: function(pnum, name) {
		var usrRef = this.db.ref('users/');
		if (pnum == 1 && this.p1name == false) {
			this.p1name = name;
			var usr = usrRef.update({ 'player1': { 'name': name, 'id': this.uid, 'wins': 0, 'losses': 0, 'ties': 0 }});
			// delete this entry upon disconnect
			usr.onDisconnect().remove();
		} else if (pnum == 2 && this.p2name == false) {
			this.p2name = name;
			var usr = usrRef.update({ 'player2': { 'name': name, 'id': this.uid, 'wins': 0, 'losses': 9, 'ties': 0 }});
			// delete this entry upon disconnect
			usr.onDisconnect().remove();
		} else {
			return false;
		}
		return true;
	},
	updateStats: function(pnum, wins, losses, ties) {
		// updates UI whe
		// scores change
		var usrRef = this.db.ref('users/player' + pnum);
		usrRef.set({'wins': wins, 'losses': losses, 'ties': ties});
		$('#p' + pnum + 'winlabel').text(wins);
		$('#p' + pnum + 'losslabel').text(losses);
		$('#p' + pnum + 'tielabel').text(ties);
	},
	makeMove: function(pnum, move) {
		// registers a users decision, commits it to the db
		var usrRef = this.db.ref('users/');
		var moveRef = this.db.ref('moves/');
		usrRef.once('value').then(function(snapshot) {
			if (snapshot.child('player1').exists() && this.uid == snapshot.child('player1').child('id').val()) {
					.update({ 'player1': 'move' });
					// TODO: Display the selection for the user that made it (somehow)
			} else if (snapshot.child('player2').exists() && this.uid == snapshot.child('player2').child('id').val()) {
					moveRef.update({ 'player2': 'move' });
			}
		});
	},
	printMessage: function(authid, msg, timestamp=0, fx=false) {
		// The function i'll call when new data arrives in the chat branch
		var authorName;
		// the author's ID is all i got.  making the moves to fimd the players
		var usrRef = this.db.ref("users/");
		usrRef.once('value').then(function(snapshot) {
			if (snapshot.child('player1').exists() && snapshot.child('player2').exists()) {
				if (snapshot.val().player1.id == authid) {
					authorName = snapshot.val().player1.name;
				} else if (snapshot.val().player2.id == authid) {
					authorName = snapshot.val().player2.name;
				}
				var name = $("<span>").append(authorName + ': ').addClass('alert alert-info chat-alert');
				console.log(name);
			}
		});
	},
	postMessage: function(authid, msg, tstamp=0, fx=false) {
		var chatRef = this.db('msgs/');
		// var usrRef = this.db('users/');
		if (tstamp === 0) {
			tstamp = Date.now();
		}
		var token = chatRef.push({ 'authid': '" + authid + "', 'msg': '" + msg + "', 'timestamp': '" + tstamp + "' })
		token.onDisconnect().remove();
	},
	printAlert: function(origin, msg) {
		var newTag = $("<span>").addClass('alert alert-info chat-alert').prepend("Alert!  " + msg + ".");
		$("#chat").prepend(new tag);
	}
};


	$("#p1play").hide();
	$("#p2play").hide();
	$("#chatform").hide();
	$("#p1join").click(function(event) {
		var pnum = 1;
		var nick=$("#p1nameinput").val();
		// Reset initial form
		$("#p1nameinput").val('');
		// If the user sent a blank name, give him a generic one...
		if (nick == "" || nick == undefined) {
			nick = "Anon1";
		}
		// pass the pertinent data to fb
		var status = fb.bindName(pnum, nick);
		if (! status) {
			// something seems to have failed...
			fb.printAlert("Failed to choose a nickname and slot...");
			return false;
		} else {
			$("#p1form").fadeOut();
			$("#p1play").fadeIn();
			if ($('#chatform').attr("style") === "display: none;") {
				$("#chatform").fadeIn();
			}
		}
	});
	// listen for player 2's join button
	$("#p2join").click(function(event) {
		var pnum = 2;
		var nick=$("#p2nameinput").val();
		// Reset join form, hide it.
		$("#p2nameinput").val('');
		if (nick == "" || nick == undefined) {
			nick = "Anon2"
		}
		var status = fb.bindName(pnum, nick);
		if (! status) {
			fb.printAlert("Failed to choose a nickname and slot...");
			return false;
		} else {
			$("#p2form").fadeOut();
			$("#p2play").fadeIn();
			if ($("#chatform").attr("style") === "display: none;") {
				$("#chatform").fadeIn();
			}
		}
	});
	// listen for the send button
	$("#send-btn").click(function(event) {
		var msgval = $('#chat-msg').val();
		var tstamp = Date.now()
		if (msgStr.length < 1) {
			console.log("Can't post an empty message... aborted.");
			fb.printAlert("Failed to post a chat message.  Reason: User didn't specify a message");
		}
		db.postMessage(this.uid, msgStr, tstamp, false);
	});
	$("#p1-rock-btn").click(function(event) {

	});
$(document).ready(fb.init());
