import yaml from 'js-yaml'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { fileURLToPath } from 'url';
import {type TagCategories} from '../datatypes'
import sharp from 'sharp'
import {createHash} from 'crypto'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '../../')

const tagFiles = glob.sync('**/*.yaml', {cwd: path.resolve(root, 'data/tags')})
const tagSet: Map<string, string> = new Map()

for (const file of tagFiles) {
    const tagData: TagCategories = yaml.load(fs.readFileSync(path.resolve(root, 'data/tags', file), 'utf-8')) as TagCategories
    for (const [tag, meta] of Object.entries(tagData.content)) {
        tagSet.set(tag, file)
    }
}

const saveImagePath = path.resolve(root, 'public/images')

const photoFiles = glob.sync('*.png', {cwd: path.resolve(root, 'workspace/generated_images')})
for (const file of photoFiles) {
    console.log(file)
    const tag = file.slice(0, -4)
    const photoPath = path.resolve(root, 'workspace/generated_images', file)
    const image = await sharp(photoPath)
        .resize(512, 512, {fit: 'cover', withoutEnlargement: true})
        .webp({quality: 60, effort: 6})
        .toBuffer()
    const hash = createHash('sha256').update(image).digest('hex')
    fs.mkdirSync(path.resolve(saveImagePath, hash.slice(0, 2)), {recursive: true})
    fs.writeFileSync(path.resolve(saveImagePath, `${hash.slice(0,2)}/${hash}.webp`), image)
    const tagFile = tagSet.get(tag)
    if (tagFile) {
        const tagData: TagCategories = yaml.load(fs.readFileSync(path.resolve(root, 'data/tags', tagFile), 'utf-8')) as TagCategories
        if (tagData.content[tag]) tagData.content[tag].image = hash
        fs.writeFileSync(path.resolve(root, 'data/tags', tagFile), yaml.dump(tagData, {indent: 2}))
    }
}
