import * as path from 'path';
import * as config from './configPath.json';
import { cpDir } from './ls/cpDir';
import { clear } from './ls/rm';

export async function copy() {
    const { project_folder } = config;
    const laya_map_folder = path.resolve(project_folder, 'laya/assets/config');
    const bin_map_folder = path.resolve(project_folder, 'bin/config');

    await clear(laya_map_folder);
    await cpDir('./dist', laya_map_folder);
    await clear(bin_map_folder);
    await cpDir('./dist', bin_map_folder);
}
