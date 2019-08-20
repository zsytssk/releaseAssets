import * as path from 'path';
import { bin, binJs, laya_assets, laya_pages, project_folder } from '../const';
import { exists, readFile } from '../script/asyncUtil';
import { execArr } from '../script/exec';
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
    status: ChangeStatus;
};
export async function getChangeFilesSince(
    commit?: string,
): Promise<FileItem[]> {
    commit = commit || '';

    const change_files = await getChangeFiles(project_folder, commit);
    const change_arr = [] as FileItem[];
    for (const change_item of change_files) {
        const { file_path: file } = change_item;
        if (!(await isIncludeFile(file))) {
            continue;
        }
        if (await isExcludeFile(file)) {
            continue;
        }
        try {
            const target = await findTargetFile(change_item);
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
        status: 'm',
        is_same: true,
        source: [need_update],
        target: [need_update],
    });

    return change_arr;
}
async function findTargetFile(change_item: ChangeItem): Promise<FileItem> {
    const { file_path } = change_item;
    // 目标文件名 == 源文件名 ||  合并
    const bin_file = await findBinFile(change_item);
    if (bin_file) {
        return bin_file;
    }

    // js + ui
    if (isScriptFile(file_path) || isUIFile(file_path)) {
        return {
            status: 'm',
            is_same: false,
            source: [file_path],
            target: [binJs],
        };
    }

    throw new Error(`cant find target file for ${file_path}`);
}

async function findBinFile(change_item: ChangeItem): Promise<FileItem> {
    const { file_path, status } = change_item;
    /** bin 文件夹中存在的文件 */
    if (file_path.indexOf(`${bin}/`) === 0) {
        if (await exists(path.resolve(project_folder, file_path))) {
            return {
                status,
                is_same: true,
                source: [file_path],
                target: [file_path],
            };
        }
    }

    /** laya/assets 中直接copy到 bin 文件 */
    if (file_path.indexOf(laya_assets) === 0) {
        const assets_file = file_path.replace(laya_assets, bin);
        if (await exists(path.resolve(project_folder, assets_file))) {
            return {
                status,
                is_same: true,
                source: [file_path],
                target: [assets_file],
            };
        }
    }

    /** laya/pages 中直接copy到 bin 文件 */
    if (file_path.indexOf(laya_pages) === 0) {
        const pages_file = file_path.replace(laya_pages, bin);
        if (await exists(path.resolve(project_folder, pages_file))) {
            return {
                status,
                is_same: false,
                source: [file_path],
                target: [pages_file],
            };
        }
    }

    const bin_folder = path.dirname(file_path.replace(laya_assets, bin));
    const assets_atlas = `${bin_folder}.atlas`;
    const assets_json = `${bin_folder}.json`;

    let atlas: string;
    let atlas_path: string;
    if (await exists(path.resolve(project_folder, assets_json))) {
        atlas = assets_json;
        atlas_path = path.resolve(project_folder, assets_json);
    } else if (await exists(path.resolve(project_folder, assets_atlas))) {
        atlas = assets_atlas;
        atlas_path = path.resolve(project_folder, assets_atlas);
    } else {
        return;
    }

    /** 图片直接读取 图集文件中设置的图片 */
    const {
        meta: { image },
    } = JSON.parse(await readFile(atlas_path));
    const image_name = image.split(',');
    const image_list = [];
    for (const item of image_name) {
        const img_path = `${path.dirname(bin_folder)}/${item}`;
        image_list.push(img_path);
    }

    return {
        status: 'm',
        is_same: false,
        source: [file_path],
        target: [atlas, ...image_list],
    };
}

export type ChangeStatus = 'm' | 'd';
type ChangeItem = {
    file_path: string;
    status: ChangeStatus;
};
async function getChangeFiles(src: string, last_commit?: string) {
    let changes_str: string;
    if (last_commit) {
        changes_str = (await execArr(`git diff --name-only ${last_commit}`, {
            path: src,
        })) as string;
    } else {
        changes_str = (await execArr(`git ls-tree --name-only -r head`, {
            path: src,
        })) as string;
    }

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
