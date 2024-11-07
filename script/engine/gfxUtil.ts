import { InputAssembler, VertexInput } from "gfx";

export const gfxUtil = {
    cloneInputAssembler: (function () {
        function vertexInput_clone(out: VertexInput, vertexInput: VertexInput): VertexInput {
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

        return function (inputAssembler: InputAssembler): InputAssembler {
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
        }
    })()
}