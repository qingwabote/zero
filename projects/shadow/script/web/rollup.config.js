import alias from '@rollup/plugin-alias';
import { readFileSync } from 'fs';

const entries = JSON.parse(readFileSync('imports.json'));

export default {
    input: 'dist/web/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'es'
    },
    plugins: [
        alias({ entries })
    ]
};