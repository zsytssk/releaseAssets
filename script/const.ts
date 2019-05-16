import * as path from 'path';
import { readFile } from './ls/asyncUtil';

export let SRC;
export let PROJECT_FOLDER;
export let DIST;
export let ignore_files;

export async function intConfig(config_path: string) {
    const config_raw = await readFile(config_path);
    const config = JSON.parse(config_raw);
    SRC = path.resolve(config.src_folder);
    PROJECT_FOLDER = path.resolve(config.project_folder);
    DIST = './dist';
    ignore_files = config.ignore_files;
}
