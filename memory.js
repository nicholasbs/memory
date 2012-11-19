//var data = [{"text":"Twitter", "count":2}, {"text":"Facebook", "count":2},{"text":"Spotify", "count":2}, {"text":"Grooveshark", "count":2}, {"text":"Pandora", "count":2}, {"text":"Instagram", "count":2}];

window.onload = function(){
	ajax();
}

function jsoncallback(json){
	var txt='';
	var data=[];

   	for(var i=0; i<json.length; i++){ 
   		//var cnt = 2;
    	txt = json[i].text;
    	var obj = {text:txt,count:2};
    	
    	data.push(obj);
  	}
  		board.load(data);
}

var ajax = function(){
	var url = "https://api.twitter.com/1/statuses/user_timeline.json?screen_name=djlindsey&count=6";
	$.ajax({
		  url: url,
		  dataType: "jsonp",
		  jsonp : "callback",
		  jsonpCallback: "jsoncallback"
	});
}


var board ={
	click_num:0,
	card_count:0,
	current_clicks:[],
	game_board:'',
	cards:[],
	board_length:4,
	board_width:3,

	/*loads the game board with data*/

	load : function (data){
		var self = this;
		var random_num = 0;
		var filled_cell = true;
		
		this.game_board = document.getElementById("board");//would be better to actually access this by class name?

		for(var i = 0; i<this.board_length; i++){
			var row = document.createElement("div");
			row.className = "divRow";
			this.game_board.appendChild(row);

			for(var j = 0; j<this.board_width; j++){
				//loop until a cell is filled with an item from the data array
				while(filled_cell){
				
				/*if the count value of the randomly generated index for data is greater than 0, fill the board with that info
				and decrease by one. data used to fill a cell can only be used twice.*/
					random_num = board.getRandomNum(data);
				
					if(data[random_num]["count"]>0){
						var new_card = new card(data[random_num]["text"], "row"+j);
						//this.game_board.appendChild(new_card.getCardMarkup());
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

		/*TOM! "this" is being assigned/defined globally!*/
		this.game_board.addEventListener("click", function(e){
			if(self.click_num==2){
				self.compareClicks();
				
				//pause before resetting clicks...
				//reset clicks
				setTimeout(function(){
					self.resetClicks();
					}, 500);
			}
		})
	}, 

	/*returns a randomly generated number btwn the valuse of 0 and one minus the length of the data array*/
	getRandomNum: function (data){
		return Math.floor((Math.random()*(data.length)));
	},
	resetClicks:function(){
		for(var i = 0; i<this.current_clicks.length; i++){
			//gray out cell and disable click/remove click event listener 
			this.current_clicks[i].target.classList.remove("on");
			this.current_clicks[i].target.classList.add("off");
			//this.current_clicks[i].target.style.color = 'white';
			//this.current_clicks[i].target.display = 'none';
			//this.game_board.removeChild(this.current_clicks[i].target);
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
		}
		else{
			for(var i = 0; i<this.current_clicks.length; i++){
				var target = this.current_clicks[i];
				target.target.addEventListener("click", board.cards[target.target.id].listener, false);
				//target.target.addListener(board.cards[target.target.id].listener);
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
			//this.game_board.removeChild(this.current_clicks[i].target);
		}
	}

}


var card = function(text, class_name) {
		var div = document.createElement("div");//should div have this prepended on it?
		div.innerHTML = text;
		//div.className = "divCell";//class_name;
		div.classList.add("divCell");
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

card.prototype = {
	settext: function(text){
		this.card_name = text;
	},

	getName: function(){
		return this.card_name;
	},

	/*TODO: remove this b/c not using. or try to figure out how to make it reusable*/
	addListener: function(){
		console.log("in add listener");
		this.markup.addEventListener("click", this.listener, false);
	},

	getCardMarkup: function(){
		return this.markup
	}
}

//QUESTION: ok, so what happens here? I have an event listener on both the board and the card/div...what happens first? so it seems like the card event listener fires first. why is that?
		/*NOTE: this is the element that has added the event listener, div in this case
					e is the mouse event
					self is the object passed in outside/around/surrounding this event listener
		*/
		
		//QUESTION: why doesn't this work? but the technique above does?
		/*div.addEventListener("click", function(e){
			board.incrementClicks();
			board.recordClick(name, e);//why is it that this.text...or self.text returns the last item to be created? also, how does this event listener know how to reference "text"...the text assigned to the div?
			this.removeEventListener("click", function(e2){
				board.incrementClicks();
				board.recordClick(text, e2);		
			})
		});*/



/*WHY CAN'T I DO THIS AJAX CALL WITHIN THE FUNCTION INIT..OR WITHIN WINDOW.LOAD?..ALSO, HOW CAN THIS BE DONE WITHOUT USING JQUERY? I.E. USING XMLHTTPREQUEST ETC?
var data_new = {
	init: function(){
		
		var url = "https://api.twitter.com/1/statuses/user_timeline.json?screen_text=djlindsey&count=1";
		$.ajax({
		  url: url,
		  dataType: "jsonp",
		  jsonp : "callback",
		  jsonpCallback: "jsonpcallback"
		  });

		function jsonpcallback(json) {

		   for (var i=0; i<data.length; i++){ 
		    console.log(json[i].text);
		  }
		}
	}
}*/


/*var data_new = {

	ajax: function(){
		console.log("this happended");
		var xmlhttp;
		if(window.XMLHttpRequest)
		{	// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}
		else
		{	// code for IE6, IE5
		  	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		xmlhttp.onreadystatechange=function()
		{
			if (xmlhttp.readyState==4 && xmlhttp.status==200)
		    {
		    	document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
		    }
		}
		
		xmlhttp.open("GET","https://api.twitter.com/1/statuses/user_timeline.json?screen_name=djlindsey&count=1",true);
		xmlhttp.send();
	},

	cross_ajax: function(){
		var invocation = new XMLHttpRequest();
		var url = 'https://api.twitter.com/1/statuses/user_timeline.json?screen_name=djlindsey&count=1';
     
		//function callOtherDomain(){
		  if(invocation) {
		    invocation.open('GET', url, true);
		    invocation.withCredentials = true;
		    //invocation.onreadystatechange = handler;

		    invocation.onreadystatechange = function()
			{
				if (invocation.readyState==4 && invocation.status==200)
		    	{
		    		document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
		    	}
			}
		    	invocation.send(); 
		  }*/

		
		/*var invocation = new XMLHttpRequest();
	    var url = 'http://aruner.net/resources/access-control-with-post-preflight/';
	    var invocationHistoryText;
	    var body = '<?xml version="1.0"?><person><name>Arun</name></person>';
	    
	    function callOtherDomain(){
	        if(invocation)
	        {
	            invocation.open('POST', url, true);
	            invocation.setRequestHeader('X-PINGARUNER', 'pingpong');
	            invocation.setRequestHeader('Content-Type', 'application/xml');
	            invocation.onreadystatechange = handler;
	            invocation.send(body); 
	        }
	        else
	        {
	            invocationHistoryText = "No Invocation TookPlace At All";
	            var textNode = document.createTextNode(invocationHistoryText);
	            var textDiv = document.getElementById("textDiv");
	            textDiv.appendChild(textNode);
	        }
        
    	}*/
	/*}
}*/