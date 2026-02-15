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