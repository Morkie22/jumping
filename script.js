const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
let score = 0;
let isGameOver = false;
let lastTime = 0;

// Settings and constants
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const PLAYER_WIDTH = 44;
const PLAYER_HEIGHT = 62.67;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const CACTUS_IMAGE = "../Images/cactus.png";

// Helper functions
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

// Classes
class Player {
    constructor(context) {
        this.context = context;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.x = 10;
        this.y = GAME_HEIGHT - this.height - 5;
        this.gravity = 0.5;
        this.velocity = 0;
        this.jumpPower = -10;
        this.isJumping = false;
        this.groundY = this.y;
    }

    jump() {
        if (!this.isJumping) {
            this.velocity = this.jumpPower;
            this.isJumping = true;
        }
    }

    update() {
        this.y += this.velocity;
        this.velocity += this.gravity;

        if (this.y > this.groundY) {
            this.y = this.groundY;
            this.isJumping = false;
        }
    }

    draw() {
        this.context.fillStyle = 'black';
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ground {
    constructor(context) {
        this.context = context;
        this.width = GROUND_WIDTH;
        this.height = GROUND_HEIGHT;
        this.x = 0;
        this.y = GAME_HEIGHT - this.height;
    }

    update() {
        // Ground does not move in this simple version, but you can add movement if needed
    }

    draw() {
        this.context.fillStyle = 'sandybrown';
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}

class TrapsController {
    constructor(context, image) {
        this.context = context;
        this.traps = [];
        this.spawnRate = 2000; // milliseconds
        this.lastSpawn = 0;
        this.image = image;
    }

    update(deltaTime) {
        if (Date.now() - this.lastSpawn > this.spawnRate) {
            this.traps.push(new Trap(this.context, this.image, GAME_WIDTH, GAME_HEIGHT - 50));
            this.lastSpawn = Date.now();
        }

        this.traps = this.traps.filter(trap => trap.x + trap.width > 0);
        this.traps.forEach(trap => trap.update());
    }

    draw() {
        this.traps.forEach(trap => trap.draw());
    }

    collideWith(player) {
        return this.traps.some(trap => trap.x < player.x + player.width &&
            trap.x + trap.width > player.x &&
            trap.y < player.y + player.height &&
            trap.y + trap.height > player.y);
    }
}

class Trap {
    constructor(context, image, x, y) {
        this.context = context;
        this.width = 20;
        this.height = 40;
        this.x = x;
        this.y = y;
        this.speed = 5;
        this.image = image;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        this.context.fillStyle = 'green';
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Game setup and loop
let player = new Player(context);
let ground = new Ground(context);
let trapsController = new TrapsController(context, loadImage(CACTUS_IMAGE));

function gameLoop(timestamp) {
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);  // Clear the canvas
    ground.update(deltaTime);
    ground.draw();
    player.update(deltaTime);
    player.draw();
    trapsController.update(deltaTime);
    trapsController.draw();

    if (trapsController.collideWith(player)) {
        isGameOver = true;
        displayGameOver();
    } else {
        score++;
        requestAnimationFrame(gameLoop);
    }
}

function displayGameOver() {
    context.fillStyle = "red";
    context.font = "30px 'Press Start 2P'";
    context.fillText("Game Over!", 150, 100);
}

document.addEventListener('keydown', function (event) {
    if (event.code === "Space" && !isGameOver) {
        player.jump();
    } else if (isGameOver && event.code === "Enter") {
        restartGame();
    }
});

function restartGame() {
    score = 0;
    isGameOver = false;
    trapsController = new TrapsController(context, loadImage(CACTUS_IMAGE));
    player = new Player(context);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
