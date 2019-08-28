import { cp } from '../script/main';

export async function releaseEcs() {
    const src = `D:\\zsytssk\\github\\airplane-laya\\libs\\ecs`;
    const dist = `Z:\\libs\\ecs`;
    await cp(src, dist);
}
export async function synBackEcs() {
    const src = `D:\\zsytssk\\github\\airplane-laya\\libs\\ecs`;
    const dist = `Z:\\libs\\ecs`;
    await cp(dist, src);
}
