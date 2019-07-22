import * as path from 'path';
import { intConfig } from './const';
import { readdir } from './script/asyncUtil';
import { cp } from './script/main';
import { releaseAssets } from './releaseAssets/releaseAssets';
import { walk } from './script/walk';

const [type, commit] = process.argv.slice(2);
const config_path = path.resolve(
    path.dirname(process.argv[1]),
    './config.json',
);
const commit_path = path.resolve(
    path.dirname(process.argv[1]),
    './commit.json',
);

async function main() {
    await intConfig(config_path, commit_path);

    const actions = {
        releaseAssets,
        releaseSvn,
    };
    if (actions[type]) {
        await actions[type](commit);
    }
}
main();

async function releaseSvn() {
    const src = `D:\\zsytssk\\job\\legend\\svn\\`;
    const dist = `V:\\`;
    const ignore = ['.svn', '设计稿'];
    const path_list = await walk(src, ignore);
    for (const item of path_list) {
        if (ignore.indexOf(item) !== -1) {
            continue;
        }
        const dist_path = item.replace(src, dist);
        console.log(item, dist_path);
        await cp(item, dist_path);
    }
}
