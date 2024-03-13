import * as yaml from 'yaml'
import fs from 'node:fs'
import { resolve } from 'node:path'

export function asyncTimeout (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function loadYamlFile (file: string, multiple: boolean = false): any {
  return multiple ? yaml.parseAllDocuments(fs.readFileSync(file, 'utf8')) : yaml.parse(fs.readFileSync(file, 'utf8'))
}

export function loadConfig (file: string) {
  return loadYamlFile(resolve('.', file))
}
