import { releaseAssets } from './releaseAssets';

const [type, commit] = process.argv.slice(2);

async function main() {
    const actions = {
        releaseAssets,
    };
    if (actions[type]) {
        await actions[type](commit);
    }
}
main();
