function markBlockError(block) {
    block.classList.add('block-error');
    setTimeout(() => block.classList.remove('block-error'), 5000);
}

function handleDeclare(block) {
    const declType = block.querySelector('.declare-type-select')?.value ?? 'int';
    const raw = block.querySelector('.declare-names-input')?.value ?? '';
    const eqIdx = raw.indexOf('=');
    const namesPart = eqIdx !== -1 ? raw.slice(0, eqIdx) : raw;
    const valuesPart = eqIdx !== -1 ? raw.slice(eqIdx + 1) : '';

    const names = namesPart.split(',').map(s => s.trim()).filter(Boolean);

    if (names.length === 0) {
        markBlockError(block);
        throw new Error('Не указаны имена переменных');
    }
    let valueStrs = [];
    if (valuesPart.trim()) {
        if (declType === 'string') {
            valueStrs = splitOutsideQuotes(valuesPart);
        } else {
            valueStrs = valuesPart.split(',').map(s => s.trim());
        }
    }

    names.forEach((name, i) => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            markBlockError(block);
            throw new Error(`Недопустимое имя: "${name}"`);
        }
        let val = declType === 'string' ? '' : 0;
        if (valueStrs[i] !== undefined && valueStrs[i] !== '') {
            const vs = valueStrs[i].trim();
            if (declType === 'string') {
                if ((vs.startsWith('"') && vs.endsWith('"')) ||
                    (vs.startsWith("'") && vs.endsWith("'"))) {
                    val = vs.slice(1, -1);
                } else {
                    try { val = String(evalExpr(vs)); }
                    catch { val = vs; }
                }
            } else {
                try { val = evalExpr(vs); } catch { val = 0; }
            }
        }
        if (declType === 'int') val = Math.trunc(Number(val));
        else if (declType === 'double') val = Number(val);
        variables[name] = val;
        varTypes[name]  = declType;
    });

    const display = names.map(n => `${n}=${variables[n]}`).join(', ');
    addConsoleMessage(`${declType} ${display}`, 'print');

    return { printed: true, nextBlock: getNextBlock(block, null) };
}

function handleAssignArray(block, arrayName, indexExpr, valueExpr) {
    if (!(arrayName in variables) || !Array.isArray(variables[arrayName])) {
        markBlockError(block);
        throw new Error(`"${arrayName}" не является массивом`);
    }

    const index = evalExpr(indexExpr);
    if (!Number.isInteger(index) || index < 0) {
        markBlockError(block);
        throw new Error(`Индекс массива должен быть неотрицательным целым числом: ${index}`);
    }

    const array = variables[arrayName];
    if (index >= array.length) {
        markBlockError(block);
        throw new Error(`Индекс ${index} вне границ массива "${arrayName}" (длина: ${array.length})`);
    }

    array[index] = evalExpr(valueExpr);
    addConsoleMessage(`${arrayName}[${index}] = ${array[index]}`, 'print');

    return { printed: true, nextBlock: getNextBlock(block, null) };
}

function handleAssignVar(block, name, exprStr) {
    if (!name) {
        markBlockError(block);
        throw new Error('Не указано имя переменной');
    }
    if (!(name in variables)) {
        markBlockError(block);
        throw new Error(`Переменная "${name}" не объявлена`);
    }

    let result = evalExpr(exprStr);
    if (varTypes[name] === 'int') result = Math.trunc(Number(result));
    else if (varTypes[name] === 'double') result = Number(result);
    else if (varTypes[name] === 'string') result = String(result);

    variables[name] = result;
    addConsoleMessage(`${name} = ${result}`, 'print');

    return { printed: true, nextBlock: getNextBlock(block, null) };
}

function handleAssign(block) {
    const name    = block.querySelector('.assign-name-input')?.value.trim() ?? '';
    const exprStr = block.querySelector('.assign-expr-input')?.value.trim() ?? '';

    const arrayMatch = name.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]$/);
    if (arrayMatch) {
        return handleAssignArray(block, arrayMatch[1], arrayMatch[2].trim(), exprStr);
    }

    return handleAssignVar(block, name, exprStr);
}

function handleFor(block) {
    const initStr = block.querySelector('.for-init-input')?.value.trim() ?? '';
    const condStr = block.querySelector('.for-cond-input')?.value.trim() ?? '';
    const stepStr = block.querySelector('.for-step-input')?.value.trim() ?? '';

    if (block.dataset.forInited !== '1') {
        if (initStr) execSimpleStatement(initStr);
        block.dataset.forInited = '1';
    } else {
        if (stepStr) execSimpleStatement(stepStr);
    }
    let condition = true;
    if (condStr) condition = evalConditionStr(condStr);

    if (!condition) block.dataset.forInited = '0';

    addConsoleMessage(`for (${initStr}; ${condStr}; ${stepStr}) → ${condition ? 'true' : 'false'}`, 'print');

    return {
        printed: true,
        nextBlock: getNextBlock(block, condition ? 'port-true' : 'port-false'),
    };
}

function handleWhile(block) {
    const condStr = block.querySelector('.while-cond-input')?.value.trim() ?? '';

    if (!condStr) {
        markBlockError(block);
        throw new Error('Не указано условие while');
    }

    const condition = evalLogicalExpr(condStr);
    addConsoleMessage(`while (${condStr}) → ${condition ? 'true' : 'false'}`, 'print');

    return {
        printed: true,
        nextBlock: getNextBlock(block, condition ? 'port-true' : 'port-false'),
    };
}

function handleIf(block) {
    const condStr = block.querySelector('.if-cond-input')?.value.trim() ?? '';

    if (!condStr) {
        markBlockError(block);
        throw new Error('Не указано условие if');
    }

    const condition = evalLogicalExpr(condStr);
    addConsoleMessage(`if (${condStr}) → ${condition ? 'true' : 'false'}`, 'print');

    return {
        printed: true,
        nextBlock: getNextBlock(block, condition ? 'port-true' : 'port-false'),
    };
}

function handleArray(block) {
    const name        = block.querySelector('.array-name-input')?.value.trim() ?? '';
    const size        = block.querySelector('.array-size-input')?.value.trim() ?? '';
    const elementsStr = block.querySelector('.array-elements-input')?.value.trim() ?? '';

    if (!name) {
        markBlockError(block);
        throw new Error('Не указано имя массива');
    }

    let expectedSize = null;
    if (size) {
        try {
            expectedSize = evalExpr(size);
            if (typeof expectedSize !== 'number' || expectedSize <= 0) {
                markBlockError(block);
                throw new Error('Размер должен быть положительным числом');
            }
        } catch {
            markBlockError(block);
            throw new Error('Некорректный размер массива');
        }
    }

    const elements = elementsStr
        ? elementsStr.split(',').map(e => e.trim()).filter(Boolean)
        : [];

    const array = elements.map(el => {
        try { return evalExpr(el); }
        catch { return resolveValue(el); }
    });

    if (expectedSize !== null && array.length !== expectedSize) {
        markBlockError(block);
        throw new Error(`Размер массива (${array.length}) не соответствует заданному (${expectedSize})`);
    }

    variables[name] = array;

    const arrayStr = array.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ');
    addConsoleMessage(`${name} = [${arrayStr}]`, 'print');

    return { printed: true, nextBlock: getNextBlock(block, null) };
}

function handleVar(block) {
    const name   = block.querySelector('.var-name-input')?.value.trim() ?? '';
    const rawVal = block.querySelector('.var-val-input')?.value.trim()  ?? '';

    if (name) {
        let resolved;
        try { resolved = evalExpr(rawVal); }
        catch { resolved = resolveValue(rawVal); }

        variables[name] = resolved;
        addConsoleMessage(`${name} = ${resolved}`, 'print');
    }

    return { printed: !!name, nextBlock: getNextBlock(block, null) };
}

function handleOutput(block) {
    const input = block.querySelector('.block-input');

    if (input) {
        const trimmed = input.value.trim() || '(пусто)';
        let output;

        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed) && trimmed in variables) {
            const val = variables[trimmed];
            output = Array.isArray(val) ? '[' + val.join(', ') + ']' : String(val);
        } else {
            try { output = String(evalExpr(trimmed)); }
            catch { output = String(resolveValue(trimmed)); }
        }

        addConsoleMessage(output, 'print');
        return { printed: true, nextBlock: getNextBlock(block, null) };
    }
    return { printed: false, nextBlock: getNextBlock(block, null) };
}

const blockHandlers = {
    'declare':   handleDeclare,
    'assign':    handleAssign,
    'for':       handleFor,
    'while':     handleWhile,
    'if':        handleIf,
    'end-if':    (block) => ({ printed: false, nextBlock: getNextBlock(block, null) }),
    'end-while': (block) => ({ printed: false, nextBlock: getNextBlock(block, null) }),
    'array':     handleArray,
    'var':       handleVar,
};

function executeBlock(block) {
    try {
        const handler = blockHandlers[block.dataset.blockType];
        let result;

        if (handler) {
            result = handler(block);
        } else {
            result = handleOutput(block);
        }

        return Promise.resolve(result);
    } catch (err) {
        currentError = err;
        errorCaught = false;

        addConsoleMessage(`ОШИБКА: ${err.message}`, 'error');
        return Promise.reject(err);
    }
}

async function executeOutputPrint() {
    if (executionInProgress) return;

    if (debugMode) {
        exitDebugMode();
    }

    executionInProgress = true;
    variables = {};
    varTypes = {};
    tryCatchStack = [];
    currentError = null;
    errorCaught = false;

    document.querySelectorAll('.block[data-block-type="for"]').forEach(b => {
        b.dataset.forInited = '0';
    });

    const startBlockEl = document.getElementById('startBlock');
    let currentBlock = null;
    for (let conn of connections) {
        if (conn.from === startBlockEl) {
            currentBlock = conn.to;
            break;
        }
    }

    if (!currentBlock) {
        executionInProgress = false;
        return;
    }

    let stepCount = 0;
    let hasPrintedAnything = false;
    const MAX_ITERATIONS = 10000;

    while (currentBlock) {
        stepCount++;
        if (stepCount > MAX_ITERATIONS) {
            addConsoleMessage('ОШИБКА: Превышен лимит итераций (возможно, бесконечный цикл)', 'error');
            break;
        }

        try {
            const result = await executeBlock(currentBlock);
            if (result.printed) hasPrintedAnything = true;
            currentBlock = result.nextBlock;
        } catch (err) {
            if (tryCatchStack.length > 0) {
                const tryContext = tryCatchStack[tryCatchStack.length - 1];
                currentBlock = getNextBlock(tryContext.block, 'port-error');
                if (!currentBlock) {
                    currentBlock = getNextBlock(tryContext.block, null);
                }
            } else {
                break;
            }
        }

        if (currentBlock && currentBlock.dataset.blockType === 'while') {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    if (hasPrintedAnything) addConsoleMessage('Программа завершена', 'complete');
    executionInProgress = false;
}

document.getElementById('runButton').addEventListener('click', () => {
    if (debugMode) {
        exitDebugMode();
    }
    executeOutputPrint();
});