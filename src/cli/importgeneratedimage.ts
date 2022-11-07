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
import { type TagCategories } from '../types/data'
import sharp from 'sharp'
import { createHash } from 'crypto'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '../../')

const tagFiles = glob.sync('**/*.yaml', {
    cwd: path.resolve(root, 'data/tags'),
})
const tagSet: Map<string, string> = new Map()

for (const file of tagFiles) {
    const tagData: TagCategories = yaml.load(
        fs.readFileSync(path.resolve(root, 'data/tags', file), 'utf-8')
    ) as TagCategories
    for (const [tag] of Object.entries(tagData.content)) {
        tagSet.set(tag, file)
    }
}

const saveImagePath = path.resolve(root, 'public/images')

const photoFiles = glob.sync('*.png', {
    cwd: path.resolve(root, 'workspace/generated_images'),
})
for (const file of photoFiles) {
    console.log(file)
    const tag = decodeURIComponent(file.slice(0, -4))
    const photoPath = path.resolve(root, 'workspace/generated_images', file)
    const image = await sharp(photoPath)
        .resize(512, 512, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 60, effort: 6 })
        .toBuffer()
    const hash = createHash('sha256').update(image).digest('hex')
    fs.mkdirSync(path.resolve(saveImagePath, hash.slice(0, 2)), {
        recursive: true,
    })
    fs.writeFileSync(
        path.resolve(saveImagePath, `${hash.slice(0, 2)}/${hash}.webp`),
        image
    )
    const tagFile = tagSet.get(tag)
    if (tagFile) {
        const tagData: TagCategories = yaml.load(
            fs.readFileSync(path.resolve(root, 'data/tags', tagFile), 'utf-8')
        ) as TagCategories
        if (tagData.content[tag]) tagData.content[tag].image = hash
        fs.writeFileSync(
            path.resolve(root, 'data/tags', tagFile),
            yaml.dump(tagData, { indent: 2 })
        )
    }
}
