# [微信小游戏原生 JS 模块](https://qingwabote.github.io/ink/#/js/minigame)

# Zero 引擎的模块适配方案

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
