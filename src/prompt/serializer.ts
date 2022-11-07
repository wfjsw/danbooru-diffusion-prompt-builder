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

import { OrderedSet as ImmutableOrderedSet } from 'immutable'
import Decimal from 'decimal.js-light'
import type { CartItemNullable, CartItemPresetChild } from '../types/cart'

function wrapParen(content: string, char: '(' | '{' | '[', length: number) {
    for (let i = 0; i < length; i++) {
        switch (char) {
            case '(':
                content = `(${content})`
                break
            case '{':
                content = `{${content}}`
                break
            case '[':
                content = `[${content}]`
                break
        }
    }
    return content
}

export function wrapParenByWeight(
    content: string,
    weight: Decimal,
    newEmphasis: boolean
): string {
    if (newEmphasis) {
        if (!weight.toDecimalPlaces(8).equals(1)) {
            return `(${content}:${weight.toDecimalPlaces(8)})`
        }
    } else {
        const oldWeight = weight.log(1.05).toInteger().toNumber()
        if (oldWeight !== 0) {
            return wrapParen(
                content,
                oldWeight > 0 ? '{' : '[',
                Math.abs(oldWeight)
            )
        }
    }
    return content
}

export function serialize(
    items: (CartItemNullable | CartItemPresetChild)[],
    newEmphasis: boolean
): string {
    return ImmutableOrderedSet.of(
        ...items.reduce((a: string[], t): string[] => {
            if (t.type === 'tag' || t.type === 'embedding') {
                let name = t.name.replaceAll('\\', '\\\\')
                if (newEmphasis) {
                    name = name
                        .replaceAll('(', '\\(')
                        .replaceAll(')', '\\)')
                        .replaceAll('[', '\\[')
                        .replaceAll(']', '\\]')
                } else {
                    name = name
                        .replaceAll('{', '\\{')
                        .replaceAll('}', '\\}')
                        .replaceAll('[', '\\[')
                        .replaceAll(']', '\\]')
                }
                a.push(wrapParenByWeight(name, t.weight, newEmphasis))
            } else if (t.type === 'preset') {
                a.push(serialize(t.children, newEmphasis))
            } else if (t.type === 'alternate') {
                if (newEmphasis) {
                    a.push(
                        wrapParenByWeight(
                            `[${t.children
                                .map((n) => serialize([n], newEmphasis))
                                .join('|')}]`,
                            t.weight,
                            newEmphasis
                        )
                    )
                } else {
                    a.push(
                        wrapParenByWeight(
                            serialize(t.children, newEmphasis),
                            t.weight,
                            newEmphasis
                        )
                    )
                }
            } else if (t.type === 'editing') {
                if (newEmphasis) {
                    a.push(
                        wrapParenByWeight(
                            `[${
                                t.children[0].type !== 'null'
                                    ? serialize([t.children[0]], newEmphasis)
                                    : ''
                            }:${
                                t.children[1].type !== 'null'
                                    ? serialize([t.children[1]], newEmphasis)
                                    : ''
                            }:${t.breakpoint.toDecimalPlaces(3).toNumber()}]`,
                            t.weight,
                            newEmphasis
                        )
                    )
                } else {
                    a.push(
                        wrapParenByWeight(
                            serialize(t.children, newEmphasis),
                            t.weight,
                            newEmphasis
                        )
                    )
                }
            } else if (t.type === 'group') {
                a.push(
                    wrapParenByWeight(
                        serialize(t.children, newEmphasis),
                        t.weight,
                        newEmphasis
                    )
                )
            }
            return a
        }, [])
    ).join(', ')
}
