import yaml from 'js-yaml'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { fileURLToPath } from 'url';
import {type TagCategories} from '../datatypes'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const tagFiles = glob.sync('**/*.yaml', {cwd: path.resolve(dirname, '../../data/tags')})
const tagSet: Set<string> = new Set()
const tagLoc = new Map<string, string>()

for (const file of tagFiles) {
    const tagData: TagCategories = yaml.load(fs.readFileSync(path.resolve(dirname, '../../data/tags', file), 'utf-8')) as TagCategories
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
    const qs = new URLSearchParams({limit: '50', 'search[title_normalize]': tag.replaceAll(' ', '_')})
    const res = await fetch(`https://danbooru.donmai.us/wiki_pages.json?${qs.toString()}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
            'Cookie': 'cf_clearance=frYrp0Q5zQuJBP06gszx2yQ0.FOKHgcrCXSuIREX4B4-1666621136-0-250',
        }
    })

    const json = await res.json()
    for (const record of json) {
        const recordTagName = record.title.replaceAll('_', ' ')
        const tagFile = tagLoc.get(recordTagName)
        if (tagFile) {
            const tagData: TagCategories = yaml.load(fs.readFileSync(path.resolve(dirname, '../../data/tags', tagFile), 'utf-8')) as TagCategories
            if (tagData.content[recordTagName]) {
                tagData.content[recordTagName].wikiURL = `https://danbooru.donmai.us/wiki_pages/${record.title}.html`
            }
            fs.writeFileSync(path.resolve(dirname, '../../data/tags', tagFile), yaml.dump(tagData, {indent: 2}))
        }
    }
}
