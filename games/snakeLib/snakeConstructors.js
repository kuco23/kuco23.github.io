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
