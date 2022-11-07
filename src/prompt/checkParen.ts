function reverseParen(paren: '(' | '[' | '{') {
    return paren === '(' ? ')' : paren === '[' ? ']' : '}'
}

export function checkParen(text: string) {
    const stack: ('('|'['|'{')[] = []
    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char)
        } else if (char === ')' || char === '}' || char === ']') {
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
