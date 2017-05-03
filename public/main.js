var pictionary = function() {
    var $canvas, $clear, $context, $drawing, $guessBox, $lastGuess, $role, $word;
    var socket = io();


    //Guessing
    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }

        console.log('Keydown log: ' + $guessBox.val());
        socket.emit('guessBox', $guessBox.val());
        $guessBox.val('');
    };

    $guessBox = $('#guess input');
    $guessBox.on('keydown', onKeyDown);


    var currentGuess = function(guess) {
        console.log('running current guess');
        $lastGuess.text('Last Guess: ' + guess);
    };

    $lastGuess = $('#last-guess');
    socket.on('guess', currentGuess);



    //Drawing
    var draw = function(position, sending, role) {
        $context.beginPath();
        $context.arc(position.x, position.y,
            6, 0, 2 * Math.PI);
        $context.fill();

        if (sending)
            socket.emit('drawSend', position);
    };

    $canvas = $('canvas');
    $context = $canvas[0].getContext('2d');
    $canvas[0].width = $canvas[0].offsetWidth;
    $canvas[0].height = $canvas[0].offsetHeight;

    $canvas.mousedown(function() {
        $drawing = true;
    }).mouseup(function() {
        $drawing = false;
    });



    socket.on('drawReceive', draw);


    //Joining a game
    socket.on('connect', function() {
        var nickname = prompt('What is your name?');
        socket.emit('join', nickname);
    });
    $role = $('#role');
    $word = $('#word');
    $clear = $('#clear-button');
    var assignRole = function(role, word) {
        console.log(role);
        $role.text('Role: ' + role);
        if (role === 'artist') {
            $word.toggle();
            $word.text('Word: ' + word);
            $clear.toggle();

            $clear.on('click', function() {
                socket.emit('clear');
            });

            $canvas.on('mousemove', function(event) {
                if ($drawing) {
                    var offset = $canvas.offset();
                    var position = {
                        x: event.pageX - offset.left,
                        y: event.pageY - offset.top
                    };
                    draw(position, true);
                }
            });
        }
        else if (role === 'guesser') {
            $('#guesser-message').toggle();
        }

    };

    var gameMessage = function(message) {
        $('#game-message').toggle().text(message);
        $('#guesser-message').hide();
    };

    var clearCanvas = function() {
        console.log('Clearing the canvas');
       $context.clearRect(0, 0, $canvas[0].width, $canvas[0].height);
    };

    socket.on('role', assignRole);
    socket.on('gameMessage', gameMessage);
    socket.on('canvasReset', clearCanvas);
};

$(document).ready(function() {
    pictionary();



});
