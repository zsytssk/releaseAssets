import { readFile } from './script/asyncUtil';

export let project_folder;
export let bin;
export let laya_assets;
export let laya_pages;
export let binJs;
export let target_folder;
export let exclude_files;
export let commit_map;
export let commit_path;
export let include;

export async function intConfig(config_path: string, _commit_path: string) {
    const config_raw = await readFile(config_path);
    const commit_raw = await readFile(_commit_path);
    const config = JSON.parse(config_raw);
    const commit = JSON.parse(commit_raw);

    commit_path = _commit_path;
    project_folder = config.project_folder;
    bin = config.bin;
    laya_assets = config.laya_assets;
    laya_pages = config.laya_pages;
    binJs = config.binJs;
    include = config.include;
    target_folder = config.target_folder;
    exclude_files = config.exclude;
    commit_map = commit.commit;
}
