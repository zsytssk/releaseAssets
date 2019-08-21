import * as path from 'path';
import { readdir } from '../script/asyncUtil';
import { cp } from '../script/main';

const img_src = 'D:\\zsytssk\\job\\legend\\svn\\设计稿\\原画\\npc对话用角色';
const img_dist = 'Z:\\laya\\assets\\res\\views\\ui_task_dialogbox';

const ani_src = 'D:\\zsytssk\\job\\legend\\svn\\设计稿\\动画\\npc';
const ani_dist = 'Z:\\dlc\\npc';

export async function copyNpc() {
    const ani_folders = await readdir(ani_src);
    for (const folder of ani_folders) {
        const name = getNotCnStr(folder);
        const src_folder = path.join(ani_src, folder);
        const dist_folder = path.join(ani_dist, name, '0');
        await cp(src_folder, dist_folder);
    }

    const img_files = await readdir(img_src);
    for (const file of img_files) {
        const name = getNotCnStr(file);
        const src_img = path.join(img_src, file);
        const dist_img = path.join(img_dist, `${name}.png`);
        await cp(src_img, dist_img);
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
