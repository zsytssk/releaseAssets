import * as _ from 'lodash';

type AnyArr = any[];
type AnyObj = { [key: string]: any };
export function stringify(obj: any, deep?: number, indent = 1) {
    if (deep === 0 || deep < 0) {
        return jsonStringify(obj);
    }

    if (_.isArray(obj)) {
        return stringifyArray(obj, deep, indent);
    } else if (_.isObject(obj)) {
        return stringifyObject(obj, deep, indent);
    } else {
        return jsonStringify(obj);
    }
}

function stringifyArray(array: AnyArr, deep?: number, indent = 1) {
    if (deep === 0) {
        return jsonStringify(array);
    }

    let result = `[\n`;
    const tab = `  `;
    for (let i = 0; i < array.length; i++) {
        result += tab.repeat(indent);
        result += stringify(array[i], deep - 1, indent + 1);

        if (i !== array.length - 1) {
            result += `,`;
        }
        result += `\n`;
    }
    result += tab.repeat(indent - 1);
    result += `]`;
    return result;
}

function stringifyObject(obj: AnyObj, deep?: number, indent = 1) {
    if (deep === 0) {
        return jsonStringify(obj);
    }
    let result = `{\n`;
    const tab = `  `;
    indent = indent || 1;

    let keys = Object.keys(obj);
    keys = keys.filter(key => {
        return obj[key] !== undefined;
    });
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const item = obj[key];
        result += tab.repeat(indent);
        result += `"${key}": ${stringify(item, deep - 1, indent + 1)}`;

        if (i !== keys.length - 1) {
            result += `,`;
        }
        result += `\n`;
    }
    result += tab.repeat(indent - 1);
    result += `}`;

    return result;
}

function jsonStringify(o) {
    if (o === undefined) {
        o = null;
    }
    return JSON.stringify(o);
}

export function log(...params) {
    // tslint:disable-next-line:no-console
    console.log(...params);
}

export function setProps<T>(data: T, props: Partial<T>) {
    for (let key in props) {
        if (!props.hasOwnProperty(key)) {
            continue;
        }
        data[key] = props[key];
    }
}

export function getXArr(start, end) {
    // prettier-ignore
    // tslint:disable-next-line:max-line-length
    const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const result = [];
    let cur_prefix = '';
    let round = 0;
    let is_start = false;
    let is_end = false;
    while (true) {
        for (const key of keys) {
            const cur_key = cur_prefix + key;
            if (cur_key === start) {
                is_start = true;
            }
            if (is_start) {
                result.push(cur_key);
            }
            if (cur_key === end) {
                is_end = true;
                break;
            }
        }
        if (is_end) {
            break;
        }
        cur_prefix = keys[round];
        round++;
    }

    return result;
}
export function getYArr(start, end) {
    // prettier-ignore
    // tslint:disable-next-line:max-line-length
    const result = [];

    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
}
