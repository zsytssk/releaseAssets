import * as path from 'path';
import {
    bin,
    binJs,
    commit_map,
    exclude_files,
    laya_assets,
    laya_pages,
    project_folder,
    target_folder,
} from './const';
import { exists } from './ls/asyncUtil';
import { execArr } from './ls/exec';
import { calcClosestDepth } from './ls/pathUtil';
import { write } from './ls/write';
import { multiCopy } from './utils';

/** 图片 bin */
export async function releaseAssets(commit?: string) {
    const cur_branch = await getCurBranch();
    if (!commit_map[cur_branch]) {
        commit_map[cur_branch] = [];
    }
    commit = commit_map[cur_branch][commit] || commit;
    const files = await getChangeFilesSince(commit);
    if (!files) {
        console.log(`cant find change files!`);
        return;
    }
    saveCommit(cur_branch);
    const list: string[][] = [];
    for (const file of files) {
        const ori_file = path.resolve(project_folder, file);
        const dist_file = path
            .resolve(target_folder, file)
            .replace('bin\\', '');
        list.push([ori_file, dist_file]);
    }
    multiCopy(list, 8);
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
        path.resolve('./script/commit.json'),
        JSON.stringify({
            commit: {
                ...commit_map,
                [cur_branch]: new_list,
            },
        }),
    );
}
async function getChangeFilesSince(commit?: string) {
    commit = commit || '';

    let files_str: string;
    if (commit) {
        files_str = (await execArr(`git diff --name-only ${commit}`, {
            path: project_folder,
        })) as string;
    } else {
        files_str = (await execArr(`git ls-tree --name-only -r head`, {
            path: project_folder,
        })) as string;
    }

    if (!files_str) {
        return;
    }

    const files = files_str.split('\n');
    /** 删除最后一个 */
    files.pop();
    let result = [];
    for (const file of files) {
        if (await isExcludeFile(file)) {
            continue;
        }
        try {
            const target = await findTargetFile(file);
            if (Array.isArray(target)) {
                result = result.concat(target);
            } else {
                result.push(target);
            }
        } catch (err) {
            console.log(err);
        }
    }
    result = result.filter((item, index) => {
        return result.indexOf(item) === index;
    });
    return result;
}
async function findTargetFile(ori_file: string) {
    // 目标文件名 == 源文件名 ||  合并
    const bin_file = await findBinFile(ori_file);
    if (bin_file) {
        return bin_file;
    }

    // js + ui
    if (isScriptFile(ori_file) || isUIFile(ori_file)) {
        return [binJs];
    }
    if (isScriptFile(ori_file) || isUIFile(ori_file)) {
        return [binJs];
    }

    throw new Error(`cant find target file for ${ori_file}`);
}

function isScriptFile(ori_file: string) {
    if (ori_file.match(/(\.ts|\.js)$/)) {
        return true;
    }
    return false;
}
function isUIFile(ori_file: string) {
    if (ori_file.match(/^laya\/pages\//)) {
        return true;
    }
    return false;
}
async function findBinFile(ori_file: string): Promise<string | string[]> {
    /** bin 文件夹中存在的文件 */
    if (ori_file.indexOf(`${bin}/`) === 0) {
        if (await exists(path.resolve(project_folder, ori_file))) {
            return ori_file;
        }
    }

    /** laya/assets  中直接copy到 bin 文件 */
    if (ori_file.indexOf(laya_assets) === 0) {
        const assets_file = ori_file.replace(laya_assets, bin);
        if (await exists(path.resolve(project_folder, assets_file))) {
            return assets_file;
        }
    }
    /** laya/pages  中直接copy到 bin 文件 */
    if (ori_file.indexOf(laya_pages) === 0) {
        const pages_file = ori_file.replace(laya_pages, bin);
        if (await exists(path.resolve(project_folder, pages_file))) {
            return pages_file;
        }
    }

    const bin_folder = path.dirname(ori_file.replace(laya_assets, bin));
    const assets_atlas = `${bin_folder}.atlas`;
    const assets_json = `${bin_folder}.json`;
    const assets_png = `${bin_folder}.png`;

    if (await exists(path.resolve(project_folder, assets_json))) {
        return [assets_json, assets_png];
    }
    if (await exists(path.resolve(project_folder, assets_atlas))) {
        return [assets_atlas, assets_png];
    }
}

async function isExcludeFile(ori_file: string): Promise<boolean> {
    ori_file = path.resolve(project_folder, ori_file);
    for (let item of exclude_files) {
        item = path.resolve(project_folder, item);
        if (calcClosestDepth(ori_file, item) > -1) {
            return true;
        }
    }

    return false;
}
