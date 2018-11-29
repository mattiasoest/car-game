const cvs    = document.getElementById("canvas");
const ctx    = cvs.getContext("2d");
const WIDTH  = cvs.width;
const HEIGHT = cvs.height;

window.addEventListener("keydown", checkInput)

// Classes
//=====================================================
class Block {
  constructor(x, y, width, height, color) {
    this.width  = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
  }
}

class Car extends Block {
  constructor(x, y, width, height, color, lane) {
    super(x, y, width, height, color);
    this.lane = lane;
  }
}

class Highway extends Block {
  constructor(x, y, width, height, color) {
    super(x, y, width, height, color);
    this.markOffset = this.height / ROAD_MARKS_AMOUNT;
    this.initRoadMarks();
  }

  initRoadMarks() {
    let offsetX = this.width / 3;
    let width = 4;
    let height = 80;
    let posY = -height;

    this.roadMarks = []
    // One extra loop to keep the road "rolling" using the marks
    for (let i = 0; i < ROAD_MARKS_AMOUNT + 1; i++) {
          this.roadMarks.push({
          mark_one : new Block(this.x + offsetX - width / 2, posY, width, height, "white"),
          mark_two : new Block(this.x + offsetX * 2 - width / 2, posY, width, height, "white")
        });
        posY += this.markOffset;
    }
  }
}
//=====================================================
const CAR_COLORS = ["#800000", "#800080","#4B0082",
  "#2F4F4F","#D2691E","#DAA520","#380474","#DC143C",
  "#FF8C00","#FFD700","#FF4500","#FF1493", "#7a003d"];
const WINDOW_COLOR = "#00FFFF";
const GAME_STATE = {PLAY : 0, MENU : 1};
const KEYS              = {left : false, right : false};
const ROAD_MARKS_AMOUNT = 4;
const HIGHWAY_WIDTH     = WIDTH / 1.3;
const GRASS_BLOCKS      = [];
const CAR_WIDTH         = 45;
const CAR_HEIGHT        = 65;
const BACKGROUND_SPEED  = 26;
const TRAFFIC_SPEED     = 11;
//=====================================================
// Make these globals easy to find byt using uppercase for now.
var ROAD;
var PLAYER;
var TRAFFIC = [];
var POINTS = 0;
var CRASH_SOUND;
var POINT_SOUND;
var START_GAME_SOUND;
var CURRENT_STATE = GAME_STATE.MENU;
//Run the game!
//=====================================================
startGame();
//=====================================================
// Implementation
//=====================================================
function startGame() {
  initGame();
  gameLoop();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function initGame() {
    loadSounds();
    createRoad();
    createTraffic();
    createPlayer();
    initGrassBlocks();
}

function draw() {
  drawGrass();
  drawRoad();
  drawPlayer();
  switch (CURRENT_STATE) {
    case GAME_STATE.PLAY:
      drawTraffic();
      break;
    case GAME_STATE.MENU:
      drawPressStart();
    break;
    default:

  }
  // Draw points last its on the top of the canvas
  drawPoints();
}

function update() {
  updateGrassBlocks();
  updateRoad();
  switch (CURRENT_STATE) {
    case GAME_STATE.PLAY:
      updateTraffic();
      updatePlayer();
      checkPlayerCollision();
      break;
      case GAME_STATE.MENU:
        // TODO If we create some more features
        break;
    default:
  }
}

// Helpers
//=====================================================
function loadSounds() {
  CRASH_SOUND = new Audio("sounds/car_crash.wav");
  POINT_SOUND = new Audio("sounds/points_10.wav");
  START_GAME_SOUND = new Audio("sounds/car_start_game.wav");

  CRASH_SOUND.volume = 0.15;
  POINT_SOUND.volume = 0.15;
  START_GAME_SOUND.volume = 0.1;
}
function resetGame() {
  CURRENT_STATE = GAME_STATE.MENU;
  POINTS = 0;
  // Just need to update 2 attributes for the player
  PLAYER.x = ROAD.x + ROAD.width / 2 - CAR_WIDTH / 2;
  PLAYER.lane = 2;
  // Create new cars for now.
  // Somewhat of a waste but will do for now.
  TRAFFIC = [];
  createTraffic();
}

function createPlayer() {
  PLAYER = new Car(ROAD.x + ROAD.width / 2 - CAR_WIDTH / 2, HEIGHT - CAR_HEIGHT * 2.5, CAR_WIDTH, CAR_HEIGHT, "blue", 2);
}

function createRoad() {
  ROAD = new Highway((WIDTH / 2) - (HIGHWAY_WIDTH / 2), 0, HIGHWAY_WIDTH, HEIGHT, "#2A2A2A");
}
function initGrassBlocks() {
  // Needs to be split in an odd number
  let screenSplit = 5;
  let blockHeight = HEIGHT / screenSplit;
  let offset = -blockHeight;
  // Create 1 extra block to keep the background "rolling"
  for (let i = 1; i <= screenSplit + 1; i++) {
    let color = i % 2 === 0 ? "#006400" : "#228B22";
    let block = new Block(0, offset, WIDTH, blockHeight, color);
    GRASS_BLOCKS.push(block);
    offset += blockHeight;
  }
}

function checkInput(event) {
  var key_state = (event.type == "keydown") ? true : false;
  if (key_state && CURRENT_STATE === GAME_STATE.MENU) {
    START_GAME_SOUND.play();
    CURRENT_STATE = GAME_STATE.PLAY;
  }
  switch(event.keyCode) {
    case 37:
      KEYS.left = event;
    break;
    case 39:
      KEYS.right = event;
    break;
  }
}

function generateRandomColor() {
  let randomIndex = Math.floor(Math.random() * CAR_COLORS.length);
  return CAR_COLORS[randomIndex];
}

function generateRandomLanePos() {
  let roadBlock = ROAD.width / 3;
  let carOffsetX = roadBlock / 2 - CAR_WIDTH / 2;
  let lane = Math.floor(Math.random()*3)+1;
  let xPos = 0;
  switch (lane) {
    case 1:
      xPos = ROAD.x + carOffsetX;
      break;
    case 2:
      xPos = ROAD.x + roadBlock + carOffsetX;
      break;
    case 3:
      xPos = ROAD.x + roadBlock * 2 + carOffsetX;
      break;
    default:
  }
  return x = {x : xPos, lane : lane};
}

function createTraffic() {
  let amountOfTraffic = 3;
  let offsetY = HEIGHT / amountOfTraffic;
  let yPos = -CAR_HEIGHT;
  for (let i = 0; i < amountOfTraffic; i++) {
    let xPos = generateRandomLanePos();
    let randomColor = generateRandomColor();
    // Unshift since we're going back with the offset!
    TRAFFIC.unshift(new Car(xPos.x, yPos, CAR_WIDTH, CAR_HEIGHT, randomColor, xPos.lane))
    yPos -= offsetY;
  }
}

function checkPlayerCollision() {
  let nearestCar = TRAFFIC[TRAFFIC.length -1];
  // Only check collision if neccessary
  if (nearestCar.y + nearestCar.height > PLAYER.y && nearestCar.y < PLAYER.y+ PLAYER.height) {
    // Easy detection with lane system.
    if (PLAYER.lane === nearestCar.lane) {
      CRASH_SOUND.play();
      resetGame();
    }
  }
}

// Updaters
//=====================================================
function updatePlayer() {
  let roadBlock = ROAD.width / 3;
  let playerOffset = roadBlock / 2 - CAR_WIDTH / 2;
  switch (PLAYER.lane) {
    case 1:
      if (KEYS.right) {
        PLAYER.x = ROAD.x + roadBlock + playerOffset;
        PLAYER.lane = 2;
      }
      break;
    case 2:
      if (KEYS.right) {
        PLAYER.x = ROAD.x + roadBlock * 2 + playerOffset;
        PLAYER.lane = 3;
      }
      else if (KEYS.left) {
        PLAYER.x = ROAD.x + playerOffset;
        PLAYER.lane = 1;
      }
      break;
    case 3:
      if (KEYS.left) {
        PLAYER.x = ROAD.x + roadBlock + playerOffset;
        PLAYER.lane = 2;
      }
      break;
    default:
  }
  // Reset since we just looking for the tap.
  KEYS.right = false;
  KEYS.left = false;
}

function updateTraffic() {
  let lastIndex = TRAFFIC[TRAFFIC.length - 1];
  if (lastIndex.y > HEIGHT) {
    POINTS++;
    if (POINTS !== 0 && POINTS % 10 === 0) {
      POINT_SOUND.play();
    }
    let car = TRAFFIC.pop();
    let posObj = generateRandomLanePos();
    car.color = generateRandomColor();

    car.x = posObj.x;
    car.lane = posObj.lane;
    car.y = -car.height;
    TRAFFIC.unshift(car);
  }
  for (let car of TRAFFIC) {
    car.y += TRAFFIC_SPEED;
  }
}

function updateRoad() {
  let lastIndex = ROAD.roadMarks[ROAD.roadMarks.length-1];
  if (lastIndex.mark_one.y > HEIGHT) {
      let markPair = ROAD.roadMarks.pop();
      let y = HEIGHT / 10;
      markPair.mark_one.y = -ROAD.markOffset;
      markPair.mark_two.y = -ROAD.markOffset;
      ROAD.roadMarks.unshift(markPair);
  }

  for (let markPair of ROAD.roadMarks) {
    markPair.mark_one.y += BACKGROUND_SPEED;
    markPair.mark_two.y += BACKGROUND_SPEED;
  }
}

function updateGrassBlocks() {
  // Check is the last block is out of the canvas
  let lastBlock = GRASS_BLOCKS[GRASS_BLOCKS.length-1];
  if (lastBlock.y > HEIGHT) {
    // Reuse the same block
    let block = GRASS_BLOCKS.pop();
    block.y = -block.height;
    GRASS_BLOCKS.unshift(block);
  }

  for (let block of GRASS_BLOCKS) {
    block.y += BACKGROUND_SPEED;
  }
}

// Draw functions
//=====================================================
function drawTraffic() {
  for (let car of TRAFFIC) {
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.rect(car.x, car.y, car.width, car.height);
    ctx.fill();

    ctx.fillStyle = WINDOW_COLOR;
    ctx.beginPath();
    ctx.rect(car.x + car.width / 8, car.y + car.height / 4.2, car.width - car.width / 4, car.height / 5.5);
    ctx.rect(car.x + car.width / 8, car.y + car.height / 1.6, car.width - car.width / 4, car.height / 7);
    ctx.fill();
  }
}

function drawRoad() {
  ctx.fillStyle = ROAD.color;
  ctx.beginPath();
  ctx.rect(ROAD.x, ROAD.y, ROAD.width, ROAD.height);
  ctx.fill();

  for (let roadMark of ROAD.roadMarks) {
    let markOne = roadMark.mark_one;
    let markTwo = roadMark.mark_two;
    // Same color for both marks.
    ctx.fillStyle = roadMark.mark_one.color;
    ctx.beginPath();
    ctx.rect(markOne.x, markOne.y, markOne.width, markOne.height);
    ctx.fill();
    ctx.beginPath();
    ctx.rect(markTwo.x, markTwo.y, markTwo.width, markTwo.height);
    ctx.fill();
  }
}

function drawGrass() {
    for (let block of GRASS_BLOCKS) {
      ctx.fillStyle = block.color;
      ctx.beginPath();
      ctx.rect(block.x, block.y, block.width, block.height);
      ctx.fill();
    }
}

function drawPlayer(){
  ctx.fillStyle = PLAYER.color;
  ctx.beginPath();
  ctx.rect(PLAYER.x, PLAYER.y, PLAYER.width, PLAYER.height);
  ctx.fill();

  ctx.fillStyle = WINDOW_COLOR;
  ctx.beginPath();
  ctx.rect(PLAYER.x + PLAYER.width / 8, PLAYER.y + PLAYER.height / 4.2, PLAYER.width - PLAYER.width / 4, PLAYER.height / 5.5);
  ctx.rect(PLAYER.x + PLAYER.width / 8, PLAYER.y + PLAYER.height / 1.6, PLAYER.width - PLAYER.width / 4, PLAYER.height / 7);
  ctx.fill();
}

function drawPoints() {
  ctx.fillStyle = "white";
  ctx.font = "25px Verdana";
  ctx.fillText("Cars passed: " + POINTS, 5, 25);
}

function drawPressStart() {
  ctx.fillStyle = "white";
  ctx.font = "30px Verdana";
  // Ugly constans for the text, will do for now.
  ctx.fillText("Press any key to start!",38, HEIGHT / 2);
}
