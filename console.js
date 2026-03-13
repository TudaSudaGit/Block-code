const consoleContent = document.getElementById('consoleContent');
const clearConsoleBtn = document.getElementById('clearConsole');

clearConsoleBtn.addEventListener('click', () => {
    consoleContent.innerHTML = '';
    if (debugMode) {
        addConsoleMessage('Режим отладки активен', 'print');
        if (debugCurrentBlock) {
            addConsoleMessage(`Текущий блок: ${debugCurrentBlock.dataset.blockType || 'output'}`, 'print');
        }
    }
});

function addConsoleMessage(message, type = 'print') {
    const msgElement = document.createElement('div');
    msgElement.className = `console-message ${type}`;
    msgElement.textContent = message;
    consoleContent.appendChild(msgElement);
    consoleContent.scrollTop = consoleContent.scrollHeight;
}