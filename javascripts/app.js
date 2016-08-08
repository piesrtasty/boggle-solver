
var Dictionary = {

  words: [],

  containsPrefix: function(prefix)  {
    return this.searchPrefix(prefix, 0, this.words.length)
  },

  containsExact: function(exact)  {
    return this.searchExact(exact, 0, this.words.length)
  },

  searchPrefix: function(prefix, start, end)  {
    if (start >= end) {
      // There are no words left to search, so return
      return this.words[start].indexOf(prefix) > -1
    }

    var middle = Math.floor((start + end) / 2);

    if (this.words[middle].indexOf > -1)  {
      // If the prefix exists, return true
      return true
    } else {
      // Recurse
      if (prefix <= this.words[middle]) {
        return this.searchPrefix(prefix, start, middle - 1)
      } else {
        return this.searchPrefix(prefix, middle + 1, end)
      }
    }

  },

  searchExact: function(exact, start, end) {

    if (start >= end) {
      // There are no words left to search, so return
      return this.words[start] === exact
    }

    var middle = Math.floor((start + end) / 2);

    if (this.words[middle] === exact) {
      // If the word exists, return true
      return true
    } else {
      // Recurse
      if (exact <= this.words[middle])  {
        return this.searchExact(exact, start, middle - 1)
      } else {
        return this.searchExact(exact, middle + 1, end)
      }
    }

  }

}

var Node = function(value, row, col)  {
  this.value = value;
  this.row = row;
  this.col = col;
};

var Path = function() {
  this.nodes = [];
};

Path.prototype.push = function(node) {
  this.nodes.push(node);
  return this
};

Path.prototype.contains = function (node) {
  for (var i = 0; i < this.nodes.length; i++)  {
    if (this.nodes[i] === node) {
      return true
    }
  }
  return false
};

Path.prototype.clone = function() {
  var path = new Path();
  path.nodes = this.nodes.slice(0);
  return path
}

Path.prototype.toString = function()  {
  var string = '';
  for (var i = 0; i < this.nodes.length; i++) {
    string += this.nodes[i].value;
  }
  return string
}

var Board = function(nodes, dictionary) {
  this.nodes = nodes
  this.words = []
  this.rowCount = nodes.length
  this.colCount = nodes[0].length
  this.dictionary = dictionary
}

Board.generate = function (board, dictionary) {
  var ROW_COUNT = board.length,
      COL_COUNT = board[0].length,
      nodes = [];

  // Replace the board with nodes
  for (var i = 0; i < ROW_COUNT; i++) {
    nodes.push([]);
    for (var j = 0; j < COL_COUNT; j++) {
      nodes[i].push(new Node(board[i][j], i, j));
    }
  }

  return new Board(nodes, dictionary)
};

Board.prototype.toString = function () {
  return JSON.stringify(this.nodes)
};

Board.prototype.solve = function(dictionary) {
  for (var i = 0; i < this.rowCount; i++) {
    for (var j = 0; j < this.colCount; j++) {
      var node = this.nodes[i][j],
          path = new Path();

      path.push(node);
      this.dfs_search(path);
    }
  }
}

Board.prototype.onBoard = function (row, col) {
  return 0 <= row && row < this.rowCount && 0 <= col && col < this.colCount
}

Board.prototype.get_unsearched_neighbors = function (path) {
  var lastNode = path.nodes[path.nodes.length - 1];


  var offsets = [
        [-1, -1], [-1,  0], [-1, +1]
      , [ 0, -1],           [ 0, +1]
      , [+1, -1], [+1,  0], [+1, +1]
    ]

  var neighbors = [];

  for (var i = 0; i < offsets.length; i++)  {
    var offset = offsets[i];
    if (this.onBoard(lastNode.row + offset[0], lastNode.col + offset[1])) {
      var potentialNode = this.nodes[lastNode.row + offset[0]][lastNode.col + offset[1]]
      if (!path.contains(potentialNode)) {
        // Create a new path if on board and we haven't visited this node yet.
        neighbors.push(potentialNode)
      }
    }
  }
  return neighbors
};

Board.prototype.dfs_search = function (path) {
  var pathString = path.toString();

  if (this.dictionary.containsExact(pathString) && pathString.length >= 3)  {
    this.words.push(pathString);
  }

  var neighbors = this.get_unsearched_neighbors(path);

  for (var i = 0; i < neighbors.length; i++)  {
    var neighbor = neighbors[i];
    var newPath = path.clone();
    newPath.push(neighbor);
    if (this.dictionary.containsPrefix(newPath.toString())) {
      this.dfs_search(newPath);
    }
  }

}

function generateBoardString()  {
  var text = "";

  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i= 0; i < 16; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function generateBoard()  {
  boardLetters = generateBoardString().split('');
  $('.tile').each(function(index)  {
    $(this).attr('value', boardLetters[index]);
  });
}

$.get('data/dict.txt').success(function (data)  {

  words = data.split('\n');
  Dictionary.words = words.sort();

});

// Generate initial starting board
generateBoard();

// Generate a new random board
$('.generate').bind('click', function() {
  generateBoard();
  $('.words').html('');
  $('.lead').hide();
  $('.error').hide();
});

$('.solve').bind('click', function()  {

  $('.words').html('');
  $('.lead').hide();
  $('.error').hide();

  var empty = $('.tile').filter(function() {
    return this.value === "";
  });

  if(empty.length) {
    $('.error').show();
  } else {
    var board = [];

    $('.board .row').each(function(row)  {
      var row = [];
      $(this).find('.tile').each(function(tile) {
        row.push($(this).attr('value'));
      });
      board.push(row);
    });

    var boggle = Board.generate(board, Dictionary);

    boggle.solve();

    var results = '';

    for (var i = 0; i < boggle.words.length; i++) {
      results = results + boggle.words[i] + ', ';
    }

    $('.lead').show();

    if (results.length > 0) {
      $('.words').html(results.slice(0, -2));
    } else  {
      $('.words').html("None");
    }
  }

});
