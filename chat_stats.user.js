// ==UserScript==
// @name        Twitch Plays Pokemon Instant Input Statistics
// @namespace   https://github.com/jpgohlke/twitch-chat-filter
// @description Instant input statistics.
// @include     http://www.twitch.tv/twitchplayspokemon
// @include     http://www.twitch.tv/twitchplayspokemon/
// @version     1.0
// @updateURL   https://raw.github.com/jpgohlke/twitch-chat-filter/master/chat_filter.user.js
// @grant       unsafeWindow
// ==/UserScript==

/* 
 * chat_stats.user.js
 *
 * Feel free to improve this script and then add your name to this following list!
 * Contributors:
 *     /u/redopium
 */
 
 
 
(function() {
    "use strict";
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
    
    var pastInputs = [];

    var TOP_THING = $("#broadcast-meta");
    $("<span style='font-weight:bold;'>Past 200 Commands</span>"+
    "<br/>"+
    "<span id='input-stats'/>"+
    "<br/>"+
    "<input id='custom-stats-code' type='text' value='anarchy/democracy'>"+
    "<span id='custom-stats'/>").insertAfter(TOP_THING);

    var __icl = CurrentChat.insert_chat_line;
    CurrentChat.insert_chat_line = function(e) { 
        for(var button in inputCounts) {
            if(CurrentChat.format_message(e).trim().match(new RegExp("^" + button + "$", "i"))) {
                inputCounts[button]++;
                pastInputs.push(button);
                while(pastInputs.length > 200)
                    inputCounts[pastInputs.shift()]--;
                break;
            }
        }
        __icl.apply(CurrentChat, [e]);
    };

    setInterval(function() {
        var stats_str = []; 
        $.each(inputCounts, function(button, count) { 
            stats_str.push(button + ": " + count);
        });
        $("#input-stats").html(stats_str.join(", "));
        var custom_code = $("#custom-stats-code").val();
        try {$("#custom-stats").html("&nbsp" + ((
            new Function("with(this) { return " + custom_code + "; }")).call(inputCounts)).toString());
        }
        catch(e) {$("#custom-stats").html("&nbsp;invalid expression");}
    }, 1000);
})();