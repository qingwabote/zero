/**copy from emscripten */
class TextDecoder {
    decode(buffer) {
        let idx = 0;
        const endPtr = buffer.length;
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
            if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 0xF0) == 0xE0) {
                u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
            } else {
                // if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte ' + ptrToString(u0) + ' encountered when deserializing a UTF-8 string in wasm memory to a JS string!');
                u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
            }

            if (u0 < 0x10000) {
                str += String.fromCharCode(u0);
            } else {
                var ch = u0 - 0x10000;
                str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
            }
        }
        return str;
    }
}
if (!globalThis.TextDecoder) {
    globalThis.TextDecoder = TextDecoder;
}
