# create visual studio project

```ps
cd native\platforms\win
cmake -G "Visual Studio 17 2022" -A x64 -S . -B build
```

# create bootstrap.json

C:\Users\name\AppData\Roaming\zero\bootstrap.json

```json
{
  "project": "/storage/emulated/0/Android/data/org.libsdl.app/files/projects/test/",
  "app": "script/platforms/jsb/dist/projects/test/script/main/App.js"
}
```

# glslang

-DENABLE_HLSL=0 -DENABLE_SPVREMAPPER=0
