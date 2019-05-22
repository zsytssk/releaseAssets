import * as path from 'path';
import { bin, binJs, laya_assets, project_folder, target_folder, laya_pages } from './const';
import { exists, lstat } from './ls/asyncUtil';
import { execArr } from './ls/exec';
import { cp } from './ls/main';

/** 图片 bin */
export async function releaseAssets(commit?: string) {
    const files = await findChangeFiles(commit);
    if (!files) {
        console.log(`cant find change files!`);
        return;
    }

    for (const file of files) {
        const ori_file = path.resolve(project_folder, file);
        const dist_file = path.resolve(target_folder, file).replace('bin\\', '');
        cp(ori_file, dist_file).then(() => {
            console.log(`complete copy ${ori_file} => ${dist_file}`);
        });
    }
}
export async function findChangeFiles(commit?: string) {
    commit = commit || '';
    const files_str = (await execArr(`git diff --name-only ${commit}`, { path: project_folder })) as string;
    if (!files_str) {
        return;
    }
    const files = files_str.split('\n');
    /** 删除最后一个 */
    files.pop();
    let result = [];
    for (const file of files) {
        try {
            const target = await findTargetFile(file);
            if (Array.isArray(target)) {
                result = result.concat(target);
            } else {
                result.push(target);
            }
        } catch (err) {
            console.error(err);
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
