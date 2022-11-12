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
import { fileURLToPath } from 'url'
import { type TagFile } from '../types/file'
// @ts-ignore for ci
import { translation } from '../../workspace/translated'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const tagFiles = glob.sync('**/*.yaml', {
    cwd: path.resolve(dirname, '../../data/tags'),
})

for (const file of tagFiles) {
    const tagData: TagFile = yaml.load(
        fs.readFileSync(path.resolve(dirname, '../../data/tags', file), 'utf-8')
    ) as TagFile
    for (const [tag, meta] of Object.entries(tagData.content)) {
        // @ts-expect-error init object
        if (!meta) tagData.content[tag] = {}
        if (!meta?.name) {
            const t = (translation as string[][]).find(
                (n) => n[0].toLowerCase() === tag.toLowerCase()
            )
            if (t) tagData.content[tag].name = t[1]
        }
    }
    fs.writeFileSync(
        path.resolve(dirname, '../../data/tags', file),
        yaml.dump(tagData, { indent: 2 })
    )
}
