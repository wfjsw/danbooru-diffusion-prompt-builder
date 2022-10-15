import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
import type {TagCategories} from "../datatypes";

const resolution = new Set()
const dirname = path.dirname(fileURLToPath(import.meta.url))

const tagFiles = fs.readdirSync(path.resolve(dirname, '../../data/tags'))
let hasError = false
for (const file of tagFiles.filter((f: string) => f.endsWith('.yaml'))) {
    const tagData: TagCategories = yaml.load(fs.readFileSync(path.resolve(dirname, '../../data/tags', file), 'utf-8')) as TagCategories
    for (const [tag, meta] of Object.entries(tagData.content)) {
        if (resolution.has(tag)) {
            console.error(`Duplicate tag ${tag} from ${file}`)
            hasError = true
        }
        resolution.add(tag)
        if (meta.alias) {
            for (const alias of meta.alias) {
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
