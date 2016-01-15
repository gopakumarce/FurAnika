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

var colors = ['green', 'blue', 'yellow', 'red']
/*
 * Uninitialized globals, will be initialized later
*/
var stage;
var group;
var layer;
var boardImageObjs = [];
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
    group.add(cell);
    cell.draw();
}

function initBoard() {
    for(var row = 0; row < boardRows; row++) {
        boardImageObjs[row] = [];
        for(var column = 0; column < boardColumns; column++) {
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

function setHand(hand, imageSrc) {
    var image = new Image();
    image.onload = function () {
        myHand[hand].image(image);
        myHand[hand].draw();
    }    
    image.src = imageSrc;
    if (image.complete) {
        $(image).load();
    }
}

function initHand() {
    for (var hand = 0; hand < boardHands; hand++) {
        myHand[hand] = new Konva.Image({
            x: firstHand + (hand*boardCell),
            y: boardTop,
            width: boardCell-1,
            height: boardCell-1,
            stroke: 'black',
            strokeWidth: 1
        });
        // Start with empty hand
        layer.add(myHand[hand]);
        setHand(hand, imageFiles[cardQuestion]);
    }
}

function setUsedHand(imageSrc) {
    var image = new Image();
    image.onload = function () {
        usedHand.image(image)
        usedHand.draw();
    }    
    image.src = imageSrc;
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
    setUsedHand(imageFiles[cardQuestion]);
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
    setUnusedCards(imageFiles[cardDeck]);
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
    setOppUsedHand(imageFiles[cardQuestion]);
}

function start() {
    initCanvas();
    initBoard();
    initHand();
    initUnusedCards();
    initUsedHand();
    initOppUsedHand();
}
