var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];


var users = [];
var artist = false;
var currentWord;

io.on('connection', function(socket) {

    console.log('Connected');
    

    //connection and role section
    socket.on('join', function(nickname) {
        //adds users to user array and assigns the socket the id number
        users.push(nickname);
        socket.name = nickname;
        if (artist == true) {
            socket.role = 'guesser';
            socket.emit('role', socket.role);
        }
        else {
            artist = true;
            socket.role = 'artist';
            socket.word = WORDS[Math.floor(Math.random() * WORDS.length)];
            currentWord = socket.word;
            console.log('Current word: ' + currentWord);
            socket.emit('role', socket.role, socket.word);
        }

    });

    socket.on('disconnect', function() {
        if (socket.role === 'artist') {
            artist = false;
            socket.broadcast.emit('gameMessage', 'Artist disconnected. Please Refresh to start a new game.');

        }
        var index = users.indexOf(socket.id);
        users.splice(index, 1);
    });



    //drawing section
    socket.on('drawSend', function(position) {
        if (socket.role === 'artist') {
            socket.broadcast.emit('drawReceive', position, socket.role);
        }
    });
    
    socket.on('clear', function(){
        console.log('clear button was clicked');
       socket.broadcast.emit('canvasReset');
       socket.emit('canvasReset');
    });


    //guessing section
    socket.on('guessBox', function(currentGuess) {
        socket.broadcast.emit('guess', currentGuess);
        socket.emit('guess', currentGuess);
        if(currentGuess === currentWord){
            socket.broadcast.emit('gameMessage', socket.name + ' has guessed correctly! Refresh for a new game.');
            socket.emit('gameMessage', socket.name + ' has guessed correctly! Refresh for a new game.');
        }
        
    });

});

server.listen(process.env.PORT || 8080);


//make an artist that isnt the first person if no artist
