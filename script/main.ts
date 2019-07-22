import * as path from 'path';
import { intConfig } from './const';
import { readdir } from './script/asyncUtil';
import { cp } from './script/main';
import { releaseAssets } from './releaseAssets/releaseAssets';
import { walk } from './script/walk';
import { releaseSvn } from './tool/releaseSvn';
import { copyFile } from 'fs';
import { copyNpc } from './tool/copyNpc';

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
        copyNpc,
    };
    if (actions[type]) {
        await actions[type](commit);
    }
}
main();
