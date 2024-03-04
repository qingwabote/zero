# 微信小游戏自身的环境

## CMD 模块

微信小游戏目前**没有**提供对**原生 ES 模块**的支持。

_如果在微信开发者工具中关闭“将 JS 编译成 ES5”，原生 ES 模块将引发错误"SyntaxError: Unexpected token 'export'", "Cannot use import statement outside a module"_

微信开发者工具编译 js 源码时无差别注入 CMD API，即便源码已经是 CMD 模块。结果像这样

```js
define("foo.js", function (require, module, exports) {
  define("foo.js", function (require, module, exports) {
    console.log("foo");
  });
});
```

据此猜测工具编译的过程是将 js 源码无差别编译为 **CommonJS**，然后将结果首尾注入 CMD API.

_[CMD](https://github.com/cmdjs/specification/blob/master/draft/module.md)_

## npm-package or import-maps

我猜测微信对 npm-package 的支持是基于 import-maps 实现的，但并没有暴露 import-maps 给开发者使用。

# Zero 引擎的适配方案

## SystemJs 模块

引擎中使用了 **TLA(Top-level await)**, 微信没有提供解决方案。引擎将输出 SystemJs 给开发者工具，利用 SystemJs 实现对 TLA 和 import-maps 的支持，但这也付出了一些成本：

Systemjs 官方支持 web 和 node 环境，微信小游戏平台则需要修改源码来适配。由于使用的是第三方模块，自然要损失一些原生模块的功能，比如微信开发者工具提供的**代码依赖分析**(不过这个工能并不能帮助开发者工具在打包时做自动裁剪，因为开发者工具目前并没有做**摇树**)

另外 Systemjs 的 TLA 还存在 [Bug](https://github.com/systemjs/systemjs/pull/2402)

[引擎中解决了这些问题](s.js)

## game.js 示例

```js
require("s.js");

const PROJECT = "spine";

globalThis.loader = { currentPath: `projects/${PROJECT}` };

System.initialize(
  `Fake:/projects/${PROJECT}/script/`,
  function (url) {
    require(url.substring("Fake:/".length));
  },
  {
    imports: {
      yaml: "./yaml.js",
      "@esotericsoftware/spine-core": "./spine-core.js",
      "gfx-common": "./gfx-common/index.js",
      gfx: "./gfx/index.js",
      loader: "./loader/index.js",
      phys: "./phys/index.js",
      boot: "./boot/index.js",
      engine: "./engine/index.js",
      spine: "./spine/index.js",
    },
  }
);

System.import("./index.js");
```
