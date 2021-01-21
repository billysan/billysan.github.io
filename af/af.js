
START = "/af/n/start.mp3";
END = "/af/n/end.mp3";

LIMBS = [ 
	'/af/limbs/leftleg.mp3',
	'/af/limbs/rightleg.mp3',
	'/af/limbs/lefthand.mp3',
	'/af/limbs/righthand.mp3'
];


function play_random() {

	var rand_limb = Math.floor(Math.random() * 4);
	var rand_square = Math.floor(Math.random() * 16);

	console.log(rand_limb);
	console.log(rand_square);

	var limb_obj = new Audio();
	limb_obj.src = LIMBS[rand_limb];

	var square_obj = new Audio();
	square_obj.src = "/af/n/" + rand_square + ".mp3";

	limb_obj.play();
	square_obj.play();
}


var g_is_running = false;

var g_settings = {
	'minutes_len' : 0,
	'is_narrator' : false,
	'currently_playing' : [ ],
	'loaded_audio_objects' : 0,
	'n_objects' : { },
	'limb_objects' : { },
	'focus_interval_object' : null,
	'current_focus' : null,
	'current_progress' : 0,
	'progress_interval_object' : null,
	'stop_AF_timeout_object' : null,
	'narration_audio_objects' : {
		'start' : new Audio("/af/n/start.mp3"),
		'end' : new Audio("/af/n/end.mp3"),
	},
}


function progress_bar() {

	if (g_is_running) {
		results = (g_settings['current_progress'] * 100 / (g_settings['minutes_len'] * 60));
		$("#af-progress-bar").css('width', results.toString() + '%');
		g_settings['current_progress'] += 1;
	} else {
		console.log("Stopping progress bar");
		clearInterval(g_settings['progress_interval_object']);
	}
}


function init_AF() {

	if (g_is_running) {
		console.log("Already running...");
		return;
	}

	console.log("Initialising AF...");

	g_settings['currently_playing'] = [ ];
	g_settings['loaded_audio_objects'] = 0;
	g_settings['audio_objects'] = { };
	g_settings['tts_objects'] = { };
	g_settings['current_focus'] = null;
	g_settings['focus_interval_object'] = null;
	g_settings['current_progress'] = 0;
	g_settings['progress_interval_object'] = null;
	g_settings['stop_AT_timeout_object'] = null;

	$("#af-play-icon").removeClass("fa-play").addClass("fa-spinner").addClass("fa-spin");
}


function start_AF() {

	console.log("Starting AF");

	// Change focus every 12700 ms
	g_settings['focus_interval_object'] = setInterval(play_random, 12700);

	// Set the stopping timer
	g_settings['stop_AF_timeout_object'] = setTimeout(stop_AT, g_settings['minutes_len'] * 1000 * 60);

	// Progress bar every second
	g_settings['progress_interval_object'] = setInterval(progress_bar, 1000);

	if (g_settings['is_narrator']) {
		g_settings['narration_audio_objects']['start'].play();
	}

	// Initial focus change after about 5 seconds into session
	setTimeout(play_random, 5000);

	// Disable start, enable stop
	$("#show-settings-button").prop('disabled', true);
	$("#stop-training-button").prop('disabled', false);

	$("#af-play-icon").removeClass("fa-spinner").removeClass("fa-spin").addClass("fa-play");

	g_is_running = true;
}


function stop_AF(user_clicked = false) {

	if (!g_is_running) {
		console.log("Not running, not stopping...");
		return;
	}

	console.log("Stopping AF...");

	// Clear stop object
	if (g_settings['stop_AF_timeout_object']) {
		clearTimeout(g_settings['stop_AF_timeout_object']);
	}

	// Stop focus change
	if (g_settings['focus_interval_object']) {
		clearInterval(g_settings['focus_interval_object']);
	}

	// Clear focus entry
	$("#focus_entry").html('&nbsp;');

	// Clear progress
	$("#af-progress-bar").css('width', '0%');

	// Say the session is over
	if (g_settings['is_narrator'] && !user_clicked) {
		g_settings['narration_audio_objects']['end'].play();
	}

	// Enable start, disable stop
	$("#show-settings-button").prop('disabled', false);
	$("#stop-training-button").prop('disabled', true);

	g_is_running = false;
}


$("#settings-start-button").click(function() {

	g_settings['minutes_len'] = parseInt($("#minutes-len-btn-group label.active input").val());
	g_settings['is_narrator'] = $("#narrate-checkbox").is(':checked');
	$("#settings-modal").modal('hide');

	init_AF();
	start_AF();
});


$("#stop-training-button").click(function() {
	stop_AF(true);
});


$(document).ready(function() { 
	$("#stop-training-button").prop('disabled', true);
	console.log("af is... ready?");
});
