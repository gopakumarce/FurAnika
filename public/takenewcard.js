/*
 * This deals with the state "TAKE_NEW_CARD"
 */

function unusedClickEvent(){
    unfilledHand = 0;
    if (unfilledHand == -1) {
        return;      
    }
    var card = freeCards.pop();
    setHand(unfilledHand, card);
 }