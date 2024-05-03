/*
=============================================================================
JavaScript File for Maze Solver Project
Author: [Amirhossein Maleki]
GitHub: http://github.com/AHM-ID
Email: mr.amirhosseinmaleki@gmail.com
Purpose: This JavaScript file is part of the Maze Solver project, developed by [Amirhossein Maleki]. 
It provides functionality for generating, solving, and visualizing mazes using various algorithms.
The project is intended for academic use and educational purposes.
License: This JavaScript file, authored by [Amirhossein Maleki], is provided under the Apache License, Version 2.0.
For more information, please refer to http://www.apache.org/licenses/LICENSE-2.0
=============================================================================
*/


// Maze cell representation (wall/empty) and visited state
const CELL_EMPTY = 0;
const CELL_WALL = 1;
const CELL_VISITED = 2;
const CELL_START = 3;
const CELL_DESTINATION = 4;
const FINAL_PATH = 5;


// Canvas and context for visualization
const mazeCanvas = document.getElementById('maze-canvas');
const ctx = mazeCanvas.getContext('2d');


// Maze dimensions (adjustable)
const mazeWidth = 30;
const mazeHeight = 20;
// Cell size for drawing
const cellSize = Math.min(mazeCanvas.width / mazeWidth, mazeCanvas.height / mazeHeight);


// Tuple to store start and destination points
let points = {};


// Defaults
let intervalVisited;
let intervalPath;
let Maze;
let elapsedTime;
let visitCount = 1;
// Initialize the counter array with the same dimensions as the maze using map
let counter = new Array(mazeHeight).fill(0).map(() => new Array(mazeWidth).fill(0));



// Generate a random maze with a random number of walls within a specified range
function generateMaze() {
    const maze = new Array(mazeHeight).fill(null).map(() => new Array(mazeWidth).fill(CELL_EMPTY));
    const minWalls = 50;
    const maxWalls = 75;
    let numWalls = Math.floor(Math.random() * (maxWalls - minWalls + 1)) + minWalls;

    // Ensure boundary cells are walls
    for (let i = 0; i < mazeWidth; i++) {
        maze[0][i] = CELL_WALL; // Top row
        maze[mazeHeight - 1][i] = CELL_WALL; // Bottom row
    }
    for (let i = 0; i < mazeHeight; i++) {
        maze[i][0] = CELL_WALL; // Leftmost column
        maze[i][mazeWidth - 1] = CELL_WALL; // Rightmost column
    }

    // Randomly place remaining walls
    for (let i = 0; i < numWalls; i++) {
        let randomX, randomY;
        do {
            randomX = Math.floor(Math.random() * (mazeWidth - 2)) + 1; // Exclude boundary cells
            randomY = Math.floor(Math.random() * (mazeHeight - 2)) + 1; // Exclude boundary cells
        } while (maze[randomY][randomX] === CELL_WALL); // Ensure we're not overwriting existing walls
        maze[randomY][randomX] = CELL_WALL;
    }

    // Randomly place start point until it's not on a wall
    let startX, startY;
    do {
        startX = Math.floor(Math.random() * (mazeWidth - 2)) + 1; // Exclude boundary cells
        startY = Math.floor(Math.random() * (mazeHeight - 2)) + 1; // Exclude boundary cells
    } while (maze[startY][startX] !== CELL_EMPTY); // Ensure the start point is not on a wall
    maze[startY][startX] = CELL_START;

    // Randomly place destination point until it's not on a wall and has a minimum distance from the start point
    let destX, destY;
    do {
        destX = Math.floor(Math.random() * (mazeWidth - 2)) + 1; // Exclude boundary cells
        destY = Math.floor(Math.random() * (mazeHeight - 2)) + 1; // Exclude boundary cells
    } while (Math.abs(destX - startX) + Math.abs(destY - startY) < 20 || maze[destY][destX] !== CELL_EMPTY); // Ensure the destination point has a minimum distance of 20 blocks from the start point and is not on a wall
    maze[destY][destX] = CELL_DESTINATION;

    points.start = { x: startX, y: startY };
    points.destination = { x: destX, y: destY };

    return maze;
}

// Function to draw the maze on the canvas
function drawMaze(maze, visitedNodes) {
    for (let y = 0; y < mazeHeight; y++) {
        for (let x = 0; x < mazeWidth; x++) {

            const centerX = (x + 0.5) * cellSize;
            const centerY = (y + 0.5) * cellSize;
            const radius = 0.425 * cellSize; // Adjust the radius as needed

            // Draw border
            if (maze[y][x] !== CELL_WALL) {
                ctx.strokeStyle = 'gray';
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
            else {
                ctx.strokeStyle = '#191825';
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }

            if (maze[y][x] === CELL_WALL) {
                ctx.fillStyle = '#191825'; // Wall
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else if (x === points.start.x && y === points.start.y) {
                ctx.fillStyle = 'white'; // Empty cell
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

                ctx.fillStyle = '#1C6758'; // Start point
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();

                ctx.font = '10px Arial';
                ctx.fillStyle = 'white';
                // Calculate the width of the text
                const textWidth = ctx.measureText('S').width;
                // Calculate the x-coordinate to center the text horizontally within the cell
                const textX = x * cellSize + (cellSize - textWidth) / 2;
                // Calculate the y-coordinate to center the text vertically within the cell
                const textY = y * cellSize + cellSize / 2 + 10 / 4;
                // Draw the text
                ctx.fillText('S', textX, textY);
                
            } else if (x === points.destination.x && y === points.destination.y) {
                ctx.fillStyle = 'white'; // Empty cell
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

                ctx.fillStyle = '#BE0000'; // Destination point
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();

                ctx.font = '10px Arial';
                ctx.fillStyle = 'white';
                // Calculate the width of the text
                const textWidth = ctx.measureText('D').width;
                // Calculate the x-coordinate to center the text horizontally within the cell
                const textX = x * cellSize + (cellSize - textWidth) / 2;
                // Calculate the y-coordinate to center the text vertically within the cell
                const textY = y * cellSize + cellSize / 2 + 10 / 4;
                // Draw the text
                ctx.fillText('D', textX, textY);
            } else if (maze[y][x] === CELL_VISITED) {
                ctx.fillStyle = 'white'; // Empty cell
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

                ctx.fillStyle = 'lightblue'; // Visited Node
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();

                if (counter[y][x] === 0) {
                    counter[y][x] = visitCount;
                    visitCount++;
                }
            } else if (maze[y][x] === FINAL_PATH) {
                ctx.fillStyle = 'white'; // Empty cell
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

                ctx.fillStyle = 'gold'; // Final Path
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                ctx.fillStyle = 'white'; // Empty cell
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }

            if (counter[y][x] > 0) {
                ctx.font = '10px Arial';
                ctx.fillStyle = 'black';
                // Calculate the width of the text
                const textWidth = ctx.measureText(counter[y][x]).width;
                // Calculate the x-coordinate to center the text horizontally within the cell
                const textX = x * cellSize + (cellSize - textWidth) / 2;
                // Calculate the y-coordinate to center the text vertically within the cell
                const textY = y * cellSize + cellSize / 2 + 10 / 4;
                // Draw the text
                ctx.fillText(counter[y][x], textX, textY);
            }
        }
    }
}



// DFS algorithm to solve the maze
function depthFirstSearch(maze, startX, startY, destX, destY) {
    const stack = [];
    const visited = new Array(mazeHeight).fill(null).map(() => new Array(mazeWidth).fill(false));
    let visitedNodes = [];
    const path = [];
    stack.push({ x: startX, y: startY });

    // Define a delay function
    const delay = (ms) => {
        const start = Date.now();
        while (Date.now() - start < ms);
    };

    while (stack.length > 0) {
        const { x, y } = stack.pop();
        visited[y][x] = true;
        visitedNodes.push({ x, y }); // Store visited nodes
        path.push({ x, y }); // Store the path as we explore

        if (x === destX && y === destY) {
            return { path, visitedNodes }; // Found destination
        }

        // Explore neighbors in the order: down, right, up, left (reversed)
        const neighbors = [
            { x: x - 1, y: y },  // Left
            { x: x, y: y + 1 }, // Down
            { x: x + 1, y: y }, // Right
            { x: x, y: y - 1 } // Up
        ];

        for (const neighbor of neighbors) {
            const { x: nx, y: ny } = neighbor;
            if (nx >= 0 && nx < mazeWidth && ny >= 0 && ny < mazeHeight && !visited[ny][nx] && maze[ny][nx] !== CELL_WALL) {
                stack.push({ x: nx, y: ny });
            }
        }

        // Introduce a delay of 1 milliseconds
        delay(1);
    }

    return { path: null, visitedNodes }; // No path found
}

// BFS algorithm to solve the maze
function breadthFirstSearch(maze, startX, startY, destX, destY) {
    const queue = [];
    const visited = new Array(mazeHeight).fill(null).map(() => new Array(mazeWidth).fill(false));
    const cameFrom = {};
    let visitedNodes = [];
    const path = [];

    queue.push({ x: startX, y: startY });
    visited[startY][startX] = true;

    // Define a delay function
    const delay = (ms) => {
        const start = Date.now();
        while (Date.now() - start < ms);
    };

    while (queue.length > 0) {
        const currentNode = queue.shift();
        const { x, y } = currentNode;

        visitedNodes.push({ x, y });

        const isDestination = x === destX && y === destY;

        const neighbors = [
            { x: x, y: y - 1 }, // Up
            { x: x + 1, y: y }, // Right
            { x: x, y: y + 1 }, // Down
            { x: x - 1, y: y } // Left
        ];

        for (const neighbor of neighbors) {
            const { x: nx, y: ny } = neighbor;
            if (nx >= 0 && nx < mazeWidth && ny >= 0 && ny < mazeHeight && maze[ny][nx] !== CELL_WALL && !visited[ny][nx]) {
                queue.push({ x: nx, y: ny });
                visited[ny][nx] = true;
                cameFrom[`${nx},${ny}`] = { x, y };
            }
        }

        if (isDestination) {
            // Reconstruct the path
            let current = { x: destX, y: destY };
            while (current) {
                path.unshift(current);
                current = cameFrom[`${current.x},${current.y}`];
            }
            return { path, visitedNodes };
        }
        // Introduce a delay of 1 milliseconds
        delay(1);
    }

    // No path found
    return { path: null, visitedNodes };
}

// A* algorithm to solve the maze
function aStar(maze, startX, startY, destX, destY) {
    let openList = [{ x: startX, y: startY }];
    let closedList = new Array(mazeHeight).fill(null).map(() => new Array(mazeWidth).fill(false));
    let cameFrom = {}; // To store the parent of each node
    let gScore = {}; // To store the cost from the start node to each node
    let fScore = {}; // To store the total estimated cost of the cheapest path from start to goal passing through the node
    let visitedNodes = [{ x: startX, y: startY }]; // Initialize with the start node

    // Initialize the scores for the start node
    gScore[`${startX},${startY}`] = 0;
    fScore[`${startX},${startY}`] = heuristic(startX, startY, destX, destY);

    let optimalPathFound = false;

    // Define a delay function
    const delay = (ms) => {
        const start = Date.now();
        while (Date.now() - start < ms);
    };

    while (openList.length > 0) {
        // Find the node in openList with the lowest fScore
        let minFScore = Infinity;
        let currentNode = null;
        let currentIndex = null;
        for (let i = 0; i < openList.length; i++) {
            const node = openList[i];
            const nodeFScore = fScore[`${node.x},${node.y}`];
            if (nodeFScore < minFScore) {
                minFScore = nodeFScore;
                currentNode = node;
                currentIndex = i;
            }
        }

        // If reached the destination, but not the optimal path, continue searching
        if (currentNode.x === destX && currentNode.y === destY && !optimalPathFound) {
            let path = [{ x: destX, y: destY }];
            let current = { x: destX, y: destY };
            while (`${current.x},${current.y}` in cameFrom) {
                current = cameFrom[`${current.x},${current.y}`];
                path.unshift(current);
            }

            // Check if the current path is the optimal path
            if (fScore[`${destX},${destY}`] === minFScore) {
                optimalPathFound = true;
            } else {
                // Continue searching
                openList.splice(currentIndex, 1);
                closedList[currentNode.y][currentNode.x] = true;
                continue;
            }
        }

        // If reached the destination and found the optimal path, return
        if (currentNode.x === destX && currentNode.y === destY && optimalPathFound) {
            let path = [{ x: destX, y: destY }];
            let current = { x: destX, y: destY };
            while (`${current.x},${current.y}` in cameFrom) {
                current = cameFrom[`${current.x},${current.y}`];
                path.unshift(current);
            }

            return { path, visitedNodes };
        }

        // Remove currentNode from openList
        openList.splice(currentIndex, 1);

        // Mark currentNode as visited
        closedList[currentNode.y][currentNode.x] = true;

        // Explore neighbors
        const neighbors = [
            { x: currentNode.x, y: currentNode.y - 1 }, // Up
            { x: currentNode.x + 1, y: currentNode.y }, // Right
            { x: currentNode.x, y: currentNode.y + 1 }, // Down
            { x: currentNode.x - 1, y: currentNode.y } // Left
        ];

        // Explore neighbors with lower f-scores first
        neighbors.sort((a, b) => fScore[`${a.x},${a.y}`] - fScore[`${b.x},${b.y}`]);

        for (const neighbor of neighbors) {
            const { x, y } = neighbor;

            // Check if neighbor is within bounds and not a wall
            if (x >= 0 && x < mazeWidth && y >= 0 && y < mazeHeight && maze[y][x] !== CELL_WALL) {
                // Calculate tentative gScore for neighbor
                let tentativeGScore = gScore[`${currentNode.x},${currentNode.y}`] + 1;
                let tentativeFScore = tentativeGScore + heuristic(x, y, destX, destY);

                if (!fScore[`${x},${y}`] || tentativeFScore < fScore[`${x},${y}`]) {
                    cameFrom[`${x},${y}`] = { x: currentNode.x, y: currentNode.y };
                    gScore[`${x},${y}`] = tentativeGScore;
                    fScore[`${x},${y}`] = tentativeFScore;

                    // Check if neighbor is already in openList
                    if (!openList.some(node => node.x === x && node.y === y)) {
                        openList.push({ x, y });
                    }
                }

                // Add neighbor to visited nodes if not already visited
                if (!closedList[y][x]) {
                    visitedNodes.push({ x, y });
                    closedList[y][x] = true;
                }
            }
        }

        // Introduce a delay of 1 milliseconds
        delay(1);
    }

    // If no path found, return visitedNodes
    return { path: null, visitedNodes };
}

// A* heuristic function (Euclidean distance)
function heuristic(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Iterative DFS algorithm to solve the maze
function iterativeDepthFirstSearch(maze, startX, startY, destX, destY) {
    const stack = [];
    const visited = new Array(mazeHeight).fill(null).map(() => new Array(mazeWidth).fill(false));
    let visitedNodes = [];
    const path = [];
    stack.push({ x: startX, y: startY });
    visited[startY][startX] = true; // Mark the start node as visited

    // Define a delay function
    const delay = (ms) => {
        const start = Date.now();
        while (Date.now() - start < ms);
    };

    while (stack.length > 0) {
        const { x, y } = stack.pop();
        visitedNodes.push({ x, y }); // Store visited nodes
        path.push({ x, y }); // Store the path as we explore

        if (x === destX && y === destY) {
            return { path, visitedNodes }; // Found destination
        }

        // Explore neighbors in the order: down, right, up, left (reversed)
        const neighbors = [
            { x: x - 1, y: y },  // Left
            { x: x, y: y + 1 }, // Down
            { x: x + 1, y: y }, // Right
            { x: x, y: y - 1 } // Up
        ];

        for (const neighbor of neighbors) {
            const { x: nx, y: ny } = neighbor;
            if (nx >= 0 && nx < mazeWidth && ny >= 0 && ny < mazeHeight && !visited[ny][nx] && maze[ny][nx] !== CELL_WALL) {
                stack.push({ x: nx, y: ny });
                visited[ny][nx] = true; // Mark neighbor as visited
            }
        }

        // Introduce a delay of 1 milliseconds
        delay(1);
    }

    return { path: null, visitedNodes }; // No path found
}



// Function to animate DFS traversal
function animateDFS(maze, startX, startY, destX, destY, result) {
    const solveButton = document.getElementById('solve-maze');
    solveButton.setAttribute('disabled', 'true');

    const path = result.path;
    const visitedNodes = result.visitedNodes;
    let index = 1;
    intervalVisited = setInterval(() => {
        if (index < visitedNodes.length - 1) {
            const { x, y } = visitedNodes[index];
            if (x !== startX || y !== startY) {
                maze[y][x] = CELL_VISITED;
                drawMaze(maze);
            }
            index++;
        } else {
            clearInterval(intervalVisited);
            index = 1;
            intervalPath = setInterval(() => {
                if (path) {
                    if (index < path.length - 1) {
                        const { x, y } = path[index];
                        maze[y][x] = FINAL_PATH;
                        drawMaze(maze);
                        index++;
                    } else {
                        clearInterval(intervalPath);
                        const solveButton = document.getElementById('solve-maze');
                        solveButton.removeAttribute('disabled'); // Remove the disabled attribute to enable the button
                        solveButton.innerHTML = '<span><i class="bi bi-arrow-clockwise me-1"></i></span> Run Again';

                        const nodesOpened = document.getElementById('nodes-opened');
                        nodesOpened.innerHTML = visitedNodes.length - 2;

                        const pathLength = document.getElementById('path-length');
                        pathLength.innerHTML = path.length - 2;

                        const time = document.getElementById('time');
                        time.innerHTML = elapsedTime + 'ms';

                        const modalStart = new bootstrap.Modal(document.getElementById('ModalSuc'));
                        modalStart.show();
                    }
                } else {
                    clearInterval(intervalPath);

                    const nodesOpened = document.getElementById('nodes-opened');
                    nodesOpened.innerHTML = visitCount - 1;

                    const pathLength = document.getElementById('path-length');
                    pathLength.innerHTML = '-';

                    const time = document.getElementById('time');
                    time.innerHTML = elapsedTime + 'ms';

                    const modalStart = new bootstrap.Modal(document.getElementById('ModalErr'));
                    modalStart.show();
                }
            }, 50); // Adjust animation speed for path
        }
    }, 100); // Adjust animation speed for visited nodes
}

// Function to animate BFS traversal
function animateBFS(maze, startX, startY, destX, destY, result) {
    const solveButton = document.getElementById('solve-maze');
    solveButton.setAttribute('disabled', 'true');

    const path = result.path;
    const visitedNodes = result.visitedNodes;
    let index = 1;
    let visitCount = 1; // Counter for visited nodes
    intervalVisited = setInterval(() => {
        if (index < visitedNodes.length - 1) {
            const { x, y } = visitedNodes[index];
            if (x !== startX || y !== startY) {
                maze[y][x] = CELL_VISITED;
                drawMaze(maze);
            }
            index++;
        } else {
            clearInterval(intervalVisited);
            index = 1;
            intervalPath = setInterval(() => {
                if (path) {
                    if (index < path.length - 1) {
                        const { x, y } = path[index];
                        maze[y][x] = FINAL_PATH;
                        drawMaze(maze);
                        index++;
                    } else {
                        clearInterval(intervalPath);
                        const solveButton = document.getElementById('solve-maze');
                        solveButton.removeAttribute('disabled'); // Remove the disabled attribute to enable the button
                        solveButton.innerHTML = '<span><i class="bi bi-arrow-clockwise me-1"></i></span> Run Again';

                        const nodesOpened = document.getElementById('nodes-opened');
                        nodesOpened.innerHTML = visitedNodes.length - 2;

                        const pathLength = document.getElementById('path-length');
                        pathLength.innerHTML = path.length - 2;

                        const time = document.getElementById('time');
                        time.innerHTML = elapsedTime + 'ms';

                        const modalStart = new bootstrap.Modal(document.getElementById('ModalSuc'));
                        modalStart.show();
                    }
                } else {
                    clearInterval(intervalPath);

                    const nodesOpened = document.getElementById('nodes-opened');
                    nodesOpened.innerHTML = visitCount - 1;

                    const pathLength = document.getElementById('path-length');
                    pathLength.innerHTML = '-';

                    const time = document.getElementById('time');
                    time.innerHTML = elapsedTime + 'ms';

                    const modalStart = new bootstrap.Modal(document.getElementById('ModalErr'));
                    modalStart.show();
                }
            }, 50); // Adjust animation speed for path
        }
    }, 100); // Adjust animation speed for visited nodes
}

// Function to animate A* traversal
function animateAStar(maze, startX, startY, destX, destY, result) {
    const solveButton = document.getElementById('solve-maze');
    solveButton.setAttribute('disabled', 'true');

    const path = result.path;
    const visitedNodes = result.visitedNodes;
    let index = 1;
    intervalVisited = setInterval(() => {
        if (index < visitedNodes.length - 1) {
            const { x, y } = visitedNodes[index];
            if (x !== startX || y !== startY) {
                maze[y][x] = CELL_VISITED;
                drawMaze(maze);
            }
            index++;
        } else {
            clearInterval(intervalVisited);
            index = 1;
            intervalPath = setInterval(() => {
                if (path) {
                    if (index < path.length - 1) { // Exclude the last node from the path drawing
                        const { x, y } = path[index];
                        maze[y][x] = FINAL_PATH;
                        drawMaze(maze);
                        index++;
                    } else {
                        clearInterval(intervalPath);
                        const solveButton = document.getElementById('solve-maze');
                        solveButton.removeAttribute('disabled'); // Remove the disabled attribute to enable the button
                        solveButton.innerHTML = '<span><i class="bi bi-arrow-clockwise me-1"></i></span> Run Again';

                        const nodesOpened = document.getElementById('nodes-opened');
                        nodesOpened.innerHTML = visitedNodes.length - 3;

                        const pathLength = document.getElementById('path-length');
                        pathLength.innerHTML = path.length - 2;

                        const time = document.getElementById('time');
                        time.innerHTML = elapsedTime + 'ms';

                        const modalStart = new bootstrap.Modal(document.getElementById('ModalSuc'));
                        modalStart.show();
                    }
                } else {
                    clearInterval(intervalPath);

                    const nodesOpened = document.getElementById('nodes-opened');
                    nodesOpened.innerHTML = visitCount - 1;

                    const pathLength = document.getElementById('path-length');
                    pathLength.innerHTML = '-';

                    const time = document.getElementById('time');
                    time.innerHTML = elapsedTime + 'ms';

                    const modalStart = new bootstrap.Modal(document.getElementById('ModalErr'));
                    modalStart.show();
                }
            }, 50); // Adjust animation speed for path
        }
    }, 100); // Adjust animation speed for visited nodes
}

// Function to animate iterative DFS traversal
function animateIterativeDFS(maze, startX, startY, destX, destY, result) {
    const solveButton = document.getElementById('solve-maze');
    solveButton.setAttribute('disabled', 'true');

    const path = result.path;
    const visitedNodes = result.visitedNodes;
    let index = 1;
    intervalVisited = setInterval(() => {
        if (index < visitedNodes.length - 1) {
            const { x, y } = visitedNodes[index];
            if (x !== startX || y !== startY) {
                maze[y][x] = CELL_VISITED;
                drawMaze(maze);
            }
            index++;
        } else {
            clearInterval(intervalVisited);
            index = 1;
            intervalPath = setInterval(() => {
                if (path) {
                    if (index < path.length - 1) {
                        const { x, y } = path[index];
                        maze[y][x] = FINAL_PATH;
                        drawMaze(maze);
                        index++;
                    } else {
                        clearInterval(intervalPath);
                        const solveButton = document.getElementById('solve-maze');
                        solveButton.removeAttribute('disabled'); // Remove the disabled attribute to enable the button
                        solveButton.innerHTML = '<span><i class="bi bi-arrow-clockwise me-1"></i></span> Run Again';

                        const nodesOpened = document.getElementById('nodes-opened');
                        nodesOpened.innerHTML = visitedNodes.length - 2;

                        const pathLength = document.getElementById('path-length');
                        pathLength.innerHTML = path.length - 2;

                        const time = document.getElementById('time');
                        time.innerHTML = elapsedTime + 'ms';

                        const modalStart = new bootstrap.Modal(document.getElementById('ModalSuc'));
                        modalStart.show();
                    }
                } else {
                    clearInterval(intervalPath);

                    const nodesOpened = document.getElementById('nodes-opened');
                    nodesOpened.innerHTML = visitCount - 1;

                    const pathLength = document.getElementById('path-length');
                    pathLength.innerHTML = '-';

                    const time = document.getElementById('time');
                    time.innerHTML = elapsedTime + 'ms';

                    const modalStart = new bootstrap.Modal(document.getElementById('ModalErr'));
                    modalStart.show();
                }
            }, 50); // Adjust animation speed for path
        }
    }, 100); // Adjust animation speed for visited nodes
}



// Function to solve maze using DFS
function solveDFS() {
    const startTime = performance.now(); // Start the timer
    const mazeCopy = JSON.parse(JSON.stringify(Maze)); // Copy maze to prevent modification
    const startX = points.start.x;
    const startY = points.start.y;
    const destX = points.destination.x;
    const destY = points.destination.y;

    const result = depthFirstSearch(mazeCopy, startX, startY, destX, destY);
    const endTime = performance.now(); // Stop the timer
    elapsedTime = Math.floor(endTime - startTime); // Calculate the elapsed time in milliseconds

    animateDFS(mazeCopy, startX, startY, destX, destY, result);

    console.log(`DFS execution time: ${elapsedTime} milliseconds`);
    // Start Point Dest Point subtracted
    console.log(`DFS Nodes Opened: ${result.visitedNodes.length - 2}`);
    console.log(`DFS Path Length: ${result.path.length - 2}`);
}

// Event listener for "Solve Maze" button with BFS
function solveBFS() {
    const startTime = performance.now(); // Start the timer
    const mazeCopy = JSON.parse(JSON.stringify(Maze)); // Copy maze to prevent modification
    const startX = points.start.x;
    const startY = points.start.y;
    const destX = points.destination.x;
    const destY = points.destination.y;

    const result = breadthFirstSearch(mazeCopy, startX, startY, destX, destY);
    const endTime = performance.now(); // Stop the timer
    elapsedTime = Math.floor(endTime - startTime); // Calculate the elapsed time in milliseconds

    animateBFS(mazeCopy, startX, startY, destX, destY, result);

    console.log(`BFS execution time: ${elapsedTime} milliseconds`);
    // Start Point Dest Point subtracted
    console.log(`BFS Nodes Opened: ${result.visitedNodes.length - 2}`);
    console.log(`BFS Path Length: ${result.path.length - 2}`);
}

// Event listener for "Solve Maze" button with A*
function solveAStar() {
    const startTime = performance.now(); // Start the timer
    const mazeCopy = JSON.parse(JSON.stringify(Maze)); // Copy maze to prevent modification
    const startX = points.start.x;
    const startY = points.start.y;
    const destX = points.destination.x;
    const destY = points.destination.y;

    const result = aStar(mazeCopy, startX, startY, destX, destY);
    const endTime = performance.now(); // Stop the timer
    elapsedTime = Math.floor(endTime - startTime); // Calculate the elapsed time in milliseconds

    animateAStar(mazeCopy, startX, startY, destX, destY, result);

    console.log(`A* execution time: ${elapsedTime} milliseconds`);
    // Start Point Dest Point and the last point that we ensured couldn't accept path subtracted
    console.log(`A* Nodes Opened: ${result.visitedNodes.length - 3}`); 
    console.log(`A* Path Length: ${result.path.length - 2}`);
}

// Function to solve maze using Iterative DFS
function solveIterativeDFS() {
    const startTime = performance.now(); // Start the timer
    const mazeCopy = JSON.parse(JSON.stringify(Maze)); // Copy maze to prevent modification
    const startX = points.start.x;
    const startY = points.start.y;
    const destX = points.destination.x;
    const destY = points.destination.y;

    const result = iterativeDepthFirstSearch(mazeCopy, startX, startY, destX, destY);
    const endTime = performance.now(); // Stop the timer
    elapsedTime = Math.floor(endTime - startTime); // Calculate the elapsed time in milliseconds

    animateIterativeDFS(mazeCopy, startX, startY, destX, destY, result);

    console.log(`Iterative DFS execution time: ${elapsedTime} milliseconds`);
    console.log(`Iterative DFS Nodes Opened: ${result.visitedNodes.length - 2}`);
    console.log(`Iterative DFS Path Length: ${result.path.length - 2}`);
}

// Function to clear everything on canvas
function clearMazeCanvas() {
    clearInterval(intervalVisited);
    clearInterval(intervalPath);

    const solveButton = document.getElementById('solve-maze');
    solveButton.removeAttribute('disabled'); // Remove the disabled attribute to enable the button
    solveButton.innerHTML = '<span><i class="bi bi-check-circle me-1"></i></span> Solve Maze';

    const nodesOpened = document.getElementById('nodes-opened');
    nodesOpened.innerHTML = '';
    const pathLength = document.getElementById('path-length');
    pathLength.innerHTML = '';
    const time = document.getElementById('time');
    time.innerHTML = '';

    // Reset the counter array to null values for visited nodes
    counter = counter.map(row => row.map(() => 0));
    visitCount = 1;

    // Fill each cell with CELL_EMPTY using map
    Maze = Maze.map((row, rowIndex) => {
        // Check if it's the first or last row
        if (rowIndex === 0 || rowIndex === mazeHeight - 1) {
            return row.map(() => CELL_WALL); // Set all cells in this row to CELL_WALL
        } else {
            // For other rows, modify only the first and last cells
            return row.map((cell, colIndex) => {
                if (colIndex === 0 || colIndex === mazeWidth - 1) {
                    return CELL_WALL; // Set the first and last cell to CELL_WALL
                } else {
                    return CELL_EMPTY; // Set other cells to CELL_EMPTY
                }
            });
        }
    });
    // Redraw the maze to reflect the updated state
    drawMaze(Maze);
}

// Function to clear just canvas result path 
function clearMaze() {
    clearInterval(intervalVisited);
    clearInterval(intervalPath);

    const solveButton = document.getElementById('solve-maze');
    solveButton.removeAttribute('disabled'); // Remove the disabled attribute to enable the button
    solveButton.innerHTML = '<span><i class="bi bi-check-circle me-1"></i></span> Solve Maze';

    const nodesOpened = document.getElementById('nodes-opened');
    nodesOpened.innerHTML = '';
    const pathLength = document.getElementById('path-length');
    pathLength.innerHTML = '';
    const time = document.getElementById('time');
    time.innerHTML = '';

    // Reset the counter array to null values for visited nodes
    counter = counter.map(row => row.map(() => 0));
    visitCount = 1;

    // Remove any markings except walls
    for (let y = 0; y < mazeHeight; y++) {
        for (let x = 0; x < mazeWidth; x++) {
            if (Maze[y][x] !== CELL_WALL) {
                Maze[y][x] = CELL_EMPTY;
            }
        }
    }

    // Redraw the maze to reflect the updated state
    drawMaze(Maze);
}



// Event listener for "Solve Maze" button
const solveButton = document.getElementById('solve-maze');
solveButton.addEventListener('click', function () {
    const algorithmSelect = document.getElementById('algorithm');
    const selectedAlgorithm = algorithmSelect.value;

    // Clear the canvas
    clearMaze();

    const nodesOpened = document.getElementById('nodes-opened');
    nodesOpened.innerHTML = '';

    const pathLength = document.getElementById('path-length');
    pathLength.innerHTML = '';

    const time = document.getElementById('time');
    time.innerHTML = '';

    if (selectedAlgorithm === 'dfs') {
        solveDFS();
    } else if (selectedAlgorithm === 'bfs') {
        solveBFS();
    } else if (selectedAlgorithm === 'astar') {
        solveAStar();
    } else if (selectedAlgorithm === 'Idfs') {
        solveIterativeDFS();
    } else {
        const modalStart = new bootstrap.Modal(document.getElementById('ModalInf'));
        modalStart.show();
    }
});

// Event listener for "Generate Maze" button
const generateButton = document.getElementById('generate-maze');
generateButton.addEventListener('click', function () {

    clearInterval(intervalVisited);
    clearInterval(intervalPath);
    clearMazeCanvas();

    const solveButton = document.getElementById('solve-maze');
    solveButton.removeAttribute('disabled'); // Remove the disabled attribute to enable the button
    solveButton.innerHTML = '<span><i class="bi bi-check-circle me-1"></i></span> Solve Maze';

    const nodesOpened = document.getElementById('nodes-opened');
    nodesOpened.innerHTML = '';
    const pathLength = document.getElementById('path-length');
    pathLength.innerHTML = '';
    const time = document.getElementById('time');
    time.innerHTML = '';

    Maze = generateMaze(); // Update initialMaze with the newly generated maze
    drawMaze(Maze);
});

// Add event listener to the maze canvas
mazeCanvas.addEventListener('click', function (event) {
    clearMaze();
    // Calculate the cell coordinates based on the click position
    const rect = mazeCanvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const cellX = Math.floor(mouseX / cellSize);
    const cellY = Math.floor(mouseY / cellSize);

    // Check if the clicked cell is an empty cell
    if (Maze[cellY][cellX] === CELL_EMPTY) {
        // Change the state of the cell to a wall
        Maze[cellY][cellX] = CELL_WALL;
        // Redraw the maze to reflect the updated state
        drawMaze(Maze);
    }
});

// Event listener for "Clear Maze" button
const clearButton = document.getElementById('clear');
clearButton.addEventListener('click', function () {
    clearMazeCanvas();
});

// Event listener for "Random Points" button
const randomPointsButton = document.getElementById('points');
randomPointsButton.addEventListener('click', function () {
    // Clear the maze canvas
    clearMazeCanvas();

    // Generate random coordinates for the start point until it's not on a wall
    let startX, startY;
    do {
        startX = Math.floor(Math.random() * (mazeWidth - 2)) + 1; // Exclude boundary cells
        startY = Math.floor(Math.random() * (mazeHeight - 2)) + 1; // Exclude boundary cells
    } while (Maze[startY][startX] !== CELL_EMPTY); // Ensure the start point is not on a wall
    Maze[startY][startX] = CELL_START;

    // Generate random coordinates for the destination point until it's not on a wall and has a minimum distance from the start point
    let destX, destY;
    do {
        destX = Math.floor(Math.random() * (mazeWidth - 2)) + 1; // Exclude boundary cells
        destY = Math.floor(Math.random() * (mazeHeight - 2)) + 1; // Exclude boundary cells
    } while (Math.abs(destX - startX) + Math.abs(destY - startY) < 20 || Maze[destY][destX] !== CELL_EMPTY); // Ensure the destination point has a minimum distance of 20 blocks from the start point and is not on a wall
    Maze[destY][destX] = CELL_DESTINATION;

    points.start = { x: startX, y: startY };
    points.destination = { x: destX, y: destY };

    drawMaze(Maze);
});

// Event listener for algorithm selection
const algorithmSelect = document.getElementById('algorithm');
algorithmSelect.addEventListener('change', function () {
    // Clear the canvas
    clearMaze();
});

// Disable Solve button until select algorithm
document.addEventListener('DOMContentLoaded', function () {
    const solveButton = document.getElementById('solve-maze');
    const algorithmSelect = document.getElementById('algorithm');

    // Disable solve button initially
    solveButton.disabled = true;

    // Add event listener to algorithm select
    algorithmSelect.addEventListener('change', function () {
        // Enable solve button if an algorithm is selected
        solveButton.disabled = algorithmSelect.value === 'nothing';
    });
});



// Initially draw a maze
Maze = generateMaze();
drawMaze(Maze);



// Array to store results for each algorithm
const algorithmResults = {
    astar: [
        [155, 187, 22],
        [172, 178, 24],
        [160, 189, 27],
        [154, 186, 20],
        [115, 135, 24],
        [246, 271, 29],
        [138, 137, 19],
        [226, 269, 29],
        [248, 267, 33],
        [102, 122, 19]
    ],
    dfs: [
        [427, 426, 426],
        [542, 541, 541],
        [54, 54, 54],
        [358, 357, 357],
        [297, 297, 297],
        [35, 35, 35],
        [183, 183, 180],
        [88, 86, 86],
        [73, 72, 72],
        [22, 23, 23]
    ],
    Idfs: [
        [280, 279, 279],
        [314, 315, 315],
        [51, 50, 50],
        [284, 282, 282],
        [236, 234, 234],
        [35, 35, 35],
        [131, 130, 130],
        [67, 64, 64],
        [64, 63, 63],
        [24, 23, 23]
    ],
    bfs: [
        [437, 437, 22],
        [387, 386, 24],
        [412, 412, 30],
        [412, 409, 26],
        [369, 368, 24],
        [447, 444, 29],
        [351, 351, 30],
        [405, 403, 32],
        [408, 398, 40],
        [239, 236, 21]
    ]
};

const labels = [
    'Exec-1',
    'Exec-2',
    'Exec-3',
    'Exec-4',
    'Exec-5',
    'Exec-6',
    'Exec-7',
    'Exec-8',
    'Exec-9',
    'Exec-10'
];



function configPath(type) {
    let result;
    if (type === 'bar' || type === 'radar' || type === 'line') {
        const dataPath = {
            labels: labels,
            datasets: [
                {
                    label: 'A*',
                    fill: true,
                    data: algorithmResults.astar.map(result => result[2]),
                    backgroundColor: '#f67019',
                    borderRadius: 5,
                },
                {
                    label: 'DFS',
                    fill: true,
                    data: algorithmResults.dfs.map(result => result[2]),
                    backgroundColor: '#4dc9f6',
                    borderRadius: 5,
                },
                {
                    label: 'IDFS',
                    fill: true,
                    data: algorithmResults.dfs.map(result => result[2]),
                    backgroundColor: '#acc236',
                    borderRadius: 5,
                },
                {
                    label: 'BFS',
                    fill: true,
                    data: algorithmResults.bfs.map(result => result[2]),
                    backgroundColor: '#d800a6',
                    borderRadius: 5,
                }
            ]
        };

        result = {
            type: type,
            data: dataPath,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Path Length Comparing'
                    }
                }
            },
        };
    }
    else {
        let totalRuntime = algorithmResults.astar.reduce((acc, curr) => acc + curr[2], 0) +
            algorithmResults.dfs.reduce((acc, curr) => acc + curr[2], 0) +
            algorithmResults.Idfs.reduce((acc, curr) => acc + curr[2], 0) +
            algorithmResults.bfs.reduce((acc, curr) => acc + curr[2], 0);

        let dataArr = [
            algorithmResults.astar.reduce((acc, curr) => acc + curr[2], 0) / totalRuntime * 100,
            algorithmResults.dfs.reduce((acc, curr) => acc + curr[2], 0) / totalRuntime * 100,
            algorithmResults.Idfs.reduce((acc, curr) => acc + curr[2], 0) / totalRuntime * 100,
            algorithmResults.bfs.reduce((acc, curr) => acc + curr[2], 0) / totalRuntime * 100
        ];

        const dataPath = {
            labels: ['A*', 'DFS', 'IDFS', 'BFS'],
            datasets: [{
                data: dataArr,
                backgroundColor: ['#f67019', '#4dc9f6', '#acc236', '#d800a6']
            }]
        };

        result = {
            type: type,
            data: dataPath,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Path Length Comparing in Percentage'
                    }
                }
            },
        };
    }

    return result;
}

function configNode(type) {
    let result;
    if (type === 'bar' || type === 'radar' || type === 'line') {
        const dataNode = {
            labels: labels,
            datasets: [
                {
                    label: 'A*',
                    fill: true,
                    data: algorithmResults.astar.map(result => result[1]),
                    backgroundColor: '#f67019',
                    borderRadius: 5,
                },
                {
                    label: 'DFS',
                    fill: true,
                    data: algorithmResults.dfs.map(result => result[1]),
                    backgroundColor: '#4dc9f6',
                    borderRadius: 5,
                },
                {
                    label: 'IDFS',
                    fill: true,
                    data: algorithmResults.dfs.map(result => result[1]),
                    backgroundColor: '#acc236',
                    borderRadius: 5,
                },
                {
                    label: 'BFS',
                    fill: true,
                    data: algorithmResults.bfs.map(result => result[1]),
                    backgroundColor: '#d800a6',
                    borderRadius: 5,
                }
            ]
        };

        result = {
            type: type,
            data: dataNode,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Expanding Node Comparing'
                    }
                }
            },
        };
    }
    else {
        let totalRuntime = algorithmResults.astar.reduce((acc, curr) => acc + curr[1], 0) +
            algorithmResults.dfs.reduce((acc, curr) => acc + curr[1], 0) +
            algorithmResults.Idfs.reduce((acc, curr) => acc + curr[1], 0) +
            algorithmResults.bfs.reduce((acc, curr) => acc + curr[1], 0);

        let dataArr = [
            algorithmResults.astar.reduce((acc, curr) => acc + curr[1], 0) / totalRuntime * 100,
            algorithmResults.dfs.reduce((acc, curr) => acc + curr[1], 0) / totalRuntime * 100,
            algorithmResults.Idfs.reduce((acc, curr) => acc + curr[1], 0) / totalRuntime * 100,
            algorithmResults.bfs.reduce((acc, curr) => acc + curr[1], 0) / totalRuntime * 100
        ];

        const dataNode = {
            labels: ['A*', 'DFS', 'IDFS', 'BFS'],
            datasets: [{
                data: dataArr,
                backgroundColor: ['#f67019', '#4dc9f6', '#acc236', '#d800a6']
            }]
        };

        result = {
            type: type,
            data: dataNode,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Expanded Node Comparing in Percentage'
                    }
                }
            },
        };
    }

    return result;
}

function configTime(type) {
    let result;
    if (type === 'bar' || type === 'radar' || type === 'line') {
        const dataTime = {
            labels: labels,
            datasets: [
                {
                    label: 'A*',
                    fill: true,
                    data: algorithmResults.astar.map(result => result[0]),
                    backgroundColor: '#f67019',
                    borderRadius: 5,
                },
                {
                    label: 'DFS',
                    fill: true,
                    data: algorithmResults.dfs.map(result => result[0]),
                    backgroundColor: '#4dc9f6',
                    borderRadius: 5,
                },
                {
                    label: 'IDFS',
                    fill: true,
                    data: algorithmResults.dfs.map(result => result[0]),
                    backgroundColor: '#acc236',
                    borderRadius: 5,
                },
                {
                    label: 'BFS',
                    fill: true,
                    data: algorithmResults.bfs.map(result => result[0]),
                    backgroundColor: '#d800a6',
                    borderRadius: 5,
                }
            ]
        };

        result = {
            type: type,
            data: dataTime,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'RunTime Comparing in ms'
                    }
                }
            },
        };
    }
    else {
        let totalRuntime = algorithmResults.astar.reduce((acc, curr) => acc + curr[0], 0) +
            algorithmResults.dfs.reduce((acc, curr) => acc + curr[0], 0) +
            algorithmResults.Idfs.reduce((acc, curr) => acc + curr[0], 0) +
            algorithmResults.bfs.reduce((acc, curr) => acc + curr[0], 0);

        let dataArr = [
            algorithmResults.astar.reduce((acc, curr) => acc + curr[0], 0) / totalRuntime * 100,
            algorithmResults.dfs.reduce((acc, curr) => acc + curr[0], 0) / totalRuntime * 100,
            algorithmResults.Idfs.reduce((acc, curr) => acc + curr[0], 0) / totalRuntime * 100,
            algorithmResults.bfs.reduce((acc, curr) => acc + curr[0], 0) / totalRuntime * 100
        ];

        const dataTime = {
            labels: ['A*', 'DFS', 'IDFS', 'BFS'],
            datasets: [{
                data: dataArr,
                backgroundColor: ['#f67019', '#4dc9f6', '#acc236', '#d800a6']
            }]
        };

        result = {
            type: type,
            data: dataTime,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'RunTime Comparing in Percentage'
                    }
                }
            },
        };
    }

    return result;
}



let myChart = null;
let configType = null;

document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('chart').getContext('2d');
    const typeSelect = document.getElementById('type');
    const modalStart = new bootstrap.Modal(document.getElementById('myModal')); // Initialize Bootstrap modal

    // Set global default font for tooltips
    Chart.defaults.font.family = "Mooli";
    Chart.defaults.font.size = 14;
    
    myChart = new Chart(ctx, configTime(typeSelect.value));
    modalStart.show();
});

// Function to update the chart type
function updateChartType() {
    const typeSelect = document.getElementById('type');
    const chartCanvas = document.getElementById('chart').getContext('2d');

    if (myChart) {
        myChart.destroy(); // Destroy the existing chart if it exists
    }

    switch (configType) {
        case 1:
            myChart = new Chart(chartCanvas, configTime(typeSelect.value));
            break;
        case 2:
            myChart = new Chart(chartCanvas, configNode(typeSelect.value));
            break;
        case 3:
            myChart = new Chart(chartCanvas, configPath(typeSelect.value));
            break;
        default:
            myChart = new Chart(chartCanvas, configTime(typeSelect.value));
            break;
    }
}

function changeConfig(num) {
    configType = num;
    updateChartType(num);
}

function download() {
    let name;
    switch (configType) {
        case 1:
            name = 'Runtime Chart';
            break;
        case 2:
            name = 'Expanded Nodes Count Chart';
            break;
        case 3:
            name = 'Path Length Chart';
            break;
        default:
            name = 'Runtime Chart';
            break;
    }

    const chartCanvas = document.getElementById('chart');
    chartCanvas.toBlob(function (blob) {
        saveAs(blob, name);
    });
}
