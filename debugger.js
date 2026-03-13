const debugButton = document.getElementById('debugButton');
const stepButton = document.getElementById('stepButton');

function showDebugIndicator() {
    if (debugIndicator) {
        debugIndicator.remove();
    }

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
    if (debugTimeoutId) {
        clearTimeout(debugTimeoutId);
        debugTimeoutId = null;
    }

    if (debugHighlightInterval) {
        clearInterval(debugHighlightInterval);
        debugHighlightInterval = null;
    }
}

function removeAllHighlights() {
    document.querySelectorAll('.block').forEach(block => {
        block.classList.remove('debug-highlight', 'debug-waiting');
    });
}

function highlightCurrentBlock(block) {
    removeAllHighlights();
    if (block) {
        block.classList.add('debug-highlight');

        debugHighlightInterval = setInterval(() => {
            if (block && debugMode) {
                block.classList.toggle('debug-waiting');
            }
        }, 500);
    }
}

function waitForNextStep() {
    debugStepPromise = new Promise((resolve) => {
        debugStepResolve = resolve;

        debugTimeoutId = setTimeout(() => {
            if (debugStepResolve) {
                addConsoleMessage('Автоматический шаг (таймаут)', 'print');
                debugStepResolve();
                debugStepResolve = null;
                debugStepPromise = null;
            }
        }, 10000);
    });

    return debugStepPromise;
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
    debugStepPromise = null;

    debugButton.disabled = false;
    stepButton.disabled = true;

    addConsoleMessage('Режим отладки завершен', 'print');
}

async function startDebugMode() {
    if (debugMode) return;

    variables = {};
    varTypes = {};
    tryCatchStack = [];
    currentError = null;
    errorCaught = false;

    document.querySelectorAll('.block[data-block-type="for"]').forEach(b => {
        b.dataset.forInited = '0';
    });

    const startBlockEl = document.getElementById('startBlock');
    let firstBlock = null;
    for (let conn of connections) {
        if (conn.from === startBlockEl) {
            firstBlock = conn.to;
            break;
        }
    }

    if (!firstBlock) {
        addConsoleMessage('Нет блоков для выполнения', 'error');
        return;
    }

    debugMode = true;
    debugCurrentBlock = firstBlock;

    debugButton.disabled = false;
    stepButton.disabled = false;

    showDebugIndicator();
    highlightCurrentBlock(debugCurrentBlock);

    addConsoleMessage('Режим отладки запущен. Нажмите STEP для выполнения следующего блока', 'print');

    debugStepPromise = new Promise((resolve) => {
        debugStepResolve = resolve;
    });

    debugTimeoutId = setTimeout(() => {
        if (debugStepResolve && debugMode) {
            addConsoleMessage('Автоматический шаг (таймаут)', 'print');
            debugStepResolve();
            debugStepResolve = null;
            debugStepPromise = null;
        }
    }, 10000);

    await debugStepPromise;

    while (debugMode && debugCurrentBlock) {
        await executeNextStep();
    }
}

async function executeNextStep() {
    if (!debugMode || !debugCurrentBlock) {
        exitDebugMode();
        return;
    }

    clearDebugTimers();

    if (debugHighlightInterval) {
        clearInterval(debugHighlightInterval);
        debugHighlightInterval = null;
    }

    const currentBlock = debugCurrentBlock;
    currentBlock.classList.remove('debug-highlight', 'debug-waiting');

    try {
        const result = await executeBlock(currentBlock);

        if (!debugMode) return;

        let nextBlock = result.nextBlock;

        if (currentError && !errorCaught) {
            addConsoleMessage(`⚠️ Возникла ошибка: ${currentError.message}`, 'error');

            if (tryCatchStack.length > 0) {
                const tryContext = tryCatchStack[tryCatchStack.length - 1];
                nextBlock = getNextBlock(tryContext.block, 'port-error');
            }
        }

        debugCurrentBlock = nextBlock;

        if (debugCurrentBlock) {
            highlightCurrentBlock(debugCurrentBlock);
        } else {
            addConsoleMessage('Программа завершена', 'complete');
            exitDebugMode();
            return;
        }

    } catch (err) {
        addConsoleMessage(`Ошибка выполнения: ${err.message}`, 'error');

        currentBlock.classList.add('block-error');
        setTimeout(() => currentBlock.classList.remove('block-error'), 3000);

        if (debugMode) {
            highlightCurrentBlock(currentBlock);
        }
    }

    if (debugMode) {
        debugStepPromise = new Promise((resolve) => {
            debugStepResolve = resolve;
        });

        debugTimeoutId = setTimeout(() => {
            if (debugStepResolve && debugMode) {
                addConsoleMessage('Автоматический шаг (таймаут)', 'print');
                debugStepResolve();
                debugStepResolve = null;
                debugStepPromise = null;
            }
        }, 10000);

        await debugStepPromise;
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

stepButton.addEventListener('click', async () => {
    if (!debugMode || !debugCurrentBlock) {
        exitDebugMode();
        return;
    }

    if (debugStepResolve) {
        debugStepResolve();
    }
});

document.addEventListener('keydown', (e) => {
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