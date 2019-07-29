
SOUNDS = [
	[ 'crickets', 'songs/crickets.mp3', 'tts/crickets.mp3', 0.8 ],
	[ 'piano' , 'songs/piano.mp3', 'tts/piano.mp3', 0.5 ],
	[ 'waves' , 'songs/waves.mp3', 'tts/waves.mp3', 0.5 ],
	[ 'bells' , 'songs/bells.mp3', 'tts/bells.mp3', 0.3 ],
	[ 'birdsong' , 'songs/birdsong.mp3', 'tts/birdsong.mp3', 0.5 ],
	[ 'bubbles' , 'songs/bubbles.mp3', 'tts/bubbles.mp3', 0.4 ],
	[ 'chant' , 'songs/chant.mp3', 'tts/chant.mp3', 0.4 ],
	[ 'childplay' , 'songs/childplay.mp3', 'tts/childplay.mp3', 0.4 ],
	[ 'drone' , 'songs/drone.mp3', 'tts/drone.mp3', 0.6 ],
	[ 'guitar' , 'songs/guitar.mp3', 'tts/guitar.mp3', 0.5 ],
	[ 'talkings' , 'songs/talkings.mp3', 'tts/talkings.mp3', 0.5] ,
	[ 'violin' , 'songs/violin.mp3', 'tts/violin.mp3', 0.5 ],
	[ 'boxing' , 'songs/boxing.mp3', 'tts/boxing.mp3', 0.7 ],
	[ 'clock' , 'songs/clock.mp3', 'tts/clock.mp3', 0.9 ],
	[ 'floor cracking' , 'songs/floor.mp3', 'tts/floor.mp3', 0.9 ],
	[ 'typing' , 'songs/typing.mp3', 'tts/typing.mp3', 0.9 ],
	[ 'sheep' , 'songs/sheep.mp3', 'tts/sheep.mp3', 0.4 ],
	[ 'traffic' , 'songs/traffic.mp3', 'tts/traffic.mp3', 0.5 ],
	[ 'harp' , 'songs/harp.mp3', 'tts/harp.mp3', 0.7 ],
];


var g_is_running = false;

var g_settings = {
	'sounds_len' : 0,
	'minutes_len' : 0,
	'is_narrator' : false,
	'currently_playing' : [ ],
	'audio_objects' : [ ],
	'tts_objects' : { },
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


function say_this(word) {

	console.log("Saying: " + word);

	// get all voices that browser offers
	var available_voices = window.speechSynthesis.getVoices();

	// this will hold an english voice
	var english_voice = '';

	// find voice by language locale "en-US"
	// if not then select the first voice
	for(var i=0; i<available_voices.length; i++) {
		if(available_voices[i].lang === 'en-US') {
			english_voice = available_voices[i];
			break;
		}
	}
	if(english_voice === '')
		english_voice = available_voices[0];

	// new SpeechSynthesisUtterance object
	var utter = new SpeechSynthesisUtterance();
	utter.rate = 0.9;
	utter.pitch = 0.3;
	utter.text = word;
	utter.voice = english_voice;

	// speak
	window.speechSynthesis.speak(utter);
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

	song_name = SOUNDS[sound_index][0]; 
	song_url = SOUNDS[sound_index][1];
	song_tts_url = SOUNDS[sound_index][2];
	song_volume_factor = SOUNDS[sound_index][3];

	console.log("Playing " + song_name);

	var audio_obj = new Audio(song_url);

	audio_obj.loop = true;
	audio_obj.volume = song_volume_factor;
	audio_obj.play();

	console.log("Downloading " + song_tts_url);
	var tts_obj = new Audio(song_tts_url);

	g_settings['audio_objects'].push(audio_obj);
	g_settings['tts_objects'][sound_index] = tts_obj;

	console.log("Done with " + song_name);
}


function start_AT() {

	if (g_is_running) { 
		return;
	}

	console.log("Starting AT...");

	g_is_running = true;
	
	g_settings['currently_playing'] = [ ];
	g_settings['audio_objects'] = [ ];
	g_settings['tts_objects'] = { };
	g_settings['current_focus'] = null;
	g_settings['focus_interval_object'] = null;
	g_settings['current_progress'] = 0;
	g_settings['progress_interval_object'] = null;
	g_settings['stop_AT_timeout_object'] = null;

	i = 0;

	while (i < g_settings['sounds_len']) {

		random_sound_pos = Math.floor(Math.random() * SOUNDS.length);

		if (!g_settings['currently_playing'].includes(random_sound_pos)) {

			g_settings['currently_playing'].push(random_sound_pos);

			i += 1;

			console.log("Selected " + SOUNDS[random_sound_pos][0]);
		}
	}

	for (i = 0; i < g_settings['sounds_len']; ++i) {
		setTimeout(play_this, 0, g_settings['currently_playing'][i]);
	}

	g_settings['focus_interval_object'] = setInterval(change_attention_focus, 21078);

	g_settings['stop_AT_timeout_object'] = setTimeout(stop_AT, g_settings['minutes_len'] * 1000 * 60);

	g_settings['progress_interval_object'] = setInterval(progress_bar, 1000);

	if (g_settings['is_narrator']) {
		g_settings['narration_audio_objects']['start'].play();
	}

	setTimeout(change_attention_focus, 3000);

	$("#show-settings-button").prop('disabled', true);
	$("#stop-training-button").prop('disabled', false);
}


function stop_AT() {

	if (!g_is_running) {
		return;
	}

	console.log("Stopping AT...");

	if (g_settings['stop_AT_timeout_object']) {
		clearTimeout(g_settings['stop_AT_timeout_object']);
	}

	for (i = 0; i < g_settings['audio_objects'].length; ++i) {

		console.log("Stopping " + SOUNDS[g_settings['currently_playing'][i]][0]);

		g_settings['audio_objects'][i].pause();
	}

	if (g_settings['focus_interval_object']) {
		clearInterval(g_settings['focus_interval_object']);
	}

	$("#focus_entry").html('&nbsp;');

	$("#kat-progress-bar").css('width', '0%');

	if (g_settings['is_narrator']) {
		g_settings['narration_audio_objects']['end'].play();
	}

	$("#show-settings-button").prop('disabled', false);

	$("#stop-training-button").prop('disabled', true);

	g_is_running = false;
}


$("#settings-start-button").click(function() {

	g_settings['sounds_len'] = parseInt($("#sounds-len-btn-group label.active input").val());
	g_settings['minutes_len'] = parseInt($("#minutes-len-btn-group label.active input").val());
	g_settings['is_narrator'] = $("#narrate-checkbox").is(':checked');

	$("#settings-modal").modal('hide');

	start_AT();
});


$("#stop-training-button").click(function() {
	stop_AT();
});


$(document).ready(function() { 
	$("#stop-training-button").prop('disabled', true);
	console.log("Ready");
});