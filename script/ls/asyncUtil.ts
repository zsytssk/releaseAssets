import * as fs from 'fs';

export function readdir(dir): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, file_list) => {
            if (err) {
                return reject(err);
            }
            resolve(file_list);
        });
    });
}
export async function readFile(file_path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(file_path, 'utf8', (err, file_str: string) => {
            if (err) {
                return reject(err);
            }
            resolve(file_str);
        });
    });
}

export function exists(path) {
    return new Promise((resolve, reject) => {
        fs.exists(path, exist => {
            resolve(exist);
        });
    });
}
export function lstat(path): Promise<fs.Stats> {
    return new Promise((resolve, reject) => {
        fs.lstat(path, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
}

export function rmdir(path) {
    return new Promise((resolve, reject) => {
        fs.rmdir(path, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
export function unlink(path) {
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

export function mkdir(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, e => {
            if (!e || (e && e.code === 'EEXIST')) {
                resolve();
            } else {
                resolve();
            }
        });
    });
}
export function isClosest(path: string, parent: string) {
    path.normalize(path);
    console.log('TCL: isClosest -> path.normalize(path)', path.normalize(path));
}

export function sleep(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
