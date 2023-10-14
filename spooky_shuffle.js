// ==UserScript==
// @name         MouseHunt - Spooky Shuffle Tracker
// @author       Rani Kheir
// @namespace    https://greasyfork.org/users/4271-rani-kheir
// @version      5.1
// @description  Play Spooky Shuffle more conveniently by keeping track of what you've already uncovered
// @include      https://www.mousehuntgame.com/
// @include      https://www.mousehuntgame.com/index.php
// @include      https://www.mousehuntgame.com/canvas*
// @include      https://www.mousehuntgame.com/camp.php*
// @include      https://www.mousehuntgame.com/inventory.php?tab=special
// @include      https://www.mousehuntgame.com/item.php?item_type=2014_spooky_shuffle_admission_ticket_stat_item
// @grant        none
// ==/UserScript==

function fireEvent(element, event) {
    if(element === null || element === undefined)
        return;
    var evt;
    // dispatch for firefox + others
    evt = new MouseEvent(event, {
        "bubbles": true,
        "cancelable": true
    });

    try {
        return !element.dispatchEvent(evt);
    }
    finally {
        element = null;
        event = null;
        evt = null;
    }
}

(function() {
    'use strict';

    function clearFields(length) {
        if (document.getElementById("card-hack-0")) {
            for (var i = 0; i < length; i++) {
                var ele = document.getElementById("card-hack-" + i);
                ele.style.color = "black";
                ele.firstChild.innerHTML = "-----";
            }
        }
    }

    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            try {
              var x = JSON.parse(this.responseText);
            } catch (err) {
              return false;
            }

            var ticket_count = x.memory_game.num_tickets;

            if (x.memory_game != undefined) {
                console.log(x);
                var cards = x.memory_game.cards;
                var len = x.memory_game.cards.length;

                if (x.memory_game.is_complete === true) {
                    console.log("clearing field")
                    setTimeout(function(){
                        clearFields(len);
                        if (x.memory_game.is_complete){
                            console.log("currently have " + ticket_count + " tickets");
                            if (ticket_count >= 36){
                                console.log("Restarting");
                                var restart_ele = document.getElementsByClassName("halloweenMemoryGame-deckChoiceContainer")[0]
                                if (x.memory_game.num_upgrade > 0){
                                    fireEvent(restart_ele.getElementsByClassName("mousehuntActionButton")[1], "click")
                                } else {
                                    fireEvent(restart_ele.getElementsByClassName("mousehuntActionButton")[0], "click")
                                }
                            }
                            return;
                        }
                    }, 3000);
                    return;
                }

                var board = document.getElementsByClassName("halloweenMemoryGame-content")[0];
                if (board) {
                    board.style.height = "510px";
                }
                
                setTimeout(function(){ 
                // board set up already
                if (document.getElementById("card-hack-0")) {
                    for (var i = len-1; i >= 0; i--) {
                        var curr_card = x.memory_game.cards[i];
                        var ele = document.getElementById("card-hack-" + i);
                        if (curr_card.name !== null) { // Last one that was clicked
                            console.log("Previous click was on card " + i + " which was " + curr_card.name)
                            ele.style.color = "green";
                            ele.firstChild.innerHTML = curr_card.name;
                            if (curr_card.is_matched){  // Previous click matched, click next card
                                if (i+1 == len){
                                    return;
                                }
                                console.log("Previous click was a match, clicking next card with index " + (i+1));
                                fireEvent(document.querySelector("[data-card-id='" + (i+1) + "']").children[0], "click");
                                return;
                            } else {
                                for (var j = 0; j < i; j++) {
                                    var prev_ele = document.getElementById("card-hack-" + j);
                                    if (prev_ele.firstChild.innerHTML == curr_card.name){
                                        console.log("Found match for " + curr_card.name + " at index " + j + " and clicking it");
                                        fireEvent(document.querySelector("[data-card-id='" + j + "']").children[0], "click");
                                        return;
                                    }
                                }
                            }
                            if (i+1 == len){
                                return;
                            }
                            console.log("No match, clicking next card with index " + (i+1));
                            fireEvent(document.querySelector("[data-card-id='" + (i+1) + "']").children[0], "click");
                            return;
                        } else if (ele.firstChild.innerHTML !== "-----"){   // Previous click selected a earlier card for match
                            console.log("Current card " + i + " has been exposed before but is not currently exposed, clicking");
                            fireEvent(document.querySelector("[data-card-id='" + i + "']").children[0], "click");
                            return;
                        }
                    }
                    if (ticket_count >= 36){    // Only start new game if have enough tickets
                        console.log("clicking first card")
                        fireEvent(document.querySelector("[data-card-id='" + 0 + "']").children[0], "click")
                        return;
                    }
                // new game (or reloaded board), setting up placeholders
                } else {
                    if (ticket_count >= 36){    // Only start new game if have enough tickets
                        for (var i = 0; i < len; i++) {
                            var divElement = document.createElement("Div");
                            divElement.id = "card-hack-" + i;
                            divElement.style.marginLeft = "12px";
                            divElement.style.textAlign = "center";
                            divElement.style.fontWeight = "bold";
                            divElement.style.fontSize = "smaller";
                            var paragraph = document.createElement("P");
                            var text = document.createTextNode("-----");
                            paragraph.appendChild(text);
                            divElement.appendChild(paragraph);
                            document.querySelector("[data-card-id='" + i + "']").appendChild(divElement);
                        }
                        console.log("clicking first card")
                        fireEvent(document.querySelector("[data-card-id='" + 0 + "']").children[0], "click")
                        return;
                    }
                }
                }, 1000 + Math.random()*500);
            }
        });
        origOpen.apply(this, arguments);
    };
})();