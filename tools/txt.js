import { readdirSync, renameSync } from 'fs';
import { extname, join } from 'path';

function compareVersion(v1, v2) {
    const v1_nums = v1.split('.');
    const v2_nums = v2.split('.');
    for (let i = 0; i < 3; i++) {
        const x = parseInt(v1_nums[i]);
        const y = parseInt(v2_nums[i]);
        if (x > y) {
            return 1
        }
        if (x < y) {
            return -1;
        }
    }
    return 0;
}

const V = '20.1.0';

if (compareVersion(V, process.versions.node) == 1) {
    throw new Error(`need node version >= ${V}`);
}

const extensions = ['.fs', '.vs', '.chunk', '.yml'];

const args = process.argv.slice(2);

for (const dirent of readdirSync(args[0], { withFileTypes: true, recursive: true })) {
    if (!dirent.isFile()) {
        continue;
    }

    if (extensions.includes(extname(dirent.name))) {
        const fullName = join(dirent.path, dirent.name)
        renameSync(fullName, fullName + '.txt');
        console.log(fullName);
    }
}