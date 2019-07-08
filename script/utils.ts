import { cp } from './ls/main';
import * as pMap from './p-map';

export function multiCopy(file_list: string[][], num: number) {
    pMap(
        file_list,
        ([ori_file, dist_file]) => {
            return cp(ori_file, dist_file).then(() => {
                console.log(`complete copy ${ori_file} => ${dist_file}`);
            });
        },
        { concurrency: num },
    );
}
