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

## GPU Instancing
试想渲染同一个人物模型的两个实例，每个人物模型由三个网格组成（头、躯干、退）。需要三个批次，每个批次分别渲染两个头、两个躯干、两个腿。每个批次需要上传两套动画（骨骼），这两套动画在三个批次中共享。