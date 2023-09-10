import babel from '@rollup/plugin-babel';

export default {
    output: {
        format: 'system'
    },
    plugins: [babel({ babelHelpers: 'bundled' })]
};