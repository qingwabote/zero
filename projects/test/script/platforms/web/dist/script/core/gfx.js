export var Format;
(function (Format) {
    Format[Format["R8UI"] = 0] = "R8UI";
    Format[Format["R16UI"] = 1] = "R16UI";
    Format[Format["R32UI"] = 2] = "R32UI";
    Format[Format["RG32F"] = 3] = "RG32F";
    Format[Format["RGB32F"] = 4] = "RGB32F";
    Format[Format["RGBA32F"] = 5] = "RGBA32F";
})(Format || (Format = {}));
export const FormatInfos = [
    { name: "R8UI", size: 1, count: 1 },
    { name: "R16UI", size: 2, count: 1 },
    { name: "R32UI", size: 4, count: 1 },
    { name: "RG32F", size: 8, count: 2 },
    { name: "RGB32F", size: 12, count: 3 },
    { name: "RGBA32F", size: 16, count: 4 },
];
let _device;
export default {
    get device() {
        return _device;
    },
    init(device) {
        _device = device;
    }
};
//# sourceMappingURL=gfx.js.map