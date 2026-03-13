function resolveValue(raw) {
    const trimmed = String(raw).trim();
    if (trimmed in variables) {
        return variables[trimmed];
    }
    if (trimmed !== '' && !isNaN(trimmed)) return Number(trimmed);
    return trimmed;
}

function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const ch = expr[i];
        if (ch === ' ') { i++; continue; }
        if (ch === '"' || ch === "'") {
            const quote = ch;
            let str = '';
            i++;
            while (i < expr.length && expr[i] !== quote) {
                str += expr[i++];
            }
            i++;
            tokens.push({ type: 'str', value: str });
            continue;
        }
        if (ch >= '0' && ch <= '9') {
            let num = '';
            while (i < expr.length && (expr[i] >= '0' && expr[i] <= '9')) num += expr[i++];
            if (i < expr.length && expr[i] === '.') {
                num += expr[i++];
                while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') num += expr[i++];
            }
            tokens.push({ type: 'num', value: Number(num) });
            continue;
        }
        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
            let name = '';
            while (i < expr.length && (/[a-zA-Z0-9_]/.test(expr[i]))) name += expr[i++];
            if (expr[i] === '(') {
                i++;
                let argExpr = '';
                let depth = 1;
                while (i < expr.length && depth > 0) {
                    if (expr[i] === '(') depth++;
                    else if (expr[i] === ')') depth--;
                    if (depth > 0) argExpr += expr[i];
                    i++;
                }
                if (name === 'split') {
                    let commaIdx = -1;
                    let inQuote = null;
                    for (let j = 0; j < argExpr.length; j++) {
                        const c = argExpr[j];
                        if ((c === '"' || c === "'") && inQuote === null) { inQuote = c; continue; }
                        if (c === inQuote) { inQuote = null; continue; }
                        if (inQuote) continue;
                        if (c === ',') { commaIdx = j; break; }
                    }
                    if (commaIdx === -1) throw new Error('split требует два аргумента: split(строка, разделитель)');
                    const strPart = argExpr.slice(0, commaIdx).trim();
                    const sepPart = argExpr.slice(commaIdx + 1).trim();
                    const strTokens = tokenize(strPart);
                    const [strVal] = parseExpr(strTokens, 0);
                    const sepTokens = tokenize(sepPart);
                    const [sepVal] = parseExpr(sepTokens, 0);
                    tokens.push({ type: 'str', value: String(strVal).split(String(sepVal)) });
                    continue;
                }
                const argTokens = tokenize(argExpr.trim());
                const [argVal] = parseExpr(argTokens, 0);
                if (name === 'int') { tokens.push({ type: 'num', value: Math.trunc(Number(argVal)) }); continue; }
                if (name === 'double') { tokens.push({ type: 'num', value: Number(argVal) }); continue; }
                if (name === 'string') { tokens.push({ type: 'str', value: String(argVal) }); continue; }
                if (name === 'len') {
                    const v = argVal;
                    if (Array.isArray(v)) { tokens.push({ type: 'num', value: v.length }); continue; }
                    tokens.push({ type: 'num', value: String(v).length }); continue;
                }
            }
            if (name in variables && typeof variables[name] === 'string' && expr[i] === '[') {
                i++;
                let indexExpr = '';
                let bracketCount = 1;
                while (i < expr.length && bracketCount > 0) {
                    if (expr[i] === '[') bracketCount++;
                    else if (expr[i] === ']') bracketCount--;
                    if (bracketCount > 0) indexExpr += expr[i];
                    i++;
                }
                const idxTokens = tokenize(indexExpr.trim());
                const [idx] = parseExpr(idxTokens, 0);
                tokens.push({ type: 'str', value: String(variables[name])[idx] ?? '' });
                continue;
            }
            if (!(name in variables)) throw new Error(`Переменная "${name}" не объявлена`);
            const v = variables[name];
            tokens.push(Array.isArray(v) || typeof v === 'string'
                ? { type: 'str', value: v }
                : { type: 'num', value: Number(v) });
            continue;
        }
        if ('()+-*/%'.includes(ch)) {
            tokens.push({ type: ch === '(' || ch === ')' ? 'paren' : 'op', value: ch });
            i++;
            continue;
        }
        throw new Error(`Неизвестный символ: "${ch}"`);
    }
    return tokens;
}

function parseExpr(tokens, pos) {
    let [left, p] = parseTerm(tokens, pos);
    while (p < tokens.length && (tokens[p].value === '+' || tokens[p].value === '-')) {
        const op = tokens[p].value;
        let right;
        [right, p] = parseTerm(tokens, p + 1);
        if (op === '+') {
            left = (typeof left === 'string' || typeof right === 'string')
                ? String(left) + String(right)
                : left + right;
        } else {
            left = left - right;
        }
    }
    return [left, p];
}

function parseTerm(tokens, pos) {
    let [left, p] = parseFactor(tokens, pos);
    while (p < tokens.length && (tokens[p].value === '*' || tokens[p].value === '/' || tokens[p].value === '%')) {
        const op = tokens[p].value;
        let right;
        [right, p] = parseFactor(tokens, p + 1);
        if (op === '*') left *= right;
        else if (op === '/') { if (right === 0) throw new Error('Деление на 0'); left /= right; }
        else { if (right === 0) throw new Error('Остаток от деления на 0'); left %= right; }
    }
    return [left, p];
}

function parseFactor(tokens, pos) {
    if (pos >= tokens.length) throw new Error('Неожиданно!');
    const tok = tokens[pos];
    if (tok.type === 'array_access') {
        const arrayName = tok.name;
        const indexExpr = tok.indexExpr;
        if (!(arrayName in variables) || !Array.isArray(variables[arrayName])) {
            throw new Error(`"${arrayName}" не является массивом`);
        }
        const indexTokens = tokenize(indexExpr);
        const [index] = parseExpr(indexTokens, 0);
        if (!Number.isInteger(index) || index < 0) {
            throw new Error(`Индекс массива должен быть неотрицательным целым числом: ${index}`);
        }
        const array = variables[arrayName];
        if (index >= array.length) {
            throw new Error(`Индекс ${index} вне границ массива "${arrayName}" (длина: ${array.length})`);
        }
        return [array[index], pos + 1];
    }
    if (tok.type === 'op' && tok.value === '-') {
        const [val, p] = parseFactor(tokens, pos + 1);
        return [-val, p];
    }
    if (tok.type === 'paren' && tok.value === '(') {
        const [val, p] = parseExpr(tokens, pos + 1);
        if (p >= tokens.length || tokens[p].value !== ')') throw new Error('Ожидалось закрытие скобки');
        return [val, p + 1];
    }
    if (tok.type === 'num') return [tok.value, pos + 1];
    if (tok.type === 'str') return [tok.value, pos + 1];
    throw new Error(`Неожиданный токен: "${tok.value}"`);
}

function evalExpr(exprStr) {
    const tokens = tokenize(exprStr.trim());
    if (tokens.length === 0) throw new Error('Пустое выражение');
    const [result, pos] = parseExpr(tokens, 0);
    if (pos !== tokens.length) throw new Error('Лишние символы в выражении');
    return result;
}

function evalCondition(leftStr, cmp, rightStr) {
    const a = evalExpr(leftStr);
    const b = evalExpr(rightStr);
    if (cmp === '>')  return a > b;
    if (cmp === '<')  return a < b;
    if (cmp === '==') return a === b;
    if (cmp === '!=') return a !== b;
    if (cmp === '>=') return a >= b;
    if (cmp === '<=') return a <= b;
    return false;
}

function evalConditionStr(condStr) {
    condStr = condStr.trim();
    for (const cmp of ['>=', '<=', '!=', '>', '<', '==']) {
        const idx = condStr.indexOf(cmp);
        if (idx !== -1) {
            const left = condStr.slice(0, idx).trim();
            const right = condStr.slice(idx + cmp.length).trim();
            return evalCondition(left, cmp, right);
        }
    }
    throw new Error(`Не удалось разобрать условие: "${condStr}"`);
}

function evalLogicalExpr(str) {
    const tokens = tokenizeLogical(str.trim());
    const [result, pos] = parseOr(tokens, 0);
    if (pos !== tokens.length) throw new Error(`Лишние символы в условии: "${tokens.slice(pos).map(t => t.value).join(' ')}"`);
    return result;
}

function tokenizeLogical(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        if (str[i] === ' ') { i++; continue; }
        if (str[i] === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
        if (str[i] === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
        const upper = str.slice(i).toUpperCase();
        if (upper.startsWith('AND') && !/[A-Z0-9_]/.test(str[i+3] || '')) {
            tokens.push({ type: 'and', value: 'AND' }); i += 3; continue;
        }
        if (upper.startsWith('OR') && !/[A-Z0-9_]/.test(str[i+2] || '')) {
            tokens.push({ type: 'or', value: 'OR' }); i += 2; continue;
        }
        if (upper.startsWith('NOT') && !/[A-Z0-9_]/.test(str[i+3] || '')) {
            tokens.push({ type: 'not', value: 'NOT' }); i += 3; continue;
        }
        let chunk = '';
        let depth = 0;
        while (i < str.length) {
            const u = str.slice(i).toUpperCase();
            if (str[i] === '(') { depth++; chunk += str[i++]; continue; }
            if (str[i] === ')') { depth--; chunk += str[i++]; continue; }
            if (depth === 0) {
                if ((u.startsWith('AND') && !/[A-Z0-9_]/.test(str[i+3] || '')) ||
                    (u.startsWith('OR')  && !/[A-Z0-9_]/.test(str[i+2] || '')) ||
                    (u.startsWith('NOT') && !/[A-Z0-9_]/.test(str[i+3] || ''))) break;
            }
            chunk += str[i++];
        }
        const trimmed = chunk.trim();
        if (trimmed) tokens.push({ type: 'cmp', value: trimmed });
    }
    return tokens;
}

function parseOr(tokens, pos) {
    let [left, p] = parseAnd(tokens, pos);
    while (p < tokens.length && tokens[p].type === 'or') {
        let right; [right, p] = parseAnd(tokens, p + 1);
        left = left || right;
    }
    return [left, p];
}

function parseAnd(tokens, pos) {
    let [left, p] = parseNot(tokens, pos);
    while (p < tokens.length && tokens[p].type === 'and') {
        let right; [right, p] = parseNot(tokens, p + 1);
        left = left && right;
    }
    return [left, p];
}

function parseNot(tokens, pos) {
    if (pos < tokens.length && tokens[pos].type === 'not') {
        const [val, p] = parseNot(tokens, pos + 1);
        return [!val, p];
    }
    return parseLogicalAtom(tokens, pos);
}

function parseLogicalAtom(tokens, pos) {
    if (pos >= tokens.length) throw new Error('Неожиданно!');
    if (tokens[pos].type === 'lparen') {
        const [val, p] = parseOr(tokens, pos + 1);
        if (p >= tokens.length || tokens[p].type !== 'rparen') throw new Error('Ожидалось закрытие скобки');
        return [val, p + 1];
    }
    if (tokens[pos].type === 'cmp') {
        const val = evalConditionStr(tokens[pos].value);
        return [val, pos + 1];
    }
    throw new Error(`Неожиданный токен в условии: "${tokens[pos].value}"`);
}

function splitOutsideQuotes(str) {
    const parts = [];
    let current = '';
    let inQuote = null;
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if ((c === '"' || c === "'") && inQuote === null) { inQuote = c; current += c; continue; }
        if (c === inQuote) { inQuote = null; current += c; continue; }
        if (inQuote) { current += c; continue; }
        if (c === ',') { parts.push(current.trim()); current = ''; continue; }
        current += c;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
}

function execSimpleStatement(stmt) {
    stmt = stmt.trim();
    if (!stmt) return;
    const arrMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[([^\]]+)\]\s*=\s*(.+)$/);
    if (arrMatch) {
        const arrayName = arrMatch[1];
        const index = evalExpr(arrMatch[2].trim());
        if (!Number.isInteger(index) || index < 0) throw new Error(`Некорректный индекс: ${index}`);
        if (index >= variables[arrayName].length) throw new Error(`Индекс ${index} вне границ`);
        variables[arrayName][index] = evalExpr(arrMatch[3].trim());
        return;
    }
    const varMatch = stmt.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (varMatch) {
        const name = varMatch[1];
        const val = evalExpr(varMatch[2].trim());
        variables[name] = val;
        if (varTypes[name] === 'int') variables[name] = Math.trunc(val);
        return;
    }
    throw new Error(`Не удалось разобрать: "${stmt}"`);
}