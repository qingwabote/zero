## game.js

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
      "gfx-common": "./gfx-common/index.js",
      gfx: "./gfx/index.js",
      loader: "./loader/index.js",
      phys: "./phys/index.js",
      boot: "./boot/index.js",
      "engine-main": "./engine-main/index.js",
      yaml: "./yaml.js",
      "@esotericsoftware/spine-core": "./spine-core.js",
    },
  }
);

System.import("./index.js");
```
