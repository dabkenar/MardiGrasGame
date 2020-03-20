////  Page-scoped globals  ////

// Counters
let throwingItemIdx = 1;
let throwingItemTracker = [];
let gameScore = 0;
let beadCount = 0;
let candyCount = 0;
let gamerMode = false;

// Size Constants
const FLOAT_1_WIDTH = 149;
const FLOAT_2_WIDTH = 101;
const FLOAT_SPEED = 2;
const PERSON_SPEED = 25;
const OBJECT_REFRESH_RATE = 50;  //ms
const SCORE_UNIT = 100;  // scoring is in 100-point units

// Size vars
let maxPersonPosX, maxPersonPosY;
let maxItemPosX;
let maxItemPosY;

// Global Window Handles (gwh__)
let gwhGame, gwhStatus, gwhScore;
let gwhBeads, gwhCandy;

// Global Object Handles
let player;
let paradeRoute;
let paradeFloat1;
let paradeFloat2;
let paradeTimer;

/*
 * This is a handy little container trick: use objects as constants to collect
 * vals for easier (and more understandable) reference to later.
 */
const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  shift: 16,
  spacebar: 32
};

let createThrowingItemIntervalHandle;
let currentThrowingFrequency = 2000;

////  Functional Code  ////

// Main
$(document).ready( function() {
  console.log("Ready!");

  maxItemPosX = $('.game-window').width() - 50;
  maxItemPosY = $('.game-window').height() - 40;
  // Set global handles (now that the page is loaded)
  gwhGame = $('#actualGame');
  gwhStatus = $('.status-window');
  gwhScore = $('#score-box');
  gwhBeads = $('#beadsCounter');
  gwhCandy = $('#candyCounter');
  player = $('#player');  // set the global player handle
  paradeRoute = $("#paradeRoute");
  paradeFloat1 = $("#paradeFloat1");
  paradeFloat2 = $("#paradeFloat2");

  // Set global positions
  maxPersonPosX = $('.game-window').width() - player.width();
  maxPersonPosY = $('.game-window').height() - player.height();

  //$(window).keydown(keydownRouter);
  
  // Periodically check for collisions
  setInterval( function() {
    checkCollisions();
  }, 100);

  startParade();

  //createThrowingItemIntervalHandle = setInterval(throwObject, currentThrowingFrequency);
});


function keydownRouter(e) {
  switch (e.which) {
    case KEYS.shift:
      break;
    case KEYS.spacebar:
      break;
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      movePerson(e.which);
      break;
    default:
      console.log("Invalid input!");
  }
}

function checkCollisions() {

}

function checkPickUp() {
  for (let i = 1; i <= throwingItemIdx; i++) {
    if (throwingItemTracker[i-1] === 1) {
      let throwingItem = $('#i-' + i);
      if (isColliding(player, throwingItem)) {
        handleRemovals(i, true);
      } //if isColliding
    } //if item Exists
  } //For throwingItemIDX
} //checkPickUp

function throwObject() {
  if (parseInt(paradeFloat2.css('left')) + 70 > maxItemPosX) {
    return;
  }
  let roll = Math.floor(getRandomNumber(1,4));
  if (roll == 2) {
    createThrowingItem(throwingItemIdx, "candy");
  }
  else if (gamerMode && roll == 3) {
    createThrowingItem(throwingItemIdx, "mask");
  }
  else {
    createThrowingItem(throwingItemIdx, "beads");
  }
}

function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

function willCollide(o1, o2, o1_xChange, o1_yChange){
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

function isOrWillCollide(o1, o2, o1_xChange, o1_yChange){
  const o1D = { 'left': o1.offset().left + o1_xChange,
        'right': o1.offset().left + o1.width() + o1_xChange,
        'top': o1.offset().top + o1_yChange,
        'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = { 'left': o2.offset().left,
        'right': o2.offset().left + o2.width(),
        'top': o2.offset().top,
        'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
     // collision detected!
     return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max){
  return (Math.random() * (max - min)) + min;
}

function handleRemovals(objectID, pickup){
  let throwingItem = $("#i-" + objectID);

  if (pickup) {
    throwingItem.css("background", "yellow");
    throwingItem.css("border-radius", 30);
    graduallyFadeAndRemoveElement(throwingItem, "pickup");
    throwingItemTracker[objectID - 1] = 0;
    if (throwingItem.attr("class") == "candy") {
      candyCount++;
      gwhCandy.text(candyCount);
      gameScore += SCORE_UNIT;
      gwhScore.text(gameScore);
    }
    else if (throwingItem.attr("class") == "mask") {
      console.log("Mask pickup");
      gameScore -= 2 * SCORE_UNIT;
      gwhScore.text(gameScore);
    }
    else {
      beadCount++;
      gwhBeads.text(beadCount);
      gameScore += SCORE_UNIT;
      gwhScore.text(gameScore);
    }
  }
  else {
    setTimeout(function() {
      graduallyFadeAndRemoveElement(throwingItem, "timeout");
      throwingItemTracker[objectID - 1] = 0;
    }, 5000);
  }
}

function createThrowingItem(itemIndex, type){
  $("#actualGame").append(createItemDivString(itemIndex, type, type + ".png"));
  let throwingItemImage = $("#i-" + itemIndex).children('img');
  let throwingItem = $("#i-" + itemIndex);

  let xPos = parseInt(paradeFloat2.css('left')) + 50;
  throwingItem.css('position', 'absolute');
  throwingItem.css('left', xPos);
  throwingItem.css('top', 230);

  if (type == "candy") {
    throwingItemImage.width(46);
  }
  else {
  throwingItemImage.width(40);
  }
  throwingItemImage.height(40);
  let xChange = getRandomNumber(-40, 40);
  let yChange = getRandomNumber(-40, 60);
  updateThrownItemPosition(throwingItemIdx, xChange, yChange, 5);
  throwingItemTracker.push(1);
  handleRemovals(throwingItemIdx, false);
  throwingItemIdx++;
}

function checkFloatReset() {
  if (parseInt(paradeFloat1.css('left')) > maxItemPosY - 10) {
    paradeFloat2.css('left', -90);
    paradeFloat1.css('left', -240);
  }
}

function moveFloat(float) {
  if (!isOrWillCollide(paradeFloat2, player, FLOAT_SPEED, 0)) {
    let newPos = parseInt(float.css('left')) + FLOAT_SPEED;
    float.css('left', newPos);
  }
}

// throwingItemIdx - index of the item (a unique identifier)
// type - beads or candy
// imageString - beads.png or candy.png
function createItemDivString(itemIndex, type, imageString){
  return "<div id='i-" + itemIndex + "' class='" + type + "'><img src='img/" + imageString + "'/></div>";
}

function updateThrownItemPosition(objectID, xChange, yChange, iterationsLeft){
  let throwingItem = $("#i-" + objectID);
  if (parseInt(throwingItem.css('left')) + xChange > maxItemPosX ||
      parseInt(throwingItem.css('top')) + yChange > maxItemPosY) {
    iterationsLeft = 0;
  }
  if (iterationsLeft > 0) {
    let xPos = parseInt(throwingItem.css('left')) + xChange;
    let yPos = parseInt(throwingItem.css('top')) + yChange;
    throwingItem.css('left', xPos);
    throwingItem.css('top', yPos);
    
    setTimeout(
      function() {
        updateThrownItemPosition(objectID, xChange, yChange, iterationsLeft - 1);
      }, 50
    );
  }
}

function graduallyFadeAndRemoveElement(elementObj, method){
  if (method == "timeout") {
    // Fade to 0 opacity over 2 seconds
    elementObj.fadeTo(2000, 0, function(){
      $(this).remove();
    });
  }
  else if (method == "pickup") {  
    elementObj.fadeTo(500, 0, function(){
      $(this).remove();
    });
  }
}

function updateThrownItems() {
  setInterval(function() {
  }, 50);
}

function updateSettingsPanel(updateRequest) {
  if (updateRequest) { //Change throwing frequency
    let argument = parseInt($("#throwFreq").val());
    if (argument == $("#throwFreq").val() &&
        argument >= 100) {
          clearInterval(createThrowingItemIntervalHandle);
          currentThrowingFrequency = argument;
          createThrowingItemIntervalHandle = setInterval(throwObject, currentThrowingFrequency);
    }
    else {
      alert("Frequency must be a number greater than or equal to 100");
      showSettingsPanel();
      return;
    }
  }
  document.getElementById("throwFreq").value = currentThrowingFrequency;
  $("#open-panel").hide();
  $("#settings-button").show();
}

function showSettingsPanel() {
  $("#open-panel").show();
  $("#settings-button").hide();
}

function enableGamerMode() {
  console.log("gamer mode enabled");
  gamerMode = true;
}

function disableGamerMode() {
  console.log("gamer mode disabled");
  gamerMode = false;
}

function generateSettingsPanel() {
  console.log("hello world");

  let panelContent = "<span id='open-settings'>Item thrown from parade float every<form><input type='text' id='throwFreq' value='2000'>milliseconds (min allowed value: 100)</span>";
  let saveContent = "<p></p><input id='save-button' type='submit' onclick='updateSettingsPanel(true)' value='Save and close settings panel'</form>";
  let discardContent = "<button id='discard-button' type='button' onclick='updateSettingsPanel(false)'>Discard and close settings panel</button>";
  let gamerContent = "<span id='gamer-mode'>Curse of the Mask:<button id='gamer-enable' type='button' onclick='enableGamerMode()'>Enable</button><button id='gamer-disable' type='button' onclick='disableGamerMode()'>Disable</button></span>";
  $("#open-panel").append(panelContent);
  $("#open-panel").append(gamerContent);
  $("#open-panel").append(saveContent);
  $("#open-panel").append(discardContent);
  $("#open-panel").hide();
}

function generateSplashScreen() {
  let splashScreen = "<div id='splash-screen'>Mardi Gras Parade!</div>";
  $('.game-window').append(splashScreen);
  splashScreen = $('#splash-screen');
  splashScreen.css("font-size", "xx-large");
  splashScreen.css("font-style", "italic");
  splashScreen.css("text-align", "center");
  $('.game-window').css("line-height", 17);
  splashScreen.css("vertical-align", "middle");
  $('#actualGame').hide();
}

function startParade(){
  console.log("Starting parade...");
  generateSplashScreen();
  generateSettingsPanel();
  setTimeout(function() {
    $("#actualGame").show();
    $('#splash-screen').hide();
    paradeTimer = setInterval( function() {
      // (Depending on current position) update left value for each parade float
      moveFloat(paradeFloat1);
      moveFloat(paradeFloat2);
      checkFloatReset();
      checkPickUp();
    }, OBJECT_REFRESH_RATE);
    createThrowingItemIntervalHandle = setInterval(throwObject, currentThrowingFrequency);
    $(window).keydown(keydownRouter);
  }, 3000);
}

// Handle player movement events
function movePerson(arrow) {
  
  switch (arrow) {
    case KEYS.left: { // left arrow
      let newPos = parseInt(player.css('left'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      if (!willCollide(paradeFloat2, player, PERSON_SPEED, 0) &&
          !willCollide(paradeFloat1, player, PERSON_SPEED, 0)) {
        player.css('left', newPos);
      }
      break;
    }
    case KEYS.right: { // right arrow
      let newPos = parseInt(player.css('left'))+PERSON_SPEED;
      if (newPos > maxPersonPosX) {
        newPos = maxPersonPosX;
      }
      if (!isOrWillCollide(paradeFloat1, player, -PERSON_SPEED, 0)) {
            player.css('left', newPos);
          }
      break;
    }
    case KEYS.up: { // up arrow
      let newPos = parseInt(player.css('top'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      if (!willCollide(paradeFloat2, player, 0, PERSON_SPEED) &&
          !willCollide(paradeFloat1, player, 0, PERSON_SPEED)) {
        player.css('top', newPos);
      }
      break;
    }
    case KEYS.down: { // down arrow
      let newPos = parseInt(player.css('top'))+PERSON_SPEED;
      if (newPos > maxPersonPosY) {
        newPos = maxPersonPosY;
      }
      if (!willCollide(paradeFloat2, player, 0, -PERSON_SPEED) &&
          !willCollide(paradeFloat1, player, 0, -PERSON_SPEED)) {
        player.css('top', newPos);
      }
      break;
    }
  }
}