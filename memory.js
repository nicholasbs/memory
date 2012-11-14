//var data = ["Twitter", "Facebook", "Spotify", "Grooveshark", "Pandora", "Instagram"];
/*for (var obj in data) {
      alert(obj + " = " + obj[data]);
   }*/

/*the board should have a listener, and should count the clicks. if click count ==2 then check to see that if the two boxes click match each other. if they do
play video, otherwise, turn them over.*/

var data = [{"name":"Twitter", "count":2}, {"name":"Facebook", "count":2},{"name":"Spotify", "count":2}, {"name":"Grooveshark", "count":2}, {"name":"Pandora", "count":2}, {"name":"Instagram", "count":2}];

var board ={
	/*loads the game board with data*/
	click_num: 0,
	current_clicks: [],
	game_board: '',
	//listener: '',

	load : function (){
		var random_num = 0;
		var filled_cell = true;
		var board_length = 4;
		var board_width = 3;
		var game_board = document.getElementById("board"); //would be better to actually access this by class name?
		this.game_board = game_board;

		var self = this;
			
		for(var i = 0; i<board_length; i++){
			for(var j = 0; j<board_width; j++){
				while(filled_cell){//loop until a cell is filled with an item from the data array
				/*if the count value of the randomly generated index for data is greater than 0, fill the board with that info
				and decrease by one. data used to fill a cell can only be used twice.*/
					random_num = board.getRandomNum();
				
					if(data[random_num]["count"]>0){
						/*var new_card = new card();
						new_card.initialize(data[random_num]["name"], "row"+j);
						this.game_board.appendChild(new_card.getCardMarkup());*/

						card.initialize(data[random_num]["name"], "row"+j); //QUESTION: how does this area of code see "card"?

						var new_card = card.getCardMarkup();

						this.game_board.appendChild(new_card);
						data[random_num]["count"] = data[random_num]["count"]-1;
						filled_cell = false;
					}
				}
				filled_cell = true;
			}
		}

		/*TOM! "this" is being assigned/defined globally!*/
		this.game_board.addEventListener("click", function(e){
			if(self.click_num==2){
				self.compareClicks();
				
				//reset clicks
				self.resetClicks();
			}
		})
	}, 

	/*returns a randomly generated number btwn the valuse of 0 and one minus the length of the data array*/
	getRandomNum: function (){
		return Math.floor((Math.random()*(data.length)));
	},
	resetClicks:function(){
		this.click_num = 0;
		this.current_clicks = [];
		//console.log("in reset clicks");
		//console.log(this.current_clicks);
	},

	incrementClicks: function(){
		this.click_num++;
	}, 

	//recordClick: function(val, element){
	recordClick: function(element){
		console.log("in record click");

		//this.current_clicks.push({"name":val, "element":element.target});
		this.current_clicks.push(element.target);
		//console.log("after");
		//console.log(this.current_clicks);
		
		/*element.removeEventListener("click", function(e){
			console.log("disabled element");
		});*/
	},

	compareClicks: function(){
		/*if(this.current_clicks[0]["name"]==this.current_clicks[1]["name"]){
			console.log("It's a match!");
			board.removeCard();
		}*/
		if(this.current_clicks[0].innerHTML==this.current_clicks[1].innerHTML){
			console.log("It's a match!");
			board.removeCard();
		}
		else{
			/*for(var i = 0; i<this.current_clicks.length; i++){
				var target = this.current_clicks[0]["element"];
				card.addListener(target);
				console.log("Welp :/");
			}*/
			for(var i = 0; i<this.current_clicks.length; i++){
				//var target = this.current_clicks[i]["element"];
				var target = this.current_clicks[i];
				card.addListener(target);
				//console.log(target);
			}
			console.log("Welp :/");
		}
	},

	removeCard: function(){
		for(var i = 0; i<this.current_clicks.length; i++){
			//this.game_board.removeChild(this.current_clicks[i]["element"]);
			this.game_board.removeChild(this.current_clicks[i]);
		}
	}

}

var card = {
	
	card_name: '',
	
	markup: '',
	
	listener: '',

	setName: function(name){
		this.card_name = name;
	},

	getName: function(){
		return this.card_name;
	},

	initialize: function(name, class_name){
		var div = document.createElement("div");//should div have this prepended on it?
		div.innerHTML = name;
		div.className = class_name;

		this.markup = div;
		this.card_name = name;//QUESTION: should i actually be using the setter method?
		var self = this;

		var listener = function (e) {
		  board.incrementClicks();
		  //board.recordClick(self.card_name, e);//QUESTION: what is actually happening when self.name is changed to name? 
		  board.recordClick(e);//QUESTION: what is actually happening when self.name is changed to name? 
		  this.removeEventListener("click", listener, false);
		};

		this.listener = listener;

		/*this.listener = function (e) {
		  board.incrementClicks();
		  board.recordClick(name, e);
		  this.removeEventListener("click", this.listener, false);
		};*/

		div.addEventListener("click", listener, false);
		//card.addListener(div);


		
		//QUESTION: ok, so what happens here? I have an event listener on both the board and the card/div...what happens first? so it seems like the card event listener fires first. why is that?
		/*NOTE: this is the element that has added the event listener, div in this case
					e is the mouse event
					self is the object passed in outside/around/surrounding this event listener
		*/
		
		//QUESTION: why doesn't this work? but the technique above does?
		/*div.addEventListener("click", function(e){
			board.incrementClicks();
			board.recordClick(name, e);//why is it that this.name...or self.name returns the last item to be created? also, how does this event listener know how to reference "name"...the name assigned to the div?
			this.removeEventListener("click", function(e2){
				board.incrementClicks();
				board.recordClick(name, e2);		
			})
		});*/

	},

	addListener: function(element){
		element.addEventListener("click", card.listener, false);
	},

	getCardMarkup: function(){
		return this.markup
	}
}