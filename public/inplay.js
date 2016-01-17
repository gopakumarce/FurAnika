/*
 * This deals with the state "IN_PLAY"
 */

var inPlayFire = [];
var inPlayBase = fireBase + "/inplay/";

function cellClickEvent(row, column){

    if (gameState != "IN_PLAY") {
        console.log("No point clicking on cell in state %s", gameState);
        return;
    }
    if (usedHandImage == -1) {
        console.log("No used hand yet to try clicking on a cell");
        return;
    }

 	/*
 	 * Ignore the "free" spots
 	 */
 	if ((row == 0) && (column == 0)) {
 		return
 	}
 	if ((row == 0) && (column == 6)) {
 		return
 	} 	
 	if ((row == 5) && (column == 0)) {
 		return
 	}
  	if ((row == 5) && (column == 6)) {
 		return
 	}
    /*
     * Drag "uncolors" opponents cells, but we cant uncolour our own colour
     * or an uncoloured (free) cell
     */
    if (usedHandImage == cardDragon) {
        if ((boardNodeColor[row][column] == -1) || (boardNodeColor[row][column] == myColor)) {
            return;
        }
        cellSetColor(rown, column, -1);
        return;
    }
    /*
     * If card is not a unicorn, the the cell picked should exactly match 
     * the card we just picked (usedHand)
     */
    if (usedHandImage != cardUnicorn) {
        if (boardImages[row][column] != usedHandImage) {
            return;
        }
    }
    /*
     * We cant pick a cell thats already picked
     */
    if (boardNodeColor[row][column] != -1) {
        return;
    }

    cellSetColor(row, column, myColor);
    inPlayFire[myColor].set({'row': row, 'column': column, color: 'myColor'});
    gameState = "TAKE_NEW_CARD";
    console.log('moving to take new card');
}

function inPlayFireEvent(snapshot) {

    console.log('in play event start');
    console.log(snapshot.key());
    console.log(snapshot.val());

    if (snapshot.val() == null) {
        return;
    }
    if (parseInt(snapshot.key()) == myColor) {
        console.log('Ignore own in play');
        return;
    }
    if (gameState != "PLAY_HAND_OPP") {
        console.log('Bad state %s for in play event', gameState);
        return;
    }

    row = snapshot.val()['row'];
    column = snapshot.val()['column'];
    color = snapshot.val()['color'];

    cellSetColor(row, column, color);    
}

function inPlayFireInit() {
    for (var color = 0; color < maxColors; color++) {
        inPlayFire[color] = new Firebase(inPlayBase + color.toString());
        inPlayFire[color].on("value", inPlayFireEvent);
    }
} 