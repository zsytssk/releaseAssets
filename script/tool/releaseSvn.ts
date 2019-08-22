import * as path from 'path';
import { readFile } from '../script/asyncUtil';
import { execArr } from '../script/exec';
import { cp } from '../script/main';
import { rm } from '../script/rm';
import { walk } from '../script/walk';
import { write } from '../script/write';

export async function releaseSvn() {
    const src = `D:\\zsytssk\\job\\legend\\svn\\产品文档\\地图配置`;
    const dist = `V:\\产品文档\\地图配置`;
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
export async function releaseNpc() {
    const src = `D:\\zsytssk\\job\\legend\\svn\\设计稿\\动画\\npc`;
    const dist = `V:\\产品文档\\地图配置`;
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
export async function releaseBack() {
    const dist = `D:\\zsytssk\\github\\glory`;
    const src = `Z:\\`;
    const commit_json = './script/back.json';
    let commit = (await execArr('git rev-parse --short HEAD', {
        path: src,
    })) as string;
    commit = commit.split('\n')[0];
    let last_commit;
    try {
        last_commit = JSON.parse(await readFile(commit_json)).last_commit;
    } catch (err) {
        last_commit = commit;
    }
    const changes = await getChangeFiles(src, last_commit);
    for (const item of changes) {
        const { status, file_path } = item;
        const src_path = path.resolve(src, file_path);
        const dist_path = path.resolve(dist, file_path);
        console.log(src_path);
        if (status === 'm') {
            await cp(src_path, dist_path);
        } else {
            await rm(dist_path);
        }
    }

    write(commit_json, JSON.stringify({ last_commit: commit }));
}

type ChangeItem = {
    file_path: string;
    status: 'm' | 'd';
};
async function getChangeFiles(src: string, last_commit: string) {
    const changes_str = (await execArr(`git diff --name-only ${last_commit} `, {
        path: src,
    })) as string;
    const all_files_str = (await execArr(`git ls-files`, {
        path: src,
    })) as string;
    const all_files = all_files_str.split('\n');
    const change_files = changes_str.split('\n');

    const result: ChangeItem[] = [];

    for (const file of change_files) {
        if (file === '') {
            continue;
        }
        if (all_files.indexOf(file) !== -1) {
            result.push({
                file_path: file,
                status: 'm',
            });
        } else {
            result.push({
                file_path: file,
                status: 'd',
            });
        }
    }

    return result;
}
