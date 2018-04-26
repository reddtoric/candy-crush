var DEBUG = false;


// By default, the first board loaded by your page will be the same 
// each time you load (which is accomplished by "seeding" the random
// number generator. This makes testing (and grading!) easier!
Math.seedrandom(0);


// A short jQuery extension to read query parameters from the URL.
$.extend({
	getUrlVars: function() {
		var vars = [], pair;
		var pairs = window.location.search.substr(1).split('&');
		for (var i = 0; i < pairs.length; i++) {
			pair = pairs[i].split('=');
			vars.push(pair[0]);
			vars[pair[0]] = pair[1] &&
			decodeURIComponent(pair[1].replace(/\+/g, ' '));
		}
		return vars;
	},
	getUrlVar: function(name) {
		return $.getUrlVars()[name];
	}
});

// constants
var DEFAULT_BOARD_SIZE = 8;

// data model at global scope for easier debugging
var board;
var rules;

var moveInputElement;
var candySize;

// initialize board
if ($.getUrlVar('size') && $.getUrlVar('size') >= 3 && $.getUrlVar('size') <= 20) {
	board = new Board($.getUrlVar('size'));
} else {
	board = new Board(DEFAULT_BOARD_SIZE);
}

// load a rule
rules = new Rules(board);

// Final initialization entry point: the Javascript code inside this block
// runs at the end of start-up when the page has finished loading.
$(document).ready(function() {
	// Your code here.
	moveInputElement = document.getElementById("moveInput");
	candySize = 320/board.boardSize;
	EnableCrushButton(false);
	EnableMoveButtons(false);
	NewGame();
	
});


/* Event Handlers */
// access the candy object with info.candy

// add a candy to the board
$(board).on('add', function(e, info) {
	// Your code here.
	//disableInput = true;
	if(DEBUG){
		console.log("ADD");
	}
	var candy = info.candy;
	
	var img = document.createElement("img");
	$("#gameBoard").append(img);
	img.src = "graphics/" + candy.toString() + "-candy.png";
	$(img).data("candy", candy);
	$(img).attr("id", "candy-id-" + candy.id);
				
	var letter = String.fromCharCode(candy.col + 97);
	var num = (candy.row + 1).toString();
	$(img).attr("data-position", letter + num);
	
	var top = candy.row * candySize;
	var left = candy.col * candySize;
	var x = board.boardSize;
	//console.log(top, (x - (top/candySize)) * candySize);
	
	
	$(img).css({"width" : candySize, 
				"height" : candySize, 
				//"top" : top - candySize, 
				//"top" : top - candySize, 
				"top" : 0 - ((x - (top/candySize)) * candySize),
				"left" : left});
				
	$(img).animate({"top" : top}, function(){
		CrushOnce();
	});
});


// move a candy on the board
$(board).on('move', function(e, info) {
	// Your code here.
	if(DEBUG){
		console.log("MOVE");
	}
	var img = document.getElementById("candy-id-" + info.candy.id);
	
	var letter = String.fromCharCode(info.candy.col + 97);
	var num = (info.candy.row + 1).toString();
	$(img).attr("data-position", letter + num);
	
	var top = info.toRow * candySize;
	var left = info.toCol * candySize;
	
    //$("#box").animate({height: "300px"});
	//$(img).css({"top" : top,
	//			"left" : left});
	
	$(img).animate({"top" : top,
					"left" : left}, function(){
						CrushOnce();
					});
	moveInputElement.focus();
});

// remove a candy from the board
$(board).on('remove', function(e, info) {
	// Your code here.
	var img = document.getElementById("candy-id-" + info.candy.id);
	
	var top = info.fromRow * candySize;
	var left = info.fromCol * candySize;
	
	//shrink in
	/*$(img).animate({"width" : 0,
					"height" : 0,
					"top" : top + candySize/2,
					"left" : left + candySize/2}, function(){
						img.parentNode.removeChild(img);
					});
	*/
	//fade out
	$(img).animate({"opacity" : 0}, function(){
						img.parentNode.removeChild(img);
					});
	//img.parentNode.removeChild(img);
});

// move a candy on the board
$(board).on('scoreUpdate', function(e, info) {
	// Your code here. To be implemented in pset 2.
	if(DEBUG){
		console.log("SCORE UPDATE");
	}
	//console.log(info);
	
	var scoreLabel = document.getElementById("scoreLabel");
	$(scoreLabel).empty();
	
	$(scoreLabel).append(info.score + " points");
	
	if(info.candy != undefined){
		$(scoreLabel).css("background-color", info.candy.color);
		
		if(info.candy.color == "yellow"){
			$(scoreLabel).css("color", "gray");
		}
		else{
			$(scoreLabel).css("color", "white");
		}
	}
	else {
		$(scoreLabel).css({"background-color" : "lightgrey",
							"color" : "black"});
	}
	
	
});

// Button Events
$(document).on('click', ".btn", function(evt) {
	var id = evt.target.id;
	if (id == "newGame") {
		NewGame();
		ClearCanvas();
	}
	else if (id == "showMove"){
		//to do
		DrawArrow();
	}
	else if (id == "crushOnce"){
		if(DEBUG){
			console.log("crush once");
		}
		CrushOnce();
		ClearCanvas();
	}
	else if (id == "up" || id == "left" || id == "right" || id == "down") {
		MoveCandy(id);
		ClearCanvas();
	}
	//clear txt field
	moveInputElement.value = '';
});

function DrawArrow(){
	var object = rules.getRandomValidMove();
	//console.log(object);
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,320,320);
	
	var col = object.candy.col;
	var row = object.candy.row;
	
	//console.log(col+1);
	//console.log(row+1);
	
	var squareSize = candySize/2;
	
	var x = (col+1) * candySize - squareSize;
	var y = (row+1) * candySize - squareSize;
	
	//ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
	ctx.fillStyle = "#333333";
	
	ctx.beginPath();
	if(object.direction == "up"){
		ctx.fillRect(x - (squareSize / 2), y - squareSize, squareSize, squareSize);
		
		ctx.moveTo(x - squareSize, y - squareSize + 1);
		ctx.lineTo(x, y - (2 * squareSize));
		ctx.lineTo(x + squareSize, y - squareSize + 1);
	}
	else if(object.direction == "down"){
		ctx.fillRect(x - (squareSize / 2), y, squareSize, squareSize);
		
		ctx.moveTo(x + squareSize, y + squareSize - 1);
		ctx.lineTo(x, y + squareSize + squareSize);
		ctx.lineTo(x - squareSize, y + squareSize - 1);
	}
	else if(object.direction == "left"){
		ctx.fillRect(x - squareSize, y - (squareSize / 2), squareSize, squareSize);
		
		ctx.moveTo(x - squareSize + 1, y - squareSize);
		ctx.lineTo(x - (2 * squareSize), y);
		ctx.lineTo(x - squareSize + 1, y + squareSize);
	}
	else if(object.direction == "right"){
		ctx.fillRect(x, y - (squareSize / 2), squareSize, squareSize);
		
		ctx.moveTo(x + squareSize - 1, y + squareSize);
		ctx.lineTo(x + (2 * squareSize), y);
		ctx.lineTo(x + squareSize - 1, y - squareSize);
	}
	ctx.closePath();
	ctx.fill();
}

// keyboard events arrive here
$(document).on('keydown', function(evt) {
	// Your code here.
	moveInputElement.focus();
	if (evt.originalEvent.key == "ArrowUp"){
		MoveCandy("up");
	}
	else if (evt.originalEvent.key == "ArrowLeft"){
		MoveCandy("left");
	}
	else if (evt.originalEvent.key == "ArrowRight"){
		MoveCandy("right");
	}
	else if (evt.originalEvent.key == "ArrowDown"){
		MoveCandy("down");
	}
});

$(document).on('click', "#canvas", function(evt){
	//console.log("evt: ", evt);
	//console.log(evt.offsetX);
	//console.log(evt.offsetY);

	var letter = String.fromCharCode(96 + Math.ceil(evt.offsetX/candySize));
	var num = Math.ceil(evt.offsetY/candySize);
	
	//console.log("letters: ", letter);
	//console.log("num    : ", num);
	
	moveInputElement.value = letter.concat(num);
	
	CheckInput();
	ClearCanvas();
});

function ClearCanvas(){
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,320,320);
}

function CrushOnce(){
	EnableMoveButtons(false);
	
	rules.removeCrushes(rules.getCandyCrushes());
	setTimeout(function(){
		rules.moveCandiesDown();
	}, 500);
}

function CheckInput(){
	moveInputElement.value = moveInputElement.value.toLocaleLowerCase().trim()
	var input = moveInputElement.value;
	
	var dim = parseInt(board.boardSize);
	var letter = input.charAt(0);
	var num = parseInt(input.substr(1, 2));
	
	if(letter >= 'a' && letter <= String.fromCharCode(96 + dim) && num >= 1 && num <= dim){
		$(moveInputElement).css("box-shadow", "0 0 15px green");
		EnableMoveButtons(true);
		
		var position = moveInputElement.value;
		var img = document.querySelectorAll("[data-position='" + position + "']").item(0);
		if (img != null){
			var candy = $(img).data("candy");
			var directions = ["up", "down", "left", "right"];
			
			directions.forEach(function(e){
				if(!rules.isMoveTypeValid(candy, e)){
					$("#" + e).attr("disabled", "disabled");
				}
			});
		}
	}
	else{
		$(moveInputElement).css("box-shadow", "0 0 15px red");
		EnableMoveButtons(false);
	}
}

function MoveCandy(direction){
	if(DEBUG){
		console.log("move candy");
	}
	var position = moveInputElement.value;
	var img = document.querySelectorAll("[data-position='" + position + "']").item(0);
	//console.log(img);
	if (img != null){
		//console.log("not null");
		var candy = $(img).data("candy");
		//console.log(candy);
		if(rules.isMoveTypeValid(candy, direction)){
			if(DEBUG){
				console.log("valid move");
			}
			var candy2 = board.getCandyInDirection(candy, direction);
			board.flipCandies(candy, candy2);
			EnableMoveButtons(false);
			EnableCrushButton(true);
		}
	}
	
	moveInputElement.value = "";
}

function NewGame(){
	board.clear();
	board.resetScore();
	rules.prepareNewGame();
}

function EnableMoveButtons(enable){
	if (enable){
		$(".arrow").removeAttr("disabled");
	}
	else{
		$(".arrow").attr("disabled", "disabled");
	}
}

function EnableCrushButton(enable){
	if (enable){
		$("#crushOnce").removeAttr("disabled");
	}
	else{
		$("#crushOnce").attr("disabled", "disabled");
	}
}
