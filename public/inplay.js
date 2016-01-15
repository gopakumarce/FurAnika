/*
 * This deals with the state "IN_PLAY"
 */

 function cellClickEvent(row, column){
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
    cellSetColor(row, column, myColor);
 }