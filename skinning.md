```plantuml
!option handwritten true
Zero -> Pipeline: batch
Pipeline -> ModelPhase: batch
ModelPhase -> SkinnedModel: upload
SkinnedModel -> SkinInstance: update
SkinInstance -> JointStore: add

Zero -> SkinnedMeshRenderer: upload
SkinnedMeshRenderer -> JointStore: upload
```

## GPU Skinning (Vertex Shader Skinning)
在 CPU 上计算骨骼变换矩阵，每帧更新到 GPU 进行顶点变换

## Skin Baking
实时变换与烘焙的实现在 shader 中走同样的 code path 即通过 offset 在骨骼变换纹理中访问指定帧的数据，区别在于实时变换时 offset 总是 0.

## GPU Instancing
试想渲染同一个人物模型的两个实例，每个人物模型由三个网格组成（头、躯干、退）。需要三个批次，每个批次分别渲染两个头、两个躯干、两个腿。每个批次需要上传两套动画（骨骼），这两套动画在三个批次中共享。