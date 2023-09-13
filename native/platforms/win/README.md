# create visual studio project

```ps
cd native\platforms\win
cmake -G "Visual Studio 17 2022" -A x64 -S . -B build
```

# create bootstrap.json

C:\Users\name\AppData\Roaming\zero\bootstrap.json

```json
{
  "root": "c:/Users/qingwabote/Documents/zero/",
  "project": "shadow",
  "script": "jsb"
}
```

# glslang

-DENABLE_HLSL=0 -DENABLE_SPVREMAPPER=0
