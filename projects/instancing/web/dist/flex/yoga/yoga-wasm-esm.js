var loadYoga = (() => {
    var _scriptDir = import.meta.url;
    return (function (loadYoga) {
        loadYoga = loadYoga || {};
        var g;
        g || (g = typeof loadYoga !== 'undefined' ? loadYoga : {});
        var ba, ca;
        g.ready = new Promise(function (a, b) {
            ba = a;
            ca = b;
        });
        var da = Object.assign({}, g), q = "";
        "undefined" != typeof document && document.currentScript && (q = document.currentScript.src);
        _scriptDir && (q = _scriptDir);
        0 !== q.indexOf("blob:") ? q = q.substr(0, q.replace(/[?#].*/, "").lastIndexOf("/") + 1) : q = "";
        var ea = g.print || console.log.bind(console), v = g.printErr || console.warn.bind(console);
        Object.assign(g, da);
        da = null;
        var w;
        g.wasmBinary && (w = g.wasmBinary);
        var noExitRuntime = g.noExitRuntime || !0;
        "object" != typeof WebAssembly && x("no native wasm support detected");
        var fa, ha = !1;
        function ia(a, b, c) {
            c = b + c;
            for (var d = ""; !(b >= c);) {
                var e = a[b++];
                if (!e) {
                    break;
                }
                if (e & 128) {
                    var f = a[b++] & 63;
                    if (192 == (e & 224)) {
                        d += String.fromCharCode((e & 31) << 6 | f);
                    }
                    else {
                        var h = a[b++] & 63;
                        e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | h : (e & 7) << 18 | f << 12 | h << 6 | a[b++] & 63;
                        65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
                    }
                }
                else {
                    d += String.fromCharCode(e);
                }
            }
            return d;
        }
        var ja, ka, z, A, la, C, D, ma, na;
        function oa() {
            var a = fa.buffer;
            ja = a;
            g.HEAP8 = ka = new Int8Array(a);
            g.HEAP16 = A = new Int16Array(a);
            g.HEAP32 = C = new Int32Array(a);
            g.HEAPU8 = z = new Uint8Array(a);
            g.HEAPU16 = la = new Uint16Array(a);
            g.HEAPU32 = D = new Uint32Array(a);
            g.HEAPF32 = ma = new Float32Array(a);
            g.HEAPF64 = na = new Float64Array(a);
        }
        var pa, qa = [], ra = [], sa = [];
        function ta() {
            var a = g.preRun.shift();
            qa.unshift(a);
        }
        var E = 0, ua = null, F = null;
        function x(a) {
            if (g.onAbort) {
                g.onAbort(a);
            }
            a = "Aborted(" + a + ")";
            v(a);
            ha = !0;
            a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
            ca(a);
            throw a;
        }
        function va() {
            return G.startsWith("data:application/octet-stream;base64,");
        }
        var G;
        if (g.locateFile) {
            if (G = "yoga-wasm-esm.wasm", !va()) {
                var wa = G;
                G = g.locateFile ? g.locateFile(wa, q) : q + wa;
            }
        }
        else {
            G = (new URL("yoga-wasm-esm.wasm", import.meta.url)).href;
        }
        function xa() {
            var a = G;
            try {
                if (a == G && w) {
                    return new Uint8Array(w);
                }
                throw "both async and sync fetching of the wasm failed";
            }
            catch (b) {
                x(b);
            }
        }
        function ya() {
            return w || "function" != typeof fetch ? Promise.resolve().then(function () {
                return xa();
            }) : fetch(G, { credentials: "same-origin" }).then(function (a) {
                if (!a.ok) {
                    throw "failed to load wasm binary file at '" + G + "'";
                }
                return a.arrayBuffer();
            }).catch(function () {
                return xa();
            });
        }
        function za(a) {
            for (; 0 < a.length;) {
                a.shift()(g);
            }
        }
        function Aa(a) {
            if (void 0 === a) {
                return "_unknown";
            }
            a = a.replace(/[^a-zA-Z0-9_]/g, "$");
            var b = a.charCodeAt(0);
            return 48 <= b && 57 >= b ? "_" + a : a;
        }
        function Ba(a, b) {
            a = Aa(a);
            return function () {
                return b.apply(this, arguments);
            };
        }
        var H = [{}, { value: void 0 }, { value: null }, { value: !0 }, { value: !1 }], Ca = [];
        function Da(a) {
            var b = Error, c = Ba(a, function (d) {
                this.name = a;
                this.message = d;
                d = Error(d).stack;
                void 0 !== d && (this.stack = this.toString() + "\n" + d.replace(/^Error(:[^\n]*)?\n/, ""));
            });
            c.prototype = Object.create(b.prototype);
            c.prototype.constructor = c;
            c.prototype.toString = function () {
                return void 0 === this.message ? this.name : this.name + ": " + this.message;
            };
            return c;
        }
        var J = void 0;
        function K(a) {
            throw new J(a);
        }
        var L = a => {
            a || K("Cannot use deleted val. handle = " + a);
            return H[a].value;
        }, Ea = a => {
            switch (a) {
                case void 0:
                    return 1;
                case null:
                    return 2;
                case !0:
                    return 3;
                case !1:
                    return 4;
                default:
                    var b = Ca.length ? Ca.pop() : H.length;
                    H[b] = { L: 1, value: a };
                    return b;
            }
        }, Fa = void 0, Ga = void 0;
        function M(a) {
            for (var b = ""; z[a];) {
                b += Ga[z[a++]];
            }
            return b;
        }
        var N = [];
        function Ha() {
            for (; N.length;) {
                var a = N.pop();
                a.g.D = !1;
                a["delete"]();
            }
        }
        var O = void 0, P = {};
        function Ia(a, b) {
            for (void 0 === b && K("ptr should not be undefined"); a.l;) {
                b = a.G(b), a = a.l;
            }
            return b;
        }
        var Q = {};
        function Ja(a) {
            a = Ka(a);
            var b = M(a);
            R(a);
            return b;
        }
        function La(a, b) {
            var c = Q[a];
            void 0 === c && K(b + " has unknown type " + Ja(a));
            return c;
        }
        function Ma() {
        }
        var Na = !1;
        function Oa(a) {
            --a.count.value;
            0 === a.count.value && (a.o ? a.s.v(a.o) : a.j.h.v(a.i));
        }
        function Pa(a, b, c) {
            if (b === c) {
                return a;
            }
            if (void 0 === c.l) {
                return null;
            }
            a = Pa(a, b, c.l);
            return null === a ? null : c.T(a);
        }
        var Qa = {};
        function Ra(a, b) {
            b = Ia(a, b);
            return P[b];
        }
        var Sa = void 0;
        function Ta(a) {
            throw new Sa(a);
        }
        function Ua(a, b) {
            b.j && b.i || Ta("makeClassHandle requires ptr and ptrType");
            !!b.s !== !!b.o && Ta("Both smartPtrType and smartPtr must be specified");
            b.count = { value: 1 };
            return S(Object.create(a, { g: { value: b, }, }));
        }
        function S(a) {
            if ("undefined" === typeof FinalizationRegistry) {
                return S = b => b, a;
            }
            Na = new FinalizationRegistry(b => {
                Oa(b.g);
            });
            S = b => {
                var c = b.g;
                c.o && Na.register(b, { g: c }, b);
                return b;
            };
            Ma = b => {
                Na.unregister(b);
            };
            return S(a);
        }
        var Va = {};
        function Wa(a) {
            for (; a.length;) {
                var b = a.pop();
                a.pop()(b);
            }
        }
        function T(a) {
            return this.fromWireType(C[a >> 2]);
        }
        var U = {}, Xa = {};
        function V(a, b, c) {
            function d(k) {
                k = c(k);
                k.length !== a.length && Ta("Mismatched type converter count");
                for (var m = 0; m < a.length; ++m) {
                    W(a[m], k[m]);
                }
            }
            a.forEach(function (k) {
                Xa[k] = b;
            });
            var e = Array(b.length), f = [], h = 0;
            b.forEach((k, m) => {
                Q.hasOwnProperty(k) ? e[m] = Q[k] : (f.push(k), U.hasOwnProperty(k) || (U[k] = []), U[k].push(() => {
                    e[m] = Q[k];
                    ++h;
                    h === f.length && d(e);
                }));
            });
            0 === f.length && d(e);
        }
        function Ya(a) {
            switch (a) {
                case 1:
                    return 0;
                case 2:
                    return 1;
                case 4:
                    return 2;
                case 8:
                    return 3;
                default:
                    throw new TypeError("Unknown type size: " + a);
            }
        }
        function W(a, b, c = {}) {
            if (!("argPackAdvance" in b)) {
                throw new TypeError("registerType registeredInstance requires argPackAdvance");
            }
            var d = b.name;
            a || K('type "' + d + '" must have a positive integer typeid pointer');
            if (Q.hasOwnProperty(a)) {
                if (c.$) {
                    return;
                }
                K("Cannot register type '" + d + "' twice");
            }
            Q[a] = b;
            delete Xa[a];
            U.hasOwnProperty(a) && (b = U[a], delete U[a], b.forEach(e => e()));
        }
        function Za(a) {
            K(a.g.j.h.name + " instance already deleted");
        }
        function X() {
        }
        function $a(a, b, c) {
            if (void 0 === a[b].m) {
                var d = a[b];
                a[b] = function () {
                    a[b].m.hasOwnProperty(arguments.length) || K("Function '" + c + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + a[b].m + ")!");
                    return a[b].m[arguments.length].apply(this, arguments);
                };
                a[b].m = [];
                a[b].m[d.C] = d;
            }
        }
        function ab(a, b) {
            g.hasOwnProperty(a) ? (K("Cannot register public name '" + a + "' twice"), $a(g, a, a), g.hasOwnProperty(void 0) && K("Cannot register multiple overloads of a function with the same number of arguments (undefined)!"), g[a].m[void 0] = b) : g[a] = b;
        }
        function bb(a, b, c, d, e, f, h, k) {
            this.name = a;
            this.constructor = b;
            this.A = c;
            this.v = d;
            this.l = e;
            this.V = f;
            this.G = h;
            this.T = k;
            this.O = [];
        }
        function cb(a, b, c) {
            for (; b !== c;) {
                b.G || K("Expected null or instance of " + c.name + ", got an instance of " + b.name), a = b.G(a), b = b.l;
            }
            return a;
        }
        function db(a, b) {
            if (null === b) {
                return this.J && K("null is not a valid " + this.name), 0;
            }
            b.g || K('Cannot pass "' + eb(b) + '" as a ' + this.name);
            b.g.i || K("Cannot pass deleted object as a pointer of type " + this.name);
            return cb(b.g.i, b.g.j.h, this.h);
        }
        function fb(a, b) {
            if (null === b) {
                this.J && K("null is not a valid " + this.name);
                if (this.I) {
                    var c = this.K();
                    null !== a && a.push(this.v, c);
                    return c;
                }
                return 0;
            }
            b.g || K('Cannot pass "' + eb(b) + '" as a ' + this.name);
            b.g.i || K("Cannot pass deleted object as a pointer of type " + this.name);
            !this.H && b.g.j.H && K("Cannot convert argument of type " + (b.g.s ? b.g.s.name : b.g.j.name) + " to parameter type " + this.name);
            c = cb(b.g.i, b.g.j.h, this.h);
            if (this.I) {
                switch (void 0 === b.g.o && K("Passing raw pointer to smart pointer is illegal"), this.ga) {
                    case 0:
                        b.g.s === this ? c = b.g.o : K("Cannot convert argument of type " + (b.g.s ? b.g.s.name : b.g.j.name) + " to parameter type " + this.name);
                        break;
                    case 1:
                        c = b.g.o;
                        break;
                    case 2:
                        if (b.g.s === this) {
                            c = b.g.o;
                        }
                        else {
                            var d = b.clone();
                            c = this.ca(c, Ea(function () {
                                d["delete"]();
                            }));
                            null !== a && a.push(this.v, c);
                        }
                        break;
                    default:
                        K("Unsupporting sharing policy");
                }
            }
            return c;
        }
        function gb(a, b) {
            if (null === b) {
                return this.J && K("null is not a valid " + this.name), 0;
            }
            b.g || K('Cannot pass "' + eb(b) + '" as a ' + this.name);
            b.g.i || K("Cannot pass deleted object as a pointer of type " + this.name);
            b.g.j.H && K("Cannot convert argument of type " + b.g.j.name + " to parameter type " + this.name);
            return cb(b.g.i, b.g.j.h, this.h);
        }
        function Y(a, b, c, d) {
            this.name = a;
            this.h = b;
            this.J = c;
            this.H = d;
            this.I = !1;
            this.v = this.ca = this.K = this.P = this.ga = this.ba = void 0;
            void 0 !== b.l ? this.toWireType = fb : (this.toWireType = d ? db : gb, this.u = null);
        }
        function hb(a, b) {
            g.hasOwnProperty(a) || Ta("Replacing nonexistant public symbol");
            g[a] = b;
            g[a].C = void 0;
        }
        var ib = [];
        function jb(a) {
            var b = ib[a];
            b || (a >= ib.length && (ib.length = a + 1), ib[a] = b = pa.get(a));
            return b;
        }
        function kb(a, b) {
            var c = [];
            return function () {
                c.length = 0;
                Object.assign(c, arguments);
                if (a.includes("j")) {
                    var d = g["dynCall_" + a];
                    d = c && c.length ? d.apply(null, [b].concat(c)) : d.call(null, b);
                }
                else {
                    d = jb(b).apply(null, c);
                }
                return d;
            };
        }
        function Z(a, b) {
            a = M(a);
            var c = a.includes("j") ? kb(a, b) : jb(b);
            "function" != typeof c && K("unknown function pointer with signature " + a + ": " + b);
            return c;
        }
        var lb = void 0;
        function ob(a, b) {
            function c(f) {
                e[f] || Q[f] || (Xa[f] ? Xa[f].forEach(c) : (d.push(f), e[f] = !0));
            }
            var d = [], e = {};
            b.forEach(c);
            throw new lb(a + ": " + d.map(Ja).join([", "]));
        }
        function pb(a, b, c, d, e) {
            var f = b.length;
            2 > f && K("argTypes array size mismatch! Must at least get return value and 'this' types!");
            var h = null !== b[1] && null !== c, k = !1;
            for (c = 1; c < b.length; ++c) {
                if (null !== b[c] && void 0 === b[c].u) {
                    k = !0;
                    break;
                }
            }
            var m = "void" !== b[0].name, l = f - 2, n = Array(l), p = [], r = [];
            return function () {
                arguments.length !== l && K("function " + a + " called with " + arguments.length + " arguments, expected " + l + " args!");
                r.length = 0;
                p.length = h ? 2 : 1;
                p[0] = e;
                if (h) {
                    var u = b[1].toWireType(r, this);
                    p[1] = u;
                }
                for (var t = 0; t < l; ++t) {
                    n[t] = b[t + 2].toWireType(r, arguments[t]), p.push(n[t]);
                }
                t = d.apply(null, p);
                if (k) {
                    Wa(r);
                }
                else {
                    for (var y = h ? 1 : 2; y < b.length; y++) {
                        var B = 1 === y ? u : n[y - 2];
                        null !== b[y].u && b[y].u(B);
                    }
                }
                u = m ? b[0].fromWireType(t) : void 0;
                return u;
            };
        }
        function qb(a, b) {
            for (var c = [], d = 0; d < a; d++) {
                c.push(D[b + 4 * d >> 2]);
            }
            return c;
        }
        function rb(a) {
            4 < a && 0 === --H[a].L && (H[a] = void 0, Ca.push(a));
        }
        function eb(a) {
            if (null === a) {
                return "null";
            }
            var b = typeof a;
            return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
        }
        function sb(a, b) {
            switch (b) {
                case 2:
                    return function (c) {
                        return this.fromWireType(ma[c >> 2]);
                    };
                case 3:
                    return function (c) {
                        return this.fromWireType(na[c >> 3]);
                    };
                default:
                    throw new TypeError("Unknown float type: " + a);
            }
        }
        function tb(a, b, c) {
            switch (b) {
                case 0:
                    return c ? function (d) {
                        return ka[d];
                    } : function (d) {
                        return z[d];
                    };
                case 1:
                    return c ? function (d) {
                        return A[d >> 1];
                    } : function (d) {
                        return la[d >> 1];
                    };
                case 2:
                    return c ? function (d) {
                        return C[d >> 2];
                    } : function (d) {
                        return D[d >> 2];
                    };
                default:
                    throw new TypeError("Unknown integer type: " + a);
            }
        }
        function ub(a, b) {
            for (var c = "", d = 0; !(d >= b / 2); ++d) {
                var e = A[a + 2 * d >> 1];
                if (0 == e) {
                    break;
                }
                c += String.fromCharCode(e);
            }
            return c;
        }
        function vb(a, b, c) {
            void 0 === c && (c = 2147483647);
            if (2 > c) {
                return 0;
            }
            c -= 2;
            var d = b;
            c = c < 2 * a.length ? c / 2 : a.length;
            for (var e = 0; e < c; ++e) {
                A[b >> 1] = a.charCodeAt(e), b += 2;
            }
            A[b >> 1] = 0;
            return b - d;
        }
        function wb(a) {
            return 2 * a.length;
        }
        function xb(a, b) {
            for (var c = 0, d = ""; !(c >= b / 4);) {
                var e = C[a + 4 * c >> 2];
                if (0 == e) {
                    break;
                }
                ++c;
                65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
            }
            return d;
        }
        function yb(a, b, c) {
            void 0 === c && (c = 2147483647);
            if (4 > c) {
                return 0;
            }
            var d = b;
            c = d + c - 4;
            for (var e = 0; e < a.length; ++e) {
                var f = a.charCodeAt(e);
                if (55296 <= f && 57343 >= f) {
                    var h = a.charCodeAt(++e);
                    f = 65536 + ((f & 1023) << 10) | h & 1023;
                }
                C[b >> 2] = f;
                b += 4;
                if (b + 4 > c) {
                    break;
                }
            }
            C[b >> 2] = 0;
            return b - d;
        }
        function zb(a) {
            for (var b = 0, c = 0; c < a.length; ++c) {
                var d = a.charCodeAt(c);
                55296 <= d && 57343 >= d && ++c;
                b += 4;
            }
            return b;
        }
        var Ab = {};
        function Bb(a) {
            var b = Ab[a];
            return void 0 === b ? M(a) : b;
        }
        var Cb = [];
        function Db(a) {
            var b = Cb.length;
            Cb.push(a);
            return b;
        }
        function Eb(a, b) {
            for (var c = Array(a), d = 0; d < a; ++d) {
                c[d] = La(D[b + 4 * d >> 2], "parameter " + d);
            }
            return c;
        }
        var Fb = [], Gb = [null, [], []];
        J = g.BindingError = Da("BindingError");
        g.count_emval_handles = function () {
            for (var a = 0, b = 5; b < H.length; ++b) {
                void 0 !== H[b] && ++a;
            }
            return a;
        };
        g.get_first_emval = function () {
            for (var a = 5; a < H.length; ++a) {
                if (void 0 !== H[a]) {
                    return H[a];
                }
            }
            return null;
        };
        Fa = g.PureVirtualError = Da("PureVirtualError");
        for (var Hb = Array(256), Ib = 0; 256 > Ib; ++Ib) {
            Hb[Ib] = String.fromCharCode(Ib);
        }
        Ga = Hb;
        g.getInheritedInstanceCount = function () {
            return Object.keys(P).length;
        };
        g.getLiveInheritedInstances = function () {
            var a = [], b;
            for (b in P) {
                P.hasOwnProperty(b) && a.push(P[b]);
            }
            return a;
        };
        g.flushPendingDeletes = Ha;
        g.setDelayFunction = function (a) {
            O = a;
            N.length && O && O(Ha);
        };
        Sa = g.InternalError = Da("InternalError");
        X.prototype.isAliasOf = function (a) {
            if (!(this instanceof X && a instanceof X)) {
                return !1;
            }
            var b = this.g.j.h, c = this.g.i, d = a.g.j.h;
            for (a = a.g.i; b.l;) {
                c = b.G(c), b = b.l;
            }
            for (; d.l;) {
                a = d.G(a), d = d.l;
            }
            return b === d && c === a;
        };
        X.prototype.clone = function () {
            this.g.i || Za(this);
            if (this.g.F) {
                return this.g.count.value += 1, this;
            }
            var a = S, b = Object, c = b.create, d = Object.getPrototypeOf(this), e = this.g;
            a = a(c.call(b, d, { g: { value: { count: e.count, D: e.D, F: e.F, i: e.i, j: e.j, o: e.o, s: e.s, }, } }));
            a.g.count.value += 1;
            a.g.D = !1;
            return a;
        };
        X.prototype["delete"] = function () {
            this.g.i || Za(this);
            this.g.D && !this.g.F && K("Object already scheduled for deletion");
            Ma(this);
            Oa(this.g);
            this.g.F || (this.g.o = void 0, this.g.i = void 0);
        };
        X.prototype.isDeleted = function () {
            return !this.g.i;
        };
        X.prototype.deleteLater = function () {
            this.g.i || Za(this);
            this.g.D && !this.g.F && K("Object already scheduled for deletion");
            N.push(this);
            1 === N.length && O && O(Ha);
            this.g.D = !0;
            return this;
        };
        Y.prototype.W = function (a) {
            this.P && (a = this.P(a));
            return a;
        };
        Y.prototype.M = function (a) {
            this.v && this.v(a);
        };
        Y.prototype.argPackAdvance = 8;
        Y.prototype.readValueFromPointer = T;
        Y.prototype.deleteObject = function (a) {
            if (null !== a) {
                a["delete"]();
            }
        };
        Y.prototype.fromWireType = function (a) {
            function b() {
                return this.I ? Ua(this.h.A, { j: this.ba, i: c, s: this, o: a, }) : Ua(this.h.A, { j: this, i: a, });
            }
            var c = this.W(a);
            if (!c) {
                return this.M(a), null;
            }
            var d = Ra(this.h, c);
            if (void 0 !== d) {
                if (0 === d.g.count.value) {
                    return d.g.i = c, d.g.o = a, d.clone();
                }
                d = d.clone();
                this.M(a);
                return d;
            }
            d = this.h.V(c);
            d = Qa[d];
            if (!d) {
                return b.call(this);
            }
            d = this.H ? d.R : d.pointerType;
            var e = Pa(c, this.h, d.h);
            return null === e ? b.call(this) : this.I ? Ua(d.h.A, { j: d, i: e, s: this, o: a, }) : Ua(d.h.A, { j: d, i: e, });
        };
        lb = g.UnboundTypeError = Da("UnboundTypeError");
        var Kb = { _embind_create_inheriting_constructor: function (a, b, c) {
                a = M(a);
                b = La(b, "wrapper");
                c = L(c);
                var d = [].slice, e = b.h, f = e.A, h = e.l.A, k = e.l.constructor;
                a = Ba(a, function () {
                    e.l.O.forEach(function (l) {
                        if (this[l] === h[l]) {
                            throw new Fa("Pure virtual function " + l + " must be implemented in JavaScript");
                        }
                    }.bind(this));
                    Object.defineProperty(this, "__parent", { value: f });
                    this.__construct.apply(this, d.call(arguments));
                });
                f.__construct = function () {
                    this === f && K("Pass correct 'this' to __construct");
                    var l = k.implement.apply(void 0, [this].concat(d.call(arguments)));
                    Ma(l);
                    var n = l.g;
                    l.notifyOnDestruction();
                    n.F = !0;
                    Object.defineProperties(this, { g: { value: n } });
                    S(this);
                    l = n.i;
                    l = Ia(e, l);
                    P.hasOwnProperty(l) ? K("Tried to register registered instance: " + l) : P[l] = this;
                };
                f.__destruct = function () {
                    this === f && K("Pass correct 'this' to __destruct");
                    Ma(this);
                    var l = this.g.i;
                    l = Ia(e, l);
                    P.hasOwnProperty(l) ? delete P[l] : K("Tried to unregister unregistered instance: " + l);
                };
                a.prototype = Object.create(f);
                for (var m in c) {
                    a.prototype[m] = c[m];
                }
                return Ea(a);
            }, _embind_finalize_value_object: function (a) {
                var b = Va[a];
                delete Va[a];
                var c = b.K, d = b.v, e = b.N, f = e.map(h => h.Z).concat(e.map(h => h.ea));
                V([a], f, h => {
                    var k = {};
                    e.forEach((m, l) => {
                        var n = h[l], p = m.X, r = m.Y, u = h[l + e.length], t = m.da, y = m.fa;
                        k[m.U] = { read: B => n.fromWireType(p(r, B)), write: (B, aa) => {
                                var I = [];
                                t(y, B, u.toWireType(I, aa));
                                Wa(I);
                            } };
                    });
                    return [{ name: b.name, fromWireType: function (m) {
                                var l = {}, n;
                                for (n in k) {
                                    l[n] = k[n].read(m);
                                }
                                d(m);
                                return l;
                            }, toWireType: function (m, l) {
                                for (var n in k) {
                                    if (!(n in l)) {
                                        throw new TypeError('Missing field:  "' + n + '"');
                                    }
                                }
                                var p = c();
                                for (n in k) {
                                    k[n].write(p, l[n]);
                                }
                                null !== m && m.push(d, p);
                                return p;
                            }, argPackAdvance: 8, readValueFromPointer: T, u: d, }];
                });
            }, _embind_register_bigint: function () {
            }, _embind_register_bool: function (a, b, c, d, e) {
                var f = Ya(c);
                b = M(b);
                W(a, { name: b, fromWireType: function (h) {
                        return !!h;
                    }, toWireType: function (h, k) {
                        return k ? d : e;
                    }, argPackAdvance: 8, readValueFromPointer: function (h) {
                        if (1 === c) {
                            var k = ka;
                        }
                        else if (2 === c) {
                            k = A;
                        }
                        else if (4 === c) {
                            k = C;
                        }
                        else {
                            throw new TypeError("Unknown boolean type size: " + b);
                        }
                        return this.fromWireType(k[h >> f]);
                    }, u: null, });
            }, _embind_register_class: function (a, b, c, d, e, f, h, k, m, l, n, p, r) {
                n = M(n);
                f = Z(e, f);
                k && (k = Z(h, k));
                l && (l = Z(m, l));
                r = Z(p, r);
                var u = Aa(n);
                ab(u, function () {
                    ob("Cannot construct " + n + " due to unbound types", [d]);
                });
                V([a, b, c], d ? [d] : [], function (t) {
                    t = t[0];
                    if (d) {
                        var y = t.h;
                        var B = y.A;
                    }
                    else {
                        B = X.prototype;
                    }
                    t = Ba(u, function () {
                        if (Object.getPrototypeOf(this) !== aa) {
                            throw new J("Use 'new' to construct " + n);
                        }
                        if (void 0 === I.B) {
                            throw new J(n + " has no accessible constructor");
                        }
                        var mb = I.B[arguments.length];
                        if (void 0 === mb) {
                            throw new J("Tried to invoke ctor of " + n + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(I.B).toString() + ") parameters instead!");
                        }
                        return mb.apply(this, arguments);
                    });
                    var aa = Object.create(B, { constructor: { value: t }, });
                    t.prototype = aa;
                    var I = new bb(n, t, aa, r, y, f, k, l);
                    y = new Y(n, I, !0, !1);
                    B = new Y(n + "*", I, !1, !1);
                    var nb = new Y(n + " const*", I, !1, !0);
                    Qa[a] = { pointerType: B, R: nb };
                    hb(u, t);
                    return [y, B, nb];
                });
            }, _embind_register_class_class_function: function (a, b, c, d, e, f, h) {
                var k = qb(c, d);
                b = M(b);
                f = Z(e, f);
                V([], [a], function (m) {
                    function l() {
                        ob("Cannot call " + n + " due to unbound types", k);
                    }
                    m = m[0];
                    var n = m.name + "." + b;
                    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
                    var p = m.h.constructor;
                    void 0 === p[b] ? (l.C = c - 1, p[b] = l) : ($a(p, b, n), p[b].m[c - 1] = l);
                    V([], k, function (r) {
                        r = pb(n, [r[0], null].concat(r.slice(1)), null, f, h);
                        void 0 === p[b].m ? (r.C = c - 1, p[b] = r) : p[b].m[c - 1] = r;
                        return [];
                    });
                    return [];
                });
            }, _embind_register_class_constructor: function (a, b, c, d, e, f) {
                0 < b || x();
                var h = qb(b, c);
                e = Z(d, e);
                V([], [a], function (k) {
                    k = k[0];
                    var m = "constructor " + k.name;
                    void 0 === k.h.B && (k.h.B = []);
                    if (void 0 !== k.h.B[b - 1]) {
                        throw new J("Cannot register multiple constructors with identical number of parameters (" + (b - 1) + ") for class '" + k.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
                    }
                    k.h.B[b - 1] = () => {
                        ob("Cannot construct " + k.name + " due to unbound types", h);
                    };
                    V([], h, function (l) {
                        l.splice(1, 0, null);
                        k.h.B[b - 1] = pb(m, l, null, e, f);
                        return [];
                    });
                    return [];
                });
            }, _embind_register_class_function: function (a, b, c, d, e, f, h, k) {
                var m = qb(c, d);
                b = M(b);
                f = Z(e, f);
                V([], [a], function (l) {
                    function n() {
                        ob("Cannot call " + p + " due to unbound types", m);
                    }
                    l = l[0];
                    var p = l.name + "." + b;
                    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
                    k && l.h.O.push(b);
                    var r = l.h.A, u = r[b];
                    void 0 === u || void 0 === u.m && u.className !== l.name && u.C === c - 2 ? (n.C = c - 2, n.className = l.name, r[b] = n) : ($a(r, b, p), r[b].m[c - 2] = n);
                    V([], m, function (t) {
                        t = pb(p, t, l, f, h);
                        void 0 === r[b].m ? (t.C = c - 2, r[b] = t) : r[b].m[c - 2] = t;
                        return [];
                    });
                    return [];
                });
            }, _embind_register_emval: function (a, b) {
                b = M(b);
                W(a, { name: b, fromWireType: function (c) {
                        var d = L(c);
                        rb(c);
                        return d;
                    }, toWireType: function (c, d) {
                        return Ea(d);
                    }, argPackAdvance: 8, readValueFromPointer: T, u: null, });
            }, _embind_register_float: function (a, b, c) {
                c = Ya(c);
                b = M(b);
                W(a, { name: b, fromWireType: function (d) {
                        return d;
                    }, toWireType: function (d, e) {
                        return e;
                    }, argPackAdvance: 8, readValueFromPointer: sb(b, c), u: null, });
            }, _embind_register_integer: function (a, b, c, d, e) {
                b = M(b);
                -1 === e && (e = 4294967295);
                e = Ya(c);
                var f = k => k;
                if (0 === d) {
                    var h = 32 - 8 * c;
                    f = k => k << h >>> h;
                }
                c = b.includes("unsigned") ? function (k, m) {
                    return m >>> 0;
                } : function (k, m) {
                    return m;
                };
                W(a, { name: b, fromWireType: f, toWireType: c, argPackAdvance: 8, readValueFromPointer: tb(b, e, 0 !== d), u: null, });
            }, _embind_register_memory_view: function (a, b, c) {
                function d(f) {
                    f >>= 2;
                    var h = D;
                    return new e(ja, h[f + 1], h[f]);
                }
                var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,][b];
                c = M(c);
                W(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d, }, { $: !0, });
            }, _embind_register_std_string: function (a, b) {
                b = M(b);
                var c = "std::string" === b;
                W(a, { name: b, fromWireType: function (d) {
                        var e = D[d >> 2], f = d + 4;
                        if (c) {
                            for (var h = f, k = 0; k <= e; ++k) {
                                var m = f + k;
                                if (k == e || 0 == z[m]) {
                                    h = h ? ia(z, h, m - h) : "";
                                    if (void 0 === l) {
                                        var l = h;
                                    }
                                    else {
                                        l += String.fromCharCode(0), l += h;
                                    }
                                    h = m + 1;
                                }
                            }
                        }
                        else {
                            l = Array(e);
                            for (k = 0; k < e; ++k) {
                                l[k] = String.fromCharCode(z[f + k]);
                            }
                            l = l.join("");
                        }
                        R(d);
                        return l;
                    }, toWireType: function (d, e) {
                        e instanceof ArrayBuffer && (e = new Uint8Array(e));
                        var f, h = "string" == typeof e;
                        h || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array || K("Cannot pass non-string to std::string");
                        if (c && h) {
                            var k = 0;
                            for (f = 0; f < e.length; ++f) {
                                var m = e.charCodeAt(f);
                                127 >= m ? k++ : 2047 >= m ? k += 2 : 55296 <= m && 57343 >= m ? (k += 4, ++f) : k += 3;
                            }
                            f = k;
                        }
                        else {
                            f = e.length;
                        }
                        k = Jb(4 + f + 1);
                        m = k + 4;
                        D[k >> 2] = f;
                        if (c && h) {
                            if (h = m, m = f + 1, f = z, 0 < m) {
                                m = h + m - 1;
                                for (var l = 0; l < e.length; ++l) {
                                    var n = e.charCodeAt(l);
                                    if (55296 <= n && 57343 >= n) {
                                        var p = e.charCodeAt(++l);
                                        n = 65536 + ((n & 1023) << 10) | p & 1023;
                                    }
                                    if (127 >= n) {
                                        if (h >= m) {
                                            break;
                                        }
                                        f[h++] = n;
                                    }
                                    else {
                                        if (2047 >= n) {
                                            if (h + 1 >= m) {
                                                break;
                                            }
                                            f[h++] = 192 | n >> 6;
                                        }
                                        else {
                                            if (65535 >= n) {
                                                if (h + 2 >= m) {
                                                    break;
                                                }
                                                f[h++] = 224 | n >> 12;
                                            }
                                            else {
                                                if (h + 3 >= m) {
                                                    break;
                                                }
                                                f[h++] = 240 | n >> 18;
                                                f[h++] = 128 | n >> 12 & 63;
                                            }
                                            f[h++] = 128 | n >> 6 & 63;
                                        }
                                        f[h++] = 128 | n & 63;
                                    }
                                }
                                f[h] = 0;
                            }
                        }
                        else {
                            if (h) {
                                for (h = 0; h < f; ++h) {
                                    l = e.charCodeAt(h), 255 < l && (R(m), K("String has UTF-16 code units that do not fit in 8 bits")), z[m + h] = l;
                                }
                            }
                            else {
                                for (h = 0; h < f; ++h) {
                                    z[m + h] = e[h];
                                }
                            }
                        }
                        null !== d && d.push(R, k);
                        return k;
                    }, argPackAdvance: 8, readValueFromPointer: T, u: function (d) {
                        R(d);
                    }, });
            }, _embind_register_std_wstring: function (a, b, c) {
                c = M(c);
                if (2 === b) {
                    var d = ub;
                    var e = vb;
                    var f = wb;
                    var h = () => la;
                    var k = 1;
                }
                else {
                    4 === b && (d = xb, e = yb, f = zb, h = () => D, k = 2);
                }
                W(a, { name: c, fromWireType: function (m) {
                        for (var l = D[m >> 2], n = h(), p, r = m + 4, u = 0; u <= l; ++u) {
                            var t = m + 4 + u * b;
                            if (u == l || 0 == n[t >> k]) {
                                r = d(r, t - r), void 0 === p ? p = r : (p += String.fromCharCode(0), p += r), r = t + b;
                            }
                        }
                        R(m);
                        return p;
                    }, toWireType: function (m, l) {
                        "string" != typeof l && K("Cannot pass non-string to C++ string type " + c);
                        var n = f(l), p = Jb(4 + n + b);
                        D[p >> 2] = n >> k;
                        e(l, p + 4, n + b);
                        null !== m && m.push(R, p);
                        return p;
                    }, argPackAdvance: 8, readValueFromPointer: T, u: function (m) {
                        R(m);
                    }, });
            }, _embind_register_value_object: function (a, b, c, d, e, f) {
                Va[a] = { name: M(b), K: Z(c, d), v: Z(e, f), N: [], };
            }, _embind_register_value_object_field: function (a, b, c, d, e, f, h, k, m, l) {
                Va[a].N.push({ U: M(b), Z: c, X: Z(d, e), Y: f, ea: h, da: Z(k, m), fa: l, });
            }, _embind_register_void: function (a, b) {
                b = M(b);
                W(a, { aa: !0, name: b, argPackAdvance: 0, fromWireType: function () {
                    }, toWireType: function () {
                    }, });
            }, _emval_call_method: function (a, b, c, d, e) {
                a = Cb[a];
                b = L(b);
                c = Bb(c);
                var f = [];
                D[d >> 2] = Ea(f);
                return a(b, c, f, e);
            }, _emval_call_void_method: function (a, b, c, d) {
                a = Cb[a];
                b = L(b);
                c = Bb(c);
                a(b, c, null, d);
            }, _emval_decref: rb, _emval_get_method_caller: function (a, b) {
                var c = Eb(a, b), d = c[0];
                b = d.name + "_$" + c.slice(1).map(function (h) {
                    return h.name;
                }).join("_") + "$";
                var e = Fb[b];
                if (void 0 !== e) {
                    return e;
                }
                var f = Array(a - 1);
                e = Db((h, k, m, l) => {
                    for (var n = 0, p = 0; p < a - 1; ++p) {
                        f[p] = c[p + 1].readValueFromPointer(l + n), n += c[p + 1].argPackAdvance;
                    }
                    h = h[k].apply(h, f);
                    for (p = 0; p < a - 1; ++p) {
                        c[p + 1].S && c[p + 1].S(f[p]);
                    }
                    if (!d.aa) {
                        return d.toWireType(m, h);
                    }
                });
                return Fb[b] = e;
            }, _emval_incref: function (a) {
                4 < a && (H[a].L += 1);
            }, _emval_run_destructors: function (a) {
                var b = L(a);
                Wa(b);
                rb(a);
            }, abort: function () {
                x("");
            }, emscripten_memcpy_big: function (a, b, c) {
                z.copyWithin(a, b, b + c);
            }, emscripten_resize_heap: function (a) {
                var b = z.length;
                a >>>= 0;
                if (2147483648 < a) {
                    return !1;
                }
                for (var c = 1; 4 >= c; c *= 2) {
                    var d = b * (1 + 0.2 / c);
                    d = Math.min(d, a + 100663296);
                    var e = Math;
                    d = Math.max(a, d);
                    e = e.min.call(e, 2147483648, d + (65536 - d % 65536) % 65536);
                    a: {
                        try {
                            fa.grow(e - ja.byteLength + 65535 >>> 16);
                            oa();
                            var f = 1;
                            break a;
                        }
                        catch (h) {
                        }
                        f = void 0;
                    }
                    if (f) {
                        return !0;
                    }
                }
                return !1;
            }, fd_close: function () {
                return 52;
            }, fd_seek: function () {
                return 70;
            }, fd_write: function (a, b, c, d) {
                for (var e = 0, f = 0; f < c; f++) {
                    var h = D[b >> 2], k = D[b + 4 >> 2];
                    b += 8;
                    for (var m = 0; m < k; m++) {
                        var l = z[h + m], n = Gb[a];
                        0 === l || 10 === l ? ((1 === a ? ea : v)(ia(n, 0)), n.length = 0) : n.push(l);
                    }
                    e += k;
                }
                D[d >> 2] = e;
                return 0;
            } };
        (function () {
            function a(e) {
                g.asm = e.exports;
                fa = g.asm.memory;
                oa();
                pa = g.asm.__indirect_function_table;
                ra.unshift(g.asm.__wasm_call_ctors);
                E--;
                g.monitorRunDependencies && g.monitorRunDependencies(E);
                0 == E && (null !== ua && (clearInterval(ua), ua = null), F && (e = F, F = null, e()));
            }
            function b(e) {
                a(e.instance);
            }
            function c(e) {
                return ya().then(function (f) {
                    return WebAssembly.instantiate(f, d);
                }).then(function (f) {
                    return f;
                }).then(e, function (f) {
                    v("failed to asynchronously prepare wasm: " + f);
                    x(f);
                });
            }
            var d = { env: Kb, wasi_snapshot_preview1: Kb, };
            E++;
            g.monitorRunDependencies && g.monitorRunDependencies(E);
            if (g.instantiateWasm) {
                try {
                    return g.instantiateWasm(d, a);
                }
                catch (e) {
                    v("Module.instantiateWasm callback failed with error: " + e), ca(e);
                }
            }
            (function () {
                return w || "function" != typeof WebAssembly.instantiateStreaming || va() || "function" != typeof fetch ? c(b) : fetch(G, { credentials: "same-origin" }).then(function (e) {
                    return WebAssembly.instantiateStreaming(e, d).then(b, function (f) {
                        v("wasm streaming compile failed: " + f);
                        v("falling back to ArrayBuffer instantiation");
                        return c(b);
                    });
                });
            })().catch(ca);
            return {};
        })();
        g.___wasm_call_ctors = function () {
            return (g.___wasm_call_ctors = g.asm.__wasm_call_ctors).apply(null, arguments);
        };
        var Ka = g.___getTypeName = function () {
            return (Ka = g.___getTypeName = g.asm.__getTypeName).apply(null, arguments);
        };
        g.__embind_initialize_bindings = function () {
            return (g.__embind_initialize_bindings = g.asm._embind_initialize_bindings).apply(null, arguments);
        };
        g.___errno_location = function () {
            return (g.___errno_location = g.asm.__errno_location).apply(null, arguments);
        };
        var Jb = g._malloc = function () {
            return (Jb = g._malloc = g.asm.malloc).apply(null, arguments);
        }, R = g._free = function () {
            return (R = g._free = g.asm.free).apply(null, arguments);
        };
        g.stackSave = function () {
            return (g.stackSave = g.asm.stackSave).apply(null, arguments);
        };
        g.stackRestore = function () {
            return (g.stackRestore = g.asm.stackRestore).apply(null, arguments);
        };
        g.stackAlloc = function () {
            return (g.stackAlloc = g.asm.stackAlloc).apply(null, arguments);
        };
        g.dynCall_jiji = function () {
            return (g.dynCall_jiji = g.asm.dynCall_jiji).apply(null, arguments);
        };
        var Lb;
        F = function Mb() {
            Lb || Nb();
            Lb || (F = Mb);
        };
        function Nb() {
            function a() {
                if (!Lb && (Lb = !0, g.calledRun = !0, !ha)) {
                    za(ra);
                    ba(g);
                    if (g.onRuntimeInitialized) {
                        g.onRuntimeInitialized();
                    }
                    if (g.postRun) {
                        for ("function" == typeof g.postRun && (g.postRun = [g.postRun]); g.postRun.length;) {
                            var b = g.postRun.shift();
                            sa.unshift(b);
                        }
                    }
                    za(sa);
                }
            }
            if (!(0 < E)) {
                if (g.preRun) {
                    for ("function" == typeof g.preRun && (g.preRun = [g.preRun]); g.preRun.length;) {
                        ta();
                    }
                }
                za(qa);
                0 < E || (g.setStatus ? (g.setStatus("Running..."), setTimeout(function () {
                    setTimeout(function () {
                        g.setStatus("");
                    }, 1);
                    a();
                }, 1)) : a());
            }
        }
        if (g.preInit) {
            for ("function" == typeof g.preInit && (g.preInit = [g.preInit]); 0 < g.preInit.length;) {
                g.preInit.pop()();
            }
        }
        Nb();
        return loadYoga.ready;
    });
})();
export default loadYoga;
