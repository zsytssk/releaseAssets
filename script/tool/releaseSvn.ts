import { walk } from '../script/walk';
import { cp } from '../script/main';

export async function releaseSvn() {
    const src = `D:\\zsytssk\\job\\legend\\svn\\`;
    const dist = `V:\\`;
    const ignore = ['.svn', '设计稿'];
    const path_list = await walk(src, ignore);
    for (const item of path_list) {
        if (ignore.indexOf(item) !== -1) {
            continue;
        }
        const dist_path = item.replace(src, dist);
        console.log(item, dist_path);
        await cp(item, dist_path);
    }
}
