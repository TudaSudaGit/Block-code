let activeBlock = null; 
let offsetX = 0;
let offsetY = 0;
let connections = [];
let activeLine = null;
let startBlock = null;
let executionInProgress = false;
let variables = {};

const operators = ["+", "-", "*", "/", "%"];
const comparators = [">", "<", "=", "!=", ">=", "<="];

const firstFive = ["I am first", "I am second", "I am third", "I am fourth", "I am fifth"];
const nextFive = ["I am sixth", "I am seventh", "I am eighth", "I am ninth", "I am tenth"];
const nextFive2 = ["I am eleventh", "I am twelfth", "I am thirteenth", "I am fourteenth", "I am fifteenth"];
const nextFive3 = ["I am sixteenth", "I am seventeenth", "I am eighteenth", "I am nineteenth", "I am twentieth"];
const nextFive4 = ["I am twenty-first", "I am twenty-second", "I am twenty-third", "I am twenty-fourth", "I am twenty-fifth"];
const nextFive5 = ["I am twenty-sixth", "I am twenty-seventh", "I am twenty-eighth", "I am twenty-ninth", "I am thirtieth"];

initVarSpawner('spawnerVar');
initOpSpawner('spawnerOp');
initDeclareSpawner('spawnerDeclare');
initAssignSpawner('spawnerAssign');
initIfSpawner('spawnerIf');
initSpawner('spawnerOutput', 'output', firstFive, true);
initArraySpawner('spawnerArray');
initWhileSpawner('spawnerWhile');
initSpawner('spawnerGreen', 'green', nextFive2);
initSpawner('spawnerOrange', 'orange', nextFive3);
initSpawner('spawnerCyan', 'cyan', nextFive4);

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

function createDeclareBlock(block) {
    const label = document.createElement('span');
    label.className = 'declare-label';
    label.textContent = 'int';

    const namesInput = document.createElement('input');
    namesInput.type = 'text';
    namesInput.className = 'declare-names-input';
    namesInput.placeholder = 'x,y = 1,2';
    namesInput.onmousedown = (e) => e.stopPropagation();
    namesInput.onkeydown = (e) => e.stopPropagation();

    const port = document.createElement("div");
    port.classList.add("port");
    makePortConnectable(block, port);
    block.innerHTML = '';
    block.classList.add('declare-input-mode');
    block.appendChild(label);
    block.appendChild(namesInput);
    block.appendChild(port);
    block.dataset.blockType = 'declare';
}

function createAssignBlock(block) {
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'assign-name-input';
    nameInput.placeholder = 'имя';
    nameInput.onmousedown = (e) => e.stopPropagation();
    nameInput.onkeydown = (e) => e.stopPropagation();

    const eq = document.createElement('span');
    eq.className = 'var-eq-label';
    eq.textContent = '=';

    const exprInput = document.createElement('input');
    exprInput.type = 'text';
    exprInput.className = 'assign-expr-input';
    exprInput.placeholder = 'выражение';
    exprInput.onmousedown = (e) => e.stopPropagation();
    exprInput.onkeydown = (e) => e.stopPropagation();

    const port = document.createElement("div");
    port.classList.add("port");
    makePortConnectable(block, port);
    block.innerHTML = '';
    block.classList.add('assign-input-mode');
    block.appendChild(nameInput);
    block.appendChild(eq);
    block.appendChild(exprInput);
    block.appendChild(port);
    block.dataset.blockType = 'assign';
}

function createIfBlock(block) {
    const ifLabel = document.createElement('span');
    ifLabel.className = 'if-label';
    ifLabel.textContent = 'if';

    const leftInput = document.createElement('input');
    leftInput.type = 'text';
    leftInput.className = 'if-left-input';
    leftInput.placeholder = 'A';
    leftInput.onmousedown = (e) => e.stopPropagation();
    leftInput.onkeydown = (e) => e.stopPropagation();

    const cmpSelect = document.createElement('select');
    cmpSelect.className = 'if-cmp-select';
    comparators.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        cmpSelect.appendChild(opt);
    });

    cmpSelect.onmousedown = (e) => e.stopPropagation();
    const rightInput = document.createElement('input');
    rightInput.type = 'text';
    rightInput.className = 'if-right-input';
    rightInput.placeholder = 'B';
    rightInput.onmousedown = (e) => e.stopPropagation();
    rightInput.onkeydown = (e) => e.stopPropagation();
    const portTrue = document.createElement("div");
    portTrue.classList.add("port", "port-true");
    portTrue.title = 'true';
    makePortConnectable(block, portTrue);
    const portFalse = document.createElement("div");
    portFalse.classList.add("port", "port-false");
    portFalse.title = 'false';
    makePortConnectable(block, portFalse);
    block.innerHTML = '';
    block.classList.add('if-input-mode');
    block.appendChild(ifLabel);
    block.appendChild(leftInput);
    block.appendChild(cmpSelect);
    block.appendChild(rightInput);
    block.appendChild(portTrue);
    block.appendChild(portFalse);
    block.dataset.blockType = 'if';
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

function initDeclareSpawner(spawnerId) {
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault();
        const newBlock = document.createElement('div');
        newBlock.classList.add('block', 'declare');
        createDeclareBlock(newBlock);
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

function initAssignSpawner(spawnerId) {
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault();
        const newBlock = document.createElement('div');
        newBlock.classList.add('block', 'assign');
        createAssignBlock(newBlock);
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

function initIfSpawner(spawnerId) {
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault();
        const newBlock = document.createElement('div');
        newBlock.classList.add('block', 'ifblock');
        createIfBlock(newBlock);
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
        if (block.dataset.blockType === 'if' || block.dataset.blockType === 'while') {
            const pClass = port.classList.contains('port-true') ? 'port-true' : 'port-false';
            if (connections.some(conn => conn.from === block && conn.portClass === pClass)) return;
        } else {
            if (connections.some(conn => conn.from === startBlock)) return;
        }
        const dragPortClass = port.classList.contains('port-true') ? 'port-true'
                            : port.classList.contains('port-false') ? 'port-false'
                            : null;
        activeLine = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        activeLine.setAttribute("stroke", dragPortClass === 'port-true' ? "#4CAF50" : dragPortClass === 'port-false' ? "#ef5350" : "#ffffff");
        activeLine.setAttribute("stroke-width", "3");
        activeLine.setAttribute("fill", "none");
        activeLine.setAttribute("marker-end", "url(#arrow)");
        svg.appendChild(activeLine);
        function move(ev) {
            const r = startBlock.getBoundingClientRect();
            setPolylinePath(activeLine, r.right, r.top + r.height / 2, ev.clientX, ev.clientY);
        }
        function up(ev) {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
            const target = findBlockUnder(ev.clientX, ev.clientY);
            if (target && target !== startBlock) {
                const targetIncoming = connections.some(conn => conn.to === target);
                const startOutgoing = (block.dataset.blockType !== 'if' && block.dataset.blockType !== 'while') 
                    ? connections.some(conn => conn.from === startBlock) : false;
                if (block.dataset.blockType === 'if' || block.dataset.blockType === 'while') {
                    if (!targetIncoming && !wouldCreateCycle(startBlock, target)) {
                        connections.push({ from: startBlock, to: target, line: activeLine, portClass: dragPortClass });
                        updateConnections();
                    } else {
                        activeLine.remove();
                    }
                } else {
                    if (!targetIncoming && !startOutgoing && !wouldCreateCycle(startBlock, target)) {
                        connections.push({ from: startBlock, to: target, line: activeLine, portClass: dragPortClass });
                        updateConnections();
                    } else {
                        activeLine.remove();
                    }
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
    if (trimmed in variables) {
        const val = variables[trimmed];
        if (Array.isArray(val)) return val;
        return val;
    }
    if (trimmed !== '' && !isNaN(trimmed)) return Number(trimmed);
    return trimmed;
}

function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') { i++; continue; }
        if (ch >= '0' && ch <= '9') {
            let num = '';
            while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') num += expr[i++];
            tokens.push({ type: 'num', value: Number(num) });
            continue;
        }
        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
            let name = '';
            while (i < expr.length && (/[a-zA-Z0-9_]/.test(expr[i]))) name += expr[i++];
               if (i < expr.length && expr[i] === '[') {
                i++; 
                let indexExpr = '';
                let bracketCount = 1;
                while (i < expr.length && bracketCount > 0) {
                    const c = expr[i];
                    if (c === '[') bracketCount++;
                    else if (c === ']') bracketCount--;
                    
                    if (bracketCount > 0) {
                        indexExpr += c;
                    }
                    i++;
                }
                tokens.push({ 
                    type: 'array_access', 
                    name: name,
                    indexExpr: indexExpr.trim()
                });
                continue;
            }
            if (!(name in variables)) throw new Error(`Переменная "${name}" не объявлена`);
            tokens.push({ type: 'num', value: Number(variables[name]) });
            continue;
        }
        if ('()+-*/%'.includes(ch)) {
            tokens.push({ type: ch === '(' || ch === ')' ? 'paren' : 'op', value: ch });
            i++;
            continue;
        }
        throw new Error(`Неизвестный символ: "${ch}"`);
    }
    return tokens;
}

function parseExpr(tokens, pos) {
    let [left, p] = parseTerm(tokens, pos);
    while (p < tokens.length && (tokens[p].value === '+' || tokens[p].value === '-')) {
        const op = tokens[p].value;
        let right; [right, p] = parseTerm(tokens, p + 1);
        left = op === '+' ? left + right : left - right;
    }
    return [left, p];
}

function parseTerm(tokens, pos) {
    let [left, p] = parseFactor(tokens, pos);
    while (p < tokens.length && (tokens[p].value === '*' || tokens[p].value === '/' || tokens[p].value === '%')) {
        const op = tokens[p].value;
        let right; [right, p] = parseFactor(tokens, p + 1);
        if (op === '*') left = left * right;
        else if (op === '/') { if (right === 0) throw new Error('Деление на 0'); left = Math.trunc(left / right); }
        else left = left % right;
    }
    return [left, p];
}

function parseFactor(tokens, pos) {
    if (pos >= tokens.length) throw new Error('Неожиданный конец выражения');
    const tok = tokens[pos];
    if (tok.type === 'array_access') {
        const arrayName = tok.name;
        const indexExpr = tok.indexExpr;
        if (!(arrayName in variables) || !Array.isArray(variables[arrayName])) {
            throw new Error(`"${arrayName}" не является массивом`);
        }
        const indexTokens = tokenize(indexExpr);
        const [index, _] = parseExpr(indexTokens, 0);
        if (!Number.isInteger(index) || index < 0) {
            throw new Error(`Индекс массива должен быть неотрицательным целым числом: ${index}`);
        }
        const array = variables[arrayName];
        if (index >= array.length) {
            throw new Error(`Индекс ${index} вне границ массива "${arrayName}" (длина: ${array.length})`);
        }
        return [array[index], pos + 1];
    }
    if (tok.type === 'op' && tok.value === '-') {
        const [val, p] = parseFactor(tokens, pos + 1);
        return [-val, p];
    }
    if (tok.type === 'paren' && tok.value === '(') {
        const [val, p] = parseExpr(tokens, pos + 1);
        if (p >= tokens.length || tokens[p].value !== ')') throw new Error('Ожидалась )');
        return [val, p + 1];
    }
    if (tok.type === 'num') return [tok.value, pos + 1];
    throw new Error(`Неожиданный токен: "${tok.value}"`);
}

function evalExpr(exprStr) {
    const tokens = tokenize(exprStr.trim());
    if (tokens.length === 0) throw new Error('Пустое выражение');
    const [result, pos] = parseExpr(tokens, 0);
    if (pos !== tokens.length) throw new Error('Лишние символы в выражении');
    return result;
}

function evalCondition(leftStr, cmp, rightStr) {
    const a = evalExpr(leftStr);
    const b = evalExpr(rightStr);
    if (cmp === '>')  return a > b;
    if (cmp === '<')  return a < b;
    if (cmp === '=')  return a === b;
    if (cmp === '!=') return a !== b;
    if (cmp === '>=') return a >= b;
    if (cmp === '<=') return a <= b;
    return false;
}

function markBlockError(block) {
    block.classList.add('block-error');
    setTimeout(() => block.classList.remove('block-error'), 2000);
}

function getNextBlock(fromBlock, portClass) {
    for (let conn of connections) {
        if (conn.from !== fromBlock) continue;
        if (portClass === null && !conn.portClass) return conn.to;
        if (portClass !== null && conn.portClass === portClass) return conn.to;
    }
    return null;
}

async function executeOutputPrint() {
    if (executionInProgress) return;
    executionInProgress = true;
    variables = {};
    const runButton = document.getElementById('runButton');
    runButton.classList.add('running');
    const startBlockEl = document.getElementById('startBlock');
    let currentBlock = null;
    for (let conn of connections) {
        if (conn.from === startBlockEl) { currentBlock = conn.to; break; }
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
        let result;
        try {
            result = await executeBlock(currentBlock, stepCount++);
        } catch (err) {
            addConsoleMessage('ОШИБКА: ' + err.message, 'error');
            break;
        }
        if (result.printed) hasPrintedAnything = true;
        currentBlock = result.nextBlock;
        if (currentBlock) await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (hasPrintedAnything) addConsoleMessage('Программа завершена', 'complete');
    executionInProgress = false;
    runButton.classList.remove('running');
}

function executeBlock(block, stepNumber) {
    return new Promise((resolve, reject) => {
        block.classList.add('executing');
        setTimeout(() => block.classList.remove('executing'), 300);
        try {
            if (block.dataset.blockType === 'declare') {
                const namesInput = block.querySelector('.declare-names-input');
                const raw = namesInput ? namesInput.value : '';
                const parts = raw.split('=');
                const names = parts[0].split(',').map(s => s.trim()).filter(s => s.length > 0);
                const valueStrs = parts[1] ? parts[1].split(',').map(s => s.trim()) : [];
                if (names.length === 0) { markBlockError(block); throw new Error('Не указаны имена переменных'); }
                names.forEach((name, i) => {
                    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) { markBlockError(block); throw new Error(`Недопустимое имя: "${name}"`); }
                    let val = 0;
                    if (valueStrs[i] !== undefined && valueStrs[i] !== '') {
                        try { val = evalExpr(valueStrs[i]); } catch { val = 0; }
                    }
                    variables[name] = val;
                });
                const display = names.map((n) => `${n}=${variables[n]}`).join(', ');
                addConsoleMessage(`int ${display}`, 'print');
                resolve({ printed: true, nextBlock: getNextBlock(block, null) });
                return;
            }
            if (block.dataset.blockType === 'assign') {
                const nameInput = block.querySelector('.assign-name-input');
                const exprInput = block.querySelector('.assign-expr-input');
                const name = nameInput ? nameInput.value.trim() : '';
                const arrayMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]\s*=\s*(.+)$/);
                if (arrayMatch) {
                    const arrayName = arrayMatch[1];
                    const indexExpr = arrayMatch[2].trim();
                    const valueExpr = arrayMatch[3].trim();
                    if (!(arrayName in variables) || !Array.isArray(variables[arrayName])) {
                        markBlockError(block);
                        throw new Error(`"${arrayName}" не является массивом`);
                    }
                    const index = evalExpr(indexExpr);
                    if (!Number.isInteger(index) || index < 0) {
                        markBlockError(block);
                        throw new Error(`Индекс массива должен быть неотрицательным целым числом: ${index}`);
                    }
                    const array = variables[arrayName];
                    if (index >= array.length) {
                        markBlockError(block);
                        throw new Error(`Индекс ${index} вне границ массива "${arrayName}" (длина: ${array.length})`);
                    }
                    const value = evalExpr(valueExpr);
                    array[index] = value;
                    addConsoleMessage(`${arrayName}[${index}] = ${value}`, 'print');
                    resolve({ printed: true, nextBlock: getNextBlock(block, null) });
                    return;
                } else {
                    const exprStr = exprInput ? exprInput.value.trim() : '';
                    if (!name) { markBlockError(block); throw new Error('Не указано имя переменной'); }
                    if (!(name in variables)) { markBlockError(block); throw new Error(`Переменная "${name}" не объявлена`); }
                    const result = evalExpr(exprStr);
                    variables[name] = result;
                    addConsoleMessage(`${name} = ${result}`, 'print');
                    resolve({ printed: true, nextBlock: getNextBlock(block, null) });
                    return;
                }
            }
            if (block.dataset.blockType === 'while') {
                const leftInput = block.querySelector('.while-left-input');
                const cmpSelect = block.querySelector('.while-cmp-select');
                const rightInput = block.querySelector('.while-right-input');
                const leftStr = leftInput ? leftInput.value.trim() : '0';
                const cmp = cmpSelect ? cmpSelect.value : '=';
                const rightStr = rightInput ? rightInput.value.trim() : '0';
                const condition = evalCondition(leftStr, cmp, rightStr);
                addConsoleMessage(`while (${leftStr} ${cmp} ${rightStr}) → ${condition ? 'true' : 'false'}`, 'print');
                let nextBlock = null;
                if (condition) {
                    nextBlock = getNextBlock(block, 'port-while-true');
                } else {
                    nextBlock = getNextBlock(block, 'port-while-false');
                }
                resolve({ 
                    printed: true, 
                    nextBlock: nextBlock,
                });
                return;
            }
            if (block.dataset.blockType === 'if') {
                const leftInput  = block.querySelector('.if-left-input');
                const cmpSelect  = block.querySelector('.if-cmp-select');
                const rightInput = block.querySelector('.if-right-input');
                const leftStr  = leftInput  ? leftInput.value.trim()  : '0';
                const cmp      = cmpSelect  ? cmpSelect.value         : '=';
                const rightStr = rightInput ? rightInput.value.trim() : '0';
                const condition = evalCondition(leftStr, cmp, rightStr);
                addConsoleMessage(`if (${leftStr} ${cmp} ${rightStr}) → ${condition ? 'true' : 'false'}`, 'print');
                resolve({ printed: true, nextBlock: condition ? getNextBlock(block, 'port-true') : getNextBlock(block, 'port-false') });
                return;
            }
            if (block.dataset.blockType === 'array') {
                const nameInput = block.querySelector('.array-name-input');
                const sizeInput = block.querySelector('.array-size-input');
                const elementsInput = block.querySelector('.array-elements-input');
                const name = nameInput ? nameInput.value.trim() : '';
                const size = sizeInput ? sizeInput.value.trim() : '';
                const elementsStr = elementsInput ? elementsInput.value.trim() : '';
                if (!name) { 
                    markBlockError(block); 
                    throw new Error('Не указано имя массива'); 
                }
                const elements = elementsStr ? 
                    elementsStr.split(',').map(e => e.trim()).filter(e => e !== '') : 
                    [];
                let expectedSize = null;
                if (size) {
                    try {
                        expectedSize = evalExpr(size);
                        if (typeof expectedSize !== 'number' || expectedSize <= 0) {
                            throw new Error('Размер должен быть положительным числом');
                        }
                    } catch {
                        markBlockError(block);
                        throw new Error('Некорректный размер массива');
                    }
                }
                const array = [];
                if (elements.length > 0) {
                    elements.forEach((element, index) => {
                        try {
                            array[index] = evalExpr(element);
                        } catch {
                            array[index] = resolveValue(element);
                        }
                    });
                }
                if (expectedSize !== null && array.length !== expectedSize) {
                    markBlockError(block);
                    throw new Error(`Размер массива (${array.length}) не соответствует заданному (${expectedSize})`);
                }
                variables[name] = array;
                const arrayStr = array.map(v => 
                    typeof v === 'string' ? `"${v}"` : v
                ).join(', ');
                addConsoleMessage(`${name} = [${arrayStr}]`, 'print');
                resolve({ printed: true, nextBlock: getNextBlock(block, null) });
                return;
            }
            if (block.dataset.blockType === 'var') {
                const nameInput = block.querySelector('.var-name-input');
                const valInput  = block.querySelector('.var-val-input');
                const name   = nameInput ? nameInput.value.trim() : '';
                const rawVal = valInput  ? valInput.value.trim()  : '';
                if (name) {
                    let resolved;
                    try { resolved = evalExpr(rawVal); } catch { resolved = resolveValue(rawVal); }
                    variables[name] = resolved;
                    addConsoleMessage(`${name} = ${resolved}`, 'print');
                }
                resolve({ printed: !!name, nextBlock: getNextBlock(block, null) });
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
                resolve({ printed: true, nextBlock: getNextBlock(block, null) });
                return;
            }
            const input = block.querySelector('.block-input');
            if (input) {
                const raw = input.value.trim() || '(пусто)';
                const output = resolveValue(raw);
                addConsoleMessage(String(output), 'print');
                resolve({ printed: true, nextBlock: getNextBlock(block, null) });
                return;
            }
            const select = block.querySelector('select');
            if (select && select.value) {
                addConsoleMessage(select.value, 'print');
                resolve({ printed: true, nextBlock: getNextBlock(block, null) });
                return;
            }
            resolve({ printed: false, nextBlock: getNextBlock(block, null) });
        } catch(err) {
            reject(err);
        }
    });
}

function createArrayBlock(block) {
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'array-name-input';
    nameInput.placeholder = 'имя';
    nameInput.onmousedown = (e) => e.stopPropagation();
    nameInput.onkeydown = (e) => e.stopPropagation();

    const eq1 = document.createElement('span');
    eq1.className = 'array-eq-label';
    eq1.textContent = '[';

    const sizeInput = document.createElement('input');
    sizeInput.type = 'text';
    sizeInput.className = 'array-size-input';
    sizeInput.placeholder = 'размер';
    sizeInput.onmousedown = (e) => e.stopPropagation();
    sizeInput.onkeydown = (e) => e.stopPropagation();

    const eq2 = document.createElement('span');
    eq2.className = 'array-eq-label';
    eq2.textContent = '] =';

    const elementsInput = document.createElement('input');
    elementsInput.type = 'text';
    elementsInput.className = 'array-elements-input';
    elementsInput.placeholder = 'элементы через запятую';
    elementsInput.onmousedown = (e) => e.stopPropagation();
    elementsInput.onkeydown = (e) => e.stopPropagation();

    const port = document.createElement("div");
    port.classList.add("port");
    makePortConnectable(block, port);
    
    block.innerHTML = '';
    block.classList.add('array-input-mode');
    block.appendChild(nameInput);
    block.appendChild(eq1);
    block.appendChild(sizeInput);
    block.appendChild(eq2);
    block.appendChild(elementsInput);
    block.appendChild(port);
    block.dataset.blockType = 'array';
}

function initArraySpawner(spawnerId) {
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault();
        const newBlock = document.createElement('div');
        newBlock.classList.add('block', 'array');
        createArrayBlock(newBlock);
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

function createWhileBlock(block) {
    const whileLabel = document.createElement('span');
    whileLabel.className = 'while-label';
    whileLabel.textContent = 'while';
    const leftInput = document.createElement('input');
    leftInput.type = 'text';
    leftInput.className = 'while-left-input';
    leftInput.placeholder = 'A';
    leftInput.onmousedown = (e) => e.stopPropagation();
    leftInput.onkeydown = (e) => e.stopPropagation();
    const cmpSelect = document.createElement('select');
    cmpSelect.className = 'while-cmp-select';
    comparators.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        cmpSelect.appendChild(opt);
    });
    cmpSelect.onmousedown = (e) => e.stopPropagation();
    const rightInput = document.createElement('input');
    rightInput.type = 'text';
    rightInput.className = 'while-right-input';
    rightInput.placeholder = 'B';
    rightInput.onmousedown = (e) => e.stopPropagation();
    rightInput.onkeydown = (e) => e.stopPropagation();
    const portTrue = document.createElement("div");
    portTrue.classList.add("port", "port-true");
    portTrue.title = 'true (выполнить тело цикла)';
    const portFalse = document.createElement("div");
    portFalse.classList.add("port", "port-false");
    portFalse.title = 'false (выход из цикла)';
    makePortConnectable(block, portTrue);
    makePortConnectable(block, portFalse);
    block.innerHTML = '';
    block.classList.add('while-input-mode');
    block.appendChild(whileLabel);
    block.appendChild(leftInput);
    block.appendChild(cmpSelect);
    block.appendChild(rightInput);
    block.appendChild(portTrue);
    block.appendChild(portFalse);
    block.dataset.blockType = 'while';
}

async function executeOutputPrint() {
    if (executionInProgress) return;
    executionInProgress = true;
    variables = {};
    const runButton = document.getElementById('runButton');
    runButton.classList.add('running');
    const startBlockEl = document.getElementById('startBlock');
    let currentBlock = null;
    for (let conn of connections) {
        if (conn.from === startBlockEl) { currentBlock = conn.to; break; }
    }
    if (!currentBlock) {
        executionInProgress = false;
        runButton.classList.remove('running');
        return;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    let stepCount = 0;
    let hasPrintedAnything = false;
    const loopDetector = new Map();
    const MAX_ITERATIONS = 1000;
    while (currentBlock) {
        stepCount++;
        if (stepCount > MAX_ITERATIONS) {
            addConsoleMessage('ОШИБКА: Превышен лимит итераций (возможно, бесконечный цикл)', 'error');
            break;
        }
        let result;
        try {
            result = await executeBlock(currentBlock, stepCount);
        } catch (err) {
            addConsoleMessage('ОШИБКА: ' + err.message, 'error');
            break;
        }
        if (result.printed) hasPrintedAnything = true;
        if (currentBlock.dataset.blockType === 'while' && result.shouldLoop) {
            const blockId = currentBlock.id || Array.from(currentBlock.classList).join('.');
            const count = loopDetector.get(blockId) || 0;
            if (count > 100) {
                addConsoleMessage('ОШИБКА: Обнаружен бесконечный цикл в while блоке', 'error');
                break;
            }
            loopDetector.set(blockId, count + 1);
        }
        currentBlock = result.nextBlock;
        if (currentBlock && currentBlock.dataset.blockType === 'while') {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    if (hasPrintedAnything) addConsoleMessage('Программа завершена', 'complete');
    executionInProgress = false;
    runButton.classList.remove('running');
}

function initWhileSpawner(spawnerId) {
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault();
        const newBlock = document.createElement('div');
        newBlock.classList.add('block', 'while');
        createWhileBlock(newBlock);
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