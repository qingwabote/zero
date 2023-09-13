## game.js

```js
require("s.js");

const zero = globalThis.zero || (globalThis.zero = {});
zero.project_path = "projects/shadow";

System.initialize(
  "Fake:/projects/shadow/script/",
  function (url) {
    require(url.substring("Fake:/".length));
  },
  {
    imports: {
      "gfx-main": "./gfx-main/index.js",
      "gfx-webgl": "./gfx-webgl/index.js",
      "engine-main": "./engine-main/index.js",
      "engine-wx": "./engine-wx/index.js",
      main: "./main/index.js",
      yaml: "./yaml.js",
      "@esotericsoftware/spine-core": "./spine-core.js",
    },
  }
);

System.import("./index.js");
```
