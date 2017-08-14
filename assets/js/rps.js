		/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\
		|   rps.js															  |
		|		multiplayer rock paper scissors 		  |
		|		using firebase and javascript.			  |
		\________________________________________*/

// set vars
var username = null;
var userid = null;


// firebase object
var fb = {
	uid: null,
	db: firebase.database(),
	cxRef: null,
	msgRef: null,
	usrRef: null,
	moveRef: null,
	conRef: null,
	p1name: false,
	p2name: false,
	wins: 0,
	ties: 0,
	losses: 0,
	init: function() {
		// this is just to set initial values and set listeners where needed
		// listen for disconnections
		var cxRef = this.db.ref('cxs/');
		var msgRef = this.db.ref('msgs/');
		var usrRef = this.db.ref('users/');
		var moveRef = this.db.ref('moves/');
		var conRef = this.db.ref('.info/connected');
		conRef.on('value', function(data) {
			// if connected
			if (data.val()) {
				// add user to connections
				var cxk = cxRef.push(true);
				// save the generated key for the UID
				this.uid = cxk.key;
				// delete this entry upon disconnect
				cxk.onDisconnect().remove();
			}
		});
		//listen for players joining
		usrRef.on('child_added', function(snapshot) {
			if (snapshot.val().player1.exists()) {
				this.p1name = snapshot.val().player1.name;
				$('#p1form').fadeOut();
				$('#p1unlabel').text(snapshot.val().player1.name);
				$('#p1winlabel').text(snapshot.val().player1.wins);
				$('#p1tielabel').text(snapshot.val().player1.ties);
				$('#p1losslabel').text(snapshot.val().player1.losses);
				$('#p1play').fadeIn();
			}
			if (snapshot.val().player2.exists()) {
				this.p2name = snapshot.val().player2.name;
				$('#p2form').fadeOut();
				$('#p2unlabel').text(snapshot.val().player2.name);
				$('#p2winlabel').text(snapshot.val().player2.wins);
				$('#p2tielabel').text(snapshot.val().player2.ties);
				$('#p2losslabel').text(snapshot.val().player2.losses);
				$('#p2play').fadeIn();
			}
		});
		//listen for players leaving
		usrRef.on('child_removed', function(snapshot) {
			if (! snapshot.child('player1').exists()) {
			 this.p1name = null;
			 $('#p1play').fadeOut();
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
	},
	bindName: function(pnum, name) {
		// Assigns the player number and nickname to the user
		var usrRef = this.db.ref('users/')
		if (pnum == 1 && this.p1name == false) {
			this.p1name = name;
			var usr = this.usrRef.push({ 'player1': { 'name': name, 'id': this.uid, 'wins': 0, 'losses': 0, 'ties': 0 }});
			// delete this entry upon disconnect
			usr.onDisconnect().remove();
		} else if (pnum == 2 && this.p2name == false) {
			this.p2name = name;
			var usr = this.usrRef.push({ 'player2': { 'name': name, 'id': this.uid, 'wins': 0, 'losses': 9, 'ties': 0 }});
			// delete this entry upon disconnect
			usr.onDisconnect().remove();
		} else {
			console.log("bindName(): User tried to join an occupied seat.");
			return false;
		}
	},
	updateStats: function(pnum, wins, losses, ties) {
		// updates UI when scores change
		$('#p' + pnum + 'winlabel').text(wins);
		$('#p' + pnum + 'losslabel').text(losses);
		$('#p' + pnum + 'tielabel').text(ties);
	},
	makeMove: function(move) {
		// registers a users decision, commits it to the db
		var usrRef = this.db.ref('users/');
		var moveRef = this.db.ref('moves/');
		usrRef.once('value').then(function(snapshot) {
			if (snapshot.child('player1').exists() && this.uid == snapshot.child('player1').child('id').val()) {
				moveRef.set({ 'player1': move });
				// TODO: Display the selection for the user that made it (somehow)
			} else if (snapshot.child('player2').exists() && this.uid == snapshot.child('player2').child('id').val()) {
				moveRef.set({ 'player2': move });
				// TODO: Display the selection for the user that made it (somehow)
			}
		});
	},
		printMessage: function(authid, msg, timestamp, effects) {
			var authorName;
			var usrRef = this.db.ref("users/");
			usrRef.once('value').then(function(snapshot) {
				if (snapshot.child('player1').exists() && snapshot.child('player2').exists()) {
					if (snapshot.val().player1.id == authid) {
						authorName = snapshot.val().player1.name;
					} else if (snapshot.val().player2.id == authid) {
						authorName = snapshot.val().player2.name;
					}
					var name = $("<span>").append(authorName).addClass('blue-text')
				}

			});
		}
	}
	$("#p1play").hide();
	$("#p2play").hide();
	$("chatform").hide();

$("#p1join").click(function(event) {
	var nick=$("#p1nameinput");
	if (nick == "" || nick == undefined) {
		nick = "Anon1"
	}
});
