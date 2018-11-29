const cvs    = document.getElementById("canvas");
const ctx    = cvs.getContext("2d");
const WIDTH  = cvs.width;
const HEIGHT = cvs.height;

class Block {
  constructor(x, y, width, height, color) {
    this.width  = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
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

const ROAD_MARKS_AMOUNT = 10;
const HIGHWAY_WIDTH = WIDTH / 1.3;
const GRASS_BLOCKS = [];
const ROAD         = new Highway((WIDTH / 2) - (HIGHWAY_WIDTH / 2), 0, HIGHWAY_WIDTH, HEIGHT, "#2A2A2A");
initGame();

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function initGame() {
    console.log("ROAD LENGTH - " + ROAD.roadMarks.length);
    initGrassBlocks();
    gameLoop();
}

function draw() {
    drawGrass();
    drawRoad();
}

function update() {
  updateGrassBlocks();
  updateRoad();
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
    markPair.mark_one.y += 5;
    markPair.mark_two.y += 5;
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
    block.y++;
  }
}

function initGrassBlocks() {
  // Needs to be split in an odd number
  let screenSplit = 11;
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
