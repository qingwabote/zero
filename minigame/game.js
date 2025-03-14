wx.onError(function (e) {
    wx.showModal({ title: 'wx.onError', content: e.message + '\n' + e.stack });
});
wx.onUnhandledRejection(function ({ reason }) {
    const t = typeof reason;
    switch (t) {
        case 'object':
            wx.showModal({ title: 'wx.onUnhandledRejection', content: reason.message + '\n' + reason.stack });
            break;
        case 'string':
            wx.showModal({ title: 'wx.onUnhandledRejection', content: reason });
            break;
        default:
            wx.showModal({ title: 'wx.onUnhandledRejection', content: 'unsupported reason type' });
            break;
    }
});

// https://developers.weixin.qq.com/community/minigame/doc/000e400c7f0020bfd2b1f57c766c00
new Promise(() => {
    require('s.js');

    System.addImportMap({
        imports: {
            "gfx-common": "./dist/gfx-common/index.js",
            "gfx": "./dist/gfx/index.js",
            "boot": "./dist/boot/index.js",
            "assets": "./dist/assets/index.js",
            "splash": "./dist/splash/script/index.js",
            "yaml": "./dist/subpackages/engine/yaml.js",
            "bastard": "./dist/subpackages/engine/bastard/index.js",
            "engine": "./dist/subpackages/engine/script/index.js",
            "puttyknife": "./dist/subpackages/engine/puttyknife/index.js",
            "yoga": "./dist/subpackages/engine/flex/yoga/script/index.js",
            "flex": "./dist/subpackages/engine/flex/script/index.js",
            "@esotericsoftware/spine-core": "./dist/subpackages/spine/spine-core.js",
            "spine": "./dist/subpackages/spine/index.js",
            "spi": "./dist/subpackages/spine/spi/script/index.js",
            "spine": "./dist/subpackages/spine/script/index.js",
            "phys": "./dist/subpackages/physics/phys/script/index.js",
            "physics": "./dist/subpackages/physics/index.js",
            "navigation": "./dist/subpackages/projects/navigation/script/index.js",
            "animation": "./dist/subpackages/projects/animation/script/index.js",
            "shadow": "./dist/subpackages/projects/shadow/script/index.js",
            "skin": "./dist/subpackages/projects/skin/script/index.js",
            "skeleton": "./dist/subpackages/projects/skeleton/script/index.js",
            "vehicle": "./dist/subpackages/projects/vehicle/script/index.js",
            "cutting2d": "./dist/subpackages/projects/cutting2d/script/index.js",
            "instancing": "./dist/subpackages/projects/instancing/script/index.js"
        },
        scopes: {
            "./dist/splash/": {
                "bundling": "./bundling-splash.js"
            },
            "./dist/subpackages/engine/": {
                "bundling": "./bundling-engine.js"
            },
            "./dist/subpackages/engine/flex/yoga/": {
                "bundling": "./bundling-yoga.js"
            },
            "./dist/subpackages/spine/spi/": {
                "bundling": "./bundling-spi.js"
            },
            "./dist/subpackages/physics/phys/": {
                "bundling": "./bundling-phys.js"
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
            },
            "./dist/subpackages/projects/instancing/": {
                "bundling": "./bundling-instancing.js"
            }
        }
    }, 'Fake://')

    System.constructor.prototype.instantiate = function (url) {
        return new Promise(function (resolve, reject) {
            require(url.substring('Fake://'.length));
            const register = System.getRegister(url);
            resolve(register)
        })
    };

    (async function () {
        const boot = await System.import('boot');
        await System.import('splash');
        await Promise.all([boot.loadBundle('engine'), boot.loadBundle('physics'), boot.loadBundle('vehicle')]);
        System.import('vehicle')
    })()
})