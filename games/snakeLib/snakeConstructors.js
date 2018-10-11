function Player(ctx, x, y, width, height, color) {
  const Shot = function(ctx, x, y, width, height, color) {
    this.context = ctx
    this.x = x; this.y = y;
    this.width = width; this.height = height;
    this.color = color;
    this.create = function() {
      this.context.fillStyle = this.color;
      this.context.fillRect(this.x, this.y, this.width, this.height);
    };
    this.delete = function () {
      this.context.clearRect(this.x, this.y, this.width, this.height);
    };
    this.create();
  };

  const ShotCollection = function () {
    this.array = [];
    this.add = function (thing) {
      this.array.push(thing);
    };
    this.move = function (speed) {
      for (let i = 0; i < this.array.length; i++) {
        if (!this.array[i]) continue;
        this.array[i].delete();
        this.array[i].y -= speed;
        this.array[i].create();
        if (this.array[i].y + this.array[i].height <= 0) {
          this.array[i].delete();
          this.array[i] = null;
        }
      }
    };
  };
  this.context = ctx;
  this.x = x; this.y = y;
  this.width = width; this.height = height;
  this.color = color;
  this.shots = new ShotCollection();
  this.getCenter = function() {return [this.x + this.width / 2, this.y + this.height/2];};
  this.create = function () {
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x, this.y, this.width, this.height);
  };
  this.delete = function () {
    this.context.clearRect(this.x, this.y, this.width, this.height);
  };
  this.move = function(speedX, speedY) {
    this.delete();
    this.x += speedX;
    this.y += speedY;
    this.create();
  };
  this.addShot = function(shotWidth, shotHeight, shotColor) {
    this.shots.add(new Shot(this.context, this.x + (this.width - shotWidth) / 2, this.y - shotHeight, shotWidth, shotHeight, shotColor));
  };
  this.create();
}

function Snake(ctx, length, partSize, color, startX, startY, life) {
  const SnakePart = function(ctx, x, y, r, color) {
    this.context = ctx;
    this.x = x; this.y = y; this.radius = r;
    this.color = color;
    this.create = function() {
      this.context.fillStyle = this.color;
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      this.context.fill();
    };
    this.delete = function() {
      this.context.clearRect(this.x - this.radius - 1, this.y - this.radius - 1, (this.radius + 1) * 2, (this.radius + 1) * 2);
    };
    this.create();
  };
  this.context = ctx;
  this.life = life; this.lifeCount = life;
  this.partSize = partSize;
  this.parts = [];
  this.color = color;
  for (let i = 0; i < length; i++) {
    let snakepart = new SnakePart(this.context, startX - partSize * i, startY, partSize / 2, color);
    this.parts.push(snakepart);
  }
  this.move = function (speed, followX, followY) {
    this.delete();
    if (this.parts[0]) {
      const vector = vectorNorm([followX - this.parts[0].x, followY - this.parts[0].y]);
      this.parts[0].x += vector[0] * speed;
      this.parts[0].y += vector[1] * speed;
      this.parts[0].create();
    }
    for (let i = 1; i < this.parts.length; i++) {
      let rawFollowVec = vectorNorm([this.parts[i - 1].x - this.parts[i].x, this.parts[i - 1].y - this.parts[i].y]);
      this.parts[i].x = this.parts[i - 1].x - rawFollowVec[0] * this.partSize;
      this.parts[i].y = this.parts[i - 1].y - rawFollowVec[1] * this.partSize;
      this.parts[i].create();
    }
  };
  this.delete = function () {
    for (let i = 0; i < this.parts.length; i++) {
      this.parts[i].delete();
    }
  };
  this.lifeDown = function () {
    this.lifeCount -= 1;
    if (this.lifeCount == 0) {
      this.lifeCount = this.life;
      this.parts[0].delete();
      this.parts = this.parts.slice(1, this.parts.length);
    }
  };
  if (this.parts[0]) {
    this.parts[0].delete();
  }
}

function SnakeGame(Canvas, Context, framespersec,
  playerspeed, playerwidth, playerheight, playercolor,
  shotspeed, shotwidth, shotheight, shotcolor,
  snakespeed, snakelife, snakelen, snakepartsize, snakecolor, snakestartx, snakestarty) {

  this.state = null; // this changes to true if game ended and was won and false if lost

  this.Canvas = Canvas; this.Context = Context; // where game is being played
  this.framespersec = framespersec; // gamespecs
  this.playerspeed = playerspeed, this.playerwidth = playerwidth; this.playerheight = playerheight; // player specs
  this.playerheight = playerheight; this.playercolor = playercolor;
  this.shotspeed = shotspeed; this.shotwidth = this.shotwidth = shotwidth; // shotspecs
  this.shotheight = shotheight; this.shotcolor = shotcolor;
  this.snakespeed = snakespeed; this.snakelife = snakelife; // snake specs
  this.snakelen = snakelen; this.snakepartsize = snakepartsize; this.snakecolor = snakecolor;
  this.snakestartx = snakestartx, this.snakestarty = snakestarty;

  this.keysChange = function(keyCode, bool) {
    this.keys[keyCode] = bool;
  };
  this.start = function() {
    this.keys = [];
    this.touchPos = [];

    this.player = new Player(this.Context, this.Canvas.width / 2, this.Canvas.height - this.playerheight * 2, this.playerwidth, this.playerheight, this.playercolor);
    this.snake = new Snake(Context, this.snakelen, this.snakepartsize, this.snakecolor, this.snakestartx, this.snakestarty, this.snakelife);

    var self = this;
    window.addEventListener('keydown', function(e) {self.keysChange.call(self, e.keyCode, true);}, false);
    window.addEventListener('keyup', function(e) {self.keysChange.call(self, e.keyCode, false)}, false);

    // binds the updateGame to the gameObj, so setInterval is not the parent, so this can be used in updateGame refering to gameObj
    this.interval = setInterval(this.updateGame.bind(this), 1000 / this.framespersec);
  };
  this.processCollision = function() {
    for (let i = 0; i < this.player.shots.array.length; i++) {
      if (!this.player.shots.array[i]) continue;
      if (checkCollision([this.player.shots.array[i].x, this.player.shots.array[i].y], [this.snake.parts[0].x, this.snake.parts[0].y],
        this.player.shots.array[i].width, this.player.shots.array[i].height, this.snake.partSize / 2 )) {
        this.snake.lifeDown();
        this.player.shots.array[i].delete();
        this.player.shots.array[i] = null;
        if (this.snake.parts.length == 0) {
          return this.endGame(true); // ends before it checks for player-snake collision
        }
      }
    }
    // checkCollision is written in another file
    if (checkCollision([this.player.x, this.player.y], [this.snake.parts[0].x, this.snake.parts[0].y],
       this.player.width, this.player.height, this.snake.partSize / 2)) {
      return this.endGame(false);
    }
  };
  this.updateGame = function() {
    if (this.keys != []) {
      if (this.keys[37] && this.player.x - this.playerspeed >= 0) this.player.move(-this.playerspeed, 0);
      if (this.keys[38] && this.player.y - this.playerspeed >= 0) this.player.move(0, -this.playerspeed);
      if (this.keys[39] && this.player.x + this.playerspeed + this.playerwidth <= this.Canvas.width) this.player.move(this.playerspeed, 0);
      if (this.keys[40] && this.player.y + this.playerspeed + this.playerheight <= this.Canvas.height) this.player.move(0, this.playerspeed);
      if (this.keys[32]) {this.player.addShot(this.shotwidth, this.shotheight, this.shotcolor); this.keys[32] = false;}
    }
    let playerCenter = this.player.getCenter();
    this.player.shots.array.filter(shot => shot);
    this.snake.move(this.snakespeed, playerCenter[0], playerCenter[1]);
    this.player.shots.move(this.shotspeed);
    this.processCollision();
  };
  this.endGame = function (gameWon) {
    clearInterval(this.interval);
    this.state = gameWon;
    this.player = null;
    this.snake = null;
    this.updateInterval = null;
    this.directInterval = null;
    this.Context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
    gameCallback(gameWon); // callback function has to be defined globally
  };
}
