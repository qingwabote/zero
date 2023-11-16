require('s.js');

System.initialize(
    `Fake:/`,
    function (url) { require(url.substring('Fake:/'.length)) },
    {
        imports: {
            "gfx-common": "./dist/gfx-common/index.js",
            "gfx": "./dist/gfx/index.js",
            "boot": "./dist/boot/index.js",
            "assets": "./dist/assets/index.js",
            "splash": "./dist/splash/script/index.js",
            "yaml": "./dist/subpackages/engine/yaml.js",
            "engine": "./dist/subpackages/engine/script/index.js",
            "@esotericsoftware/spine-core": "./dist/subpackages/spine/spine-core.js",
            "spine": "./dist/subpackages/spine/index.js",
            "navigation": "./dist/subpackages/projects/navigation/script/index.js",
            "animation": "./dist/subpackages/projects/animation/script/index.js",
            "shadow": "./dist/subpackages/projects/shadow/script/index.js",
            "skin": "./dist/subpackages/projects/skin/script/index.js",
            "skeleton": "./dist/subpackages/projects/skeleton/script/index.js",
            "cutting2d": "./dist/subpackages/projects/cutting2d/script/index.js"
        },
        scopes: {
            "./dist/splash/": {
                "bundling": "./bundling-splash.js"
            },
            "./dist/subpackages/engine/": {
                "bundling": "./bundling-engine.js"
            },
            "./dist/subpackages/projects/animation/": {
                "bundling": "./bundling-animation.js"
            },
            "./dist/subpackages/projects/shadow/": {
                "bundling": "./bundling-shadow.js"
            },
            "./dist/subpackages/projects/skin/": {
                "bundling": "./bundling-skin.js"
            },
            "./dist/subpackages/projects/skeleton/": {
                "bundling": "./bundling-skeleton.js"
            }
        }
    }
);

System.import('splash');

(async function () {
    const boot = await System.import('boot');
    await Promise.all([boot.loadBundle('engine'), boot.loadBundle('navigation')]);
    System.import('navigation')
})()