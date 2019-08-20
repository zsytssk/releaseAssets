import * as http from 'http';
import { target_folder } from '../const';
import { excuse } from '../script/exec';

/* 提交目标仓库 */
export async function genVersion() {
    const msg = 'updateVersion';

    const branch = await excuse('git rev-parse --abbrev-ref HEAD', {
        path: target_folder,
    });
    const username = await excuse('git config user.name', {
        path: target_folder,
    });

    return new Promise((resolve, reject) => {
        const url = `http://10.189.12.49/tool/?act=pack&st=doPack&outJson=1&username=${username}&branch=${branch}&msg=${msg}&gameName=sgGlory`;
        console.log('genVersion:>', url);
        const request = http.get(url, res => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error: string;
            if (statusCode !== 200) {
                error = '请求失败\n' + `状态码: ${statusCode}`;
            } else if (!/^application\/json/.test(contentType)) {
                error =
                    '无效的 content-type.\n' +
                    `期望的是 application/json 但接收到的是 ${contentType}`;
            }
            if (error) {
                // 消费响应数据来释放内存。
                res.resume();
                reject(error);
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', chunk => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    if (
                        parsedData.code === 0 ||
                        (parsedData.code === -1 &&
                            parsedData.msg.indexOf('分支没有任何改动') > -1)
                    ) {
                        resolve(parsedData);
                    } else {
                        reject(`出现错误: ${parsedData}`);
                    }
                } catch (e) {
                    reject(`出现错误: ${e.message}`);
                }
            });
        });
        request.on('timeout', () => {
            request.abort();
            reject(`genVersion timeout`);
        });
        request.on('error', () => {
            request.abort();
            reject(`genVersion error`);
        });
    });
}
