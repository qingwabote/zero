declare const System: any;
declare const require: any;

import "systemjs";

System.initialize(
    'C:/Users/qingwabote/Documents/zero/projects/shadow/script/jsb-systemjs/dist/',
    function (url: string) { require(url) },
    {
        "imports": {
            "gfx-main": "./gfx-main/index.js",
            "engine-main": "./engine-main/index.js",
            "engine-jsb": "./engine-jsb/index.js",
            "main": "./main/index.js",
            "yaml": "./yaml.js",
            "@esotericsoftware/spine-core": "./spine-core.js"
        }
    }
);

(async function () {
    const engine = await System.import('engine-jsb');
    const main = await System.import('main');
    engine.run(main.App)
})()


