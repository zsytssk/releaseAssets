import * as path from 'path';
import { readdir } from '../script/asyncUtil';
import { cp } from '../script/main';

const src = 'D:\\zsytssk\\job\\legend\\svn\\设计稿\\动画\\npc';
const dist = 'Z:\\dlc\\npc';

export async function copyNpc() {
    const folders = await readdir(src);
    for (const folder of folders) {
        const name = getNotCnStr(folder);
        const src_folder = path.join(src, folder);
        const dist_folder = path.join(dist, name, '0');
        await cp(src_folder, dist_folder);
    }
}

export function getNotCnStr(str: string) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (isCnChar(char)) {
            break;
        }
        result += char;
    }

    return result;
}
export function isCnChar(char: string) {
    return char.match(/[^\x00-\xff]/);
}
