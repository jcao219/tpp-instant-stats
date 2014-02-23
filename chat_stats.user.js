// ==UserScript==
// @name        Twitch Plays Pokemon Instant Input Statistics
// @namespace   https://github.com/jcao219/tpp-instant-stats
// @description Instant input statistics.
// @include     http://www.twitch.tv/twitchplayspokemon
// @include     http://www.twitch.tv/twitchplayspokemon/
// @version     1.1
// @updateURL   https://raw.github.com/jcao219/tpp-instant-stats/master/chat_stats.user.js
// @grant       unsafeWindow
// ==/UserScript==

/* 
 * chat_stats.user.js
 *
 * Feel free to improve this script and then add your name to this following list!
 * Contributors:
 *     /u/redopium
 *
 * Much of the design is adapted from https://github.com/jpgohlke/twitch-chat-filter/
 * Thank you to all contributors to the above repository.
 */
 
 /* global unsafeWindow:false */ 
 
 
(function() {
"use strict";


// --- Script Configuration ---

var MAX_INPUT_HISTORY = 200;

// --- Greasemonkey loading ---

// Greasemonkey userscripts run in a separate environment and cannot use
// global variables from the page directly. We need to access them via unsafeWindow
var myWindow;
try{
    myWindow = unsafeWindow;
}catch(e){
    myWindow = window;
}

var $ = myWindow.jQuery;

// --- Display ---

var top_thing = $("#broadcast-meta");
$("<span style='font-weight:bold;'>Past "+MAX_INPUT_HISTORY+" Commands</span>"+
"<br/>"+
"<span id='input-stats'/>"+
"<br/>"+
"<input id='custom-stats-code' type='text' value='anarchy/democracy'>"+
"<span id='custom-stats'/>").insertAfter(top_thing);

// --- Main ---
var initialize_stats = function() {
    var inputCounts = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        a: 0,
        b: 0,
        start: 0,
        democracy: 0,
        anarchy: 0
    };

    // keep track of past inputs so that we can erase the oldest inputs
    var pastInputs = [];

    // keep a copy of the old insert_chat_line method so we can call it
    var __icl = myWindow.CurrentChat.insert_chat_line;

    // replace the insert_chat_line method
    myWindow.CurrentChat.insert_chat_line = function(e) { 
        for(var button in inputCounts) {
            if(e.message.trim().match(new RegExp("^" + button + "$", "i"))) {
                inputCounts[button]++;
                // erase everything older than MAX_INPUT_HISTORY
                pastInputs.push(button);
                while(pastInputs.length > MAX_INPUT_HISTORY)
                    inputCounts[pastInputs.shift()]--;
                break;
            }
        }
        // call the original insert_chat_line method
        __icl.apply(myWindow.CurrentChat, [e]);
    };
    
    // update display every 1000ms
    myWindow.setInterval(function() {
        var stats_str = []; 
        $.each(inputCounts, function(button, count) { 
            stats_str.push(button + ": " + count);
        });
        $("#input-stats").html(stats_str.join(", "));

        // try to evaluate the custom code, with the inputCounts as the context
        var custom_code = $("#custom-stats-code").val();
        try {$("#custom-stats").html("&nbsp" + ((
            new Function("with(this) { return " + custom_code + "; }")).call(inputCounts)).toString());
        }
        catch(e) {$("#custom-stats").html("&nbsp;invalid expression");}
    }, 1000);
}

$(function(){
	//Instead of testing for the existence of CurrentChat, check if the spinner is gone.
	var chatLoadedCheck = myWindow.setInterval(function () {
		if($("#chat_loading_spinner").css('display') == 'none'){
			myWindow.clearInterval(chatLoadedCheck);
			initialize_stats();
		}
	}, 100);
});
})();
