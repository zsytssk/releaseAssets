import * as pMap from './p-map';
import { ChangeStatus } from './releaseAssets/findChangeFiles';
import { cp } from './script/main';
import { rm } from './script/rm';

export type ItemData = [string, string, ChangeStatus];
export function multiCopy(file_list: ItemData[], num: number) {
    pMap(
        file_list,
        ([ori_file, dist_file, status]: ItemData) => {
            if (status === 'm') {
                return cp(ori_file, dist_file).then(() => {
                    console.log(`copyed:> ${ori_file} => ${dist_file}`);
                });
            } else {
                return rm(dist_file).then(() => {
                    console.log(`delete:> ${dist_file}`);
                });
            }
        },
        { concurrency: num },
    );
}
