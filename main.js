const spawner = document.getElementById('spawner');
const trash = document.getElementById('trash');
const trashRect = trash.getBoundingClientRect();
let activeBlock = null; 
let offsetX = 0;
let offsetY = 0;
    function startDrag(e, element) {
    activeBlock = element; 
    activeBlock.style.opacity = '0.5'; 
    const rect = activeBlock.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
}
spawner.onmousedown = (e) => {
    const newBlock = document.createElement('div');
    newBlock.classList.add('block');
    newBlock.innerText = "I am new!";
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
    } else {
    trash.classList.remove('active');
    }
};
document.onmouseup = () => {
    if (!activeBlock) return;
    const blockRect = activeBlock.getBoundingClientRect();
    const isOverTrash = (blockRect.right > trashRect.left && blockRect.left < trashRect.right && blockRect.bottom > trashRect.top && blockRect.top < trashRect.bottom);
    if (isOverTrash) {
    activeBlock.remove();
    } else {
    activeBlock.style.opacity = '1'; 
    }
    trash.classList.remove('active');
    activeBlock = null;
};