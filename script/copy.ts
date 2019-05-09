import * as path from 'path';
import { PROJECT_FOLDER } from './config';
import { cpDir } from './ls/cpDir';
import { clear } from './ls/rm';

export async function copy() {
    const laya_map_folder = path.resolve(PROJECT_FOLDER, 'laya/assets/config');
    const bin_map_folder = path.resolve(PROJECT_FOLDER, 'bin/config');

    await clear(laya_map_folder);
    await cpDir('./dist', laya_map_folder);
    await clear(bin_map_folder);
    await cpDir('./dist', bin_map_folder);
}
