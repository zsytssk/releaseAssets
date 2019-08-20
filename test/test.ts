import * as path from 'path';
import { intConfig } from '../script/const';
import { writeVersion } from '../script/tool/writeVersion';

// console.log(path.dirname(`D:\\test\\test`));

const config_path = path.resolve(
    path.dirname(process.argv[1]),
    '../script/config.json',
);
const commit_path = path.resolve(
    path.dirname(process.argv[1]),
    '../script/commit.json',
);

async function main() {
    await intConfig(config_path, commit_path);
    writeVersion();
}

main();
