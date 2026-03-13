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

function createVarBlock(block) {
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

const spawnerConfig = {
    'spawnerVar':      { cssClass: 'variable',  createFn: createVarBlock,                  spawnOX: 60, spawnOY: 30 },
    'spawnerDeclare':  { cssClass: 'declare',   createFn: createDeclareBlock,               spawnOX: 60, spawnOY: 30 },
    'spawnerAssign':   { cssClass: 'assign',    createFn: createAssignBlock,                spawnOX: 60, spawnOY: 30 },
    'spawnerIf':       { cssClass: 'ifblock',   createFn: createIfBlock,                    spawnOX: 75, spawnOY: 30 },
    'spawnerOutput':   { cssClass: 'output',    createFn: (b) => createDropdown(b, true),   spawnOX: 60, spawnOY: 30 },
    'spawnerArray':    { cssClass: 'array',     createFn: createArrayBlock,                 spawnOX: 60, spawnOY: 30 },
    'spawnerWhile':    { cssClass: 'while',     createFn: createWhileBlock,                 spawnOX: 75, spawnOY: 30 },
    'spawnerEndIf':    { cssClass: 'end-if',    createFn: createEndIfBlock,                 spawnOX: 60, spawnOY: 25 },
    'spawnerEndWhile': { cssClass: 'end-while', createFn: createEndWhileBlock,              spawnOX: 60, spawnOY: 25 },
    'spawnerFor':      { cssClass: 'forblock',  createFn: createForBlock,                   spawnOX: 75, spawnOY: 30 },
};

function initAllSpawners() {
    Object.entries(spawnerConfig).forEach(([id, { cssClass, createFn, spawnOX, spawnOY }]) => {
        const spawner = document.getElementById(id);
        if (!spawner) return;

        spawner.onmousedown = (e) => {
            e.preventDefault();

            const newBlock = document.createElement('div');
            newBlock.classList.add('block', cssClass);
            createFn(newBlock);
            newBlock.style.position = 'absolute';
            newBlock.style.left = (e.clientX - spawnOX) + 'px';
            newBlock.style.top  = (e.clientY - spawnOY) + 'px';
            newBlock.style.zIndex = '500';
            document.body.appendChild(newBlock);
            console.log('[spawner] created', cssClass, 'at', newBlock.style.left, newBlock.style.top, 'block:', newBlock);

            newBlock.onmousedown = (ev) => {
                if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
                ev.stopPropagation();
                startDrag(ev, newBlock);
            };

            startDrag(e, newBlock);
        };
    });
}

initAllSpawners();