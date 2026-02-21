let activeBlock = null; 
let offsetX = 0;
let offsetY = 0;
let connections = [];
let activeLine = null;
let startBlock = null;
<<<<<<< HEAD
let executionInProgress = false;

const firstFive = ["Print text", "Show message", "Display value", "Output line", "Write to console"];
const nextFive = ["Add 5+3", "Multiply 4*7", "Divide 10/2", "Subtract 9-4", "Calculate 2^8"];
const nextFive2 = ["Set Variable X=10", "Set Variable Y=20", "Set Variable Name='Code'", "Set Variable Count=5", "Set Variable Active=true"];
const nextFive3 = ["If X > Y", "If Count < 10", "If Name == 'Code'", "If Active == true", "Else Statement"];
const nextFive4 = ["Loop 5 times", "While True", "For each item", "Break loop", "Continue"];
const nextFive5 = ["Return value", "End function", "Throw error", "Try catch", "Finally"];

initSpawner('spawnerBlue', 'blue', firstFive, true);
=======
const firstFive = ["I am first", "I am second", "I am third", "I am fourth", "I am fifth"];
const nextFive = ["I am sixth", "I am seventh", "I am eighth", "I am ninth", "I am tenth"];
const nextFive2 = ["I am eleventh", "I am twelfth", "I am thirteenth", "I am fourteenth", "I am fifteenth"];
const nextFive3 = ["I am sixteenth", "I am seventeenth", "I am eighteenth", "I am nineteenth", "I am twentieth"];
const nextFive4 = ["I am twenty-first", "I am twenty-second", "I am twenty-third", "I am twenty-fourth", "I am twenty-fifth"];
const nextFive5 = ["I am twenty-sixth", "I am twenty-seventh", "I am twenty-eighth", "I am twenty-ninth", "I am thirtieth"];

initSpawner('spawnerBlue', 'blue', firstFive);
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
initSpawner('spawnerPurple', 'purple', nextFive);
initSpawner('spawnerGreen', 'green', nextFive2);
initSpawner('spawnerOrange', 'orange', nextFive3);
initSpawner('spawnerCyan', 'cyan', nextFive4);
initSpawner('spawnerYellow', 'yellow', nextFive5);

<<<<<<< HEAD
const consoleContent = document.getElementById('consoleContent');
const clearConsoleBtn = document.getElementById('clearConsole');

clearConsoleBtn.addEventListener('click', () => {
    consoleContent.innerHTML = '';
});

const startBlockElement = document.getElementById('startBlock');
makeStartBlockDraggable(startBlockElement);

=======
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("width", window.innerWidth);
svg.setAttribute("height", window.innerHeight);
svg.style.position = "absolute";
svg.style.top = 0;
svg.style.left = 0;
svg.style.pointerEvents = "none";
document.body.appendChild(svg);

window.addEventListener("resize", () => {
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
<<<<<<< HEAD
    updateConnections();
=======
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
});

const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
marker.setAttribute("id", "arrow");
marker.setAttribute("markerWidth", "10");
marker.setAttribute("markerHeight", "10");
marker.setAttribute("refX", "10");
marker.setAttribute("refY", "5");
marker.setAttribute("orient", "auto");

const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
path.setAttribute("d", "M0,0 L10,5 L0,10 Z");
<<<<<<< HEAD
path.setAttribute("fill", "#FFD700");
=======
path.setAttribute("fill", "white");
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
marker.appendChild(path);
defs.appendChild(marker);
svg.appendChild(defs);

<<<<<<< HEAD
function makeStartBlockDraggable(element) {
    const port = document.createElement("div");
    port.classList.add("start-port");
    element.appendChild(port);
    
    element.onmousedown = (e) => {
        if (e.target.classList.contains('start-port')) return;
        e.preventDefault();
        startDrag(e, element);
    };
    
    makeStartPortConnectable(element, port);
}

function startDrag(e, element) {
    activeBlock = element; 
    activeBlock.style.opacity = '0.7'; 
=======
function startDrag(e, element) {
    activeBlock = element; 
    activeBlock.style.opacity = '0.5'; 
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
    activeBlock.style.zIndex = '1000';
    const rect = activeBlock.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
}
<<<<<<< HEAD

function createDropdown(block, optionsList, isBlueBlock = false) {
    if (isBlueBlock) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'block-input';
        input.placeholder = 'Enter text to print...';
        input.onmousedown = (e) => e.stopPropagation();
        
        let textToPrint = '';
        
        input.oninput = (e) => {
            textToPrint = e.target.value;
        };
        
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            }
            e.stopPropagation();
        };
        
        const port = document.createElement("div");
        port.classList.add("port");
        block.appendChild(port);
        makePortConnectable(block, port);
        
        block.innerHTML = '';
        block.classList.add('text-input-mode');
        block.appendChild(input);
        block.appendChild(port);
        
        block.getPrintText = () => {
            return textToPrint || input.placeholder;
        };
    } else {
        const select = document.createElement('select');
        select.style.width = '100%';
        select.style.height = '100%';
        select.style.background = 'transparent';
        select.style.border = 'none';
        select.style.color = 'inherit';
        select.style.fontWeight = 'bold';
        select.style.fontSize = '12px';
        select.style.textAlign = 'center';
        select.style.cursor = 'pointer';
        
        const placeholder = document.createElement('option');
        placeholder.textContent = "Choose action...";
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);
        
        optionsList.forEach(text => {
            const opt = document.createElement('option');
            opt.value = text;
            opt.textContent = text;
            select.appendChild(opt);
        });
        
        select.onmousedown = (e) => e.stopPropagation(); 
        select.onchange = () => {
            const oldPort = block.querySelector('.port');
            block.innerHTML = '';
            block.style.display = 'flex';
            block.style.alignItems = 'center';
            block.style.justifyContent = 'center';
            block.textContent = select.value;
            if (oldPort) {
                block.appendChild(oldPort);
            } else {
                const port = document.createElement("div");
                port.classList.add("port");
                block.appendChild(port);
                makePortConnectable(block, port);
            }
        };
        
        const port = document.createElement("div");
        port.classList.add("port");
        block.appendChild(port);
        makePortConnectable(block, port);
        block.innerHTML = "";
        block.appendChild(select);
        block.appendChild(port);
    }
}

function initSpawner(spawnerId, colorClass, blockOptions, isBlueBlock = false) {
=======
//kjbvbhjl
function createDropdown(block, optionsList) {
    const select = document.createElement('select');
    const placeholder = document.createElement('option');
    placeholder.textContent = "Choose...";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);
    optionsList.forEach(text => {
        const opt = document.createElement('option');
        opt.value = text;
        opt.textContent = text;
        select.appendChild(opt);
    });
    select.onmousedown = (e) => e.stopPropagation(); 
    select.onchange = () => {
        const oldPort = block.querySelector('.port');
        block.innerHTML = '';
        block.textContent = select.value;
        if (oldPort) {
            block.appendChild(oldPort);
        } else {
            const port = document.createElement("div");
            port.classList.add("port");
            block.appendChild(port);
            makePortConnectable(block, port);
        }
    };
    const port = document.createElement("div");
    port.classList.add("port");
    block.appendChild(port);
    makePortConnectable(block, port);
    block.textContent = "";
    block.appendChild(select);
    block.appendChild(port);
}

function initSpawner(spawnerId, colorClass, blockOptions) {
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault(); 
        const newBlock = document.createElement('div');
        newBlock.classList.add('block', colorClass);
<<<<<<< HEAD
        createDropdown(newBlock, blockOptions, isBlueBlock);
=======
        createDropdown(newBlock, blockOptions);
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
        const rect = spawner.getBoundingClientRect();
        newBlock.style.position = 'absolute';
        newBlock.style.left = rect.left + 'px';
        newBlock.style.top = rect.top + 'px';
        document.body.appendChild(newBlock);
        newBlock.onmousedown = (ev) => {
            ev.stopPropagation();
            startDrag(ev, newBlock);
        };
        startDrag(e, newBlock);
    };
}

document.onmousemove = (e) => {
    const trashRect = trash.getBoundingClientRect();
    if (!activeBlock) return; 

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

<<<<<<< HEAD
    const leftPanel = document.querySelector('.left-panel');
    const leftPanelRect = leftPanel.getBoundingClientRect();
    
    if (x < leftPanelRect.right + 10) {
        activeBlock.style.left = leftPanelRect.right + 10 + 'px';
    } else {
        activeBlock.style.left = x + 'px';
    }
    
=======
    activeBlock.style.left = x + 'px';
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
    activeBlock.style.top = y + 'px';

    const blockRect = activeBlock.getBoundingClientRect();
    const isOverTrash = (
        blockRect.right > trashRect.left && 
        blockRect.left < trashRect.right && 
        blockRect.bottom > trashRect.top && 
        blockRect.top < trashRect.bottom
    );

    if (isOverTrash) {
        trash.classList.add('active');
    } else {
        trash.classList.remove('active');
    }
    updateConnections();
};

document.onmouseup = () => {
    const trashRect = trash.getBoundingClientRect();
    if (!activeBlock) return;
    const blockRect = activeBlock.getBoundingClientRect();
    const isOverTrash = (blockRect.right > trashRect.left && blockRect.left < trashRect.right && blockRect.bottom > trashRect.top && blockRect.top < trashRect.bottom);
<<<<<<< HEAD
    
    if (isOverTrash) {
        if (activeBlock.id === 'startBlock') {
            activeBlock.style.opacity = '1';
        } else {
            removeConnections(activeBlock);
            activeBlock.remove();
        }
=======
    if (isOverTrash) {
        removeConnections(activeBlock);
        activeBlock.remove();
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
    }
    else {
        activeBlock.style.opacity = '1';
    }

    trash.classList.remove('active');
    activeBlock = null;
};

function removeConnections(block) {
    connections = connections.filter(conn => {
        if (conn.from === block || conn.to === block) {
            conn.line.remove();
            return false;
        }
        return true;
    });

    updateBlockConnectionStates();
}
<<<<<<< HEAD

=======
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
function updateBlockConnectionStates() {
    const blocks = document.querySelectorAll(".block");
    blocks.forEach(block => {
        const outgoing = connections.some(conn => conn.from === block);
        const incoming = connections.some(conn => conn.to === block);
        block.dataset.outgoing = outgoing ? '1' : '0';
        block.dataset.incoming = incoming ? '1' : '0';
        if (outgoing || incoming) {
            block.classList.add("connected");
        } else {
            block.classList.remove("connected");
        }
    });
}

function setPolylinePath(line, x1, y1, x2, y2) {
<<<<<<< HEAD
    const offsetX = 40;
    
=======

    const offsetX = 30;
    const safeOffset = 2;

>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
    const startX = x1;
    const startY = y1;

    const p1x = x1 + offsetX;
    const p1y = y1;

<<<<<<< HEAD
    const midY = y1 + (y2 - y1) * 0.5;
=======
    const midY = y1 + (y2 - y1) * 0.6;
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc

    const p2x = p1x;
    const p2y = midY;

    const p3x = x2 - offsetX;
    const p3y = midY;

    const p4x = p3x;
    const p4y = y2;

<<<<<<< HEAD
    const endX = x2;
=======
    const endX = x2 - safeOffset;
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
    const endY = y2;

    const points = `
        ${startX},${startY}
        ${p1x},${p1y}
        ${p2x},${p2y}
        ${p3x},${p3y}
        ${p4x},${p4y}
        ${endX},${endY}
    `;

    line.setAttribute("points", points);
}

<<<<<<< HEAD
function wouldCreateCycle(fromBlock, toBlock) {
    if (fromBlock === toBlock) return true;
    
    const visited = new Set();
    const stack = [toBlock];
    
    while (stack.length > 0) {
        const current = stack.pop();
        if (visited.has(current)) continue;
        visited.add(current);
        
        if (current === fromBlock) return true;
        
        connections.forEach(conn => {
            if (conn.from === current) {
                stack.push(conn.to);
            }
        });
    }
    
    return false;
}

function makePortConnectable(block, port) {
    port.addEventListener("mousedown", e => {
        e.stopPropagation();
        e.preventDefault();
        
        startBlock = block;
        const startOutgoing = connections.some(conn => conn.from === startBlock);
        if (startOutgoing) {
            return;
        }
        
        activeLine = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        activeLine.setAttribute("stroke", "#FFD700");
        activeLine.setAttribute("stroke-width", "3");
=======
function makePortConnectable(block, port) {
    port.addEventListener("mousedown", e => {
        e.stopPropagation();
        startBlock = block;
        const startOutgoing = connections.some(conn => conn.from === startBlock);
        if (startOutgoing) return;
        activeLine = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        activeLine.setAttribute("stroke", "white");
        activeLine.setAttribute("stroke-width", "2");
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
        activeLine.setAttribute("fill", "none");
        activeLine.setAttribute("marker-end", "url(#arrow)");
        svg.appendChild(activeLine);

        function move(ev) {
            const r = startBlock.getBoundingClientRect();
            const x1 = r.right;
            const y1 = r.top + r.height / 2;
            const x2 = ev.clientX;
            const y2 = ev.clientY;
            setPolylinePath(activeLine, x1, y1, x2, y2);
        }

        function up(ev) {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
<<<<<<< HEAD
            
            const target = findBlockUnder(ev.clientX, ev.clientY);
            
            if (target && target !== startBlock) {
                const targetIncoming = connections.some(conn => conn.to === target);
                const startOutgoing = connections.some(conn => conn.from === startBlock);
                
                if (!targetIncoming && !startOutgoing && !wouldCreateCycle(startBlock, target)) {
=======
            const target = findBlockUnder(ev.clientX, ev.clientY);
            if (target && target !== startBlock) {
                const targetIncoming = connections.some(conn => conn.to === target);
                if (!targetIncoming) {
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
                    connections.push({
                        from: startBlock,
                        to: target,
                        line: activeLine
                    });
                    updateConnections();
<<<<<<< HEAD
                } else {
                    activeLine.remove();
                }
            } else {
=======
                }
                else {
                    activeLine.remove();
                }
            }
            else {
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
                activeLine.remove();
            }

            activeLine = null;
            startBlock = null;
        }

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    });
}

<<<<<<< HEAD
function makeStartPortConnectable(block, port) {
    port.addEventListener("mousedown", e => {
        e.stopPropagation();
        e.preventDefault();
        
        startBlock = block;
        const startOutgoing = connections.some(conn => conn.from === startBlock);
        if (startOutgoing) {
            return;
        }
        
        activeLine = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        activeLine.setAttribute("stroke", "#FFD700");
        activeLine.setAttribute("stroke-width", "3");
        activeLine.setAttribute("fill", "none");
        activeLine.setAttribute("marker-end", "url(#arrow)");
        svg.appendChild(activeLine);

        function move(ev) {
            const r = startBlock.getBoundingClientRect();
            const x1 = r.right;
            const y1 = r.top + r.height / 2;
            const x2 = ev.clientX;
            const y2 = ev.clientY;
            setPolylinePath(activeLine, x1, y1, x2, y2);
        }

        function up(ev) {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
            
            const target = findBlockUnder(ev.clientX, ev.clientY);
            
            if (target && target !== startBlock) {
                const targetIncoming = connections.some(conn => conn.to === target);
                const startOutgoing = connections.some(conn => conn.from === startBlock);
                
                if (!targetIncoming && !startOutgoing && !wouldCreateCycle(startBlock, target)) {
                    connections.push({
                        from: startBlock,
                        to: target,
                        line: activeLine
                    });
                    updateConnections();
                } else {
                    activeLine.remove();
                }
            } else {
                activeLine.remove();
            }

            activeLine = null;
            startBlock = null;
        }

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    });
}

function getBlockText(block) {
    if (block.id === 'startBlock') return 'START';
    
    const input = block.querySelector('.block-input');
    if (input) {
        return input.value || 'Print (empty)';
    }
    
    const select = block.querySelector('select');
    if (select && select.value) return select.value;
    return block.textContent.trim() || 'Block';
}

function updateConnections() {
    connections.forEach(conn => {
        if (conn.from && conn.to && conn.line) {
            const r1 = conn.from.getBoundingClientRect();
            const r2 = conn.to.getBoundingClientRect();
            const x1 = r1.right;
            const y1 = r1.top + r1.height / 2;
            const x2 = r2.left;
            const y2 = r2.top + r2.height / 2;

            setPolylinePath(conn.line, x1, y1, x2, y2);
        }
    });
    updateBlockConnectionStates();
=======
function updateConnections() {
    connections.forEach(conn => {
        const r1 = conn.from.getBoundingClientRect();
        const r2 = conn.to.getBoundingClientRect();
        const x1 = r1.right;
        const y1 = r1.top + r1.height / 2;
        const x2 = r2.left;
        const y2 = r2.top + r2.height / 2;

        setPolylinePath(conn.line, x1, y1, x2, y2);
        updateBlockConnectionStates();
    });
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
}

function findBlockUnder(x, y) {
    const blocks = document.querySelectorAll(".block");
    for (let block of blocks) {
<<<<<<< HEAD
=======
        if (block.id === "spawner") continue;
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
        const r = block.getBoundingClientRect();
        if (x > r.left && x < r.right && y > r.top && y < r.bottom) {
            return block;
        }
    }
    return null;
<<<<<<< HEAD
}

async function executeBlueprint() {
    if (executionInProgress) return;
    
    executionInProgress = true;
    const runButton = document.getElementById('runButton');
    runButton.classList.add('running');
    
    const startBlock = document.getElementById('startBlock');
    
    let currentBlock = null;
    for (let conn of connections) {
        if (conn.from === startBlock) {
            currentBlock = conn.to;
            break;
        }
    }
    
    if (!currentBlock) {
        executionInProgress = false;
        runButton.classList.remove('running');
        return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let stepCount = 1;
    let hasPrintedAnything = false;
    
    while (currentBlock) {
        const printed = await executeBlock(currentBlock, stepCount++);
        if (printed) hasPrintedAnything = true;
        
        let nextBlock = null;
        for (let conn of connections) {
            if (conn.from === currentBlock) {
                nextBlock = conn.to;
                break;
            }
        }
        currentBlock = nextBlock;
        
        if (currentBlock) {
            await new Promise(resolve => setTimeout(resolve, 400));
        }
    }
    
    if (hasPrintedAnything) {
        addConsoleMessage('PROGRAM COMPLETED', 'complete');
    }
    
    executionInProgress = false;
    runButton.classList.remove('running');
}

function executeBlock(block, stepNumber) {
    return new Promise(resolve => {
        block.classList.add('executing');
        
        const input = block.querySelector('.block-input');
        let printed = false;
        
        if (input) {
            const textToPrint = input.value || '(empty)';
            if (textToPrint !== '(empty)' || input.value) {
                addConsoleMessage(textToPrint, 'print');
                printed = true;
            }
        }
        
        setTimeout(() => {
            block.classList.remove('executing');
            resolve(printed);
        }, 600);
    });
}

function addConsoleMessage(message, type = 'print') {
    const msgElement = document.createElement('div');
    msgElement.className = `console-message ${type}`;
    msgElement.textContent = message;
    consoleContent.appendChild(msgElement);
    consoleContent.scrollTop = consoleContent.scrollHeight;
}

document.getElementById('runButton').addEventListener('click', executeBlueprint);

document.addEventListener('selectstart', (e) => {
    if (activeBlock) {
        e.preventDefault();
    }
});
=======
}
>>>>>>> 087bae845dbf902c960c98f86dc601108da7b8cc
