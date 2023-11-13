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
            "skeleton": "./dist/subpackages/projects/skeleton/script/index.js",
        },
        scopes: {
            "./dist/splash/": {
                "bundling": "./bundling-splash.js"
            },
            "./dist/subpackages/engine/": {
                "bundling": "./bundling-engine.js"
            },
            "./dist/subpackages/projects/skeleton/": {
                "bundling": "./bundling-skeleton.js"
            }
        }
    }
);

System.import('splash');

async function loadSubpackage(name) {
    return new Promise((res, rej) => {
        wx.loadSubpackage({
            name,
            success: function () {
                console.log(`load ${name} success`);
                res();
            },
            fail: function () {
                rej(`load ${name} fail`);
            }
        })
    })
}

Promise.all([loadSubpackage('engine'), loadSubpackage('spine'), loadSubpackage('skeleton')]).then(() => {
    System.import('skeleton')
})

// loadTask.onProgressUpdate(res => {
//     console.log('下载进度', res.progress)
//     console.log('已经下载的数据长度', res.totalBytesWritten)
//     console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
// })