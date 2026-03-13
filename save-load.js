const blockTypeRegistry = {
    'var':       { css: 'variable',  make: b => createVarBlock(b) },
    'declare':   { css: 'declare',   make: b => createDeclareBlock(b) },
    'assign':    { css: 'assign',    make: b => createAssignBlock(b) },
    'if':        { css: 'ifblock',   make: b => createIfBlock(b) },
    'output':    { css: 'output',    make: b => createDropdown(b, true) },
    'array':     { css: 'array',     make: b => createArrayBlock(b) },
    'while':     { css: 'while',     make: b => createWhileBlock(b) },
    'end-if':    { css: 'end-if',    make: b => createEndIfBlock(b) },
    'end-while': { css: 'end-while', make: b => createEndWhileBlock(b) },
    'for':       { css: 'forblock',  make: b => createForBlock(b) },
};

function serializeState() {
    const startEl = document.getElementById('startBlock');
    const blockToId = new Map();
    const blocksData = [];
    let idx = 0;

    document.querySelectorAll('.block').forEach(block => {
        if (block.closest('.left-panel') || block.closest('.right-panel')) return;
        if (block.id === 'startBlock') return;

        const id = 'b' + (idx++);
        blockToId.set(block, id);

        const blockType = block.dataset.blockType || 'output';

        const inputs = {};
        block.querySelectorAll('input, select').forEach(inp => {
            const key = inp.className.trim().split(/\s+/)[0];
            if (key) inputs[key] = inp.value;
        });

        blocksData.push({ id, blockType, left: block.style.left, top: block.style.top, inputs });
    });

    const connsData = connections.map(conn => ({
        from:      conn.from.id === 'startBlock' ? '__start__' : blockToId.get(conn.from),
        to:        blockToId.get(conn.to),
        portClass: conn.portClass
    }));

    return {
        startBlock: { left: startEl.style.left || '170px', top: startEl.style.top || '20px' },
        blocks: blocksData,
        connections: connsData,
    };
}

function saveAlgorithm() {
    const name = prompt('Имя файла:', 'algorithm') || 'algorithm';
    const blob = new Blob([JSON.stringify(serializeState())], { type: 'application/json' });
    const link = document.createElement('a');
    const fileUrl = URL.createObjectURL(blob);
    link.href = fileUrl;
    link.download = name + ".codeblock";
    link.click();
    URL.revokeObjectURL(fileUrl);
}

function loadAlgorithm() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = ev => {
            try { restoreState(JSON.parse(ev.target.result)); }
            catch (err) { alert('Ошибка загрузки'); }
        };
        reader.readAsText(file);
    };
    input.click();
}

function restoreState(state) {
    document.querySelectorAll('.block').forEach(block => {
        if (block.closest('.left-panel') || block.closest('.right-panel')) return;
        if (block.id === 'startBlock') return;
        block.remove();
    });

    connections.forEach(conn => conn.line.remove());
    connections.length = 0;

    const startEl = document.getElementById('startBlock');
    startEl.style.left = state.startBlock.left;
    startEl.style.top  = state.startBlock.top;

    const idToBlock = new Map();
    idToBlock.set('__start__', startEl);

    state.blocks.forEach(bData => {
        const reg = blockTypeRegistry[bData.blockType];

        const block = document.createElement('div');
        block.classList.add('block', reg.css);
        block.style.position = 'absolute';
        block.style.left = bData.left;
        block.style.top  = bData.top;
        document.body.appendChild(block);

        reg.make(block);

        Object.entries(bData.inputs).forEach(([key, value]) => {
            block.querySelector('.' + key).value = value;
        });

        block.onmousedown = ev => {
            if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
            ev.stopPropagation();
            startDrag(ev, block);
        };

        idToBlock.set(bData.id, block);
    });

    state.connections.forEach(cData => {
        const fromBlock = idToBlock.get(cData.from);
        const toBlock   = idToBlock.get(cData.to);

        const color = cData.portClass === 'port-true' ? '#4CAF50' : cData.portClass === 'port-false' ? '#ef5350' : '#ffffff';

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '3');
        line.setAttribute('fill', 'none');
        line.setAttribute('marker-end', 'url(#arrow)');
        svg.appendChild(line);

        connections.push({ from: fromBlock, to: toBlock, line, portClass: cData.portClass });
    });

    updateConnections();
}

document.getElementById('saveBtn').addEventListener('click', saveAlgorithm);
document.getElementById('loadBtn').addEventListener('click', loadAlgorithm);