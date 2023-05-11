# create visual studio project

```ps
cd native\platforms\win
cmake -G "Visual Studio 17 2022" -A x64 -S . -B build
```

# create bootstrap.js

C:\Users\name\AppData\Roaming\zero\bootstrap.js

```js
// use "/" as path separator
export default {
  project: "c:/Users/qingwabote/Documents/zero/projects/animation/",
  app: "script/platforms/jsb/dist/projects/animation/script/main/App.js",
};
```

# glslang

-DENABLE_HLSL=0 -DENABLE_SPVREMAPPER=0
