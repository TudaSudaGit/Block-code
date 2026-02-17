const spawner = document.getElementById('spawner');
const trash = document.getElementById('trash');
const trashRect = trash.getBoundingClientRect();
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
    const rect = activeBlock.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
}

function createDropdown(block) {
    const select = document.createElement('select');
    const options = [ "I am first", "I am second", "I am third", "I am fourth", "I am fifth"];
    const placeholder = document.createElement('option');
    placeholder.textContent = "Choose...";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);
    options.forEach(text => {
    const opt = document.createElement('option');
    opt.value = text;
    opt.textContent = text;
    select.appendChild(opt);
    });

    select.onmousedown = (e) => {
    e.stopPropagation(); 
    };

    select.onchange = () => {
    block.textContent = select.value; 
    };

    block.textContent = "";
    block.appendChild(select);
    const port = document.createElement("div");
    port.classList.add("port");
    block.appendChild(port);
    makePortConnectable(block, port);
}

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

document.onmousemove = (e) => {
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
        trash.classList.remove('active');
    }
    updateConnections();
};

document.onmouseup = () => {
    if (!activeBlock) return;
    const blockRect = activeBlock.getBoundingClientRect();
    const isOverTrash = (blockRect.right > trashRect.left && blockRect.left < trashRect.right && blockRect.bottom > trashRect.top && blockRect.top < trashRect.bottom);
    if (isOverTrash) {
        removeConnections(activeBlock);
        activeBlock.remove();
    }
    else {
        activeBlock.style.opacity = '1';
    }

    trash.classList.remove('active');
    activeBlock = null;
};

function makePortConnectable(block, port) {
    port.addEventListener("mousedown", e => {
        e.stopPropagation();
        startBlock = block;

        activeLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        activeLine.setAttribute("stroke", "white");
        activeLine.setAttribute("stroke-width", "2");
        activeLine.setAttribute("marker-end", "url(#arrow)");
        svg.appendChild(activeLine);

        function move(ev) {
            const r = block.getBoundingClientRect();
            activeLine.setAttribute("x1", r.right);
            activeLine.setAttribute("y1", r.top + r.height / 2);
            activeLine.setAttribute("x2", ev.clientX);
            activeLine.setAttribute("y2", ev.clientY);
        }

        function up(ev) {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);

            const target = findBlockUnder(ev.clientX, ev.clientY);

            if (target && target !== startBlock) {

                connections.push({
                    from: startBlock,
                    to: target,
                    line: activeLine
                });

                startBlock.classList.add("connected");
                target.classList.add("connected");
                updateConnections();
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

        conn.line.setAttribute("x1", r1.right);
        conn.line.setAttribute("y1", r1.top + r1.height / 2);
        conn.line.setAttribute("x2", r2.left);
        conn.line.setAttribute("y2", r2.top + r2.height / 2);
    });
}

function removeConnections(block) {
    connections = connections.filter(conn => {
        if (conn.from === block || conn.to === block) {
            conn.line.remove();
            return false;
        }
        return true;
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