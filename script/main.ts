import * as path from 'path';
import { intConfig } from './const';
import { releaseAssets, acpp } from './releaseAssets/releaseAssets';
import { copyNpc } from './tool/copyNpc';
import { releaseSvn, releaseBack } from './tool/releaseSvn';

const [type, commit, msg] = process.argv.slice(2);
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
        copyNpc,
        releaseBack,
        acpp,
    };
    if (actions[type]) {
        await actions[type](commit, msg);
    }
}
main();
