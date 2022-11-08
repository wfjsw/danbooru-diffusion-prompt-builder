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

import type Decimal from 'decimal.js-light'

export interface CartItemPresetChild {
    label: string
    name: string
    category: string | null
    type: 'tag'
    weight: Decimal
    children: null
    parent: CartItemPreset
}

export type CartSimpleType = 'tag' | 'embedding'
export type CartSwitchableType = 'editing' | 'alternate' | 'group'
export type CartCompositeType = 'preset' | CartSwitchableType

export type CartType = CartSimpleType | CartCompositeType

export interface CartItemSimple {
    label: string
    name: string
    category: string | null
    type: CartSimpleType
    weight: Decimal
    children: null
    parent: CartItemComplex | null
}

export interface CartItemPreset {
    label: string
    type: 'preset'
    name: string
    category: string
    weight: Decimal
    children: CartItemPresetChild[]
    parent: CartItemComplex | null
}

export interface CartItemNull {
    label: '无标签'
    type: 'null'
    children: null
    parent: CartItemComplex | null
}

export type CartItemEditingChild = (CartItem | CartItemNull) & {
    parent: CartItemEditing
}

export interface CartItemEditing {
    label: '标签替换'
    type: 'editing'
    breakpoint: Decimal
    weight: Decimal
    children: [CartItemEditingChild, CartItemEditingChild]
    parent: CartItemComplex | null
}

export type CartItemAlternateChild = CartItem & { parent: CartItemAlternate }

export interface CartItemAlternate {
    label: '标签轮转'
    type: 'alternate'
    weight: Decimal
    children: CartItemAlternateChild[]
    parent: CartItemComplex | null
}

export type CartItemGroupChild = CartItem & { parent: CartItemGroup }

export interface CartItemGroup {
    label: '标签组'
    type: 'group'
    weight: Decimal
    children: CartItemGroupChild[]
    parent: CartItemComplex | null
}

export type CartItemComplex =
    | CartItemEditing
    | CartItemAlternate
    | CartItemGroup

export type CartItem = CartItemSimple | CartItemPreset | CartItemComplex
export type CartChildItem =
    | CartItemPresetChild
    | CartItemEditingChild
    | CartItemAlternateChild
    | CartItemGroupChild

export type CartItemNullable = CartItem | CartItemNull

export interface Cart {
    positive: CartItem[]
    negative: CartItem[]
}
