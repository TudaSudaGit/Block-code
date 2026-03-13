let activeBlock = null; 
let offsetX = 0;
let offsetY = 0;
let connections = [];
let activeLine = null;
let startBlock = null;
let executionInProgress = false;
let variables = {};
let varTypes = {};

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

function createDropdown(block, isOutputBlock = false) {
    if (isOutputBlock) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'block-input';
        input.placeholder = 'input';
        input.onmousedown = (e) => e.stopPropagation();
        
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
    } 
}

function createVarBlock(block){
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'var-name-input';
    nameInput.placeholder = 'name';
    nameInput.onmousedown = (e) => e.stopPropagation();
    nameInput.onkeydown = (e) => e.stopPropagation();

    const eq = document.createElement('span');
    eq.className = 'var-eq-label';
    eq.textContent = '=';

    const valInput = document.createElement('input');
    valInput.type = 'text';
    valInput.className = 'var-val-input';
    valInput.placeholder = 'value';
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

function createDeclareBlock(block) {
    const typeSelect = document.createElement('select');
    typeSelect.className = 'declare-type-select';
    ['int', 'double', 'string'].forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        typeSelect.appendChild(opt);
    });
    typeSelect.onmousedown = (e) => e.stopPropagation();
    typeSelect.onkeydown = (e) => e.stopPropagation();

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
    block.appendChild(typeSelect);
    block.appendChild(namesInput);
    block.appendChild(port);
    block.dataset.blockType = 'declare';
}

function createAssignBlock(block) {
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'assign-name-input';
    nameInput.placeholder = 'name';
    nameInput.onmousedown = (e) => e.stopPropagation();
    nameInput.onkeydown = (e) => e.stopPropagation();

    const eq = document.createElement('span');
    eq.className = 'var-eq-label';
    eq.textContent = '=';

    const exprInput = document.createElement('input');
    exprInput.type = 'text';
    exprInput.className = 'assign-expr-input';
    exprInput.placeholder = 'expression';
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

    const condInput = document.createElement('input');
    condInput.type = 'text';
    condInput.className = 'if-cond-input';
    condInput.placeholder = 'a > 0 AND b < 10';
    condInput.onmousedown = (e) => e.stopPropagation();
    condInput.onkeydown = (e) => e.stopPropagation();

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
    block.appendChild(condInput);
    block.appendChild(portTrue);
    block.appendChild(portFalse);
    block.dataset.blockType = 'if';
}

const spawnerConfig = {
    'spawnerVar':      { cssClass: 'variable',  createFn: createVarBlock,     offsetX: 60, offsetY: 30 },
    'spawnerDeclare':  { cssClass: 'declare',   createFn: createDeclareBlock,  offsetX: 60, offsetY: 30 },
    'spawnerAssign':   { cssClass: 'assign',    createFn: createAssignBlock,   offsetX: 60, offsetY: 30 },
    'spawnerIf':       { cssClass: 'ifblock',   createFn: createIfBlock,       offsetX: 75, offsetY: 30 },
    'spawnerOutput':   { cssClass: 'output',    createFn: (b) => createDropdown(b, true), offsetX: 60, offsetY: 30 },
    'spawnerArray':    { cssClass: 'array',     createFn: createArrayBlock,    offsetX: 60, offsetY: 30 },
    'spawnerWhile':    { cssClass: 'while',     createFn: createWhileBlock,    offsetX: 75, offsetY: 30 },
    'spawnerEndIf':    { cssClass: 'end-if',    createFn: createEndIfBlock,    offsetX: 60, offsetY: 25 },
    'spawnerEndWhile': { cssClass: 'end-while', createFn: createEndWhileBlock, offsetX: 60, offsetY: 25 },
    'spawnerFor':      { cssClass: 'forblock',  createFn: createForBlock,      offsetX: 75, offsetY: 30 },
};

function initAllSpawners() {
    Object.entries(spawnerConfig).forEach(([id, { cssClass, createFn, offsetX, offsetY }]) => {
        const spawner = document.getElementById(id);
        if (!spawner) return;

        spawner.onmousedown = (e) => {
            e.preventDefault();

            const newBlock = document.createElement('div');
            newBlock.classList.add('block', cssClass);
            createFn(newBlock);
            newBlock.style.position = 'absolute';
            newBlock.style.left = (e.clientX - offsetX) + 'px';
            newBlock.style.top  = (e.clientY - offsetY) + 'px';
            document.body.appendChild(newBlock);

            newBlock.onmousedown = (ev) => {
                if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
                ev.stopPropagation();
                startDrag(ev, newBlock);
            };

            startDrag(e, newBlock);
        };
    });
}

function markBlockError(block) {
    block.classList.add('block-error');
    setTimeout(() => block.classList.remove('block-error'), 5000);
}

document.onmousemove = (e) => {
    const trashRect = trash.getBoundingClientRect();
    if (!activeBlock) return; 

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

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
        if (block.dataset.blockType === 'if' || block.dataset.blockType === 'while' || block.dataset.blockType === 'for') {
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
                const multiIn = target.dataset.blockType === 'end-if';
                const targetIncoming = !multiIn && connections.some(conn => conn.to === target);
                const startOutgoing = (block.dataset.blockType !== 'if' && block.dataset.blockType !== 'while' && block.dataset.blockType !== 'for')
                    ? connections.some(conn => conn.from === startBlock) : false;
                const isBackEdge = startBlock.dataset.blockType === 'end-while' &&
                                (target.dataset.blockType === 'while' || target.dataset.blockType === 'for');
                const cycle = !isBackEdge && wouldCreateCycle(startBlock, target);

                if (block.dataset.blockType === 'if' || block.dataset.blockType === 'while' || block.dataset.blockType === 'for') {
                    if (!targetIncoming && !cycle) {
                        connections.push({ from: startBlock, to: target, line: activeLine, portClass: dragPortClass });
                        updateConnections();
                    } else {
                        activeLine.remove();
                    }
                } else {
                    if ((isBackEdge || (!targetIncoming && !startOutgoing && !cycle))) {
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
        if (ch === '"' || ch === "'") {
            const quote = ch;
            let str = '';
            i++;
            while (i < expr.length && expr[i] !== quote) {
                str += expr[i++];
            }
            i++;
            tokens.push({ type: 'str', value: str });
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let num = '';
            while (i < expr.length && (expr[i] >= '0' && expr[i] <= '9')) num += expr[i++];
            if (i < expr.length && expr[i] === '.') {
                num += expr[i++];
                while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') num += expr[i++];
            }
            tokens.push({ type: 'num', value: Number(num) });
            continue;
        }
        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
            let name = '';
            while (i < expr.length && (/[a-zA-Z0-9_]/.test(expr[i]))) name += expr[i++];
            if (expr[i] === '(') {
                    i++;
                    let argExpr = '';
                    let depth = 1;
                    while (i < expr.length && depth > 0) {
                        if (expr[i] === '(') depth++;
                        else if (expr[i] === ')') depth--;
                        if (depth > 0) argExpr += expr[i];
                        i++;
                    }
                    if (name === 'split') {
                        let commaIdx = -1;
                        let inQuote = null;
                        for (let j = 0; j < argExpr.length; j++) {
                            const c = argExpr[j];
                            if ((c === '"' || c === "'") && inQuote === null) { inQuote = c; continue; }
                            if (c === inQuote) { inQuote = null; continue; }
                            if (inQuote) continue;
                            if (c === ',') { commaIdx = j; break; }
                        }
                        if (commaIdx === -1) throw new Error('split требует два аргумента: split(строка, разделитель)');
                        const strPart = argExpr.slice(0, commaIdx).trim();
                        const sepPart = argExpr.slice(commaIdx + 1).trim();
                        const strTokens = tokenize(strPart);
                        const [strVal] = parseExpr(strTokens, 0);
                        const sepTokens = tokenize(sepPart);
                        const [sepVal] = parseExpr(sepTokens, 0);
                        tokens.push({ type: 'str', value: String(strVal).split(String(sepVal)) });
                        continue;
                    }
                    const argTokens = tokenize(argExpr.trim());
                    const [argVal] = parseExpr(argTokens, 0);
                    if (name === 'int') { tokens.push({ type: 'num', value: Math.trunc(Number(argVal)) }); continue; }
                    if (name === 'double') { tokens.push({ type: 'num', value: Number(argVal) }); continue; }
                    if (name === 'string') { tokens.push({ type: 'str', value: String(argVal) }); continue; }
                    if (name === 'len') {
                        const v = argVal;
                        if (Array.isArray(v)) { tokens.push({ type: 'num', value: v.length }); continue; }
                        tokens.push({ type: 'num', value: String(v).length }); continue;
                    }
            }
            if (name in variables && typeof variables[name] === 'string' && expr[i] === '[') {
                i++;
                let indexExpr = '';
                let bracketCount = 1;
                while (i < expr.length && bracketCount > 0) {
                    if (expr[i] === '[') bracketCount++;
                    else if (expr[i] === ']') bracketCount--;
                    if (bracketCount > 0) indexExpr += expr[i];
                    i++;
                }
                const idxTokens = tokenize(indexExpr.trim());
                const [idx] = parseExpr(idxTokens, 0);
                tokens.push({ type: 'str', value: String(variables[name])[idx] ?? '' });
                continue;
            }
            if (!(name in variables)) throw new Error(`Переменная "${name}" не объявлена`);
            const v = variables[name];
            tokens.push(Array.isArray(v) || typeof v === 'string'
                ? { type: 'str', value: v }
                : { type: 'num', value: Number(v) });
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
        let right;
        [right, p] = parseTerm(tokens, p + 1);
        if (op === '+') {
            left = (typeof left === 'string' || typeof right === 'string')
                ? String(left) + String(right)
                : left + right;
        } else {
            left = left - right;
        }
    }
    return [left, p];
}

function parseTerm(tokens, pos) {
    let [left, p] = parseFactor(tokens, pos);
    while (p < tokens.length && (tokens[p].value === '*' || tokens[p].value === '/' || tokens[p].value === '%')) {
        const op = tokens[p].value;
        let right; 
        [right, p] = parseFactor(tokens, p + 1);
        if (op === '*') left *= right;
        else if (op === '/') { if (right === 0) throw new Error('Деление на 0'); left /= right; }
        else { if (right === 0) throw new Error('Остаток от деления на 0'); left %= right; }
    }
    return [left, p];
}

function parseFactor(tokens, pos) {
    if (pos >= tokens.length) throw new Error('Неожиданно!');
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
        if (p >= tokens.length || tokens[p].value !== ')') throw new Error('Ожидалось закрытие скобки');
        return [val, p + 1];
    }
    if (tok.type === 'num') return [tok.value, pos + 1];
    if (tok.type === 'str') return [tok.value, pos + 1];
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
    if (cmp === '==')  return a === b;
    if (cmp === '!=') return a !== b;
    if (cmp === '>=') return a >= b;
    if (cmp === '<=') return a <= b;
    return false;
}

function evalLogicalExpr(str) {
    const tokens = tokenizeLogical(str.trim());
    const [result, pos] = parseOr(tokens, 0);
    if (pos !== tokens.length) throw new Error(`Лишние символы в условии: "${tokens.slice(pos).map(t=>t.value).join(' ')}"`);
    return result;
}

function tokenizeLogical(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        if (str[i] === ' ') { i++; continue; }
        if (str[i] === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
        if (str[i] === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
        const upper = str.slice(i).toUpperCase();
        if (upper.startsWith('AND') && !/[A-Z0-9_]/.test(str[i+3] || '')) {
            tokens.push({ type: 'and', value: 'AND' }); i += 3; continue;
        }
        if (upper.startsWith('OR') && !/[A-Z0-9_]/.test(str[i+2] || '')) {
            tokens.push({ type: 'or', value: 'OR' }); i += 2; continue;
        }
        if (upper.startsWith('NOT') && !/[A-Z0-9_]/.test(str[i+3] || '')) {
            tokens.push({ type: 'not', value: 'NOT' }); i += 3; continue;
        }
        let chunk = '';
        let depth = 0;
        while (i < str.length) {
            const u = str.slice(i).toUpperCase();
            if (str[i] === '(' ) { depth++; chunk += str[i++]; continue; }
            if (str[i] === ')' ) {
                depth--; chunk += str[i++];
                continue;
            }
            if (depth === 0) {
                if ((u.startsWith('AND') && !/[A-Z0-9_]/.test(str[i+3] || '')) ||
                    (u.startsWith('OR')  && !/[A-Z0-9_]/.test(str[i+2] || '')) ||
                    (u.startsWith('NOT') && !/[A-Z0-9_]/.test(str[i+3] || ''))) break;
            }
            chunk += str[i++];
        }
        const trimmed = chunk.trim();
        if (trimmed) tokens.push({ type: 'cmp', value: trimmed });
    }
    return tokens;
}

function parseOr(tokens, pos) {
    let [left, p] = parseAnd(tokens, pos);
    while (p < tokens.length && tokens[p].type === 'or') {
        let right; [right, p] = parseAnd(tokens, p + 1);
        left = left || right;
    }
    return [left, p];
}

function parseAnd(tokens, pos) {
    let [left, p] = parseNot(tokens, pos);
    while (p < tokens.length && tokens[p].type === 'and') {
        let right; [right, p] = parseNot(tokens, p + 1);
        left = left && right;
    }
    return [left, p];
}

function parseNot(tokens, pos) {
    if (pos < tokens.length && tokens[pos].type === 'not') {
        const [val, p] = parseNot(tokens, pos + 1);
        return [!val, p];
    }
    return parseLogicalAtom(tokens, pos);
}

function parseLogicalAtom(tokens, pos) {
    if (pos >= tokens.length) throw new Error('Неожиданно!');
    if (tokens[pos].type === 'lparen') {
        const [val, p] = parseOr(tokens, pos + 1);
        if (p >= tokens.length || tokens[p].type !== 'rparen') throw new Error('Ожидалось закрытие скобки');
        return [val, p + 1];
    }
    if (tokens[pos].type === 'cmp') {
        const val = evalConditionStr(tokens[pos].value);
        return [val, pos + 1];
    }
    throw new Error(`Неожиданный токен в условии: "${tokens[pos].value}"`);
}

function getNextBlock(fromBlock, portClass) {
    for (let conn of connections) {
        if (conn.from !== fromBlock) continue;
        if (portClass === null && !conn.portClass) return conn.to;
        if (portClass !== null && conn.portClass === portClass) return conn.to;
    }
    return null;
}

function splitOutsideQuotes(str) {
    const parts = [];
    let current = '';
    let inQuote = null;
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if ((c === '"' || c === "'") && inQuote === null) { inQuote = c; current += c; continue; }
        if (c === inQuote) { inQuote = null; current += c; continue; }
        if (inQuote) { current += c; continue; }
        if (c === ',') { parts.push(current.trim()); current = ''; continue; }
        current += c;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
}

function handleDeclare(block) {
    const declType = block.querySelector('.declare-type-select')?.value ?? 'int';
    const raw = block.querySelector('.declare-names-input')?.value ?? '';
    const eqIdx = raw.indexOf('=');
    const namesPart = eqIdx !== -1 ? raw.slice(0, eqIdx) : raw;
    const valuesPart = eqIdx !== -1 ? raw.slice(eqIdx + 1) : '';

    const names = namesPart.split(',').map(s => s.trim()).filter(Boolean);

    if (names.length === 0) {
        markBlockError(block);
        throw new Error('Не указаны имена переменных');
    }
    let valueStrs = [];
    if (valuesPart.trim()) {
        if (declType === 'string') {
            valueStrs = splitOutsideQuotes(valuesPart);
        } else {
            valueStrs = valuesPart.split(',').map(s => s.trim());
        }
    }

    names.forEach((name, i) => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            markBlockError(block);
            throw new Error(`Недопустимое имя: "${name}"`);
        }
        let val = declType === 'string' ? '' : 0;
        if (valueStrs[i] !== undefined && valueStrs[i] !== '') {
            const vs = valueStrs[i].trim();
            if (declType === 'string') {
                if ((vs.startsWith('"') && vs.endsWith('"')) ||
                    (vs.startsWith("'") && vs.endsWith("'"))) {
                    val = vs.slice(1, -1);
                } else {
                    try { val = String(evalExpr(vs)); }
                    catch { val = vs; }
                }
            } else {
                try { val = evalExpr(vs); } catch { val = 0; }
            }
        }
        if (declType === 'int') val = Math.trunc(Number(val));
        else if (declType === 'double') val = Number(val);
        variables[name] = val;
        varTypes[name]  = declType;
    });

    const display = names.map(n => `${n}=${variables[n]}`).join(', ');
    addConsoleMessage(`${declType} ${display}`, 'print');

    return { printed: true, nextBlock: getNextBlock(block, null) };
}

function handleAssignArray(block, arrayName, indexExpr, valueExpr) {
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

    array[index] = evalExpr(valueExpr);
    addConsoleMessage(`${arrayName}[${index}] = ${array[index]}`, 'print');

    return { printed: true, nextBlock: getNextBlock(block, null) };
}

function handleAssignVar(block, name, exprStr) {
    if (!name) {
        markBlockError(block);
        throw new Error('Не указано имя переменной');
    }
    if (!(name in variables)) {
        markBlockError(block);
        throw new Error(`Переменная "${name}" не объявлена`);
    }

    let result = evalExpr(exprStr);
    if (varTypes[name] === 'int') result = Math.trunc(Number(result));
    else if (varTypes[name] === 'double') result = Number(result);
    else if (varTypes[name] === 'string') result = String(result);

    variables[name] = result;
    addConsoleMessage(`${name} = ${result}`, 'print');

    return { printed: true, nextBlock: getNextBlock(block, null) };
}

function handleAssign(block) {
    const name    = block.querySelector('.assign-name-input')?.value.trim() ?? '';
    const exprStr = block.querySelector('.assign-expr-input')?.value.trim() ?? '';

    const arrayMatch = name.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]$/);
    if (arrayMatch) {
        return handleAssignArray(block, arrayMatch[1], arrayMatch[2].trim(), exprStr);
    }

    return handleAssignVar(block, name, exprStr);
}

function handleFor(block) {
    const initStr = block.querySelector('.for-init-input')?.value.trim() ?? '';
    const condStr = block.querySelector('.for-cond-input')?.value.trim() ?? '';
    const stepStr = block.querySelector('.for-step-input')?.value.trim() ?? '';

    if (block.dataset.forInited !== '1') {
        if (initStr) execSimpleStatement(initStr);
        block.dataset.forInited = '1';
    } else {
        if (stepStr) execSimpleStatement(stepStr);
    }
    let condition = true;
    if (condStr) condition = evalConditionStr(condStr);
    

    addConsoleMessage(`for (${initStr}; ${condStr}; ${stepStr}) → ${condition ? 'true' : 'false'}`, 'print');

    return {
        printed: true,
        nextBlock: getNextBlock(block, condition ? 'port-true' : 'port-false'),
    };
}

function handleWhile(block) {
    const condStr = block.querySelector('.while-cond-input')?.value.trim() ?? '';

    if (!condStr) {
        markBlockError(block);
        throw new Error('Не указано условие while');
    }

    const condition = evalLogicalExpr(condStr);
    addConsoleMessage(`while (${condStr}) → ${condition ? 'true' : 'false'}`, 'print');

    return {
        printed: true,
        nextBlock: getNextBlock(block, condition ? 'port-true' : 'port-false'),
    };
}

function handleIf(block) {
    const condStr = block.querySelector('.if-cond-input')?.value.trim() ?? '';

    if (!condStr) {
        markBlockError(block);
        throw new Error('Не указано условие if');
    }

    const condition = evalLogicalExpr(condStr);
    addConsoleMessage(`if (${condStr}) → ${condition ? 'true' : 'false'}`, 'print');

    return {
        printed: true,
        nextBlock: getNextBlock(block, condition ? 'port-true' : 'port-false'),
    };
}

function handleArray(block) {
    const name        = block.querySelector('.array-name-input')?.value.trim() ?? '';
    const size        = block.querySelector('.array-size-input')?.value.trim() ?? '';
    const elementsStr = block.querySelector('.array-elements-input')?.value.trim() ?? '';

    if (!name) {
        markBlockError(block);
        throw new Error('Не указано имя массива');
    }

    let expectedSize = null;
    if (size) {
        try {
            expectedSize = evalExpr(size);
            if (typeof expectedSize !== 'number' || expectedSize <= 0) {
                markBlockError(block);
                throw new Error('Размер должен быть положительным числом');
            }
        } catch {
            markBlockError(block);
            throw new Error('Некорректный размер массива');
        }
    }

    const elements = elementsStr
        ? elementsStr.split(',').map(e => e.trim()).filter(Boolean)
        : [];

    const array = elements.map(el => {
        try { return evalExpr(el); }
        catch { return resolveValue(el); }
    });

    if (expectedSize !== null && array.length !== expectedSize) {
        markBlockError(block);
        throw new Error(`Размер массива (${array.length}) не соответствует заданному (${expectedSize})`);
    }

    variables[name] = array;

    const arrayStr = array.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ');
    addConsoleMessage(`${name} = [${arrayStr}]`, 'print');

    return { printed: true, nextBlock: getNextBlock(block, null) };
}

function handleVar(block) {
    const name   = block.querySelector('.var-name-input')?.value.trim() ?? '';
    const rawVal = block.querySelector('.var-val-input')?.value.trim()  ?? '';

    if (name) {
        let resolved;
        try { resolved = evalExpr(rawVal); }
        catch { resolved = resolveValue(rawVal); }

        variables[name] = resolved;
        addConsoleMessage(`${name} = ${resolved}`, 'print');
    }

    return { printed: !!name, nextBlock: getNextBlock(block, null) };
}

function handleOutput(block) {
    const input = block.querySelector('.block-input');

    if (input) {
        const trimmed = input.value.trim() || '(пусто)';
        let output;

        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed) && trimmed in variables) {
            const val = variables[trimmed];
            output = Array.isArray(val) ? '[' + val.join(', ') + ']' : String(val);
        } else {
            try { output = String(evalExpr(trimmed)); }
            catch { output = String(resolveValue(trimmed)); }
        }

        addConsoleMessage(output, 'print');
        return { printed: true, nextBlock: getNextBlock(block, null) };
    }
    return { printed: false, nextBlock: getNextBlock(block, null) };
}

const blockHandlers = {
    'declare':   handleDeclare,
    'assign':    handleAssign,
    'for':       handleFor,
    'while':     handleWhile,
    'if':        handleIf,
    'end-if':    (block) => ({ printed: false, nextBlock: getNextBlock(block, null) }),
    'end-while': (block) => ({ printed: false, nextBlock: getNextBlock(block, null) }),
    'array':     handleArray,
    'var':       handleVar,
};


function executeBlock(block) {
    try {
        const handler = blockHandlers[block.dataset.blockType];
        if (handler) return Promise.resolve(handler(block));
        return Promise.resolve(handleOutput(block));
    } catch (err) {
        return Promise.reject(err);
    }
}

function createArrayBlock(block) {
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'array-name-input';
    nameInput.placeholder = 'name';
    nameInput.onmousedown = (e) => e.stopPropagation();
    nameInput.onkeydown = (e) => e.stopPropagation();

    const eq1 = document.createElement('span');
    eq1.className = 'array-eq-label';
    eq1.textContent = '[';

    const sizeInput = document.createElement('input');
    sizeInput.type = 'text';
    sizeInput.className = 'array-size-input';
    sizeInput.placeholder = 'size';
    sizeInput.onmousedown = (e) => e.stopPropagation();
    sizeInput.onkeydown = (e) => e.stopPropagation();

    const eq2 = document.createElement('span');
    eq2.className = 'array-eq-label';
    eq2.textContent = '] =';

    const elementsInput = document.createElement('input');
    elementsInput.type = 'text';
    elementsInput.className = 'array-elements-input';
    elementsInput.placeholder = 'elements';
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

function createWhileBlock(block) {
    const whileLabel = document.createElement('span');
    whileLabel.className = 'while-label';
    whileLabel.textContent = 'while';

    const condInput = document.createElement('input');
    condInput.type = 'text';
    condInput.className = 'while-cond-input';
    condInput.placeholder = 'a > 0 AND b < 10';
    condInput.onmousedown = (e) => e.stopPropagation();
    condInput.onkeydown = (e) => e.stopPropagation();

    const portTrue = document.createElement("div");
    portTrue.classList.add("port", "port-true");
    portTrue.title = 'true';
    const portFalse = document.createElement("div");
    portFalse.classList.add("port", "port-false");
    portFalse.title = 'false';
    makePortConnectable(block, portTrue);
    makePortConnectable(block, portFalse);
    block.innerHTML = '';
    block.classList.add('while-input-mode');
    block.appendChild(whileLabel);
    block.appendChild(condInput);
    block.appendChild(portTrue);
    block.appendChild(portFalse);
    block.dataset.blockType = 'while';
}

async function executeOutputPrint() {
    if (executionInProgress) return;
    executionInProgress = true;
    variables = {};
    varTypes = {};
    document.querySelectorAll('.block[data-block-type="for"]').forEach(b => { b.dataset.forInited = '0'; });
    const startBlockEl = document.getElementById('startBlock');
    let currentBlock = null;
    for (let conn of connections) {
        if (conn.from === startBlockEl) { currentBlock = conn.to; break; }
    }
    if (!currentBlock) {
        executionInProgress = false;
        return;
    }
    let stepCount = 0;
    let hasPrintedAnything = false; 
    const MAX_ITERATIONS = 10000;
    while (currentBlock) {
        stepCount++;
        if (stepCount > MAX_ITERATIONS) {
            addConsoleMessage('ОШИБКА: Превышен лимит итераций (возможно, бесконечный цикл)', 'error');
            break;
        }
        let result;
        try {
            result = await executeBlock(currentBlock);
        } catch (err) {
            addConsoleMessage('ОШИБКА: ' + err.message, 'error');
            break;
        }
        if (result.printed) hasPrintedAnything = true;
        currentBlock = result.nextBlock;
        if (currentBlock && currentBlock.dataset.blockType === 'while') {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    if (hasPrintedAnything) addConsoleMessage('Программа завершена', 'complete');
    executionInProgress = false;
}

function addConsoleMessage(message, type = 'print') {
    const msgElement = document.createElement('div');
    msgElement.className = `console-message ${type}`;
    msgElement.textContent = message;
    consoleContent.appendChild(msgElement);
    consoleContent.scrollTop = consoleContent.scrollHeight;
}

function createEndIfBlock(block) {
    block.innerHTML = '';
    block.textContent = '} end if';
    const port = document.createElement('div');
    port.classList.add('port');
    makePortConnectable(block, port);
    block.appendChild(port);
    block.dataset.blockType = 'end-if';
}

function createEndWhileBlock(block) {
    block.innerHTML = '';
    block.textContent = 'end cycle';
    block.dataset.blockType = 'end-while';
    const port = document.createElement('div');
    port.classList.add('port');
    makePortConnectable(block, port);
    block.appendChild(port);
}

function evalConditionStr(condStr) {
    condStr = condStr.trim();
    for (const cmp of ['>=', '<=', '!=', '>', '<', '==']) {
        const idx = condStr.indexOf(cmp);
        if (idx !== -1) {
            const left = condStr.slice(0, idx).trim();
            const right = condStr.slice(idx + cmp.length).trim();
            return evalCondition(left, cmp, right);
        }
    }
    throw new Error(`Не удалось разобрать условие: "${condStr}"`);
}

function execSimpleStatement(stmt) {
    stmt = stmt.trim();
    if (!stmt) return;
    const arrMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]\s*=\s*(.+)$/);
    if (arrMatch) {
        const arrayName = arrMatch[1];
        const index = evalExpr(arrMatch[2].trim());
        if (!Number.isInteger(index) || index < 0) throw new Error(`Некорректный индекс: ${index}`);
        if (index >= variables[arrayName].length) throw new Error(`Индекс ${index} вне границ`);
        variables[arrayName][index] = evalExpr(arrMatch[3].trim());
        return;
    }
    const varMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (varMatch) {
        const name = varMatch[1];
        const val = evalExpr(varMatch[2].trim());
        variables[name] = val;
        if (varTypes[name] === 'int') variables[name] = Math.trunc(val);
        return;
    }
    throw new Error(`Не удалось разобрать: "${stmt}"`);
}

function createForBlock(block) {
    const forLabel = document.createElement('span');
    forLabel.className = 'for-label';
    forLabel.textContent = 'for';
    const initInput = document.createElement('input');
    initInput.type = 'text';
    initInput.className = 'for-init-input';
    initInput.placeholder = 'init';
    initInput.onmousedown = (e) => e.stopPropagation();
    initInput.onkeydown = (e) => e.stopPropagation();
    const sep1 = document.createElement('span');
    sep1.className = 'for-sep';
    sep1.textContent = ';';
    const condInput = document.createElement('input');
    condInput.type = 'text';
    condInput.className = 'for-cond-input';
    condInput.placeholder = 'cond';
    condInput.onmousedown = (e) => e.stopPropagation();
    condInput.onkeydown = (e) => e.stopPropagation();
    const sep2 = document.createElement('span');
    sep2.className = 'for-sep';
    sep2.textContent = ';';
    const stepInput = document.createElement('input');
    stepInput.type = 'text';
    stepInput.className = 'for-step-input';
    stepInput.placeholder = 'step';
    stepInput.onmousedown = (e) => e.stopPropagation();
    stepInput.onkeydown = (e) => e.stopPropagation();
    const portTrue = document.createElement('div');
    portTrue.classList.add('port', 'port-true');
    portTrue.title = 'true';
    makePortConnectable(block, portTrue);
    const portFalse = document.createElement('div');
    portFalse.classList.add('port', 'port-false');
    portFalse.title = 'false';
    makePortConnectable(block, portFalse);
    block.innerHTML = '';
    block.classList.add('for-input-mode');
    block.appendChild(forLabel);
    block.appendChild(initInput);
    block.appendChild(sep1);
    block.appendChild(condInput);
    block.appendChild(sep2);
    block.appendChild(stepInput);
    block.appendChild(portTrue);
    block.appendChild(portFalse);
    block.dataset.blockType = 'for';
    block.dataset.forInited = '0';
}

initAllSpawners();

document.getElementById('runButton').addEventListener('click', executeOutputPrint);

document.addEventListener('selectstart', (e) => {
    if (activeBlock) {
        e.preventDefault();
    }
});