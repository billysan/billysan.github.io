
SOUNDS = [
	[ 'crickets 🦗', 'songs/crickets.mp3', 'tts/crickets.mp3', 0.8 ],
	[ 'piano 🎹' , 'songs/piano.mp3', 'tts/piano.mp3', 0.5 ],
	[ 'waves 🌊' , 'songs/waves.mp3', 'tts/waves.mp3', 0.5 ],
	[ 'bells 🔔' , 'songs/bells.mp3', 'tts/bells.mp3', 0.3 ],
	[ 'birdsong 🐦' , 'songs/birdsong.mp3', 'tts/birdsong.mp3', 0.5 ],
	[ 'bubbles 🥤' , 'songs/bubbles.mp3', 'tts/bubbles.mp3', 0.3 ],
	[ 'chant 🕉️' , 'songs/chant.mp3', 'tts/chant.mp3', 0.4 ],
	[ 'childplay 🧒' , 'songs/childplay.mp3', 'tts/childplay.mp3', 0.4 ],
	[ 'drone ✈️' , 'songs/drone.mp3', 'tts/drone.mp3', 0.8 ],
	[ 'guitar 🎸' , 'songs/guitar.mp3', 'tts/guitar.mp3', 0.5 ],
	[ 'talkings 🗯️' , 'songs/talkings.mp3', 'tts/talkings.mp3', 0.5] ,
	[ 'violin 🎻' , 'songs/violin.mp3', 'tts/violin.mp3', 0.5 ],
	[ 'boxing 🥊' , 'songs/boxing.mp3', 'tts/boxing.mp3', 0.7 ],
	[ 'clock 🕰️' , 'songs/clock.mp3', 'tts/clock.mp3', 0.9 ],
	[ 'floor cracking 🚪' , 'songs/floor.mp3', 'tts/floor.mp3', 0.9 ],
	[ 'typing ⌨️' , 'songs/typing.mp3', 'tts/typing.mp3', 0.9 ],
	[ 'sheep 🐑' , 'songs/sheep.mp3', 'tts/sheep.mp3', 0.4 ],
	[ 'traffic 🚗' , 'songs/traffic.mp3', 'tts/traffic.mp3', 0.5 ],
	[ 'harp 🎭' , 'songs/harp.mp3', 'tts/harp.mp3', 0.8 ],
];


HT = [
	['ht/chewing.mp3', 1],
	['ht/bag.mp3', 0.2],
	['ht/bear.mp3', 0.8],
	['ht/grill.mp3', 0.7],
	['ht/itchy.mp3', 1],
	['ht/kalkar.mp3', 0.7],
	['ht/keys.mp3', 0.8],
	['ht/wall.mp3', 0.7],
	['ht/yuk.mp3', 0.5],
]


var g_is_running = false;

var g_settings = {
	'sounds_len' : 0,
	'minutes_len' : 0,
	'is_narrator' : false,
	'is_ht' : false,
	'currently_playing' : [ ],
	'loaded_audio_objects' : 0,
	'audio_objects' : { },
	'tts_objects' : { },
	'ht_object' : null,
	'focus_interval_object' : null,
	'current_focus' : null,
	'current_progress' : 0,
	'progress_interval_object' : null,
	'stop_AT_timeout_object' : null,
	'narration_audio_objects' : {
		'start' : new Audio("tts/start.mp3"),
		'end' : new Audio("tts/end.mp3"),
	},
}


function loaded_audio() {

	g_settings['loaded_audio_objects'] += 1;

	// * 2: one audio, one tts
	objects_ready = (g_settings['sounds_len'] * 2);

	if (g_settings['is_ht']) {
		objects_ready += 1;
	}

	if (g_settings['loaded_audio_objects'] == objects_ready) {
		console.log("ready!");
		start_AT();
	}
}


function progress_bar() {

	if (g_is_running) {
		results = (g_settings['current_progress'] * 100 / (g_settings['minutes_len'] * 60));
		$("#kat-progress-bar").css('width', results.toString() + '%');
		g_settings['current_progress'] += 1;
	} else {
		console.log("Stopping progress bar");
		clearInterval(g_settings['progress_interval_object']);
	}
}


function change_attention_focus() {

	console.log("Changing focus...");

	var random_focus = g_settings['currently_playing'][Math.floor(Math.random() * g_settings['currently_playing'].length)];

	if (random_focus != g_settings['current_focus']) {

		if (g_settings['current_focus']) {
			$("#focus_entry").fadeOut();
		}

		$("#focus_entry").html('Concentrate on the ' + SOUNDS[random_focus][0]);
		$("#focus_entry").fadeIn();

		if (g_settings['is_narrator']) {
			g_settings['tts_objects'][random_focus.toString()].play();
		}

		g_settings['current_focus'] = random_focus;
	}
}


function play_this(sound_index) {
	g_settings['audio_objects'][sound_index.toString()].play();
}


function init_AT() {

	if (g_is_running) {
		console.log("Already running...");
		return;
	}

	console.log("Initialising AT...");

	g_settings['currently_playing'] = [ ];
	g_settings['loaded_audio_objects'] = 0;
	g_settings['audio_objects'] = { };
	g_settings['tts_objects'] = { };
	g_settings['current_focus'] = null;
	g_settings['focus_interval_object'] = null;
	g_settings['current_progress'] = 0;
	g_settings['progress_interval_object'] = null;
	g_settings['stop_AT_timeout_object'] = null;

	// Select random files to play
	i = 0;

	while (i < g_settings['sounds_len']) {

		random_sound_pos = Math.floor(Math.random() * SOUNDS.length);

		if (!g_settings['currently_playing'].includes(random_sound_pos)) {

			g_settings['currently_playing'].push(random_sound_pos);

			i += 1;

			console.log("Selected " + SOUNDS[random_sound_pos][0]);
		}
	}

	// Preload relevant audio
	for (i = 0; i < g_settings['sounds_len']; ++i) {

		sound_index = g_settings['currently_playing'][i];

		song_name = SOUNDS[sound_index][0];
		song_url = SOUNDS[sound_index][1];
		song_tts_url = SOUNDS[sound_index][2];
		song_volume_factor = SOUNDS[sound_index][3];

		console.log("Preloading sound: " + SOUNDS[sound_index][0]);

		// preload song
		var audio_obj = new Audio();

		audio_obj.src = song_url;
		audio_obj.loop = true;
		audio_obj.volume = song_volume_factor;
		audio_obj.addEventListener('canplaythrough', loaded_audio, false);

		// preload its relevant tts
		var tts_obj = new Audio();

		tts_obj.src = song_tts_url;
		tts_obj.addEventListener('canplaythrough', loaded_audio, false);

		g_settings['audio_objects'][sound_index] = audio_obj;
		g_settings['tts_objects'][sound_index] = tts_obj;
	}

	
	if (g_settings['is_ht']) {

		// Select a single HT track
		console.log("HT is on");
	
		random_ht_pos = Math.floor(Math.random() * HT.length);

		console.log("Selected: " + HT[random_ht_pos][0]);

		// preload song
		var ht_obj = new Audio();

		ht_obj.src = HT[random_ht_pos][0];
		ht_obj.volume = HT[random_ht_pos][1];
		ht_obj.loop = true;
		ht_obj.addEventListener('canplaythrough', loaded_audio, false);
	
		g_settings['ht_object'] = ht_obj;
	}


	$("#kat-play-icon").removeClass("fa-play").addClass("fa-spinner").addClass("fa-spin");
}


function start_AT() {

	console.log("Starting AT");

	// Play all songs
	for (i = 0; i < g_settings['sounds_len']; ++i) {
		setTimeout(play_this, 0, g_settings['currently_playing'][i]);
	}

	// Change focus every 21078 ms
	g_settings['focus_interval_object'] = setInterval(change_attention_focus, 21078);

	// Set the stopping timer
	g_settings['stop_AT_timeout_object'] = setTimeout(stop_AT, g_settings['minutes_len'] * 1000 * 60);

	// Progress bar every second
	g_settings['progress_interval_object'] = setInterval(progress_bar, 1000);

	if (g_settings['is_narrator']) {
		g_settings['narration_audio_objects']['start'].play();
	}

	if (g_settings['is_ht']) {
		g_settings['ht_object'].play();
	}

	// Initial focus change after about 5 seconds into session
	setTimeout(change_attention_focus, 5000);

	// Disable start, enable stop
	$("#show-settings-button").prop('disabled', true);
	$("#stop-training-button").prop('disabled', false);

	$("#kat-play-icon").removeClass("fa-spinner").removeClass("fa-spin").addClass("fa-play");

	g_is_running = true;
}


function stop_sounds() {

	for (i = 0; i < g_settings['sounds_len']; ++i) {

		sound_index = g_settings['currently_playing'][i]

		console.log("Stopping " + SOUNDS[sound_index][0]);

		g_settings['audio_objects'][sound_index.toString()].pause();
	}

	if (g_settings['is_ht']) {
		g_settings['ht_object'].pause();
	}
}


function stop_AT(user_clicked = false) {

	if (!g_is_running) {
		console.log("Not running, not stopping...");
		return;
	}

	console.log("Stopping AT...");

	// Clear stop object
	if (g_settings['stop_AT_timeout_object']) {
		clearTimeout(g_settings['stop_AT_timeout_object']);
	}

	// Stop all sounds
	setTimeout(stop_sounds, 5000);

	// Stop focus change
	if (g_settings['focus_interval_object']) {
		clearInterval(g_settings['focus_interval_object']);
	}

	// Clear focus entry
	$("#focus_entry").html('&nbsp;');

	// Clear progress
	$("#kat-progress-bar").css('width', '0%');

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

	g_settings['sounds_len'] = parseInt($("#sounds-len-btn-group label.active input").val());
	g_settings['minutes_len'] = parseInt($("#minutes-len-btn-group label.active input").val());
	g_settings['is_narrator'] = $("#narrate-checkbox").is(':checked');
	g_settings['is_ht'] = $("#ht-checkbox").is(':checked');

	$("#settings-modal").modal('hide');

	init_AT();
});


$("#stop-training-button").click(function() {
	stop_AT(true);
});


$(document).ready(function() { 
	$("#stop-training-button").prop('disabled', true);
	console.log("kat is... ready?");
});
