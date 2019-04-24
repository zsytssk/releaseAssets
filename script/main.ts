import { genXlsx } from './gen/gen';
import { walkSrc } from './utils/walkSrc';

const type = process.argv.slice(2)[0];

async function gen() {
    const files_arr = await walkSrc();
    for (const file of files_arr) {
        await genXlsx(file);
    }
}

async function copy() {}

async function main() {
    const actions = {
        copy,
        gen,
    };
    if (actions[type]) {
        await actions[type]();
    }
}
main();
