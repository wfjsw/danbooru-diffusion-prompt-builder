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
