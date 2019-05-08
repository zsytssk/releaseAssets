import * as path from 'path';
import * as config from './configPath.json';

export const SRC = path.resolve(config.src_folder);
// export const SRC = './src';
export const DIST = './dist';
export const ignore_files = config.ignore_files;
