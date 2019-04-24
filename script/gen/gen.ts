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
    const result = { info: {}, data: {} } as XlsxInfo;
    const file_name = fileName(file);
    const xlsx_content = nodeXlsx.parse(file);
    const [title, type_str_arr, zh_title, ...data] = xlsx_content[0].data;
    const type_arr = calcType(type_str_arr);
    result.info = {
        title,
        type: type_arr,
        zh_title,
    };

    for (let i = 3; i < data.length; i++) {
        const item_info = {};
        const row = data[i];
        if (row.length === 0) {
            continue;
        }
        for (let k = 0; k < title.length; k++) {
            item_info[title[k]] = convertType(row[k], type_arr[k]);
        }
        result.data[row[0]] = item_info;
    }
    const dist_path = path.resolve(DIST, `${file_name}.json`);
    return write(dist_path, stringify(result, 3));
}

export function fileName(file_path: string) {
    const extension = path.extname(file_path);
    return path.basename(file_path, extension);
}
