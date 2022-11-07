const BOUNDARY_PAREN_REGEX =
    /[^,，\\([{\s]\s*[([{]|[^\\][\])}]\s*[^,，)\]}\s]/

function reverseParen(paren: '(' | '[' | '{') {
    return paren === '(' ? ')' : paren === '[' ? ']' : '}'
}

export function checkParen(text: string) {
    const stack: ('('|'['|'{')[] = []
    for (let i = 0; i < text.length; i++) {
        const prevChar = i > 0 ? text[i - 1] : ''
        const char = text[i]
        if ((char === '(' || char === '{' || char === '[') && prevChar !== '\\') {
            stack.push(char)
        } else if (
            (char === ')' || char === '}' || char === ']') &&
            prevChar !== '\\'
        ) {
            const last = stack.pop()
            if (last === '(' && char !== ')') return { i, expected: ')', char }
            if (last === '{' && char !== '}') return { i, expected: '}', char }
            if (last === '[' && char !== ']') return { i, expected: ']', char }
        }
    }
    if (stack.length > 0) {
        const last = stack.map(n => reverseParen(n)).join('')
        return { i: text.length, expected: last, char: 'EOF' }
    }
    return null
}

export function checkBoundaryParen(text: string) {
    const result = text.match(BOUNDARY_PAREN_REGEX)

    if (result) {
        return { i: result.index, char: result[0]}
    } else {
        return null
    }
}
