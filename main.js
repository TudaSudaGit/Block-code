let activeBlock = null; 
let offsetX = 0;
let offsetY = 0;
let connections = [];
let activeLine = null;
let startBlock = null;
let executionInProgress = false;
let variables = {};

const operators = ["+", "-", "*", "/", "%"];

const firstFive = ["I am first", "I am second", "I am third", "I am fourth", "I am fifth"];
const nextFive = ["I am sixth", "I am seventh", "I am eighth", "I am ninth", "I am tenth"];
const nextFive2 = ["I am eleventh", "I am twelfth", "I am thirteenth", "I am fourteenth", "I am fifteenth"];
const nextFive3 = ["I am sixteenth", "I am seventeenth", "I am eighteenth", "I am nineteenth", "I am twentieth"];
const nextFive4 = ["I am twenty-first", "I am twenty-second", "I am twenty-third", "I am twenty-fourth", "I am twenty-fifth"];
const nextFive5 = ["I am twenty-sixth", "I am twenty-seventh", "I am twenty-eighth", "I am twenty-ninth", "I am thirtieth"];

initVarSpawner('spawnerVar');
initOpSpawner('spawnerOp');
initSpawner('spawnerOutput', 'output', firstFive, true);
initSpawner('spawnerPurple', 'purple', nextFive);
initSpawner('spawnerGreen', 'green', nextFive2);
initSpawner('spawnerOrange', 'orange', nextFive3);
initSpawner('spawnerCyan', 'cyan', nextFive4);
initSpawner('spawnerYellow', 'yellow', nextFive5);

const consoleContent = document.getElementById('consoleContent');
const clearConsoleBtn = document.getElementById('clearConsole');

clearConsoleBtn.addEventListener('click', () => {
    consoleContent.innerHTML = '';
});

const startBlockElement = document.getElementById('startBlock');
makeStartBlockDraggable(startBlockElement);

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
    updateConnections();
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
path.setAttribute("fill", "#ffffff");
marker.appendChild(path);
defs.appendChild(marker);
svg.appendChild(defs);

function makeStartBlockDraggable(element) {
    const port = document.createElement("div");
    port.classList.add("start-port");
    element.appendChild(port);
    
    element.onmousedown = (e) => {
        if (e.target.classList.contains('start-port')) return;
        e.preventDefault();
        startDrag(e, element);
    };
    
    makePortConnectable(element, port);
}

function startDrag(e, element) {
    activeBlock = element; 
    activeBlock.style.opacity = '0.7'; 
    activeBlock.style.zIndex = '1000';
    const rect = activeBlock.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
}

function createDropdown(block, optionsList, isOutputBlock = false) {
    if (isOutputBlock) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'block-input';
        input.placeholder = 'Введите текст...';
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
        
        const placeholder = document.createElement('option');
        placeholder.textContent = "Выбрать...";
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

function createVarBlock(block){
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'var-name-input';
    nameInput.placeholder = 'имя';
    nameInput.onmousedown = (e) => e.stopPropagation();
    nameInput.onkeydown = (e) => e.stopPropagation();

    const eq = document.createElement('span');
    eq.className = 'var-eq-label';
    eq.textContent = '=';

    const valInput = document.createElement('input');
    valInput.type = 'text';
    valInput.className = 'var-val-input';
    valInput.placeholder = 'значение';
    valInput.onmousedown = (e) => e.stopPropagation();
    valInput.onkeydown = (e) => e.stopPropagation();

    const port = document.createElement("div");
    port.classList.add("port");
    makePortConnectable(block, port);
    block.innerHTML = '';
    block.classList.add('var-input-mode');
    block.appendChild(nameInput);
    block.appendChild(eq);
    block.appendChild(valInput);
    block.appendChild(port);
    block.dataset.blockType = 'var';
}

function createOpBlock(block) {
    const aInput = document.createElement('input');
    aInput.type = 'text';
    aInput.className = 'op-a-input';
    aInput.placeholder = 'A';
    aInput.onmousedown = (e) => e.stopPropagation();
    aInput.onkeydown = (e) => e.stopPropagation();

    const select = document.createElement('select');
    select.className = 'op-select';
    operators.forEach(op => {
        const opt = document.createElement('option');
        opt.value = op;
        opt.textContent = op;
        select.appendChild(opt);
    });
    select.onmousedown = (e) => e.stopPropagation();

    const bInput = document.createElement('input');
    bInput.type = 'text';
    bInput.className = 'op-b-input';
    bInput.placeholder = 'B';
    bInput.onmousedown = (e) => e.stopPropagation();
    bInput.onkeydown = (e) => e.stopPropagation();

    const arrow = document.createElement('span');
    arrow.className = 'op-arrow-label';
    arrow.textContent = '->';

    const resInput = document.createElement('input');
    resInput.type = 'text';
    resInput.className = 'op-res-input';
    resInput.placeholder = 'итог';
    resInput.onmousedown = (e) => e.stopPropagation();
    resInput.onkeydown = (e) => e.stopPropagation();

    const port = document.createElement("div");
    port.classList.add("port");
    makePortConnectable(block, port);
    block.innerHTML = '';
    block.classList.add('op-input-mode');
    block.appendChild(aInput);
    block.appendChild(select);
    block.appendChild(bInput);
    block.appendChild(arrow);
    block.appendChild(resInput);
    block.appendChild(port);
    block.dataset.blockType = 'op';
}

function initSpawner(spawnerId, colorClass, blockOptions, isOutputBlock = false) {
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault(); 

        const newBlock = document.createElement('div');
        newBlock.classList.add('block', colorClass);
        createDropdown(newBlock, blockOptions, isOutputBlock);
        newBlock.style.position = 'absolute';
        newBlock.style.left = (e.clientX - 60) + 'px';
        newBlock.style.top = (e.clientY - 30) + 'px';
        document.body.appendChild(newBlock);
        newBlock.onmousedown = (ev) => {
            if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
            ev.stopPropagation();
            startDrag(ev, newBlock);
        };
        startDrag(e, newBlock);
    };
}

function initVarSpawner(spawnerId) {
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault();
        const newBlock = document.createElement('div');
        newBlock.classList.add('block', 'variable');
        createVarBlock(newBlock);
        newBlock.style.position = 'absolute';
        newBlock.style.left = (e.clientX - 60) + 'px';
        newBlock.style.top = (e.clientY - 30) + 'px';
        document.body.appendChild(newBlock);
        newBlock.onmousedown = (ev) => {
            if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
            ev.stopPropagation();
            startDrag(ev, newBlock);
        };
        startDrag(e, newBlock);
    };
}

function initOpSpawner(spawnerId) {
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault();
        const newBlock = document.createElement('div');
        newBlock.classList.add('block', 'operation');
        createOpBlock(newBlock);
        newBlock.style.position = 'absolute';
        newBlock.style.left = (e.clientX - 75) + 'px';
        newBlock.style.top = (e.clientY - 30) + 'px';
        document.body.appendChild(newBlock);
        newBlock.onmousedown = (ev) => {
            if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
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

    const leftPanel = document.querySelector('.left-panel');
    const leftPanelRect = leftPanel.getBoundingClientRect();
    
    activeBlock.style.left = x + 'px';
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
    
    if (isOverTrash) {
        if (activeBlock.id === 'startBlock') {
            activeBlock.style.opacity = '1';
        } else {
            removeConnections(activeBlock);
            activeBlock.remove();
        }
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
    const offsetX = 40;
    
    const startX = x1;
    const startY = y1;

    const p1x = x1 + offsetX;
    const p1y = y1;

    const midY = y1 + (y2 - y1) * 0.5;

    const p2x = p1x;
    const p2y = midY;

    const p3x = x2 - offsetX;
    const p3y = midY;

    const p4x = p3x;
    const p4y = y2;

    const endX = x2;
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
        activeLine.setAttribute("stroke", "#ffffff");
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
}

function findBlockUnder(x, y) {
    const blocks = document.querySelectorAll(".block");
    for (let block of blocks) {
        const r = block.getBoundingClientRect();
        if (x > r.left && x < r.right && y > r.top && y < r.bottom) {
            return block;
        }
    }
    return null;
}

function resolveValue(raw) {
    const trimmed = String(raw).trim();
    if (trimmed in variables) return variables[trimmed];
    if (trimmed !== '' && !isNaN(trimmed)) return Number(trimmed);
    return trimmed;
}

async function executeOutputPrint() {
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
    
    let stepCount = 0;
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
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    if (hasPrintedAnything) {
        addConsoleMessage('Программа завершена', 'complete');
    }
    
    executionInProgress = false;
    runButton.classList.remove('running');
}

function executeBlock(block, stepNumber) {
    return new Promise(resolve => {
        block.classList.add('executing');
        let printed = false;

        if (block.dataset.blockType === 'var') {
            const nameInput = block.querySelector('.var-name-input');
            const valInput  = block.querySelector('.var-val-input');
            const name   = nameInput ? nameInput.value.trim() : '';
            const rawVal = valInput  ? valInput.value.trim()  : '';
            if (name) {
                const resolved = resolveValue(rawVal);
                variables[name] = resolved;
                addConsoleMessage(`${name} = ${resolved}`, 'print');
                printed = true;
            }
            setTimeout(() => { block.classList.remove('executing'); resolve(printed); }, 0);
            return;
        }

        if (block.dataset.blockType === 'op') {
            const aInput   = block.querySelector('.op-a-input');
            const sel      = block.querySelector('.op-select');
            const bInput   = block.querySelector('.op-b-input');
            const resInput = block.querySelector('.op-res-input');
            const a  = resolveValue(aInput  ? aInput.value  : '0');
            const op = sel ? sel.value : '+';
            const b  = resolveValue(bInput  ? bInput.value  : '0');
            const resName = resInput ? resInput.value.trim() : '';

            const aNum = Number(a);
            const bNum = Number(b);
            let result;
            if      (op === '+') result = aNum + bNum;
            else if (op === '-') result = aNum - bNum;
            else if (op === '*') result = aNum * bNum;
            else if (op === '/') result = bNum !== 0 ? aNum / bNum : 'ошибка: деление на 0';
            else if (op === '%') result = bNum !== 0 ? aNum % bNum : 'ошибка: деление на 0';
            else result = 0;

            if (resName) {
                variables[resName] = result;
                addConsoleMessage(`${resName} = ${a} ${op} ${b} = ${result}`, 'print');
            } else {
                addConsoleMessage(`${a} ${op} ${b} = ${result}`, 'print');
            }
            printed = true;
            setTimeout(() => { block.classList.remove('executing'); resolve(printed); }, 0);
            return;
        }
        
        const input = block.querySelector('.block-input');
        if (input) {
            const raw = input.value.trim() || '(пусто)';
            const output = resolveValue(raw);
            addConsoleMessage(String(output), 'print');
            printed = true;
            setTimeout(() => { block.classList.remove('executing'); resolve(printed); }, 0);
            return;
        }

        const select = block.querySelector('select');
        if (select && select.value) {
            addConsoleMessage(select.value, 'print');
            printed = true;
        }
        
        setTimeout(() => {
            block.classList.remove('executing');
            resolve(printed);
        }, 0);
    });
}

function addConsoleMessage(message, type = 'print') {
    const msgElement = document.createElement('div');
    msgElement.className = `console-message ${type}`;
    msgElement.textContent = message;
    consoleContent.appendChild(msgElement);
    consoleContent.scrollTop = consoleContent.scrollHeight;
}

document.getElementById('runButton').addEventListener('click', executeOutputPrint);

document.addEventListener('selectstart', (e) => {
    if (activeBlock) {
        e.preventDefault();
    }
});