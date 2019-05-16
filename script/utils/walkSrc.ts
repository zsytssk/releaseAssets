import * as path from 'path';
import { ignore_files, SRC } from '../const';
import { readdir } from '../ls/asyncUtil';

export async function walkSrc(): Promise<string[]> {
    const result = [] as string[];
    const files = await readdir(SRC);

    for (const file of files) {
        if (ignore_files.indexOf(file) !== -1) {
            continue;
        }
        /** ignore xlsx 缓存文件 */
        if (file.indexOf('~$') !== -1) {
            continue;
        }
        const file_path = path.resolve(SRC, file);
        result.push(file_path);
    }

    return result;
}
