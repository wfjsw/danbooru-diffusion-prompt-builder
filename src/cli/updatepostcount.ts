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

for (const file of tagFiles) {
    const tagData: TagCategories = yaml.load(
        fs.readFileSync(path.resolve(dirname, '../../data/tags', file), 'utf-8')
    ) as TagCategories
    for (const [tag] of Object.entries(tagData.content)) {
        tagSet.add(tag)
        // if (meta.alias) {
        //     for (const alias of meta.alias) {
        //         tagSet.add(alias)
        //     }
        // }
    }
}
const tagArr = Array.from(tagSet)
const batchCount = Math.ceil(tagSet.size / 50)
const result: Record<string, number> = {}
for (let i = 0; i < batchCount; i++) {
    console.log(`${i + 1} / ${batchCount}`)
    const batch = tagArr.slice(i * 50, (i + 1) * 50)
    const batchStr = batch.map((n) => n.replaceAll(' ', '_')).join(',')
    const qs = new URLSearchParams({
        limit: '50',
        only: 'name,post_count',
        'search[name_normalize]': batchStr,
    })
    const res = await axios.get(
        `https://danbooru.donmai.us/tags.json?${qs.toString()}`,
        {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                Cookie: 'cf_clearance=',
            },
        }
    )

    for (const record of res.data) {
        result[record.name.replaceAll('_', ' ').toLowerCase()] =
            record.post_count as number
    }
}

fs.writeFileSync(
    path.resolve(dirname, '../../data/danbooru_tag_post_count.json'),
    JSON.stringify(result, null, 4)
)
