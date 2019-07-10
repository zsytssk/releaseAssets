import * as path from 'path';
import { bin, binJs, laya_assets, laya_pages, project_folder } from '../const';
import { exists } from '../ls/asyncUtil';
import { execArr } from '../ls/exec';
import {
    isExcludeFile,
    isIncludeFile,
    isSame,
    isScriptFile,
    isUIFile,
} from './releaseAssetsUtils';

type FileItem = {
    target: string[];
    source: string[];
    is_same: boolean;
};
export async function getChangeFilesSince(
    commit?: string,
): Promise<FileItem[]> {
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
    const change_arr = [] as FileItem[];
    for (const file of files) {
        if (!(await isIncludeFile(file))) {
            continue;
        }
        if (await isExcludeFile(file)) {
            continue;
        }
        try {
            const target = await findTargetFile(file);
            change_arr.push(target);
        } catch (err) {
            console.error(err);
        }
    }
    /** 合并图集文件 */
    for (let len = change_arr.length, i = len - 1; i >= 0; i--) {
        const cur_item = change_arr[i];
        const same_item = change_arr.find(item => {
            return isSame(cur_item.target, item.target);
        });

        if (same_item && same_item !== cur_item) {
            change_arr.splice(i, 1);
            same_item.source = [...same_item.source, ...cur_item.source];
        }
    }
    const need_update = 'bin\\fileconfig.json';

    change_arr.push({
        is_same: true,
        source: [need_update],
        target: [need_update],
    });

    return change_arr;
}
async function findTargetFile(ori_file: string): Promise<FileItem> {
    // 目标文件名 == 源文件名 ||  合并
    const bin_file = await findBinFile(ori_file);
    if (bin_file) {
        return bin_file;
    }

    // js + ui
    if (isScriptFile(ori_file) || isUIFile(ori_file)) {
        return {
            is_same: false,
            source: [ori_file],
            target: [binJs],
        };
    }

    throw new Error(`cant find target file for ${ori_file}`);
}

async function findBinFile(ori_file: string): Promise<FileItem> {
    /** bin 文件夹中存在的文件 */
    if (ori_file.indexOf(`${bin}/`) === 0) {
        if (await exists(path.resolve(project_folder, ori_file))) {
            return {
                is_same: true,
                source: [ori_file],
                target: [ori_file],
            };
        }
    }

    /** laya/assets 中直接copy到 bin 文件 */
    if (ori_file.indexOf(laya_assets) === 0) {
        const assets_file = ori_file.replace(laya_assets, bin);
        if (await exists(path.resolve(project_folder, assets_file))) {
            return {
                is_same: true,
                source: [ori_file],
                target: [assets_file],
            };
        }
    }

    /** laya/pages 中直接copy到 bin 文件 */
    if (ori_file.indexOf(laya_pages) === 0) {
        const pages_file = ori_file.replace(laya_pages, bin);
        if (await exists(path.resolve(project_folder, pages_file))) {
            return {
                is_same: true,
                source: [ori_file],
                target: [pages_file],
            };
        }
    }

    const bin_folder = path.dirname(ori_file.replace(laya_assets, bin));
    const assets_atlas = `${bin_folder}.atlas`;
    const assets_json = `${bin_folder}.json`;
    const assets_png = `${bin_folder}.png`;

    if (await exists(path.resolve(project_folder, assets_json))) {
        return {
            is_same: false,
            source: [ori_file],
            target: [assets_json, assets_png],
        };
    }
    if (await exists(path.resolve(project_folder, assets_atlas))) {
        return {
            is_same: false,
            source: [ori_file],
            target: [assets_atlas, assets_png],
        };
    }
}
