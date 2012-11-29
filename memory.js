(function() {
  window.onload = function() {
    getById("play").addEventListener("click", function() {
      var username = getById("username-input").value;

      if (username) {
        hideError();
        requestTweets(username);
      } else {
        showError("Please enter a username");
      }
    });

    getById("play-again").addEventListener("click", function() {
      location.reload();
    });
  };

  function requestTweets(username) {
    var url = "https://api.twitter.com/1/statuses/user_timeline.json?screen_name="+username+"&count=20";

    $.ajax({
      url: url,
      dataType: "jsonp",
      jsonp : "callback",
      success: loadTweets
    });
  }

  function loadTweets(json) {
    var ROWS = 4;
    var COLS = 3;
    var UNIQUE_CARDS = ROWS * COLS / 2;

    if (json.length < UNIQUE_CARDS) {
      showError('Bummer, not enough tweets to play. Choose another username.');
    } else {
      var tweets = json.map(function(item) { return item.text; });
      var board = new Board(tweets, ROWS, COLS);

      getById("username").classList.add("hide");
      board.show();
    }
  }

  function Board(data, rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cards = {};
    this.selectedCards = [];
    this.numberOfMatches = 0;
    this.el = getById("board");

    this.load(data);

    var self = this;
    this.el.addEventListener("click", function(e) {
      if (self.selectedCards.length === 2)
        return; // ignore additional clicks

      var clickedCard = self.cards[e ? e.target.id : window.event.srcElement.id];

      if (!clickedCard.isRemoved() && !clickedCard.isFaceUp()) {
        clickedCard.flipFaceUp();
        self.selectedCards.push(clickedCard);
        if (self.selectedCards.length === 2) {
          setTimeout(function() { self.compareSelectedCards(); }, 500);
        }
      }
    });
  }

  Board.prototype = {
    load: function(data) {
      data = data.slice(0, this.uniqueCards());
      var dupeData = shuffle(data.concat(data));

      for (var i = 0, cardNum = 0; i < this.rows; i++) {
        var row = document.createElement("div");
        row.className = "div-row";
        this.el.appendChild(row);

        for (var j = 0; j < this.cols; j++, cardNum++) {
          var newCard = new Card(dupeData[cardNum]);
          row.appendChild(newCard.el);
          this.cards[newCard.el.id] = newCard;
        }
      }
    },

    unselectCards: function() {
      for (var i = 0; i < this.selectedCards.length; i++) {
        this.selectedCards[i].flipFaceDown();
      }
      this.selectedCards = [];
    },

    compareSelectedCards: function() {
      if (this.selectedCards[0].matchId === this.selectedCards[1].matchId) {
        this.removeSelectedCards();
        this.numberOfMatches++;

        if (this.solved()) {
            getById("play-again").classList.remove("hide");
        }
      } else {
        this.unselectCards();
      }
    },

    removeSelectedCards: function() {
      for (var i = 0; i < this.selectedCards.length; i++) {
        this.selectedCards[i].remove();
      }
      this.selectedCards = [];
    },

    uniqueCards: function() {
      return this.rows * this.cols / 2;
    },

    solved: function() {
      return this.numberOfMatches === this.uniqueCards();
    },

    show: function() {
      this.el.classList.remove("hide");
      this.el.classList.add("show-table");
    }
  };

  function Card(text, board) {
    this.el = document.createElement("div");
    this.el.innerHTML = text;
    this.el.classList.add("div-cell");
    this.el.id = Card.getNextId();

    this.matchId = Card.getMatchIdFor(text);
  }

  Card.getNextId = function() {
    if (typeof this._nextId === "undefined") {
      this._nextId = 0;
    }
    return this._nextId++;
  }

  Card.getMatchIdFor = function(text) {
    if (typeof this._matchIds === "undefined") {
      this._matchIds = {};
    }
    if (typeof this._matchIds[text] === "undefined") {
      this._matchIds[text] = this._nextId;
    }
    return this._matchIds[text];
  }

  Card.prototype = {
    flipFaceUp: function() {
      this.el.classList.add("faceup");
    },

    flipFaceDown: function() {
      this.el.classList.remove("faceup");
    },

    isFaceUp: function() {
      return hasClass(this.el, "faceup");
    },

    remove: function() {
      this.el.classList.add("removed");
    },

    isRemoved: function() {
      return hasClass(this.el, "removed");
    }
  };


  //Fisher-Yates suffle -- destructive!
  function shuffle(list) {
    var i, j, temp;
    for (i = list.length - 1; i > 0; i--) {
      j = Math.floor(Math.random()*i);
      temp = list[i];
      list[i] = list[j];
      list[j] = temp;
    }
    return list;
  }

  function hasClass(el, cls) {
    for (var i = 0; i < el.classList.length; i++) {
      if (el.classList[i] === cls)
        return true;
    }
    return false;
  }

  function getById(id) {
    return document.getElementById(id);
  }

  function showError(msg) {
    var messageDrawer = getById("message-drawer");
    messageDrawer.getElementsByClassName("message-text")[0].innerHTML = msg;
    messageDrawer.classList.remove("hide");
  }

  function hideError() {
    getById("message-drawer").classList.add("hide");
  }
})();
