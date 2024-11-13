import { InputAssembler } from "gfx";
export const gfxUtil = {
    cloneInputAssembler: (function () {
        function vertexInput_clone(out, vertexInput) {
            const buffers = vertexInput.buffers;
            const buffers_size = buffers.size();
            for (let i = 0; i < buffers_size; i++) {
                out.buffers.add(buffers.get(i));
            }
            const offsets = vertexInput.offsets;
            const offsets_size = offsets.size();
            for (let i = 0; i < offsets_size; i++) {
                out.offsets.add(offsets.get(i));
            }
            return out;
        }
        return function (inputAssembler) {
            const out = new InputAssembler;
            const vertexAttributes = inputAssembler.vertexInputState.attributes;
            const size = vertexAttributes.size();
            for (let i = 0; i < size; i++) {
                out.vertexInputState.attributes.add(vertexAttributes.get(i));
            }
            out.vertexInputState.primitive = inputAssembler.vertexInputState.primitive;
            vertexInput_clone(out.vertexInput, inputAssembler.vertexInput);
            if (inputAssembler.indexInput) {
                out.indexInput = inputAssembler.indexInput;
            }
            return out;
        };
    })(),
    compressAffineMat4(out, offset, m) {
        out[offset + 0] = m[0];
        out[offset + 1] = m[1];
        out[offset + 2] = m[2];
        out[offset + 3] = m[12];
        out[offset + 4] = m[4];
        out[offset + 5] = m[5];
        out[offset + 6] = m[6];
        out[offset + 7] = m[13];
        out[offset + 8] = m[8];
        out[offset + 9] = m[9];
        out[offset + 10] = m[10];
        out[offset + 11] = m[14];
    }
};
