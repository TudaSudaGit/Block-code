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

function setPolylinePath(line, x1, y1, x2, y2) {
    const offsetX = 40;

    const p1x = x1 + offsetX;
    const p1y = y1;

    const midY = y1 + (y2 - y1) * 0.5;

    const p2x = p1x;
    const p2y = midY;

    const p3x = x2 - offsetX;
    const p3y = midY;

    const p4x = p3x;
    const p4y = y2;

    const points = `
        ${x1},${y1}
        ${p1x},${p1y}
        ${p2x},${p2y}
        ${p3x},${p3y}
        ${p4x},${p4y}
        ${x2},${y2}
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
            setPolylinePath(conn.line, r1.right, r1.top + r1.height / 2, r2.left, r2.top + r2.height / 2);
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

function getNextBlock(fromBlock, portClass) {
    for (let conn of connections) {
        if (conn.from !== fromBlock) continue;
        if (portClass === null && !conn.portClass) return conn.to;
        if (portClass !== null && conn.portClass === portClass) return conn.to;
    }
    return null;
}