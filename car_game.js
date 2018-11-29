const cvs    = document.getElementById("canvas");
const ctx    = cvs.getContext("2d");
const WIDTH  = cvs.width;
const HEIGHT = cvs.height;

window.addEventListener("keydown", checkInput)

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

class GrassBlock extends Block {
    constructor(x, y, width, height, color) {
      super(x, y, width, height, color);
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
    let width = 2;
    let height = 30;
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

const KEYS = {left : false, right : false};
const ROAD_MARKS_AMOUNT = 10;
const HIGHWAY_WIDTH = WIDTH / 1.3;
const GRASS_BLOCKS = [];
const CAR_WIDTH = 45;
const CAR_HEIGHT = 60;

// Make these globals easy to find byt using uppercase for now.
var ROAD;
var PLAYER;
var TRAFFIC = [];

initGame();

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function initGame() {
    ROAD = new Highway((WIDTH / 2) - (HIGHWAY_WIDTH / 2), 0, HIGHWAY_WIDTH, HEIGHT, "#2A2A2A");
    PLAYER = new Car(ROAD.x + ROAD.width / 2 - CAR_WIDTH / 2, HEIGHT - CAR_HEIGHT * 1.6, CAR_WIDTH, CAR_HEIGHT, "blue", 2);
    createTraffic();
    initGrassBlocks();
    gameLoop();
}

function draw() {
    drawGrass();
    drawRoad();
    drawTraffic();
    drawPlayer();
}

function update() {
  updateGrassBlocks();
  updateRoad();
  updatePlayer();
}

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
    markPair.mark_one.y += 8;
    markPair.mark_two.y += 8;
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
    block.y += 3;
  }
}

function initGrassBlocks() {
  // Needs to be split in an odd number
  let screenSplit = 5;
  let blockHeight = HEIGHT / screenSplit;
  let offset = -blockHeight;
  // Create 1 extra block to keep the background "rolling"
  for (let i = 1; i <= screenSplit + 1; i++) {
    let color = i % 2 === 0 ? "#006400" : "#228B22";
    let block = new GrassBlock(0, offset, WIDTH, blockHeight, color);
    GRASS_BLOCKS.push(block);
    offset += blockHeight;
  }
}

function createTraffic() {
  let amountOfTraffic = 3
  let roadBlock = ROAD.width / 3;
  let carOffsetX = roadBlock / 2 - CAR_WIDTH / 2;
  let offsetY = HEIGHT / amountOfTraffic;
  let yPos = 0;
  for (let i = 0; i < amountOfTraffic; i++) {
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
    TRAFFIC.push(new Car(xPos, yPos, CAR_WIDTH, CAR_HEIGHT, "#7a003d", lane))
    yPos += offsetY;
  }
  console.log(TRAFFIC.length);
}

function drawTraffic() {
  for (let car of TRAFFIC) {
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.rect(car.x, car.y, car.width, car.height);
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
}

function checkInput(event) {
  switch(event.keyCode) {
    case 37:
      KEYS.left = event;
    break;
    case 39:
      KEYS.right = event;
    break;
  }
}
