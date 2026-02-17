const trash = document.getElementById('trash');
let activeBlock = null; 
let offsetX = 0;
let offsetY = 0;

let trashRect = trash.getBoundingClientRect();

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
    select.onmousedown = (e) => e.stopPropagation(); 
    select.onchange = () => {
        block.textContent = select.value; 
    };
    block.textContent = "";
    block.appendChild(select);
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
};

document.onmouseup = () => {
    if (!activeBlock) return;

    const blockRect = activeBlock.getBoundingClientRect();
    const isOverTrash = (
        blockRect.right > trashRect.left && 
        blockRect.left < trashRect.right && 
        blockRect.bottom > trashRect.top && 
        blockRect.top < trashRect.bottom
    );

    if (isOverTrash) {
        activeBlock.remove();
    } else {
        activeBlock.style.opacity = '1';
        activeBlock.style.zIndex = '100';
    }
    
    trash.classList.remove('active');
    activeBlock = null;
};

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
