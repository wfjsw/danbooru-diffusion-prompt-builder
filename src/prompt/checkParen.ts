/*******************************************************************************
 * Danbooru Diffusion Prompt Builder
 * Copyright (C) 2022  Jabasukuriputo Wang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 ******************************************************************************/

const BOUNDARY_PAREN_REGEX =
    /[^,，\\([{\s:|]\s*[([{]|[^\\][\])}]\s*[^,，)\]}\s:|]/

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
            if (!last && char === ')') return { i, expected: '(', char }
            if (!last && char === '}') return { i, expected: '{', char }
            if (!last && char === ']') return { i, expected: '[', char }
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
