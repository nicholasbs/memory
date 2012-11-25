/**
 	* Adds click event listeners to the "play" and "play again" buttons when the window loads.
 */
window.onload = function(){
	//var play_button = document.getElementsByClassName("button")[0];
	//TODO: try abstracting things out and making the following a reusable function
	//QUESTION: is it advisable to just give the input elements id values vs doing all that i'm doing below(in the name of only having classes)?
	var msg_obj = new Message();
	var play_button='';
	var username_element_inputs = document.getElementById("username").getElementsByTagName("button");
			var i=0;
			var found = false;

			while(i<username_element_inputs.length && (!found)){
				if(username_element_inputs[i].classList.contains("button")){
					play_button = username_element_inputs[i];
					found = true;
				}			
				i++;
			}

	play_button.addEventListener("click", function(e){

		//if there's a username make ajax request
		try{
			//var username = document.getElementsByClassName("username-input")[0].value;
			var username='';
			var username_element_inputs = document.getElementById("username").getElementsByTagName("input");
			var i=0;
			var found = false;

			while(i<username_element_inputs.length && (!found)){
				if(username_element_inputs[i].classList.contains("username-input")){
					username = username_element_inputs[i].value;
					found = true;
				}			
				i++;
			}

			if(username==''){
				throw new UserException("Must enter username to play.");
			}
			else{
				msg_obj.getMessageDrawer().classList.add("hide");
				//document.getElementById("message-drawer").style.display = 'none';
				executeAjaxHandler(username);
			}
		}
		catch(err){
			console.log(err.name);
			/*HERE*/msg_obj.getMessageDrawer().getElementsByClassName("message-text")[0]
			/*HERE*/document.getElementsByClassName("message-text")[0].innerHTML = err.msg;
			msg_obj.getMessageDrawer().classList.remove(err.class_name);//QUESTION: is this line absolutely unecessary? is it better to do the line below? i added this line to avoid accessing the dom so much...
		}
	}, false);

	var play_again = document.getElementById("play-again");
	play_again.addEventListener("click", function(e){
		utilities.clearInputs();
		location.reload();
	}, false);
}

//QUESTION: why doesn't jquery ajax module recognize the anonymous version of this function?
function jsoncallback(json){
	var MAX_LENGTH = 6;
	var txt='';
	var data=[];

	for (var i = json.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = json[i];
        json[i] = json[j];
        json[j] = temp;
    }	
	
	if(json.length>=MAX_LENGTH){
	   	for(var i=0; i<MAX_LENGTH; i++){
	    	txt = json[i].text;
	    	
	    	var obj = {text:txt,count:2};	    	
	    	data.push(obj);
	  	}
	  	board.load(data, MAX_LENGTH);
	  	document.getElementById("username").classList.toggle("hide");
	  	document.getElementById("board").classList.remove("hide");
	  	document.getElementById("board").classList.add("show-table");
  	}
  	else if(json.error=="Not authorized"){
		console.log('This user is private. Choose another username');   	
	}
	else if(json.errors!=""){
		console.log("This user doesn't exist. Choose another username");
	}
  	else{
  		//maybe make an error object that routes errors accordingly?
  		console.log('Bummer, not enough tweets to play. Choose another username.');
  	}
}


var executeAjaxHandler = function(username){
	var url = "https://api.twitter.com/1/statuses/user_timeline.json?screen_name="+username+"&count=20";

	$.ajax({
			  url: url,
			  dataType: "jsonp",
			  jsonp : "callback",
			  jsonpCallback: "jsoncallback"
		});
}

var Message = function(){
	var message_drawer = document.getElementById("message-drawer");
	this.message_drawer = message_drawer;
}

Message.prototype = {
	getMessageDrawer:function(){
		return this.message_drawer;
	}
}

var UserException = function(msg){
	this.msg = msg;
	this.name = "UserException";
	this.class_name = "hide";
}

var utilities = {
	clearInputs:function(){
		var input_elements = document.getElementsByTagName("input");

		for(var i = 0; i<input_elements.length; i++){
			input_elements[i].value = '';
		}		
	}
}

var board = {
	click_num:0,
	card_count:0,
	current_clicks:[],
	game_board:'',
	cards:[],
	BOARD_LENGTH:4,
	BOARD_WIDTH:3,
	number_of_matches:0,

	/*loads the game board with data*/

	load : function (data, MAX_LENGTH){
		this.max_length = MAX_LENGTH;
		var self = this;
		var random_num = 0;
		var filled_cell = true;
		
		this.game_board = document.getElementById("board");//would be better to actually access this by class name?

		for(var i = 0; i<this.BOARD_LENGTH; i++){
			var row = document.createElement("div");
			row.className = "div-row";
			this.game_board.appendChild(row);

			for(var j = 0; j<this.BOARD_WIDTH; j++){
				//loop until a cell is filled with an item from the data array
				while(filled_cell){
				
				/*if the count value of the randomly generated index for data is greater than 0, fill the board with that info
				and decrease by one. data used to fill a cell can only be used twice.*/
					random_num = board.getRandomNum(data);

					if(data[random_num]["count"]>0){
						var new_card = new Card(data[random_num]["text"]);
						row.appendChild(new_card.getCardMarkup());
						this.card_count++;
						this.cards.push(new_card);

						data[random_num]["count"] = data[random_num]["count"]-1;
						filled_cell = false;
					}
				}
				filled_cell = true;
			}
		}

		this.game_board.addEventListener("click", function(e){
			if(self.click_num==2){
				self.compareClicks();
				
				//pause before resetting clicks...
				setTimeout(function(){
					self.resetClicks();

					//if number of matches found == MAX_LENGTH, the game has ended, ask to reload board...
					if(board.number_of_matches==board.max_length){
						document.getElementById("username").classList.toggle("z-index");
						document.getElementById("play-again").classList.toggle("hide");
					}
				}, 500);
			}
		})
	}, 

	/*returns a randomly generated number btwn the values of 0 and the length of the data array*/
	getRandomNum: function (){
		return Math.floor((Math.random()*(this.max_length)));
	},
	resetClicks:function(){
		for(var i = 0; i<this.current_clicks.length; i++){
			//gray out cell and disable click/remove click event listener 
			this.current_clicks[i].target.classList.remove("on");
			this.current_clicks[i].target.classList.add("off");
		}	
		this.click_num = 0;
		this.current_clicks = [];
	},

	incrementClicks: function(){
		this.click_num++;
	}, 

	recordClick: function(element){
		this.current_clicks.push(element);
	},

	compareClicks: function(){
		//this should be changed to compare something like "match_id"
		if(this.current_clicks[0].target.innerHTML==this.current_clicks[1].target.innerHTML){
			console.log("It's a match!");

			setTimeout(function(){
				board.removeCard();
					}, 500);
			this.number_of_matches++;
		}
		else{
			for(var i = 0; i<this.current_clicks.length; i++){
				var target = this.current_clicks[i];
				target.target.addEventListener("click", board.cards[target.target.id].listener, false);
				// QUESTION: is there anyway to obtain the object that the markup is attached to?
			}
			console.log("Welp :/");
		}
	},

	removeCard: function(){
		for(var i = 0; i<this.current_clicks.length; i++){
			//gray out cell and disable click/remove click event listener 
			this.current_clicks[i].target.classList.remove("on");
			this.current_clicks[i].target.classList.add("removed");
		}
	}

}


var Card = function(text) {
		var div = document.createElement("div");//should div have this prepended on it?
		div.innerHTML = text;
		div.classList.add("div-cell");
		div.classList.add("off");
		div.id = board.card_count;

		this.markup = div;
		this.card_name = name;//QUESTION: should i actually be using the setter method?
		var self = this;

		var listener = function (e) {
			div.classList.remove("off");
			div.classList.add("on");
		  	board.incrementClicks();
		  	board.recordClick(e);//QUESTION: what is actually happening when self.name is changed to name? 
		  	this.removeEventListener("click", listener, false);
		};

		this.listener = listener;

		//TODO: understand the differences btwn the above code and below code

		/*this.listener = function (e) {
		  board.incrementClicks();
		  board.recordClick(text, e);
		  this.removeEventListener("click", this.listener, false);
		};*/

		this.markup.addEventListener("click", this.listener, false);
}

Card.prototype = {
	getCardMarkup: function(){
		return this.markup
	}
}

