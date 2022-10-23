import yaml from 'js-yaml'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { fileURLToPath } from 'url';
import {type TagCategories} from '../datatypes'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '../../')

const tagFiles = glob.sync('**/*.yaml', {cwd: path.resolve(dirname, '../../data/tags')})
const tagSet: Set<string> = new Set()

const uc = 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry'
const ucA = uc.split(', ')

for (const file of tagFiles) {
    if (file.startsWith('restricted')) continue
    const tagData: TagCategories = yaml.load(fs.readFileSync(path.resolve(dirname, '../../data/tags', file), 'utf-8')) as TagCategories
    for (const [tag, meta] of Object.entries(tagData.content)) {
        if (ucA.includes(tag)) continue
        if (!meta.image) {
            tagSet.add(tag)
        }
    }
}

const generatedPath = path.resolve(root, 'workspace/generated_images')
fs.mkdirSync(generatedPath, {recursive: true})

for (const tag of tagSet) {
    if (fs.existsSync(path.resolve(generatedPath, `${encodeURIComponent(tag)}.png`))) {
        continue
    }
    console.log(tag)

    const params = JSON.stringify({
        prompt: `masterpiece, best quality, ${tag}`,
        negative_prompt: uc,
        steps: 28,
        cfg_scale: 12,
        do_not_save_samples: true,
        width: 512,
        height: 512,
        clip_skip: 2,
        sampler_index: 'Euler a',
        sd_model: 'modelsfw.pruned.ckpt [1d4a34af]',
    })

    const res = await fetch('http://127.0.0.1:7860/sdapi/v1/txt2img', {
        method: 'POST',
        body: params,
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const json = await res.json()
    await fs.promises.writeFile(path.resolve(generatedPath, `${encodeURIComponent(tag)}.png`), Buffer.from(json.images[0], 'base64'))
}
