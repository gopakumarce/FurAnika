/*
 * The main file for the game. Has many global vars etc..
 *  which will be accessed from other files
 */

var width = window.innerWidth;
var height = window.innerHeight;

/*
 * The actual play baord related parameters. The board is a 7-column
 * 6-row board
 */
var boardRows = 6;
var boardColumns = 7;
var boardHands = 3; // Number of cards in my hand
var boardTop = 8; // Start 8 pixels from top
var boardLeft = 8;  // Start 8 pixels from left
var boardToHandSpace = 4;
var myColor = -1;
var oppColor = -1;
var oppColorCells = 0;

/* 
 * forumla is as below, leaving boardToHandSpace between board and the hand (boardHands)
 * width = boardLeft + boardColumns*boardCellWide + boardToHandSpace + 
 *         boardHands*boardCellWide + boardLeft
 */
var boardCellWide = Math.floor((width - (boardToHandSpace+2*boardLeft))/(boardColumns+boardHands));
/*
 * Leave boardTop space above and below
 */
var boardCellHigh = Math.floor((height - 2*boardTop)/boardRows);
var boardCell = Math.min(boardCellWide,boardCellHigh);
var firstHand = boardLeft + boardColumns*boardCell + boardToHandSpace*boardLeft;
var startButtons = document.getElementById('start-buttons');

/*
 * The three hands are in a row next to each other, the usedHands are right
 * below that and opponent's oppUsedHands are below that and unusedCards below that,
 * all equally spaced from the top and bottom and between each of them
 * so the spacing formula is boardRows*boardCell = (3*space + 4*boardCell)
 */
var cardStackSeperation = Math.floor((boardRows*boardCell - 4*boardCell)/3);

/*
 * 0 to 18 are animals, 19 is FREE spot
 */
var boardImages = [
              [19, 09, 17, 16, 15, 00, 19], 
              [18, 07, 01, 13, 03, 04, 12], 
              [11, 08, 02, 05, 10, 14, 06], 
              [12, 13, 14, 15, 16, 17, 18], 
              [05, 06, 07, 08, 09, 03, 11], 
              [19, 00, 01, 02, 10, 04, 19]
             ];                

/*
 * 20 is the symbol for deck of cards, 21 for dragon, 22 for unicorn, 23 for question mark
 */
var cardDeck = 20;
var cardDragon = 21;
var cardUnicorn = 22;
var cardQuestion = 23;

var imageFiles = ['images/tiger.jpg', 'images/kangaroo.jpg', 'images/giraffe.jpg', 'images/fox.jpg', 'images/tortoise.jpg', 'images/hippo.jpg',
                  'images/monkey.jpg', 'images/zebra.jpg', 'images/alligator.jpg', 'images/lion.jpg', 'images/wolf.jpg', 'images/moose.jpg',
                  'images/panda.jpg', 'images/shark.jpg', 'images/camel.jpg', 'images/ostrich.jpg', 'images/dolphin.jpg', 'images/elephant.jpg',
                  'images/penguin.jpg', 'images/free.png', 'images/deck.jpg', 'images/dragon.jpg', 'images/unicorn.jpg', 'images/question.jpg'];

var allCards = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22,
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22];
var freeCards = [];
var totalCards = 42; 

var fireBase = "https://furanikasequence.firebaseio.com/";

var colors = ['green', 'blue', 'yellow', 'red'];
var maxColors = 4;
var greenColor = 0;
var blueColor = 1;
var yellowColor = 2;
var redColor = 3;
var handImages = [cardQuestion, cardQuestion, cardQuestion]; // all question marks
var gameState = 'CHOOSE_COLOR'; // The starting state
var unfilledHand = -1;
var usedHandImage = -1;

/*
 * Uninitialized globals, will be initialized later
*/
var stage;
var group;
var layer;
var boardImageObjs = [];
var boardNodeObjs = [];
var boardNodeColor = [];
var myHand = [];
var usedHand;
var unusedCards;
var oppUsedHand;

function initCanvas() {
    stage = new Konva.Stage({
      container: 'container',
      width: width,
      height: height
    });

    layer = new Konva.Layer();

    /*
    * create a group which will be used to combine
    * multiple simple shapes.  Transforming the group will
    * transform all of the simple shapes together as
    * one unit
    */
    group = new Konva.Group({
        x: boardLeft,
        y: boardTop,
        rotation: 0
    });

    layer.add(group);
    stage.add(layer);
}

function cellSetColor(row, column, color){
    boardNodeColor[row][column] = color;
    var oneCell = boardNodeObjs[row][column];
    oneCell.cache();
    oneCell.filters([Konva.Filters.RGB]);
    switch (color) {
        case greenColor: //green
            oneCell.green(300);
            break;  
        case blueColor: //blue
            oneCell.green(200);
            oneCell.blue(300);
            break;        
        case yellowColor: //yellow
            oneCell.green(300);
            oneCell.red(300);
            break;                          
        case redColor: //red
            oneCell.green(50);
            oneCell.blue(50);
            oneCell.red(300);
            break;   
    }
    oneCell.draw();
}

function reSetCell(row, column) {
    boardNodeColor[row][column] = -1;
    boardNodeObjs[row][column].off('click');
    boardNodeObjs[row][column].destroy();
    boardNodeObjs[row][column] = null;
    cellImageSpecific = cellImage.bind(null, row, column)
    boardImageObjs[row][column] = new Image();
    boardImageObjs[row][column].onload = cellImageSpecific;
    boardImageObjs[row][column].src = imageFiles[boardImages[row][column]];
    if (boardImageObjs[row][column].complete) {
        $(boardImageObjs[row][column]).load();
    }

}

function cellImage(row, column) {
    var cell = new Konva.Image({
        x: boardLeft + (column * boardCell),
        y: boardTop + (row * boardCell),
        image: boardImageObjs[row][column],
        width: boardCell-1,
        height: boardCell-1,
        stroke: 'black',
        strokeWidth: 1,
    });
    cell.cache();
    group.add(cell);
    cell.draw();
    boardNodeObjs[row][column] = cell;
    cell.on('click', cellClickEvent.bind(cell, row, column));
}

function initBoard() {
    for(var row = 0; row < boardRows; row++) {
        boardImageObjs[row] = [];
        boardNodeObjs[row] = [];
        boardNodeColor[row] = [];
        for(var column = 0; column < boardColumns; column++) {
            boardNodeColor[row][column] = -1;
            cellImageSpecific = cellImage.bind(null, row, column)
            boardImageObjs[row][column] = new Image();
            boardImageObjs[row][column].onload = cellImageSpecific;
            boardImageObjs[row][column].src = imageFiles[boardImages[row][column]];
            if (boardImageObjs[row][column].complete) {
                $(boardImageObjs[row][column]).load();
            }
        }
    }
}

function setHand(hand, imgIndex) {
    var image = new Image();
    var imageSrc = imageFiles[imgIndex];
    handImages[hand] = imgIndex;
    image.onload = function () {
        myHand[hand].image(image);
        myHand[hand].draw();
        layer.draw();
    }    
    image.src = imageSrc;
    if (image.complete) {
        $(image).load();
    }
    if (imgIndex == cardQuestion) {
        myHand[hand].draggable(false);
    } else {
        myHand[hand].draggable(true);
    }
}

function initHand(startWithHands) {
    for (var hand = 0; hand < boardHands; hand++) {
        myHand[hand] = new Konva.Image({
            x: firstHand + (hand*boardCell),
            y: boardTop,
            width: boardCell-1,
            height: boardCell-1,
            stroke: 'black',
            strokeWidth: 1,
            draggable: true            
        });
        // Start with empty hand
        layer.add(myHand[hand]);
        myHand[hand].setZIndex(1);
        if (!startWithHands) {
            setHand(hand, cardQuestion);
        }
        myHand[hand].on('dragend', handDragEvent.bind(myHand[hand], hand));
    }
    if (startWithHands) {
        distributeInitialHand();
    }
}

function setUsedHand(imageId) {
    usedHandImage = imageId;
    var image = new Image();
    image.onload = function () {
        usedHand.image(image)
        usedHand.draw();
    }    
    image.src = imageFiles[imageId];
    if (image.complete) {
        $(image).load();
    }
}

function initUsedHand() {
    /*
     * Align this in the middle below the second of the three hands (0, 1, 2)
     */
    usedHand = new Konva.Image({
            x: firstHand + boardCell,
            y: boardTop + boardCell + cardStackSeperation,
            width: boardCell-1,
            height: boardCell-1,
            stroke: 'black',
            strokeWidth: 1});
    layer.add(usedHand);
    usedHand.setZIndex(-1);
    setUsedHand(cardQuestion);
}

function setUnusedCards(imageSrc) {
    var image = new Image();
    image.onload = function () {
        unusedCards.image(image);
        unusedCards.draw();
    }    
    image.src = imageSrc;
    if (image.complete) {
        $(image).load();
    }
}

function initUnusedCards() {
    /*
     * Align this in the middle below the second of the three hands (0, 1, 2)
     */
    unusedCards = new Konva.Image({
            x: firstHand + boardCell,
            y: boardTop + 2*boardCell + 2*cardStackSeperation,
            width: boardCell-1,
            height: boardCell-1,
            stroke: 'black',
            strokeWidth: 1});
    layer.add(unusedCards);
    unusedCards.setZIndex(-1);
    setUnusedCards(imageFiles[cardDeck]);
    unusedCards.on('click', unusedClickEvent.bind(unusedCards));
}

function setOppUsedHand(imageSrc) {
    var image = new Image();
    image.onload = function () {
        oppUsedHand.image(image);
        oppUsedHand.draw();
    }    
    image.src = imageSrc;
    if (image.complete) {
        $(image).load();
    }
}

function initOppUsedHand() {
    /*
     * Align this in the middle below the second of the three hands (0, 1, 2)
     */
    oppUsedHand = new Konva.Image({
            x: firstHand + boardCell,
            y: boardTop + 3*boardCell + 3*cardStackSeperation,
            width: boardCell-1,
            height: boardCell-1,
            stroke: 'black',
            strokeWidth: 1});
    layer.add(oppUsedHand);
    oppUsedHand.setZIndex(-1);
    setOppUsedHand(imageFiles[cardQuestion]);
}

function initFreeCards() {
    var tmpCards = allCards.slice();
    var max = totalCards - 1; 
    var rand = 0;
    for (var i = 0; i < totalCards; i++, max--) {
        rand = Math.floor(Math.random() * (max + 1));
        freeCards[i] = tmpCards.splice(rand, 1)[0];
    }
}

function startReinit() {
    location.reload();     
}

function start(startWithHands) {
    initCanvas();
    initBoard();
    initFreeCards();
    initHand(startWithHands);
    initUnusedCards();
    initUsedHand();
    initOppUsedHand();
    
    playHandFireInit();
    inPlayFireInit();
    takeNewFireInit();
}

