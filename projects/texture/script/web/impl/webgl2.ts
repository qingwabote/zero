const canvas = document.getElementById("ZeroCanvas") as HTMLCanvasElement;
(globalThis as any).gfx = {
    context: canvas.getContext('webgl2', { alpha: false, antialias: false }),
};