
const WIDTH = 29;
const HEIGHT = 29//14;
const CANVAS_SIZE = 720;
const CELL_WIDTH = 23;
const CELL_HEIGHT = 21;
const RADIUS = CELL_HEIGHT/2;
const grid = generateGrid();
const lines = generateLines(grid);


// p5.js Functions
function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE, SVG);
  strokeWeight(1)
  noLoop();
  ellipseMode(RADIUS);
}



function draw() {
  for (let h = 0; h < HEIGHT; h++) {
    for (let w = 0; w < WIDTH; w++) {
      let x = w*CELL_WIDTH;
      let y = h*CELL_HEIGHT;
      let v = grid[h][w];

      if (!v) { continue; }

      strokeWeight(1);
      fill(255);
      ellipse(x + CELL_WIDTH/2, y + CELL_HEIGHT/2, RADIUS, RADIUS);
    }
  }

  for (const l of lines) {
    drawLine(l);
  }
}



function mousePressed() {
  if (mouseButton === LEFT) {
    remove();
    redraw();
  } else if (mouseButton === RIGHT) {
    save('degredation.svg');
  }
}



// Helper functions
function generateGrid() {
  //const rowProbabilities = [ WIDTH, WIDTH, WIDTH, WIDTH, 20, 13, 11, 8, 8, 8, 6, 3, 3, 1 ].map(v => v / WIDTH);
  const rowProbabilities = new Array(HEIGHT).fill(0).map((v, idx) => {
    if (idx < 4) { return WIDTH; }
    return (WIDTH - idx) / WIDTH;
  })
  
  // Genreate the grid
  const grid = [ ];
  for (let i = 0; i < HEIGHT; i++) {
    grid.push(new Array(WIDTH).fill(0).map(v => Math.random() < rowProbabilities[i]));
  }

  return grid;
}

function generateLines(grid) {

  const connectAdjacent = (h, w) => {

    const offsets = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 }
    ];

    let diagOffsets = [
      { x: -1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: -1 },
      { x: 1, y: 1 }
    ];

    for (let offset of offsets) {
      let xOff = offset.x;
      let yOff = offset.y;
      let x = w + xOff
      let y = h + yOff
      if (y < 0 || y >= HEIGHT) { continue; } // Bounds check

      // Add a connection
      if (grid[y][x]) {
        let key = `${w},${h},${x},${y}`;
        let key2 = `${x},${y},${w},${h}`;
        if (lines[key] === undefined || lines[key2] === undefined) { 
          lines[key] = true;
          // Remove the diagOffsets which are adjacent to the current position
          diagOffsets = diagOffsets.filter(v => {
            if (xOff !== 0) {
              if (v.x === xOff && v.y === yOff - 1) { return false; }
              if (v.x === xOff && v.y === yOff + 1) { return false; }
            } else if (yOff !== 0) {
              if (v.x === xOff - 1 && v.y === yOff) { return false; }
              if (v.x === xOff + 1 && v.y === yOff) { return false; }
            }
            return true; 
          });
        }

      }
    }

    if (diagOffsets.length === 0) { return; }

    // Connect diagonals, if they exist
    for (let i = 0; i < diagOffsets.length; i++) {
      let x = w + diagOffsets[i].x;
      let y = h + diagOffsets[i].y;
      if (y < 0 || y >= HEIGHT) { continue; } // Bounds check

      // Add a connection
      let key = `${w},${h},${x},${y}`;
      let key2 = `${x},${y},${w},${h}`;
      if (grid[y][x] && lines[key] === undefined && lines[key2] === undefined) {
        lines[key] = true;
      }

    }

  }

  const lines = { };
  for (let h = 0; h < HEIGHT; h++) {
    for (let w = 0; w < WIDTH; w++) {
       // Only generate lines for filled cells
      if (!grid[h][w]) { continue; }

      connectAdjacent(h, w);
    }
  }
  
  // Flatten to array of objects
  return Object.keys(lines).map(v => {
    let [ x, y, x2, y2 ] = v.split(',').map(v => parseInt(v));
    return { x, y, x2, y2 };
  });
}

function drawLine(l) {
  let angle = Math.atan2(l.y2 - l.y, l.x2 - l.x);
  let x1 = l.x*CELL_WIDTH + CELL_WIDTH/2 + Math.cos(angle)*(RADIUS/2);
  let y1 = l.y*CELL_HEIGHT + CELL_HEIGHT/2 + Math.sin(angle)*(RADIUS/2);
  let x2 = l.x2*CELL_WIDTH + CELL_WIDTH/2 - Math.cos(angle)*(RADIUS/2);
  let y2 = l.y2*CELL_HEIGHT + CELL_HEIGHT/2 - Math.sin(angle)*(RADIUS/2);
  line(x1, y1, x2, y2);
}
