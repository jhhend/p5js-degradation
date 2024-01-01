
const WIDTH = 29;
const HEIGHT = 12;
const CANVAS_SIZE = 720;
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
  let cellWidth = 23;
  let cellHeight = 21;

  for (let h = 0; h < HEIGHT; h++) {
    for (let w = 0; w < WIDTH; w++) {
      let x = w*cellWidth;
      let y = h*cellHeight;
      let v = grid[h][w];
      
      fill(255)
      rect(x, y, cellWidth, cellHeight);

      if (v) {
        fill(0);
        ellipse(x + cellWidth/2, y + cellHeight/2, 5, 5);
      }
    }
  }

  for (const l of lines) {
    let x1 = l.x*cellWidth + cellWidth/2;
    let y1 = l.y*cellHeight + cellHeight/2;
    let x2 = l.x2*cellWidth + cellWidth/2;
    let y2 = l.y2*cellHeight + cellHeight/2;
    line(x1, y1, x2, y2);
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
  const rowProbabilities = [ WIDTH, WIDTH, 20, 13, 11, 8, 8, 8, 6, 3, 3, 1 ].map(v => v / WIDTH);

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
        if (lines[key] === undefined) { 
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

    console.log(diagOffsets);

    if (diagOffsets.length === 0) { return; }

    // Connect diagonals, if they exist
    for (let i = 0; i < diagOffsets.length; i++) {
      let x = w + diagOffsets[i].x;
      let y = h + diagOffsets[i].y;
      if (y < 0 || y >= HEIGHT) { continue; } // Bounds check

      // Add a connection
      let key = `${w},${h},${x},${y}`;
      if (grid[y][x] && lines[key] === undefined) {
        lines[key] = true;
      }

    }

  }

  const lines = { };
  for (let h = 0; h < HEIGHT; h++) {
    for (let w = 0; w < WIDTH; w++) {
      if (!grid[h][w]) { continue; } // Only generate lines for filled cells
      connectAdjacent(h, w);
    }
  }
  
  // Flatten to array of objects
  return Object.keys(lines).map(v => {
    let [x, y, x2, y2] = v.split(',').map(v => parseInt(v));
    return { x, y, x2, y2 };
  });
}
