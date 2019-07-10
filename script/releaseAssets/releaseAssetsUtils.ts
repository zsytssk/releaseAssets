import * as path from 'path';
import { exclude_files, include, project_folder } from '../const';
import { calcClosestDepth } from '../ls/pathUtil';

export async function isExcludeFile(ori_file: string): Promise<boolean> {
    ori_file = path.resolve(project_folder, ori_file);
    for (let item of exclude_files) {
        item = path.resolve(project_folder, item);
        if (calcClosestDepth(ori_file, item) > -1) {
            return true;
        }
    }

    return false;
}

export async function isIncludeFile(ori_file: string): Promise<boolean> {
    ori_file = path.resolve(project_folder, ori_file);
    for (let item of include) {
        item = path.resolve(project_folder, item);
        if (calcClosestDepth(ori_file, item) > -1) {
            return true;
        }
    }

    return false;
}

export function isScriptFile(ori_file: string) {
    if (ori_file.match(/(\.ts|\.js)$/)) {
        return true;
    }
    return false;
}
export function isUIFile(ori_file: string) {
    if (ori_file.match(/^laya\/pages\//)) {
        return true;
    }
    return false;
}

export function isSame(p1: string | string[], p2: string | string[]) {
    if (typeof p1 === 'string') {
        return p1 === p2;
    }

    if (p1.length !== p2.length) {
        return false;
    }

    for (const [index, item] of p1.entries()) {
        if (item !== p2[index]) {
            return false;
        }
    }
    return true;
}
