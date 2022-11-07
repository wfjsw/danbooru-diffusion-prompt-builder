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
import axios from 'axios'
import { fileURLToPath } from 'url'
import { type TagCategories } from '../types/data'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const tagFiles = glob.sync('**/*.yaml', {
    cwd: path.resolve(dirname, '../../data/tags'),
})
const tagSet: Set<string> = new Set()
const tagLoc = new Map<string, string>()

for (const file of tagFiles) {
    const tagData: TagCategories = yaml.load(
        fs.readFileSync(path.resolve(dirname, '../../data/tags', file), 'utf-8')
    ) as TagCategories
    for (const [tag, meta] of Object.entries(tagData.content)) {
        if (!meta.wikiURL) {
            tagSet.add(tag)
            tagLoc.set(tag, file)
        }
    }
}
let i = 0
for (const tag of tagSet) {
    console.log(`${++i} / ${tagSet.size}`)
    const qs = new URLSearchParams({
        limit: '50',
        only: 'title',
        'search[title_normalize]': tag.replaceAll(' ', '_'),
    })
    const res = await axios.get(
        `https://danbooru.donmai.us/wiki_pages.json?${qs.toString()}`,
        {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                Cookie: 'cf_clearance=',
            },
        }
    )
    for (const record of res.data) {
        const recordTagName: string = record.title.replaceAll('_', ' ')
        const tagFile = tagLoc.get(recordTagName)
        if (tagFile) {
            const tagData: TagCategories = yaml.load(
                fs.readFileSync(
                    path.resolve(dirname, '../../data/tags', tagFile),
                    'utf-8'
                )
            ) as TagCategories
            if (tagData.content[recordTagName]) {
                tagData.content[
                    recordTagName
                ].wikiURL = `https://danbooru.donmai.us/wiki_pages/${record.title}.html`
            }
            fs.writeFileSync(
                path.resolve(dirname, '../../data/tags', tagFile),
                yaml.dump(tagData, { indent: 2 })
            )
        }
    }
}
