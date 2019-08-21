import * as path from 'path';
import { project_folder, target_folder } from '../const';
import { readFile } from '../script/asyncUtil';
import { write } from '../script/write';
import { replaceReg } from './replaceReg';

let version_json: any;
export async function writeVersion() {
    const index_html = path.resolve(target_folder, 'index.html');
    const index_js = path.resolve(target_folder, 'index.js');

    const version_path = path.resolve(target_folder, 'release/sgGlory.json');

    const index_html_str = await readFile(index_html);
    const index_js_str = await readFile(index_js);
    version_json = JSON.parse(await readFile(version_path));
    const new_index_html_str = replaceReg(
        index_html_str,
        /(var CDN_VERSION = [^\;]+;)/g,
        `var CDN_VERSION = '${timeVersion()}';`,
    );
    const new_index_js_str = replaceReg(
        index_js_str,
        /loadLib\(('|")(([^\?\'\"]+)\?[^\'\"]+)('|")\)/g,
        (match: RegExpExecArray) => {
            const file = match[3];
            const version = getVersion(file);
            console.log(file, version);
            return `loadLib('${file}?v=${version}')`;
        },
    );
    await write(index_html, new_index_html_str);
    await write(index_js, new_index_js_str);
}

function timeVersion() {
    const now = new Date();
    const year = format(now.getFullYear());
    const month = format(now.getMonth() + 1);
    const day = format(now.getUTCDate());
    const hour = format(now.getHours());
    const minutes = format(now.getMinutes());
    const second = format(now.getSeconds());
    return `${year}${month}${day}${hour}${minutes}${second}`;
}

function format(time: number) {
    if (time >= 10) {
        return time + '';
    } else {
        return '0' + time;
    }
}

function getVersion(key: string) {
    if (version_json[key]) {
        return version_json[key].version;
    }

    return '';
}
