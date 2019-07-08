import * as path from 'path';
import { intConfig } from './const';
import { readdir } from './ls/asyncUtil';
import { cp } from './ls/main';
import { releaseAssets } from './releaseAssets';

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
    const src = `D:\\zsytssk\\job\\legend\\svn`;
    const dist = `V:\\`;
    const ignore = ['.svn', '设计稿'];
    const path_list = await readdir(src);
    for (const item of path_list) {
        if (ignore.indexOf(item) !== -1) {
            continue;
        }
        const src_path = path.resolve(src, item);
        const dist_path = path.resolve(dist, item);
        console.log(src_path, dist_path);
        await cp(src_path, dist_path);
    }

    // const files = await walk(src);
    // for (const file of files) {
    //     if (calcClosestDepth(file, ignore) > -1) {
    //         continue;
    //     }
    //     const rel_path = path.relative(file, src);
    //     const dist_path = path.resolve(dist, rel_path);
    //     console.log(file, rel_path, dist_path);
    //     // cp(file, dist_path);
    // }
}
