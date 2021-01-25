

var LIMBS = [ 
	'leftleg',
	'rightleg',
	'lefthand',
	'righthand'
];


var ICONS = [ 
	'sun',
	'berb',
	'boat',
	'wave'
];

var COLORS = [
	'yellow',
	'blue',
	'green',
	'red',
	'pink'
]


//var root = "/af";
var root = "C:/Users/billy/Projects/billysan.github.io/af"

function play_random() {

	horizontal = Math.floor(Math.random() * 5) + 1,
	vertical = Math.floor(Math.random() * 4) + 1;

	limb = LIMBS[Math.floor(Math.random() * 4)],
	color = COLORS[horizontal - 1];
	icon = ICONS[vertical - 1];

	playLimb(limb);
	setTimeout(function(){ playColor(color); }, 1750);
	//activateCell(vertical,horizontal,limb);
	setTimeout(function(){ playIcon(icon); }, 2750);
}

/*
function activateCell(vertical,horizontal,limb){
	$(".af-grid ." + limb).removeClass(limb);
	$(".af-grid .active").removeClass('active');

	$(".af-grid .row:nth-child("+ vertical + ") .cell:nth-child("+ horizontal+ ")").addClass('active').addClass(limb);
}
*/

function playColor(color) {
	var color_obj = new Audio();
	color_obj.src = root + "/colors/" + color + ".mp3";
	color_obj.play();
}

function playIcon(icon){
	var icon_obj = new Audio();
	icon_obj.src = root + "/shapes/" + icon + ".mp3";
	icon_obj.play();
}


function playLimb(limb){
	var limb_obj = new Audio();
	limb_obj.src = root + "/limbs/" + limb + ".mp3";
	limb_obj.play();
}

/*
function playNum(num){
	var num_obj = new Audio();
	num_obj.src = root + "/n/" + num + ".mp3";
	num_obj.play();
}
*/

var g_is_running = false;

var g_settings = {
	'minutes_len' : 0,
	'is_narrator' : false,
	'focus_interval_object' : null,
	'current_progress' : 0,
	'progress_interval_object' : null,
	'stop_AF_timeout_object' : null,
	'narration_audio_objects' : {
		'start' : new Audio(root + "/n/start.mp3"),
		'end' : new Audio(root + "/n/end.mp3"),
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

	g_settings['focus_interval_object'] = null;
	g_settings['current_progress'] = 0;
	g_settings['progress_interval_object'] = null;
	g_settings['stop_AF_timeout_object'] = null;

	$("#af-play-icon").removeClass("fa-play").addClass("fa-spinner").addClass("fa-spin");
}


function start_AF() {

	console.log("Starting AF");
	var randomInterval = 8000;
	// Change focus every 12700 ms
	g_settings['focus_interval_object'] = setInterval(play_random, randomInterval);

	// Set the stopping timer
	g_settings['stop_AF_timeout_object'] = setTimeout(stop_AF, g_settings['minutes_len'] * 1000 * 60);

	// Progress bar every second
	g_settings['progress_interval_object'] = setInterval(progress_bar, 1000);

	g_settings['narration_audio_objects']['start'].play();

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
	if (!user_clicked) {
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
	console.log("af is... ready? 2");
});
