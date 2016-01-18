/*
 * This deals with the state "TAKE_NEW_CARD"
 */

var takeNewFire = [];
var takeNewBase = fireBase + "/takenew/";

function unusedClickEvent(){
    if (gameState != "TAKE_NEW_CARD") {
        console.log('cant take new card in state %s', gameState);
        return;
    }

    if (unfilledHand == -1) {
        return;      
    }
    var card = freeCards.pop();
    setHand(unfilledHand, card);
    gameState = "PLAY_HAND_OPP";
    // We shouldnt be sending card to the opponent ;)
    takeNewFire[myColor].set({'time': Date.now(), 'card' : card});
    console.log('moving to PLAY_HAND_OPP');
}

function takeNewFireEvent(snapshot) {

    console.log('take new event start');
    console.log(snapshot.key());
    console.log(snapshot.val());

    if (snapshot.val() == null) {
        return;
    }
    if (parseInt(snapshot.key()) == myColor) {
        console.log('Ignore own take new');
        return;
    }

    if (gameState != "PLAY_HAND_OPP") {
        console.log('bad state %s for take new event', gameState);
        return;
    }
    //TODO: Check for freeCards being empty ??

    /*
     * Now its our turn (finally !!)
     */
    gameState = "PLAY_HAND_SELF";
    console.log('moving to PLAY_HAND_SELF');
}

function takeNewFireInit() {
    for (var color = 0; color < maxColors; color++) {
        takeNewFire[color] = new Firebase(takeNewBase + color.toString());
        takeNewFire[color].on("value", takeNewFireEvent);
        takeNewFire[color].onDisconnect().remove();
    }
} 