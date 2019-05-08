import * as nodeXlsx from 'node-xlsx';
import * as path from 'path';
import { DIST } from '../config';
import { write } from '../ls/write';
import { stringify } from '../utils/util';
import { calcType, convertType, ItemType } from './type';

// import * as xlsx from 'xlsx';
type XlsxInfo = {
    info: {
        title: string[];
        zh_title: string[];
        type: ItemType[];
    };
    data: {
        [key: string]: any;
    };
};
export async function genXlsx(file: string) {
    const result = { data: {}, info: {} } as XlsxInfo;
    const file_name = fileName(file);
    const xlsx_content = nodeXlsx.parse(file);
    const [title, type_str_arr, zh_title, ...data] = xlsx_content[0].data;
    const type_arr = calcType(type_str_arr);
    result.info = {
        title,
        type: type_str_arr,
        zh_title,
    };

    const is_arr = detectIsArr(data);
    for (const row of data) {
        const item_info = {};
        if (row.length === 0) {
            continue;
        }
        for (let k = 0; k < title.length; k++) {
            item_info[title[k]] = convertType(row[k], type_arr[k]);
        }
        if (!is_arr) {
            result.data[row[0]] = item_info;
            continue;
        }
        /** 如果是数组就push到Array中... */
        if (!result.data[row[0]]) {
            result.data[row[0]] = [];
        }
        result.data[row[0]].push(item_info);
    }
    const dist_path = path.resolve(DIST, `${file_name}.json`);
    return write(dist_path, stringify(result, 2));
}

export function fileName(file_path: string) {
    const extension = path.extname(file_path);
    return path.basename(file_path, extension);
}
/** 存在item的第一个值相同 就是数组 */
function detectIsArr(data: any[]) {
    for (let i = 0; i < data.length; i++) {
        const cur_item = data[i];
        const index = data.findIndex(item => {
            return item[0] !== undefined && item[0] === cur_item[0];
        });
        if (index !== -1 && index !== i) {
            return true;
        }
    }
    return false;
}
