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

import yaml from 'js-yaml'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { fileURLToPath } from 'url';
import type {TagCategories} from "../datatypes";

const resolution = new Set()
const dirname = path.dirname(fileURLToPath(import.meta.url))

const tagFiles = glob.sync('**/*.yaml', {cwd: path.resolve(dirname, '../../data/tags')})
let hasError = false
for (const file of tagFiles) {
    const tagData: TagCategories = yaml.load(fs.readFileSync(path.resolve(dirname, '../../data/tags', file), 'utf-8')) as TagCategories
    for (const [rawTag, meta] of Object.entries(tagData.content)) {
        const tag = rawTag.toLowerCase().replaceAll('_', ' ')
        if (resolution.has(tag)) {
            console.error(`Duplicate tag ${tag} from ${file}`)
            hasError = true
        }
        resolution.add(tag)
        if (meta?.alias) {
            for (const rawAlias of meta.alias) {
                const alias = rawAlias.toLowerCase().replaceAll('_', ' ')
                if (resolution.has(alias)) {
                    console.error(`Duplicate alias ${alias} of ${tag} from ${file}`)
                    hasError = true
                }
                resolution.add(alias)
            }
        }
    }
}

if (hasError) {
    process.exit(1)
} else {
    console.log('No duplicate tag found')
}
