# 使用 cmake 创建 visual studio 项目

```ps
cd native\platforms\win
cmake -G "Visual Studio 17 2022" -A x64 -S . -B build
```

# bootstrap.json

App 启动时读取此配置文件，将其放置于如下目录：

C:\Users\name\AppData\Roaming\zero\bootstrap.json

```json
{
  "root": "c:/Users/qingwabote/Documents/zero/",
  "project": "shadow",
  "script": "jsb"
}
```

# 控制台显示乱码？
勾选“使用 Unicode UTF-8 提供全球语言支持”

# glslang

-DENABLE_HLSL=0 -DENABLE_SPVREMAPPER=0
