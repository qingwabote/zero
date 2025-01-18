/**copy from emscripten */
class TextEncoder {
    encodeInto(str, buffer) {
        let outIdx = 0;
        const maxBytesToWrite = buffer.length;
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
                if (outIdx >= endIdx) break;
                heap[outIdx++] = u;
            } else if (u <= 0x7FF) {
                if (outIdx + 1 >= endIdx) break;
                heap[outIdx++] = 0xC0 | (u >> 6);
                heap[outIdx++] = 0x80 | (u & 63);
            } else if (u <= 0xFFFF) {
                if (outIdx + 2 >= endIdx) break;
                heap[outIdx++] = 0xE0 | (u >> 12);
                heap[outIdx++] = 0x80 | ((u >> 6) & 63);
                heap[outIdx++] = 0x80 | (u & 63);
            } else {
                if (outIdx + 3 >= endIdx) break;
                // if (u > 0x10FFFF) warnOnce('Invalid Unicode code point ' + ptrToString(u) + ' encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).');
                heap[outIdx++] = 0xF0 | (u >> 18);
                heap[outIdx++] = 0x80 | ((u >> 12) & 63);
                heap[outIdx++] = 0x80 | ((u >> 6) & 63);
                heap[outIdx++] = 0x80 | (u & 63);
            }
        }
        return { written: outIdx - startIdx };
    }
}

if (!globalThis.TextEncoder) {
    globalThis.TextEncoder = TextEncoder;
} 