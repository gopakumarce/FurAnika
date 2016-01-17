/*
 * This deals with the state "CHOOSE_COLOR"
 */

var chooseColorFire = [];
var chooseColorBase = fireBase + "/choosecolor/";
var initialHandFire = [];
var initialHandBase = fireBase + "/inithand/";
var selfInitHands = 0;
var oppInitHands = 0;

function chooseColorFireEvent(snapshot) {

    console.log('Start color event');
    console.log(snapshot.key());
    console.log(snapshot.val());

    if (gameState != "CHOOSE_COLOR") {
        console.log('Bad state %s to get color event %s', gameState, snapshot.val());
        return;
    }
    if (parseInt(snapshot.key()) == myColor) {
        console.log('Ignoring own color');
        return;
    }
    if (snapshot.val() == null) {
        console.log('null val in color event');
        return;
    }
    /*
     * TODO: Assumes only two players
     */
    oppColor = parseInt(snapshot.key());

    /*
     * Ok, so we have the smaller color, we start distributing the 
     * initial hand.
     */
    if ((myColor != -1) && (myColor < oppColor)) {
        distributeInitialHand();
    }
}

function distributeInitialHand() {
    var hand = 0;
    for (var i = 0; i < boardHands; i++) {
        hand = freeCards.pop();
        /*
         * Sending events one by one here, can explore how to send as bunch
         */
        setHand(i, hand);
        initialHandFire[myColor].set(hand);
    }
    selfInitHands = boardHands;
}

/*
 * Whenever we extend this to more than two players, we will distribute three
 * three cards each starting from the lowest color going higher
 */
function initialHandFireEvent(snapshot) {

    console.log('Start inithand event');
    console.log(snapshot.key());
    console.log(snapshot.val());

    if (gameState != "CHOOSE_COLOR") {
        console.log('Bad state %s to get initHand event %s', gameState, snapshot.val());
        return;
    }
    if (parseInt(snapshot.key()) == myColor) {
        console.log('Ignoring own inithand');
        return;
    }
    if (snapshot.val() == null) {
        console.log('null val in init hand event');
        return;
    }

    /* 
     * Distributing cards is done from top of the stack by popping, so we
     * do a pop here also since the stack is kept identical on all clients
     */
    freeCards.pop();

    /*
     * TODO: Again, we are assuming only one opponent.
     */
    oppInitHands++;
    if ((oppInitHands == boardHands) && (myColor > oppColor)) {
        distributeInitialHand();
    }
    /*
     * Both parties have all cards distributed, now we are ready to play.
     */
    if ((oppInitHands == boardHands) && (selfInitHands == boardHands)) {
        gameState = "PLAY_HAND_SELF";  
        console.log('Transition to play-hand-self');
    }
}

function chooseColorFireInit() {
    console.log('color fire init');
    for (var color = 0; color < maxColors; color++) {
        chooseColorFire[color] = new Firebase(chooseColorBase + color.toString());
        chooseColorFire[color].on("value", chooseColorFireEvent);
        initialHandFire[color] = new Firebase(initialHandBase + color.toString());
        initialHandFire[color].on("value", initialHandFireEvent);
    }
} 

function chooseColor(color) {
    console.log('set color %d', color);
    myColor = color;
    /*
     * value here doesnt matter, the event handler checks only for the key
     */
    chooseColorFire[color].set(color);

    /*
     * Our color was not chosen yet when opponent color was chosen, so the
     * color event callback wouldnt have triggerd hand-distribution.
     */
    if (myColor < oppColor) {
        distributeInitialHand();
    }
}

