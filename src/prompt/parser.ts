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

import nearley from 'nearley'
import grammarOld from './grammarOld'
import grammarNew from './grammarNew'
import Decimal from 'decimal.js-light'
import type {
    CartItem,
    CartItemComplex,
    CartItemSimple,
    CartItemGroup,
    CartItemEditing,
    CartItemAlternate,
    CartItemEditingChild,
} from '../types/cart'
import { useTagStore } from '../stores/tags'

export function parse(prompt: string, newEmphasis: boolean) {
    const parser = new nearley.Parser(
        nearley.Grammar.fromCompiled(newEmphasis ? grammarNew : grammarOld)
    )
    parser.feed(prompt)
    return parser.results[0]
}

function toTag(
    name: string,
    parent: CartItemComplex | null,
    weight: Decimal
): CartItemSimple {
    const tagStore = useTagStore()
    const trimmedName = name.trim().toLowerCase().replaceAll('_', ' ')
    let matchText = trimmedName
    let resolvedTag = tagStore.resolve(trimmedName)
    if (!resolvedTag) {
        matchText = trimmedName + 's'
        resolvedTag = tagStore.resolve(matchText)
    }
    if (!resolvedTag) {
        matchText = trimmedName + 'es'
        resolvedTag = tagStore.resolve(matchText)
    }
    if (!resolvedTag && trimmedName.endsWith('s')) {
        matchText = trimmedName.slice(0, -1)
        resolvedTag = tagStore.resolve(matchText)
    }
    if (!resolvedTag && trimmedName.endsWith('es')) {
        matchText = trimmedName.slice(0, -2)
        resolvedTag = tagStore.resolve(matchText)
    }
    if (resolvedTag) {
        return {
            label: `${trimmedName} - ${resolvedTag.meta.name}`,
            type: 'tag',
            name: trimmedName,
            category: resolvedTag.meta.category,
            weight,
            parent,
            children: null,
        }
    } else {
        return {
            label: trimmedName,
            name: trimmedName,
            type: 'tag',
            category: null,
            parent,
            children: null,
            weight,
        }
    }
}

function walkNewEmphasis(
    node: any,
    parent: CartItemComplex | null,
    weight: Decimal
): CartItem | null {
    if (node === null) return null
    if (node.type === 'tag') {
        return toTag(node.name, parent, weight)
    } else if (
        node.type === 'weight_add' ||
        node.type === 'weight_sub' ||
        node.type === 'weight_set'
    ) {
        switch (node.type) {
            case 'weight_add':
                weight = weight.mul(1.1)
                break
            case 'weight_sub':
                weight = weight.div(1.1)
                break
            case 'weight_set':
                weight = new Decimal(node.weight)
                break
        }
        if (node.content.length > 1) {
            const group: CartItemGroup = {
                type: 'group',
                label: '标签组',
                weight: weight,
                parent,
                // @ts-ignore recursive
                children: null,
            }
            group.children = node.content.map((child: any) =>
                walkNewEmphasis(child, group, new Decimal(1))
            )
            return group
        } else if (node.content.length === 1) {
            return walkNewEmphasis(node.content[0], parent, weight)
        } else {
            return null
        }
    } else if (node.type === 'editing') {
        const editing: CartItemEditing = {
            type: 'editing',
            label: '标签替换',
            weight,
            parent,
            // @ts-ignore recursive
            children: [],
            breakpoint: new Decimal(node.breakpoint),
        }

        if (node.from === null || node.from.every((n: any) => n === null)) {
            editing.children.push({
                type: 'null',
                label: '无标签',
                parent: editing,
                children: null,
            })
        } else if (node.from.length === 1) {
            editing.children.push(
                walkNewEmphasis(
                    node.from[0],
                    editing,
                    new Decimal(1)
                ) as CartItemEditingChild
            )
        } else {
            const group: CartItemGroup & { parent: CartItemEditing } = {
                type: 'group',
                label: '标签组',
                weight: weight,
                parent: editing,
                // @ts-ignore recursive
                children: null,
            }
            group.children = node.from.map((child: any) =>
                walkNewEmphasis(child, group, new Decimal(1))
            )
            editing.children.push(group)
        }

        if (node.to === null || node.to.every((n: any) => n === null)) {
            editing.children.push({
                type: 'null',
                label: '无标签',
                parent: editing,
                children: null,
            })
        } else if (node.to.length === 1) {
            editing.children.push(
                walkNewEmphasis(
                    node.to[0],
                    editing,
                    new Decimal(1)
                ) as CartItemEditingChild
            )
        } else {
            const group: CartItemGroup & { parent: CartItemEditing } = {
                type: 'group',
                label: '标签组',
                weight: weight,
                parent: editing,
                // @ts-ignore recursive
                children: null,
            }
            group.children = node.to.map((child: any) =>
                walkNewEmphasis(child, group, new Decimal(1))
            )
            editing.children.push(group)
        }
        return editing
    } else if (node.type === 'alternate') {
        const alternate: CartItemAlternate = {
            type: 'alternate',
            label: '标签轮转',
            weight,
            parent,
            // @ts-ignore recursive
            children: [],
        }
        alternate.children = node.tags
            .map((child: any) => {
                if (child.length === 0 || child.every((n: any) => n === null))
                    return null
                else if (child.length === 1)
                    return walkNewEmphasis(child[0], alternate, new Decimal(1))
                else {
                    const group: CartItemGroup & { parent: CartItemAlternate } =
                        {
                            type: 'group',
                            label: '标签组',
                            weight: weight,
                            parent: alternate,
                            // @ts-ignore recursive
                            children: null,
                        }
                    group.children = child.map((child: any) =>
                        walkNewEmphasis(child, group, new Decimal(1))
                    )
                    return group
                }
            })
            .filter((n: any) => !!n)
        return alternate
    } else {
        throw new Error('Unknown node type')
    }
}

function walkOldEmphasis(
    node: any,
    parent: CartItemComplex | null,
    weight: Decimal
): CartItem | null {
    if (node === null) return null
    if (node.type === 'tag') {
        return toTag(node.name, parent, weight)
    } else if (node.type === 'weight_add' || node.type === 'weight_sub') {
        switch (node.type) {
            case 'weight_add':
                weight = weight.mul(1.1)
                break
            case 'weight_sub':
                weight = weight.div(1.1)
                break
        }
        if (node.content.length > 1) {
            const group: CartItemGroup = {
                type: 'group',
                label: '标签组',
                weight: weight,
                parent,
                // @ts-ignore recursive
                children: null,
            }
            group.children = node.content.map((child: any) =>
                walkNewEmphasis(child, group, new Decimal(1))
            )
            return group
        } else if (node.content.length === 1) {
            return walkNewEmphasis(node.content[0], parent, weight)
        } else {
            return null
        }
    } else {
        throw new Error('Unknown node type')
    }
}

export function unserialize(
    prompt: string,
    root: CartItem[],
    newEmphasis: boolean
) {
    const parsed = parse(prompt, newEmphasis)
    if (parsed) {
        for (const node of parsed) {
            const parsedNode = newEmphasis
                ? walkNewEmphasis(node, null, new Decimal(1))
                : walkOldEmphasis(node, null, new Decimal(1))
            if (parsedNode) root.push(parsedNode)
        }
    }
}
