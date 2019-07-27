
SOUNDS = [
	[ 'crickets', 'songs/crickets.mp3' ],
	[ 'piano' , 'songs/piano.mp3' ],
	[ 'waves' , 'songs/waves.mp3' ],
	[ 'bells' , 'songs/bells.mp3' ],
	[ 'birdsong' , 'songs/birdsong.mp3' ],
	[ 'bubbles' , 'songs/bubbles.mp3' ],
	[ 'chant' , 'songs/chant.mp3' ],
	[ 'childplay' , 'songs/childplay.mp3' ],
	[ 'drone' , 'songs/drone.mp3' ],
	[ 'guitar' , 'songs/guitar.mp3' ],
	[ 'talkings' , 'songs/talkings.mp3'] ,
	[ 'violin' , 'songs/violin.mp3' ], // TODO replace
	[ 'boxing' , 'songs/boxing.mp3' ],
	[ 'clock' , 'songs/clock.mp3' ],
];


var g_is_running = false;

var g_settings = {
	'sounds_len' : 0,
	'minutes_len' : 0,
	'is_narrator' : false,
	'currently_playing' : [ ],
	'audio_objects' : [ ],
	'focus_interval_object' : null,
	'current_focus' : null,
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
			$("#focus_entry").fadeOut(2000);
		}

		$("#focus_entry").html('Concentrate on ' + SOUNDS[random_focus][0]);
		$("#focus_entry").fadeIn(2000);

		if (g_settings['is_narrator']) {

			say_this('Concentrate on');

			say_this(random_focus);
		}

		g_settings['current_focus'] = random_focus;
	}
}


function play_this(song) {

	console.log("Playing " + song);

	var audio_obj = new Audio(song);

	audio_obj.volume = 0.3;
	audio_obj.play();

	g_settings['audio_objects'].push(audio_obj);

	console.log("Done with " + song);
}


function start_AT() {

	if (g_is_running) { 
		return;
	}

	console.log("Starting AT...");

	g_is_running = true;
	
	g_settings['currently_playing'] = [ ];
	g_settings['audio_objects'] = [ ];
	g_settings['current_focus'] = null;
	g_settings['focus_interval_object'] = null;

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
	
		setTimeout(play_this, 0, SOUNDS[g_settings['currently_playing'][i]][1]);
	
	}

	g_settings['focus_interval_object'] = setInterval(change_attention_focus, 15000);

	setTimeout(stop_AT, g_settings['minutes_len'] * 1000 * 60);
}


function stop_AT() {

	if (!g_is_running) {
		return;
	}

	console.log("Stopping AT...");

	for (i = 0; i < g_settings['audio_objects'].length; ++i) {

		console.log("Stopping " + g_settings['currently_playing'][i]);

		g_settings['audio_objects'][i].pause();

	}

	clearInterval(g_settings['focus_interval_object']);

	$("#focus_entry").fadeOut(2000);

	g_is_running = false;
}


$("#settings-start-button").click(function() {

	g_settings['sounds_len'] = parseInt($("#sounds-len-btn-group label.active input").val());
	g_settings['minutes_len'] = parseInt($("#minutes-len-btn-group label.active input").val());
	g_settings['is_narrator'] = $("#narrate-checkbox").is(':checked');

	$("#settings-modal").modal('hide');

	start_AT();

	$("#show-settings-button").prop('disabled', true);
	$("#stop-training-button").prop('disabled', false);
});


$("#stop-training-button").click(function() {

	stop_AT();

	$("#show-settings-button").prop('disabled', false);
	$("#stop-training-button").prop('disabled', true);
});


$(document).ready(function() { 
	console.log("Ready");
});