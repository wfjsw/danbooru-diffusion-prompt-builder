import path from 'path'
import sharp from 'sharp'
import {fileURLToPath} from "url";
import {createHash} from 'crypto'
import fs from "fs";

const inputModelPath = process.argv[2]

if (!inputModelPath) {
    console.error('No input model path provided')
    process.exit(1)
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const modelPath = path.resolve(process.cwd(), inputModelPath)
const savePath = path.resolve(dirname, '../../public/embeddings')

const modelHash = createHash('sha256').update(fs.readFileSync(modelPath)).digest('hex')

fs.mkdirSync(path.resolve(savePath, modelHash.slice(0, 2)), {recursive: true})
await sharp(modelPath)
    .resize(512, 512, {fit: 'cover'})
    .webp({quality: 60, effort: 6})
    .toFile(path.resolve(savePath, `${modelHash.slice(0,2)}/${modelHash}.preview.webp`))

await sharp(modelPath)
    .webp({lossless: true})
    .toFile(path.resolve(savePath, `${modelHash.slice(0,2)}/${modelHash}.webp`))

console.log('Model imported')
console.log('Hash:', modelHash)
