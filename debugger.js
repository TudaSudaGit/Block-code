const debugButton = document.getElementById('debugButton');
const stepButton  = document.getElementById('stepButton');

function showDebugIndicator() {
    if (debugIndicator) debugIndicator.remove();
    debugIndicator = document.createElement('div');
    debugIndicator.className = 'debug-mode-indicator';
    debugIndicator.textContent = 'DEBUG MODE';
    document.body.appendChild(debugIndicator);
}

function hideDebugIndicator() {
    if (debugIndicator) {
        debugIndicator.remove();
        debugIndicator = null;
    }
}

function clearDebugTimers() {
    if (debugTimeoutId)        { clearTimeout(debugTimeoutId);         debugTimeoutId = null; }
    if (debugHighlightInterval){ clearInterval(debugHighlightInterval); debugHighlightInterval = null; }
}

function removeAllHighlights() {
    document.querySelectorAll('.block').forEach(block =>
        block.classList.remove('debug-highlight', 'debug-waiting')
    );
}

function highlightCurrentBlock(block) {
    removeAllHighlights();
    if (!block) return;
    block.classList.add('debug-highlight');
    debugHighlightInterval = setInterval(() => {
        if (block && debugMode) block.classList.toggle('debug-waiting');
    }, 500);
}

function waitForStep() {
    return new Promise(resolve => {
        debugStepResolve = resolve;
        debugTimeoutId = setTimeout(() => {
            if (debugStepResolve) {
                addConsoleMessage('Автоматический шаг (таймаут)', 'print');
                debugStepResolve();
                debugStepResolve = null;
            }
        }, 10000);
    });
}

function exitDebugMode() {
    debugMode = false;
    debugCurrentBlock = null;
    clearDebugTimers();
    removeAllHighlights();
    hideDebugIndicator();

    if (debugStepResolve) {
        debugStepResolve();
        debugStepResolve = null;
    }

    debugButton.disabled = false;
    stepButton.disabled  = true;

    addConsoleMessage('Режим отладки завершён', 'print');
}

async function startDebugMode() {
    if (debugMode) return;

    variables = {};
    varTypes  = {};

    document.querySelectorAll('.block[data-block-type="for"]').forEach(b => {
        b.dataset.forInited = '0';
    });

    const startBlockEl = document.getElementById('startBlock');
    let firstBlock = null;
    for (const conn of connections) {
        if (conn.from === startBlockEl) { firstBlock = conn.to; break; }
    }

    if (!firstBlock) {
        addConsoleMessage('Нет блоков для выполнения', 'error');
        return;
    }

    debugMode         = true;
    debugCurrentBlock = firstBlock;
    stepButton.disabled = false;

    showDebugIndicator();
    highlightCurrentBlock(debugCurrentBlock);
    addConsoleMessage('Режим отладки. Нажмите STEP (или пробел) для выполнения блока', 'print');

    while (debugMode && debugCurrentBlock) {
        await waitForStep();
        if (!debugMode) break;

        clearDebugTimers();

        const currentBlock = debugCurrentBlock;
        currentBlock.classList.remove('debug-highlight', 'debug-waiting');

        try {
            const result   = await executeBlock(currentBlock);
            debugCurrentBlock = result.nextBlock;
        } catch (err) {
            addConsoleMessage(`Ошибка: ${err.message}`, 'error');
            currentBlock.classList.add('block-error');
            setTimeout(() => currentBlock.classList.remove('block-error'), 3000);
            debugCurrentBlock = null;
        }

        if (debugCurrentBlock) {
            highlightCurrentBlock(debugCurrentBlock);
        } else {
            addConsoleMessage('Программа завершена', 'complete');
            exitDebugMode();
            return;
        }
    }
}

debugButton.addEventListener('click', async () => {
    if (executionInProgress) {
        addConsoleMessage('Выполнение уже запущено. Дождитесь завершения.', 'error');
        return;
    }
    if (debugMode) {
        exitDebugMode();
        return;
    }
    await startDebugMode();
});

stepButton.addEventListener('click', () => {
    if (!debugMode || !debugStepResolve) return;
    debugStepResolve();
    debugStepResolve = null;
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && debugMode) {
        e.preventDefault();
        exitDebugMode();
        addConsoleMessage('Режим отладки прерван (Escape)', 'print');
    }
    if (e.key === ' ' && debugMode && !stepButton.disabled) {
        e.preventDefault();
        stepButton.click();
    }
});