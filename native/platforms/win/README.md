```ps
cd native\platforms\win
cmake -G "Visual Studio 17 2022" -A x64 -S . -B build
```

create a bootstrap.js in exe dir:

```js
// use "/" as path separator
export default {
  app: "c:/Users/qingwabote/Documents/zero/projects/triangle/script/platforms/jsb/dist/projects/triangle/script/main/App.js",
};
```
