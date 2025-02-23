let textEncode;
if (globalThis.TextEncoder) {
    const encoder = new globalThis.TextEncoder();
    textEncode = function (source, destination) { return encoder.encodeInto(source, destination).written; };
}
else {
    // the implementations copy from emscripten
    textEncode = function (str, buffer) {
        let outIdx = 0;
        const maxBytesToWrite = buffer.byteLength;
        const heap = buffer;
        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite;
        for (var i = 0; i < str.length; ++i) {
            // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
            // unit, not a Unicode code point of the character! So decode
            // UTF16->UTF32->UTF8.
            // See http://unicode.org/faq/utf_bom.html#utf16-3
            // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
            // and https://www.ietf.org/rfc/rfc2279.txt
            // and https://tools.ietf.org/html/rfc3629
            var u = str.charCodeAt(i); // possibly a lead surrogate
            if (u >= 0xD800 && u <= 0xDFFF) {
                var u1 = str.charCodeAt(++i);
                u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
            }
            if (u <= 0x7F) {
                if (outIdx >= endIdx)
                    break;
                heap[outIdx++] = u;
            }
            else if (u <= 0x7FF) {
                if (outIdx + 1 >= endIdx)
                    break;
                heap[outIdx++] = 0xC0 | (u >> 6);
                heap[outIdx++] = 0x80 | (u & 63);
            }
            else if (u <= 0xFFFF) {
                if (outIdx + 2 >= endIdx)
                    break;
                heap[outIdx++] = 0xE0 | (u >> 12);
                heap[outIdx++] = 0x80 | ((u >> 6) & 63);
                heap[outIdx++] = 0x80 | (u & 63);
            }
            else {
                if (outIdx + 3 >= endIdx)
                    break;
                // if (u > 0x10FFFF) warnOnce('Invalid Unicode code point ' + ptrToString(u) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
                heap[outIdx++] = 0xF0 | (u >> 18);
                heap[outIdx++] = 0x80 | ((u >> 12) & 63);
                heap[outIdx++] = 0x80 | ((u >> 6) & 63);
                heap[outIdx++] = 0x80 | (u & 63);
            }
        }
        return outIdx - startIdx;
    };
}
let textDecode;
if (globalThis.TextDecoder) {
    const decoder = new globalThis.TextDecoder();
    textDecode = function (input) { return decoder.decode(input); };
}
else {
    // the implementations copy from emscripten
    textDecode = function (buffer) {
        let idx = 0;
        const endPtr = buffer.byteLength;
        const heapOrArray = buffer;
        var str = '';
        // If building with TextDecoder, we have already computed the string length
        // above, so test loop end condition against that
        while (idx < endPtr) {
            // For UTF8 byte structure, see:
            // http://en.wikipedia.org/wiki/UTF-8#Description
            // https://www.ietf.org/rfc/rfc2279.txt
            // https://tools.ietf.org/html/rfc3629
            var u0 = heapOrArray[idx++];
            if (!(u0 & 0x80)) {
                str += String.fromCharCode(u0);
                continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 0xE0) == 0xC0) {
                str += String.fromCharCode(((u0 & 31) << 6) | u1);
                continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 0xF0) == 0xE0) {
                u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            }
            else {
                // if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
                u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
            }
            if (u0 < 0x10000) {
                str += String.fromCharCode(u0);
            }
            else {
                var ch = u0 - 0x10000;
                str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
            }
        }
        return str;
    };
}
export { textDecode, textEncode };
