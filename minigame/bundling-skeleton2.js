System.register(['assets'], (function (exports) {
    'use strict';
    var Bundle;
    return {
        setters: [function (module) {
            Bundle = module.Bundle;
        }],
        execute: (function () {

            const bundle = exports('bundle', new Bundle("dist/subpackages/projects/skeleton2/assets"));

        })
    };
}));