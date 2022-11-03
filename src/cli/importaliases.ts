import yaml from 'js-yaml'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import axios from 'axios'
import { fileURLToPath } from 'url';
import {type TagCategories} from '../datatypes'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const tagFiles = glob.sync('**/*.yaml', {cwd: path.resolve(dirname, '../../data/tags')})
const tagSet: Set<string> = new Set()
const tagLoc = new Map<string, string>()

for (const file of tagFiles) {
    const tagData: TagCategories = yaml.load(fs.readFileSync(path.resolve(dirname, '../../data/tags', file), 'utf-8')) as TagCategories
    for (const [tag, meta] of Object.entries(tagData.content)) {
        if (!meta.alias) {
            tagSet.add(tag)
            tagLoc.set(tag, file)
        }
    }
}
const tagArr = Array.from(tagSet)
const batchCount = Math.ceil(tagSet.size / 50)
for (let i = 0; i < batchCount; i++) {
    console.log(`${i+1} / ${batchCount}`)
    const batch = tagArr.slice(i * 50, (i + 1) * 50)
    const batchStr = batch.map((n) => n.replaceAll(' ', '_')).join(',')
    const qs = new URLSearchParams({limit: '50', only: 'name,consequent_aliases[antecedent_name]',
        'search[name_normalize]': batchStr})
    const res = await axios.get(`https://danbooru.donmai.us/tags.json?${qs.toString()}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            'Cookie': 'cf_clearance=',
        },
    })
    for (const record of res.data) {
        const recordTagName = record.name.replaceAll('_', ' ')
        const tagFile = tagLoc.get(recordTagName)
        console.log(recordTagName, tagFile, record.consequent_aliases)
        if (tagFile) {
            const tagData: TagCategories = yaml.load(fs.readFileSync(path.resolve(dirname, '../../data/tags', tagFile), 'utf-8')) as TagCategories
            if (tagData.content[recordTagName] && record.consequent_aliases.length > 0) {
                tagData.content[recordTagName].alias = record.consequent_aliases.map((n: any) => n.antecedent_name.replaceAll('_', ' '))
            }
            fs.writeFileSync(path.resolve(dirname, '../../data/tags', tagFile), yaml.dump(tagData, {indent: 2}))
        }
    }
}
