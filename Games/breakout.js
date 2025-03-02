import { stopAudio, loadAudio } from "../Controllers/AudioController.js";
import { isPaused, loadPauseMenu, resetPauseMenu } from "../Controllers/PauseMenuController.js";
import { loadHelpPopup } from "../Controllers/HelpPopupController.js";

export function loadBreakout(){
  const canvas = document.getElementById('game');
  const context = canvas.getContext('2d');

  const homeButton = document.getElementById("home-button");
  const mainContent = document.getElementById("main-content");


  //Make and then load the breakout audio (from AudioController.js)
  const audio = new Audio("/triplex.github.io/Audio/breakout-sound.mp3");
  loadAudio(audio);

  //Load the pause menu, attach game's loop to it (to be paused) (from PauseMenuController.js)
  loadPauseMenu(loop);

  //Load the help popup for breakout (from HelpPopupController.js)
  loadHelpPopup("breakout");

  //Display score and high score
  var score = 0;
  var highscore = 0;

  const scoreboard = document.getElementById("score-board");
  scoreboard.style.display = "block";

  const highscoreboard = document.getElementById("highscore-board");
  highscoreboard.style.display = "block";

  document.getElementById("score-board").innerHTML = "Score: " + score; 
  document.getElementById("highscore-board").innerHTML = "High Score: " + highscore; 




  //When the home button is clicked, stop the game loop, clear the canvas, stop the audio, reset the pause menu, and return to the home page
  function returnHome(){

    //Stop game loop, clear canvas
    cancelAnimationFrame(id);
    context.clearRect(0,0,canvas.width,canvas.height);

    //Stop audio (from AudioController.js)
    stopAudio(audio);

    //Reset pause menu (from PauseMenuController.js)
    resetPauseMenu();

    //Reset help popup (from HelpPopupController.js)
    loadHelpPopup("home");
    
    //Make score board dissapear
    scoreboard.style.display = "none"
    highscoreboard.style.display = "none"

    //Make home display visible, canvas invisible
    mainContent.style.display="flex";
    canvas.style.display="none";

    //Prevent multiple event listeners from being added
    homeButton.removeEventListener("click", returnHome);
  }

  //When the home button is clicked, return to the home page
  homeButton.addEventListener("click", returnHome);
  


  /////////////////////////////////////////////////////////////////
  //GAME CODE STARTS HERE /////////////////////////////////////////



  // each row is 14 bricks long. the level consists of 3 blank rows then 8 rows
  // of 4 colors: red, orange, green, and yellow
  const level1 = [
    [],
    [],
    [],
    ['R','R','R','R','R','R','R','R','R','R','R','R','R','R'],
    ['R','R','R','R','R','R','R','R','R','R','R','R','R','R'],
    ['O','O','O','O','O','O','O','O','O','O','O','O','O','O'],
    ['O','O','O','O','O','O','O','O','O','O','O','O','O','O'],
    ['G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
    ['G','G','G','G','G','G','G','G','G','G','G','G','G','G'],
    ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y'],
    ['Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y','Y']
  ];

  // create a mapping between color short code (R, O, G, Y) and color name
  const colorMap = {
    'R': 'red',
    'O': 'orange',
    'G': 'green',
    'Y': 'yellow'
  };

  // use a 2px gap between each brick
  const brickGap = 2;

  // calculate the brick width and height based on the canvas width and height
  const brickWidth = Math.floor((canvas.width-24-28)/14);
  const brickHeight = Math.floor(brickWidth/3);

  // the wall width takes up the remaining space of the canvas width. with 14 bricks
  // and 13 2px gaps between them, thats: 400 - (14 * 25 + 2 * 13) = 24px. so each
  // wall will be 12px
  const wallSize = 12;
  const bricks = [];

  // create the level by looping over each row and column in the level1 array
  // and creating an object with the bricks position (x, y) and color
  for (let row = 0; row < level1.length; row++) {
    for (let col = 0; col < level1[row].length; col++) {
      const colorCode = level1[row][col];

      bricks.push({
        x: wallSize + (brickWidth + brickGap) * col,
        y: wallSize + (brickHeight + brickGap) * row,
        color: colorMap[colorCode],
        width: brickWidth,
        height: brickHeight
      });
    }
  }

  const paddle = {
    // place the paddle horizontally in the middle of the screen
    x: canvas.width / 2 - brickWidth / 2,
    y: canvas.height-canvas.height/6,
    width: (Math.floor((canvas.width-24-28)/14)) * 2,
    height: brickHeight,

    // paddle x velocity
    dx: 0
  };

  const ball = {
    x: 130,
    y: 260,
    width: 15,
    height: 15,

    // how fast the ball should go in either the x or y direction
    speed: 6,

    // ball velocity
    dx: 0,
    dy: 0
  };

  // check for collision between two objects using axis-aligned bounding box (AABB)
  // @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
          obj1.x + obj1.width > obj2.x &&
          obj1.y < obj2.y + obj2.height &&
          obj1.y + obj1.height > obj2.y;
  }

  // game loop
  function loop() {
    if (isPaused()) return;

    id = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);

    // move paddle by it's velocity
    paddle.x += paddle.dx;

    // prevent paddle from going through walls
    if (paddle.x < wallSize) {
      paddle.x = wallSize
    }
    else if (paddle.x + brickWidth > canvas.width - wallSize) {
      paddle.x = canvas.width - wallSize - brickWidth;
    }

    // move ball by it's velocity
    ball.x += ball.dx;
    ball.y += ball.dy;

    // prevent ball from going through walls by changing its velocity
    // left & right walls
    if (ball.x < wallSize) {
      ball.x = wallSize;
      ball.dx *= -1;
    }
    else if (ball.x + ball.width > canvas.width - wallSize) {
      ball.x = canvas.width - wallSize - ball.width;
      ball.dx *= -1;
    }
    // top wall
    if (ball.y < wallSize) {
      ball.y = wallSize;
      ball.dy *= -1;
    }

    // reset ball if it goes below the screen
    if (ball.y > canvas.height) {
      ball.x = 130;
      ball.y = 260;
      ball.dx = 0;
      ball.dy = 0;

    }

    // check to see if ball collides with paddle. if they do change y velocity
    if (collides(ball, paddle)) {
      ball.dy *= -1;

      // move ball above the paddle otherwise the collision will happen again
      // in the next frame
      ball.y = paddle.y - ball.height;
    }

    // check to see if ball collides with a brick. if it does, remove the brick
    // and change the ball velocity based on the side the brick was hit on
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];

      if (collides(ball, brick)) {
        //update score
        score += 1;
        if (score > highscore) {
          highscore = score;
        }
        document.getElementById("score-board").innerHTML = "Score: " + score;
        document.getElementById("highscore-board").innerHTML = "High Score: " + highscore; 


        // remove brick from the bricks array
        bricks.splice(i, 1);

        // ball is above or below the brick, change y velocity
        // account for the balls speed since it will be inside the brick when it
        // collides
        if (ball.y + ball.height - ball.speed <= brick.y ||
            ball.y >= brick.y + brick.height - ball.speed) {
          ball.dy *= -1;
        }
        // ball is on either side of the brick, change x velocity
        else {
          ball.dx *= -1;
        }

        break;
      }
    }    

    // draw ball if it's moving
    if (ball.dx || ball.dy) {
      context.fillRect(ball.x, ball.y, ball.width, ball.height);
    }

    // draw bricks
    bricks.forEach(function(brick) {
      context.fillStyle = brick.color;
      context.fillRect(brick.x, brick.y, brick.width, brick.height);
    });

    // draw paddle
    context.fillStyle = 'cyan';
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }

  // listen to keyboard events to move the paddle
  document.addEventListener('keydown', function(e) {
    // left arrow key
    if (e.which === 37) {
      paddle.dx = -10;
    }
    // right arrow key
    else if (e.which === 39) {
      paddle.dx = 10;
    }

    // space key
    // if they ball is not moving, we can launch the ball using the space key. ball
    // will move towards the bottom right to start
    if (ball.dx === 0 && ball.dy === 0 && e.which === 32) {
      ball.dx = ball.speed;
      ball.dy = ball.speed;

      //reset score
      score = 0;
      document.getElementById("score-board").innerHTML = "Score: " + score;
    }
  });

  // listen to keyboard events to stop the paddle if key is released
  document.addEventListener('keyup', function(e) {
    if (e.which === 37 || e.which === 39) {
      paddle.dx = 0;
    }
  });

  // start the game
  let id = requestAnimationFrame(loop);
}