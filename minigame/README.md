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
      yaml: "./yaml.js",
      "@esotericsoftware/spine-core": "./spine-core.js",
      "gfx-common": "./gfx-common/index.js",
      gfx: "./gfx/index.js",
      loader: "./loader/index.js",
      phys: "./phys/index.js",
      boot: "./boot/index.js",
      engine: "./engine/index.js",
    },
  }
);

System.import("./index.js");
```
