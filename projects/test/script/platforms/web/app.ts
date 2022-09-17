
// const eulerXLabel = document.querySelector<HTMLLabelElement>('#eulerXLabel')!;
// const eulerXInput = document.querySelector<HTMLInputElement>('#eulerXInput')!;

// const eulerYLabel = document.querySelector<HTMLLabelElement>('#eulerYLabel')!;
// const eulerYInput = document.querySelector<HTMLInputElement>('#eulerYInput')!;

// const eulerZLabel = document.querySelector<HTMLLabelElement>('#eulerZLabel')!;
// const eulerZInput = document.querySelector<HTMLInputElement>('#eulerZInput')!;

// function updateInput(euler: Readonly<Vec3>): void {
//     eulerXInput.valueAsNumber = euler[0];
//     eulerYInput.valueAsNumber = euler[1];
//     eulerZInput.valueAsNumber = euler[2];
// }

// function updateLabel(euler: Readonly<Vec3>): void {
//     eulerXLabel.textContent = `eulerX: ${euler[0]}`;
//     eulerYLabel.textContent = `eulerY: ${euler[1]}`;
//     eulerZLabel.textContent = `eulerZ: ${euler[2]}`;
// }

// function onTransform(flag: TransformBit) {
//     if (flag & TransformBit.ROTATION) {
//         const euler = node.euler;
//         updateInput(euler);
//         updateLabel(euler);
//     }
// }

// function onEulerInput(): void {
//     const euler: Vec3 = [eulerXInput.valueAsNumber, eulerYInput.valueAsNumber, eulerZInput.valueAsNumber];
//     node.eventEmitter.off("TRANSFORM_CHANGED", onTransform);
//     node.euler = euler;
//     node.eventEmitter.on("TRANSFORM_CHANGED", onTransform)
//     updateLabel(euler);
// }

// eulerXInput.addEventListener('input', onEulerInput);
// eulerYInput.addEventListener('input', onEulerInput);
// eulerZInput.addEventListener('input', onEulerInput);

// node.eventEmitter.on("TRANSFORM_CHANGED", onTransform)

// updateInput(node.euler)
// updateLabel(node.euler)
