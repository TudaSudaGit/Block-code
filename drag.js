const trash = document.getElementById('trash');

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
    } else {
        activeBlock.style.opacity = '1';
    }

    trash.classList.remove('active');
    activeBlock = null;
};

document.addEventListener('selectstart', (e) => {
    if (activeBlock) {
        e.preventDefault();
    }
});

const startBlockElement = document.getElementById('startBlock');
makeStartBlockDraggable(startBlockElement);