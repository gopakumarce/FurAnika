/*
 * This deals with the state "PLAY_HAND"
 */
 
var playHandFire = [];
var playHandBase = fireBase + "/playhand/";

function handDragEvent(hand) {
	var handPlayed = 0;
	var usedHandX = firstHand + boardCell;
	var usedHandY = boardTop + boardCell + cardStackSeperation;

	position = this.getPosition();
	diffX = Math.abs(position.x - usedHandX);
	diffY = Math.abs(position.y - usedHandY);

	if ((diffX < boardCell) && (diffY < boardCell)) {
        /*
         * Cant play unless its our turn, and cant play if card is dragon
         * and there are no opponent colored cells on the board
         */
		if ((gameState == "PLAY_HAND_SELF") &&
            ((handImages[hand] != cardDragon) || (oppColorCells > 0))) {
			handPlayed = 1;
		}
	}
	if (handPlayed == 1) {
		// Set the card back to question mark, the card 
		// goes back in place whether its played or not
		setUsedHand(handImages[hand]);
	    playHandFire[myColor].set({'time': Date.now(), 'hand': handImages[hand]});
		myHand[hand].hide();
		myHand[hand].x(firstHand + (hand*boardCell))
		myHand[hand].y(boardTop);
		myHand[hand].show();
		setHand(hand, cardQuestion);
        unfilledHand = hand;
        gameState = "IN_PLAY";
        console.log('Moving to state in-play');
	} else {
	    myHand[hand].x(firstHand + (hand*boardCell))
	    myHand[hand].y(boardTop);
	    layer.draw();
    }
}

function playHandFireEvent(snapshot) {

    console.log('Start hand event');
    console.log(snapshot.key());
    console.log(snapshot.val());

    if (snapshot.val() == null) {
        return;
    }
    if (parseInt(snapshot.key()) == myColor) {
    	console.log('ignoring own playhand');
    	return;
    }

    if (gameState == "PLAY_HAND_SELF") {
    	gameState = "PLAY_HAND_OPP";
    	console.log('Opponent made the first move');
    } else if (gameState != "PLAY_HAND_OPP") {
        console.log('Bad Game state %s in play hand event', gameState);
        return;
    }
    setOppUsedHand(imageFiles[snapshot.val()['hand']]);
}

function playHandFireInit() {
    for (var color = 0; color < maxColors; color++) {
        playHandFire[color] = new Firebase(playHandBase + color.toString());
        playHandFire[color].on("value", playHandFireEvent);
    }
} 