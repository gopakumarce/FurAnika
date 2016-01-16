/*
 * This deals with the state "PLAY_HAND"
 */
 
function handDragEvent(hand) {
	var handPlayed = 0;
	var usedHandX = firstHand + boardCell;
	var usedHandY = boardTop + boardCell + cardStackSeperation;

	position = this.getPosition();
	diffX = Math.abs(position.x - usedHandX)
	diffY = Math.abs(position.y - usedHandY)

	if ((diffX < boardCell) && (diffY < boardCell)) {
        handPlayed = 1;
	}
	if (handPlayed == 1) {
		// Set the card back to question mark, the card 
		// goes back in place whether its played or not
		setUsedHand(imageFiles[handImages[hand]]);
		myHand[hand].hide();
	    myHand[hand].x(firstHand + (hand*boardCell))
	    myHand[hand].y(boardTop);
	    myHand[hand].show();
		setHand(hand, cardQuestion);
		layer.draw();
    unfilledHand = hand;
	} else {
	    myHand[hand].x(firstHand + (hand*boardCell))
	    myHand[hand].y(boardTop);
	    layer.draw();
    }
}