import * as path from 'path';
import {
    commit_map,
    commit_path,
    project_folder,
    target_folder,
} from '../const';
import { excuse, execArr } from '../script/exec';
import { write } from '../script/write';
import { genVersion } from '../tool/genVersion';
import { writeVersion } from '../tool/writeVersion';
import { ItemData, multiCopy } from '../utils';
import { getChangeFilesSince } from './findChangeFiles';

/** 图片 bin */
export async function releaseAssets(commit?: string, msg?: string) {
    const cur_branch = await getCurBranch();
    if (!commit_map[cur_branch]) {
        commit_map[cur_branch] = [];
    }
    commit = commit_map[cur_branch][commit] || commit;

    if (!isNaN(Number(commit))) {
        console.log(`maybe cant find index=${commit} in commit_map!`);
    }
    const files = await getChangeFilesSince(commit);
    if (!files) {
        console.log(`cant find change files!`);
        return;
    }
    saveCommit(cur_branch);
    const list: ItemData[] = [];
    for (const file_item of files) {
        const { target, source, is_same, status } = file_item;
        for (const [index, item] of target.entries()) {
            let ori_file = path.resolve(project_folder, item);
            if (is_same) {
                ori_file = path.resolve(project_folder, source[index]);
            }
            const dist_file = path
                .resolve(target_folder, item)
                .replace('bin\\', '');

            list.push([ori_file, dist_file, status]);
        }
    }
    await multiCopy(list, 8);
    await releaseRemote(msg);
}

async function getCurBranch() {
    let cur_branch = (await execArr(`git rev-parse --abbrev-ref HEAD`, {
        path: project_folder,
    })) as string;

    cur_branch = cur_branch.split('\n')[0];

    return cur_branch;
}
async function saveCommit(cur_branch: string) {
    let cur_commit = (await execArr(`git rev-parse --short HEAD`, {
        path: project_folder,
    })) as string;
    cur_commit = cur_commit.replace('\n', '');
    const commit_list = commit_map[cur_branch];
    /** 已经保存的commit不再继续添加 */
    if (commit_list.indexOf(cur_commit) !== -1) {
        return;
    }
    const new_list = commit_list.concat([]);
    new_list.unshift(cur_commit);
    await write(
        commit_path,
        JSON.stringify({
            commit: {
                ...commit_map,
                [cur_branch]: new_list,
            },
        }),
    );
}

/* 提交目标仓库 */
export async function releaseRemote(msg: string) {
    msg = msg || 'update';
    try {
        /* 提交修改文件 */
        await acpp(msg);
        /* 生成版本号 */
        const info = await genVersion();
        console.log(info);

        /** 拉取服务端最新的版本号 */
        await excuse(`git pull`, {
            path: target_folder,
            output: true,
        });

        /* 改写index.html + index.js 中版本号 */
        await writeVersion();

        /* 将上一步修改的文件提交 */
        await acpp(msg);
    } catch (err) {
        console.log(`fail`, err);
    }
}
/* 提交目标仓库 */
export async function acpp(msg: string) {
    console.log('git add .');
    await excuse(`git add .`, {
        path: target_folder,
        output: true,
    });

    console.log(`git commit -m "${msg}"`);
    await excuse(`git commit -m "${msg}"`, {
        path: target_folder,
        output: true,
    });

    console.log(`git pull`);
    await excuse(`git pull`, {
        path: target_folder,
        output: true,
    });

    console.log(`git push`);
    await excuse(`git push`, {
        path: target_folder,
        output: true,
    });
}
