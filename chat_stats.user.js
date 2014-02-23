// ==UserScript==
// @name        Twitch Plays Pokemon Instant Input Statistics
// @namespace   https://github.com/jcao219/tpp-instant-stats
// @description Instant input statistics.
// @include     http://www.twitch.tv/twitchplayspokemon
// @include     http://www.twitch.tv/twitchplayspokemon/
// @version     1.2
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
var UPDATE_INTERVAL = 500; // ms

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

$("<style type='text/css'>"+
".chart div div {"+
"  font: 10px sans-serif;"+
"  background-color: steelblue;"+
"  text-align: right;"+
"  margin: 0px;"+
"  color: white;"+
"  display: inline-block;"+
"}"+
".chart div span {"+
"  font: 10px sans-serif;"+
"  width: 50px;"+
"  padding-right: 2px;"+
"  text-align: right;"+
"  display: inline-block;"+
"}"+
".chart div {"+
"  font: 10px sans-serif;"+
"  width: 100%;"+
"  margin: 2px;"+
"  white-space:nowrap;"+
"}"+
"</style>").appendTo("head");

var top_thing = $(".dynamic-player");
$("<span style='font-weight:bold;'>Latest "+MAX_INPUT_HISTORY+" Commands</span>"+
"<div class='chart' id='input-stats'/>").insertAfter(top_thing);

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
    
    // update display every 500ms
    myWindow.setInterval(function() {
        var stats_str = []; 
        $.each(inputCounts, function(button, count) { 
            stats_str.push("<div><span>"+button+"</span><div style='width: " + Math.max(count*5, 4) + "px;'>" + count + "</div></div>");
        });
        $("#input-stats").html(stats_str.join(""));
    }, UPDATE_INTERVAL);
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
