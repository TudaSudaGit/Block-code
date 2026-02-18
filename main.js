const trash = document.getElementById('trash');
let activeBlock = null; 
let offsetX = 0;
let offsetY = 0;
let connections = [];
let activeLine = null;
let startBlock = null;

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
path.setAttribute("fill", "white");
marker.appendChild(path);
defs.appendChild(marker);
svg.appendChild(defs);

function startDrag(e, element) {
    activeBlock = element; 
    activeBlock.style.opacity = '0.5'; 
    activeBlock.style.zIndex = '1000';
    
    const rect = activeBlock.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
}

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

    select.onmousedown = (e) => {
    e.stopPropagation(); 
    };

    select.onchange = () => {
        port = block.querySelector('.port');
        const selectedText = select.value;
        const textNode = document.createTextNode(selectedText);
        block.innerHTML = '';
        block.appendChild(textNode);
        if (port){
            block.appendChild(port);
        };
    select.onmousedown = (e) => e.stopPropagation(); 
    select.onchange = () => {
        block.textContent = select.value; 
    };

    block.textContent = "";
    block.appendChild(select);

    const port = document.createElement("div");
    port.classList.add("port");
    block.appendChild(port);
    makePortConnectable(block, port);
};

spawner.onmousedown = (e) => {
    const newBlock = document.createElement('div');
    newBlock.classList.add('block');
    createDropdown(newBlock);
    newBlock.style.left = spawner.offsetLeft + 'px';
    newBlock.style.top = spawner.offsetTop + 'px';
    document.body.appendChild(newBlock);
    newBlock.onmousedown = (ev) => {
    startDrag(ev, newBlock);
    };
    startDrag(e, newBlock);
};
}

function initSpawner(spawnerId, colorClass, blockOptions) {
    const spawner = document.getElementById(spawnerId);
    spawner.onmousedown = (e) => {
        e.preventDefault(); 
        const newBlock = document.createElement('div');
        newBlock.classList.add('block', colorClass);
        createDropdown(newBlock, blockOptions);
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
        activeBlock.style.left = x + 'px';
        activeBlock.style.top = y + 'px';
        const blockRect = activeBlock.getBoundingClientRect();
        const isOverTrash = (blockRect.right > trashRect.left && blockRect.left < trashRect.right && blockRect.bottom > trashRect.top && blockRect.top < trashRect.bottom);
    if (isOverTrash) {
        trash.classList.add('active');
    } 
    else {

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
    const isOverTrash = (
        blockRect.right > trashRect.left && 
        blockRect.left < trashRect.right && 
        blockRect.bottom > trashRect.top && 
        blockRect.top < trashRect.bottom
    );

    if (isOverTrash) {
        removeConnections(activeBlock);
        activeBlock.remove();
    }
    else {
        activeBlock.style.opacity = '1';
    }

        activeBlock.remove();
    } else {
        activeBlock.style.opacity = '1';
        activeBlock.style.zIndex = '100';
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

    const offsetX = 30;
    const safeOffset = 2;

    const startX = x1;
    const startY = y1;

    const p1x = x1 + offsetX;
    const p1y = y1;

    const midY = y1 + (y2 - y1) * 0.6;

    const p2x = p1x;
    const p2y = midY;

    const p3x = x2 - offsetX;
    const p3y = midY;

    const p4x = p3x;
    const p4y = y2;

    const endX = x2 - safeOffset;
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

function makePortConnectable(block, port) {
    port.addEventListener("mousedown", e => {
        e.stopPropagation();
        startBlock = block;
        const startOutgoing = connections.some(conn => conn.from === startBlock);
        if (startOutgoing) return;
        activeLine = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        activeLine.setAttribute("stroke", "white");
        activeLine.setAttribute("stroke-width", "2");
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
                if (!targetIncoming) {
                    connections.push({
                        from: startBlock,
                        to: target,
                        line: activeLine
                    });
                    updateConnections();
                }
                else {
                    activeLine.remove();
                }
            }
            else {
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
        const r1 = conn.from.getBoundingClientRect();
        const r2 = conn.to.getBoundingClientRect();
        const x1 = r1.right;
        const y1 = r1.top + r1.height / 2;
        const x2 = r2.left;
        const y2 = r2.top + r2.height / 2;

        setPolylinePath(conn.line, x1, y1, x2, y2);
        updateBlockConnectionStates();
    });
}

function findBlockUnder(x, y) {
    const blocks = document.querySelectorAll(".block");
    for (let block of blocks) {
        if (block.id === "spawner") continue;
        const r = block.getBoundingClientRect();
        if (x > r.left && x < r.right && y > r.top && y < r.bottom) {
            return block;
        }
    }
    return null;
}
const firstFive = ["I am first", "I am second", "I am third", "I am fourth", "I am fifth"];
const nextFive = ["I am sixth", "I am seventh", "I am eighth", "I am ninth", "I am tenth"];
const nextFive2 = ["I am eleventh", "I am twelfth", "I am thirteenth", "I am fourteenth", "I am fifteenth"];
const nextFive3 = ["I am sixteenth", "I am seventeenth", "I am eighteenth", "I am nineteenth", "I am twentieth"];
const nextFive4 = ["I am twenty-first", "I am twenty-second", "I am twenty-third", "I am twenty-fourth", "I am twenty-fifth"];
const nextFive5 = ["I am twenty-sixth", "I am twenty-seventh", "I am twenty-eighth", "I am twenty-ninth", "I am thirtieth"];

initSpawner('spawnerBlue', 'blue', firstFive);
initSpawner('spawnerPurple', 'purple', nextFive);
initSpawner('spawnerGreen', 'green', nextFive2);
initSpawner('spawnerOrange', 'orange', nextFive3);
initSpawner('spawnerCyan', 'cyan', nextFive4);
initSpawner('spawnerYellow', 'yellow', nextFive5);
