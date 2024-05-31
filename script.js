// the code is executed only after the HTML content of the page is fully loaded.
document.addEventListener("DOMContentLoaded", function () {
  let game = new Game();
  game.loop();
});

// `this` refers to the current instance of the GameView class.
//  this.ctx, this.width, etc, are properties of the current instance of the GameView class.
class GameView {
  constructor() {
    let canvas = document.querySelector("#canvas");
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.offsetTop = canvas.offsetTop;
  }

  // Rest parameters (indicated by three dots (...)) followed by the parameter name
  // allow you to represent an indefinite number of arguments as an array.
  draw(...entities) {
    // Fill the Canvas with Black
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);

    entities.forEach((entity) => entity.draw(this.ctx));
  }

  drawScores(scores) {
    // Fill
    this.ctx.fillStyle = "white";
    this.ctx.font = "30px monospace";

    this.ctx.textAlign = "left";
    this.ctx.fillText(scores.leftScore.toString(), 50, 50);

    this.ctx.textAlign = "right";
    this.ctx.fillText(scores.rightScore.toString(), this.width - 50, 50);
  }

  drawGameOver() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "30px monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText("GAME OVER", this.width / 2, this.height / 2);
  }
}

class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // Returns an object with the left, right, top, and bottom bounds of the entity
  boundingBox() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height,
    };
  }

  // Takes a drawing context and draws a white rectangle
  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Paddle extends Entity {
  // Caps as they are to be tret as constants
  static WIDTH = 5;
  static HEIGHT = 20;
  static OFFSET = 10;

  constructor(x, y) {
    // Uses super to call the constructor of its superclass (Entity)
    super(x, y, Paddle.WIDTH, Paddle.HEIGHT);
  }
}

class Ball extends Entity {
  static SIZE = 5;

  constructor() {
    // The 0's (X & Y) are just placeholders and the ball's position is handled by init()
    super(0, 0, Ball.SIZE, Ball.SIZE);
    this.init();
  }

  init() {
    this.x = 20;
    this.y = 30;
    this.xSpeed = 4;
    this.ySpeed = 2;
  }

  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  adjustAngle(distanceFromTop, distanceFromBottom) {
    if (distanceFromTop < 0) {
      // If the ball is hit near the top of the paddle, reduce the ySpeed
      this.ySpeed -= 0.5;
    } else if (distanceFromBottom < 0) {
      // If the ball is hit near the bottom of the padde, increase the ySpeed
      this.ySpeed += 0.5;
    }
  }

  checkPaddleCollision(paddle, xSpeedAfterBounce) {
    let ballBox = this.boundingBox();
    let paddleBox = paddle.boundingBox();

    // Confirm if the ball and paddle are overlapping both vertically and horizontally
    let collisionOccured =
      ballBox.left < paddleBox.right &&
      ballBox.right > paddleBox.left &&
      ballBox.top < paddleBox.bottom &&
      ballBox.bottom > paddleBox.top;

    // if collisionOccured = true
    if (collisionOccured) {
      let distanceFromTop = ballBox.top - paddleBox.top;
      let distanceFromBottom = paddleBox.bottom - ballBox.bottom;
      this.adjustAngle(distanceFromTop, distanceFromBottom);
      this.xSpeed = xSpeedAfterBounce;
    }
  }

  checkWallCollision(width, height, scores) {
    let ballBox = this.boundingBox();

    // Hitting the Left wall
    if (ballBox.left < 0) {
      scores.rightScore++;
      this.init();
    }
    // Hitting the Right wall
    if (ballBox.right > width) {
      scores.leftScore++;
      this.init();
    }
    // Hitting the Top or Bottom walls
    if (ballBox.top < 0 || ballBox.bottom > height) {
      this.ySpeed = -this.ySpeed;
    }
  }
}

class Scores {
  constructor() {
    this.leftScore = 0;
    this.rightScore = 0;
  }
}

class Computer {
  static followBall(paddle, ball) {
    const MAX_SPEED = 2;
    let ballBox = ball.boundingBox();
    let paddleBox = paddle.boundingBox();

    if (ballBox.top < paddleBox.top) {
      paddle.y -= MAX_SPEED;
    } else if (ballBox.bottom > paddleBox.bottom) {
      paddle.y += MAX_SPEED;
    }
  }
}

class Game {
  constructor() {
    this.gameView = new GameView();
    this.ball = new Ball();
    this.leftPaddle = new Paddle(Paddle.OFFSET, 10);
    this.rightPaddle = new Paddle(
      this.gameView.width - Paddle.OFFSET - Paddle.WIDTH,
      30
    );

    this.scores = new Scores();
    this.gameOver = false;

    document.addEventListener("mousemove", (e) => {
      this.rightPaddle.y = e.y - this.gameView.offsetTop;
    });
  }

  draw() {
    this.gameView.draw(this.ball, this.leftPaddle, this.rightPaddle);
    this.gameView.drawScores(this.scores);
  }

  checkCollision() {
    this.ball.checkPaddleCollision(this.leftPaddle, Math.abs(this.ball.xSpeed));
    this.ball.checkPaddleCollision(
      this.rightPaddle,
      -Math.abs(this.ball.xSpeed)
    );

    this.ball.checkWallCollision(
      this.gameView.width,
      this.gameView.height,
      this.scores
    );

    if (this.scores.leftScore > 4 || this.scores.rightScore > 4) {
      this.gameOver = true;
    }
  }

  update() {
    this.ball.update();
    Computer.followBall(this.leftPaddle, this.ball);
  }

  loop() {
    this.draw();
    this.update();
    this.checkCollision();

    if (this.gameOver) {
      this.draw();
      this.gameView.drawGameOver();
    } else {
      // Call this method again after a Timeout
      setTimeout(() => this.loop(), 30);
    }
  }
}
