const cvs    = document.getElementById("canvas");
const ctx    = cvs.getContext("2d");
const WIDTH  = cvs.width;
const HEIGHT = cvs.height;


class GrassBlock {
  constructor(x, y, width, height, color) {
    this.width  = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.color = color;
  }
}

const GRASS_BLOCKS = [];

initGame();

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function initGame() {
    initGrassBlocks();
    gameLoop();
}

function draw() {
    drawGrass();
}

function update() {
  updateGrassBlocks();
}

function updateGrassBlocks() {
  // Check is the last block is out of the canvas
  let lastBlock = GRASS_BLOCKS[GRASS_BLOCKS.length-1];
  if (lastBlock.y > HEIGHT) {
    console.log("LAST COLOR " +lastBlock.color);
    // Reuse the same block
    let block = GRASS_BLOCKS.pop();
    console.log("POPPED " + block.color);
    console.log(GRASS_BLOCKS.length);
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

function drawGrass() {
    for (let block of GRASS_BLOCKS) {
      ctx.fillStyle = block.color;
      ctx.beginPath();
      ctx.rect(block.x, block.y, block.width, block.height);
      ctx.fill();
    }
}