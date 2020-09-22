var isWorker = "undefined" == typeof window, isChromeApp = !1;
if (isChromeApp) {
    var parentSource = null, parentOrigin = null;
    window.addEventListener("message", function (e) {
        null === parentSource && (parentSource = e.source, parentOrigin = e.origin), onmessage(e)
    }), window.postMessage = function (e) {
        parentSource.postMessage(e, parentOrigin)
    }
}
if (isWorker || isChromeApp) {
    isChromeApp && (self = window);
    var server, nextId = 0, pending = {};
    self.onmessage = function (e) {
        var data = e.data;
        switch (data.type) {
            case"init":
                if (data.defs && data.defs.length > 0) {
                    for (var tmp = [], i = 0; i < data.defs.length; i++) tmp.push(getDefFromName(data.defs[i]));
                    data.defs = tmp
                }
                return startServer(data.defs, data.plugins, data.scripts);
            case"add":
                return server.addFile(data.name, data.text);
            case"del":
                return server.delFile(data.name);
            case"req":
                return server.request(data.body, function (e, t) {
                    postMessage({id: data.id, body: t, err: e && String(e)})
                });
            case"getFile":
                var c = pending[data.id];
                return delete pending[data.id], c(data.err, data.text);
            case"setDefs":
                return setDefs(data.defs);
            case"debug":
                debug(data.body);
                break;
            default:
                throw new Error("Unknown message type: " + data.type)
        }

        function setDefs(e) {
            try {
                if (server.defs = [], !e || 0 == e.length) return;
                for (var t = 0; t < e.length; t++) server.defs.push(getDefFromName(e[t]))
            } catch (e) {
            }
        }

        function getDefFromName(name) {
            try {
                return "string" != typeof name ? name : eval("def_" + name)
            } catch (e) {
                throw e
            }
        }

        function debug(e) {
            if ("files" == e || "filecontents" == e) for (var t = 0; t < server.files.length; t++) t > 0 && "\n", "filecontents" == e ? ("file: " + server.files[t].name + "\n\nbody:\n", server.files[t].text + "\n\n\n") : server.files[t].name
        }
    }, self.getFile = function (e, t) {
        postMessage({type: "getFile", name: e, id: ++nextId}), pending[nextId] = t
    }, self.startServer = function (e, t, r) {
        r && importScripts.apply(null, r), server = new tern.Server({getFile: getFile, async: !0, defs: e, plugins: t})
    }, self.console || (self.console = {
        log: function (e) {
            postMessage({type: "debug", message: e})
        }
    })
}

function _extend() {
    var e = arguments[0];
    return Array.prototype.slice.call(arguments, 1).forEach(function (t) {
        for (var r in t) e[r] = t[r]
    }), e
}

!function (e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).acorn = e()
    }
}(function () {
    return function e(t, r, o) {
        function n(s, a) {
            if (!r[s]) {
                if (!t[s]) {
                    var c = "function" == typeof require && require;
                    if (!a && c) return c(s, !0);
                    if (i) return i(s, !0);
                    var l = new Error("Cannot find module '" + s + "'");
                    throw l.code = "MODULE_NOT_FOUND", l
                }
                var p = r[s] = {exports: {}};
                t[s][0].call(p.exports, function (e) {
                    var r = t[s][1][e];
                    return n(r || e)
                }, p, p.exports, e, t, r, o)
            }
            return r[s].exports
        }

        for (var i = "function" == typeof require && require, s = 0; s < o.length; s++) n(o[s]);
        return n
    }({
        1: [function (e, t, r) {
            "use strict";
            r.parse = function (e, t) {
                var r = u(t, e), o = r.options.locations ? [r.pos, r.curPosition()] : r.pos;
                return r.nextToken(), r.parseTopLevel(r.options.program || r.startNodeAt(o))
            }, r.parseExpressionAt = function (e, t, r) {
                var o = u(r, e);
                return o.nextToken(), o.parseExpression()
            }, r.tokenizer = function (e, t) {
                return u(t, e)
            }, Object.defineProperty(r, "__esModule", {value: !0});
            var o = e("./state"), n = o.Parser, i = e("./options"), s = i.getOptions;
            e("./parseutil"), e("./statement"), e("./lval"), e("./expression"), r.Parser = o.Parser, r.plugins = o.plugins, r.defaultOptions = i.defaultOptions;
            var a = e("./location");
            r.SourceLocation = a.SourceLocation, r.getLineInfo = a.getLineInfo, r.Node = e("./node").Node;
            var c = e("./tokentype");
            r.TokenType = c.TokenType, r.tokTypes = c.types;
            var l = e("./tokencontext");
            r.TokContext = l.TokContext, r.tokContexts = l.types;
            var p = e("./identifier");
            r.isIdentifierChar = p.isIdentifierChar, r.isIdentifierStart = p.isIdentifierStart, r.Token = e("./tokenize").Token;
            var h = e("./whitespace");
            r.isNewLine = h.isNewLine, r.lineBreak = h.lineBreak, r.lineBreakG = h.lineBreakG;

            function u(e, t) {
                return new n(s(e), String(t))
            }

            r.version = "1.0.2"
        }, {
            "./expression": 2,
            "./identifier": 3,
            "./location": 4,
            "./lval": 5,
            "./node": 6,
            "./options": 7,
            "./parseutil": 8,
            "./state": 9,
            "./statement": 10,
            "./tokencontext": 11,
            "./tokenize": 12,
            "./tokentype": 13,
            "./whitespace": 15
        }],
        2: [function (e, t, r) {
            "use strict";
            var o = e("./tokentype").types, n = e("./state").Parser, i = e("./identifier").reservedWords,
                s = e("./util").has, a = n.prototype;
            a.checkPropClash = function (e, t) {
                if (!(this.options.ecmaVersion >= 6)) {
                    var r = e.key, o = void 0;
                    switch (r.type) {
                        case"Identifier":
                            o = r.name;
                            break;
                        case"Literal":
                            o = String(r.value);
                            break;
                        default:
                            return
                    }
                    var n = e.kind || "init", i = void 0;
                    if (s(t, o)) {
                        i = t[o];
                        var a = "init" !== n;
                        (!this.strict && !a || !i[n]) && a ^ i.init || this.raise(r.start, "Redefinition of property")
                    } else i = t[o] = {init: !1, get: !1, set: !1};
                    i[n] = !0
                }
            }, a.parseExpression = function (e, t) {
                var r = this.markPosition(), n = this.parseMaybeAssign(e, t);
                if (this.type === o.comma) {
                    var i = this.startNodeAt(r);
                    for (i.expressions = [n]; this.eat(o.comma);) i.expressions.push(this.parseMaybeAssign(e, t));
                    return this.finishNode(i, "SequenceExpression")
                }
                return n
            }, a.parseMaybeAssign = function (e, t) {
                if (this.type == o._yield && this.inGenerator) return this.parseYield();
                var r = void 0;
                t ? r = !1 : (t = {start: 0}, r = !0);
                var n = this.markPosition(), i = this.parseMaybeConditional(e, t);
                if (this.type.isAssign) {
                    var s = this.startNodeAt(n);
                    return s.operator = this.value, s.left = this.type === o.eq ? this.toAssignable(i) : i, t.start = 0, this.checkLVal(i), this.next(), s.right = this.parseMaybeAssign(e), this.finishNode(s, "AssignmentExpression")
                }
                return r && t.start && this.unexpected(t.start), i
            }, a.parseMaybeConditional = function (e, t) {
                var r = this.markPosition(), n = this.parseExprOps(e, t);
                if (t && t.start) return n;
                if (this.eat(o.question)) {
                    var i = this.startNodeAt(r);
                    return i.test = n, i.consequent = this.parseMaybeAssign(), this.expect(o.colon), i.alternate = this.parseMaybeAssign(e), this.finishNode(i, "ConditionalExpression")
                }
                return n
            }, a.parseExprOps = function (e, t) {
                var r = this.markPosition(), o = this.parseMaybeUnary(t);
                return t && t.start ? o : this.parseExprOp(o, r, -1, e)
            }, a.parseExprOp = function (e, t, r, n) {
                var i = this.type.binop;
                if (null != i && (!n || this.type !== o._in) && i > r) {
                    var s = this.startNodeAt(t);
                    s.left = e, s.operator = this.value;
                    var a = this.type;
                    this.next();
                    var c = this.markPosition();
                    return s.right = this.parseExprOp(this.parseMaybeUnary(), c, i, n), this.finishNode(s, a === o.logicalOR || a === o.logicalAND ? "LogicalExpression" : "BinaryExpression"), this.parseExprOp(s, t, r, n)
                }
                return e
            }, a.parseMaybeUnary = function (e) {
                if (this.type.prefix) {
                    var t = this.startNode(), r = this.type === o.incDec;
                    return t.operator = this.value, t.prefix = !0, this.next(), t.argument = this.parseMaybeUnary(), e && e.start && this.unexpected(e.start), r ? this.checkLVal(t.argument) : this.strict && "delete" === t.operator && "Identifier" === t.argument.type && this.raise(t.start, "Deleting local variable in strict mode"), this.finishNode(t, r ? "UpdateExpression" : "UnaryExpression")
                }
                var n = this.markPosition(), i = this.parseExprSubscripts(e);
                if (e && e.start) return i;
                for (; this.type.postfix && !this.canInsertSemicolon();) {
                    (t = this.startNodeAt(n)).operator = this.value, t.prefix = !1, t.argument = i, this.checkLVal(i), this.next(), i = this.finishNode(t, "UpdateExpression")
                }
                return i
            }, a.parseExprSubscripts = function (e) {
                var t = this.markPosition(), r = this.parseExprAtom(e);
                return e && e.start ? r : this.parseSubscripts(r, t)
            }, a.parseSubscripts = function (e, t, r) {
                var n;
                return this.eat(o.dot) ? ((n = this.startNodeAt(t)).object = e, n.property = this.parseIdent(!0), n.computed = !1, this.parseSubscripts(this.finishNode(n, "MemberExpression"), t, r)) : this.eat(o.bracketL) ? ((n = this.startNodeAt(t)).object = e, n.property = this.parseExpression(), n.computed = !0, this.expect(o.bracketR), this.parseSubscripts(this.finishNode(n, "MemberExpression"), t, r)) : !r && this.eat(o.parenL) ? ((n = this.startNodeAt(t)).callee = e, n.arguments = this.parseExprList(o.parenR, !1), this.parseSubscripts(this.finishNode(n, "CallExpression"), t, r)) : this.type === o.backQuote ? ((n = this.startNodeAt(t)).tag = e, n.quasi = this.parseTemplate(), this.parseSubscripts(this.finishNode(n, "TaggedTemplateExpression"), t, r)) : e
            }, a.parseExprAtom = function (e) {
                var t = void 0;
                switch (this.type) {
                    case o._this:
                    case o._super:
                        var r = this.type === o._this ? "ThisExpression" : "Super";
                        return t = this.startNode(), this.next(), this.finishNode(t, r);
                    case o._yield:
                        this.inGenerator && this.unexpected();
                    case o.name:
                        var n = this.markPosition(), i = this.parseIdent(this.type !== o.name);
                        return !this.canInsertSemicolon() && this.eat(o.arrow) ? this.parseArrowExpression(this.startNodeAt(n), [i]) : i;
                    case o.regexp:
                        var s = this.value;
                        return (t = this.parseLiteral(s.value)).regex = {pattern: s.pattern, flags: s.flags}, t;
                    case o.num:
                    case o.string:
                        return this.parseLiteral(this.value);
                    case o._null:
                    case o._true:
                    case o._false:
                        return (t = this.startNode()).value = this.type === o._null ? null : this.type === o._true, t.raw = this.type.keyword, this.next(), this.finishNode(t, "Literal");
                    case o.parenL:
                        return this.parseParenAndDistinguishExpression();
                    case o.bracketL:
                        return t = this.startNode(), this.next(), this.options.ecmaVersion >= 7 && this.type === o._for ? this.parseComprehension(t, !1) : (t.elements = this.parseExprList(o.bracketR, !0, !0, e), this.finishNode(t, "ArrayExpression"));
                    case o.braceL:
                        return this.parseObj(!1, e);
                    case o._function:
                        return t = this.startNode(), this.next(), this.parseFunction(t, !1);
                    case o._class:
                        return this.parseClass(this.startNode(), !1);
                    case o._new:
                        return this.parseNew();
                    case o.backQuote:
                        return this.parseTemplate();
                    default:
                        this.unexpected()
                }
            }, a.parseLiteral = function (e) {
                var t = this.startNode();
                return t.value = e, t.raw = this.input.slice(this.start, this.end), this.next(), this.finishNode(t, "Literal")
            }, a.parseParenExpression = function () {
                this.expect(o.parenL);
                var e = this.parseExpression();
                return this.expect(o.parenR), e
            }, a.parseParenAndDistinguishExpression = function () {
                var e = this.markPosition(), t = void 0;
                if (this.options.ecmaVersion >= 6) {
                    if (this.next(), this.options.ecmaVersion >= 7 && this.type === o._for) return this.parseComprehension(this.startNodeAt(e), !0);
                    for (var r = this.markPosition(), n = [], i = !0, s = {start: 0}, a = void 0, c = void 0; this.type !== o.parenR;) {
                        if (i ? i = !1 : this.expect(o.comma), this.type === o.ellipsis) {
                            a = this.start, n.push(this.parseRest());
                            break
                        }
                        this.type !== o.parenL || c || (c = this.start), n.push(this.parseMaybeAssign(!1, s))
                    }
                    var l = this.markPosition();
                    if (this.expect(o.parenR), !this.canInsertSemicolon() && this.eat(o.arrow)) return c && this.unexpected(c), this.parseArrowExpression(this.startNodeAt(e), n);
                    n.length || this.unexpected(this.lastTokStart), a && this.unexpected(a), s.start && this.unexpected(s.start), n.length > 1 ? ((t = this.startNodeAt(r)).expressions = n, this.finishNodeAt(t, "SequenceExpression", l)) : t = n[0]
                } else t = this.parseParenExpression();
                if (this.options.preserveParens) {
                    var p = this.startNodeAt(e);
                    return p.expression = t, this.finishNode(p, "ParenthesizedExpression")
                }
                return t
            };
            var c = [];
            a.parseNew = function () {
                var e = this.startNode(), t = this.parseIdent(!0);
                if (this.options.ecmaVersion >= 6 && this.eat(o.dot)) return e.meta = t, e.property = this.parseIdent(!0), "target" !== e.property.name && this.raise(e.property.start, "The only valid meta property for new is new.target"), this.finishNode(e, "MetaProperty");
                var r = this.markPosition();
                return e.callee = this.parseSubscripts(this.parseExprAtom(), r, !0), this.eat(o.parenL) ? e.arguments = this.parseExprList(o.parenR, !1) : e.arguments = c, this.finishNode(e, "NewExpression")
            }, a.parseTemplateElement = function () {
                var e = this.startNode();
                return e.value = {
                    raw: this.input.slice(this.start, this.end),
                    cooked: this.value
                }, this.next(), e.tail = this.type === o.backQuote, this.finishNode(e, "TemplateElement")
            }, a.parseTemplate = function () {
                var e = this.startNode();
                this.next(), e.expressions = [];
                var t = this.parseTemplateElement();
                for (e.quasis = [t]; !t.tail;) this.expect(o.dollarBraceL), e.expressions.push(this.parseExpression()), this.expect(o.braceR), e.quasis.push(t = this.parseTemplateElement());
                return this.next(), this.finishNode(e, "TemplateLiteral")
            }, a.parseObj = function (e, t) {
                var r = this.startNode(), n = !0, s = {};
                for (r.properties = [], this.next(); !this.eat(o.braceR);) {
                    if (n) n = !1; else if (this.expect(o.comma), this.afterTrailingComma(o.braceR)) break;
                    var a = this.startNode(), c = void 0, l = void 0;
                    this.options.ecmaVersion >= 6 && (a.method = !1, a.shorthand = !1, (e || t) && (l = this.markPosition()), e || (c = this.eat(o.star))), this.parsePropertyName(a), this.eat(o.colon) ? (a.value = e ? this.parseMaybeDefault() : this.parseMaybeAssign(!1, t), a.kind = "init") : this.options.ecmaVersion >= 6 && this.type === o.parenL ? (e && this.unexpected(), a.kind = "init", a.method = !0, a.value = this.parseMethod(c)) : this.options.ecmaVersion >= 5 && !a.computed && "Identifier" === a.key.type && ("get" === a.key.name || "set" === a.key.name) && this.type != o.comma && this.type != o.braceR ? ((c || e) && this.unexpected(), a.kind = a.key.name, this.parsePropertyName(a), a.value = this.parseMethod(!1)) : this.options.ecmaVersion >= 6 && !a.computed && "Identifier" === a.key.type ? (a.kind = "init", e ? ((this.isKeyword(a.key.name) || this.strict && (i.strictBind(a.key.name) || i.strict(a.key.name)) || !this.options.allowReserved && this.isReservedWord(a.key.name)) && this.raise(a.key.start, "Binding " + a.key.name), a.value = this.parseMaybeDefault(l, a.key)) : this.type === o.eq && t ? (t.start || (t.start = this.start), a.value = this.parseMaybeDefault(l, a.key)) : a.value = a.key, a.shorthand = !0) : this.unexpected(), this.checkPropClash(a, s), r.properties.push(this.finishNode(a, "Property"))
                }
                return this.finishNode(r, e ? "ObjectPattern" : "ObjectExpression")
            }, a.parsePropertyName = function (e) {
                if (this.options.ecmaVersion >= 6) {
                    if (this.eat(o.bracketL)) return e.computed = !0, e.key = this.parseMaybeAssign(), void this.expect(o.bracketR);
                    e.computed = !1
                }
                e.key = this.type === o.num || this.type === o.string ? this.parseExprAtom() : this.parseIdent(!0)
            }, a.initFunction = function (e) {
                e.id = null, this.options.ecmaVersion >= 6 && (e.generator = !1, e.expression = !1)
            }, a.parseMethod = function (e) {
                var t = this.startNode();
                this.initFunction(t), this.expect(o.parenL), t.params = this.parseBindingList(o.parenR, !1, !1);
                var r = void 0;
                return this.options.ecmaVersion >= 6 ? (t.generator = e, r = !0) : r = !1, this.parseFunctionBody(t, r), this.finishNode(t, "FunctionExpression")
            }, a.parseArrowExpression = function (e, t) {
                return this.initFunction(e), e.params = this.toAssignableList(t, !0), this.parseFunctionBody(e, !0), this.finishNode(e, "ArrowFunctionExpression")
            }, a.parseFunctionBody = function (e, t) {
                var r = t && this.type !== o.braceL;
                if (r) e.body = this.parseMaybeAssign(), e.expression = !0; else {
                    var n = this.inFunction, i = this.inGenerator, s = this.labels;
                    this.inFunction = !0, this.inGenerator = e.generator, this.labels = [], e.body = this.parseBlock(!0), e.expression = !1, this.inFunction = n, this.inGenerator = i, this.labels = s
                }
                if (this.strict || !r && e.body.body.length && this.isUseStrict(e.body.body[0])) {
                    var a = {}, c = this.strict;
                    this.strict = !0, e.id && this.checkLVal(e.id, !0);
                    for (var l = 0; l < e.params.length; l++) this.checkLVal(e.params[l], !0, a);
                    this.strict = c
                }
            }, a.parseExprList = function (e, t, r, n) {
                for (var i = [], s = !0; !this.eat(e);) {
                    if (s) s = !1; else if (this.expect(o.comma), t && this.afterTrailingComma(e)) break;
                    r && this.type === o.comma ? i.push(null) : this.type === o.ellipsis ? i.push(this.parseSpread(n)) : i.push(this.parseMaybeAssign(!1, n))
                }
                return i
            }, a.parseIdent = function (e) {
                var t = this.startNode();
                return e && "never" == this.options.allowReserved && (e = !1), this.type === o.name ? (!e && (!this.options.allowReserved && this.isReservedWord(this.value) || this.strict && i.strict(this.value) && (this.options.ecmaVersion >= 6 || -1 == this.input.slice(this.start, this.end).indexOf("\\"))) && this.raise(this.start, "The keyword '" + this.value + "' is reserved"), t.name = this.value) : e && this.type.keyword ? t.name = this.type.keyword : this.unexpected(), this.next(), this.finishNode(t, "Identifier")
            }, a.parseYield = function () {
                var e = this.startNode();
                return this.next(), this.type == o.semi || this.canInsertSemicolon() || this.type != o.star && !this.type.startsExpr ? (e.delegate = !1, e.argument = null) : (e.delegate = this.eat(o.star), e.argument = this.parseMaybeAssign()), this.finishNode(e, "YieldExpression")
            }, a.parseComprehension = function (e, t) {
                for (e.blocks = []; this.type === o._for;) {
                    var r = this.startNode();
                    this.next(), this.expect(o.parenL), r.left = this.parseBindingAtom(), this.checkLVal(r.left, !0), this.expectContextual("of"), r.right = this.parseExpression(), this.expect(o.parenR), e.blocks.push(this.finishNode(r, "ComprehensionBlock"))
                }
                return e.filter = this.eat(o._if) ? this.parseParenExpression() : null, e.body = this.parseExpression(), this.expect(t ? o.parenR : o.bracketR), e.generator = t, this.finishNode(e, "ComprehensionExpression")
            }
        }, {"./identifier": 3, "./state": 9, "./tokentype": 13, "./util": 14}],
        3: [function (e, t, r) {
            "use strict";
            r.isIdentifierStart = function (e, t) {
                if (e < 65) return 36 === e;
                if (e < 91) return !0;
                if (e < 97) return 95 === e;
                if (e < 123) return !0;
                if (e <= 65535) return e >= 170 && i.test(String.fromCharCode(e));
                if (!1 === t) return !1;
                return l(e, a)
            }, r.isIdentifierChar = function (e, t) {
                if (e < 48) return 36 === e;
                if (e < 58) return !0;
                if (e < 65) return !1;
                if (e < 91) return !0;
                if (e < 97) return 95 === e;
                if (e < 123) return !0;
                if (e <= 65535) return e >= 170 && s.test(String.fromCharCode(e));
                if (!1 === t) return !1;
                return l(e, a) || l(e, c)
            }, Object.defineProperty(r, "__esModule", {value: !0});
            r.reservedWords = {
                3: function (e) {
                    switch (e.length) {
                        case 6:
                            switch (e) {
                                case"double":
                                case"export":
                                case"import":
                                case"native":
                                case"public":
                                case"static":
                                case"throws":
                                    return !0
                            }
                            return !1;
                        case 4:
                            switch (e) {
                                case"byte":
                                case"char":
                                case"enum":
                                case"goto":
                                case"long":
                                    return !0
                            }
                            return !1;
                        case 5:
                            switch (e) {
                                case"class":
                                case"final":
                                case"float":
                                case"short":
                                case"super":
                                    return !0
                            }
                            return !1;
                        case 7:
                            switch (e) {
                                case"boolean":
                                case"extends":
                                case"package":
                                case"private":
                                    return !0
                            }
                            return !1;
                        case 9:
                            switch (e) {
                                case"interface":
                                case"protected":
                                case"transient":
                                    return !0
                            }
                            return !1;
                        case 8:
                            switch (e) {
                                case"abstract":
                                case"volatile":
                                    return !0
                            }
                            return !1;
                        case 10:
                            return "implements" === e;
                        case 3:
                            return "int" === e;
                        case 12:
                            return "synchronized" === e
                    }
                }, 5: function (e) {
                    switch (e.length) {
                        case 5:
                            switch (e) {
                                case"class":
                                case"super":
                                case"const":
                                    return !0
                            }
                            return !1;
                        case 6:
                            switch (e) {
                                case"export":
                                case"import":
                                    return !0
                            }
                            return !1;
                        case 4:
                            return "enum" === e;
                        case 7:
                            return "extends" === e
                    }
                }, 6: function (e) {
                    switch (e) {
                        case"enum":
                        case"await":
                            return !0
                    }
                    return !1
                }, strict: function (e) {
                    switch (e.length) {
                        case 9:
                            switch (e) {
                                case"interface":
                                case"protected":
                                    return !0
                            }
                            return !1;
                        case 7:
                            switch (e) {
                                case"package":
                                case"private":
                                    return !0
                            }
                            return !1;
                        case 6:
                            switch (e) {
                                case"public":
                                case"static":
                                    return !0
                            }
                            return !1;
                        case 10:
                            return "implements" === e;
                        case 3:
                            return "let" === e;
                        case 5:
                            return "yield" === e
                    }
                }, strictBind: function (e) {
                    switch (e) {
                        case"eval":
                        case"arguments":
                            return !0
                    }
                    return !1
                }
            };
            r.keywords = {
                5: function (e) {
                    switch (e.length) {
                        case 4:
                            switch (e) {
                                case"case":
                                case"else":
                                case"with":
                                case"null":
                                case"true":
                                case"void":
                                case"this":
                                    return !0
                            }
                            return !1;
                        case 5:
                            switch (e) {
                                case"break":
                                case"catch":
                                case"throw":
                                case"while":
                                case"false":
                                    return !0
                            }
                            return !1;
                        case 3:
                            switch (e) {
                                case"for":
                                case"try":
                                case"var":
                                case"new":
                                    return !0
                            }
                            return !1;
                        case 6:
                            switch (e) {
                                case"return":
                                case"switch":
                                case"typeof":
                                case"delete":
                                    return !0
                            }
                            return !1;
                        case 8:
                            switch (e) {
                                case"continue":
                                case"debugger":
                                case"function":
                                    return !0
                            }
                            return !1;
                        case 2:
                            switch (e) {
                                case"do":
                                case"if":
                                case"in":
                                    return !0
                            }
                            return !1;
                        case 7:
                            switch (e) {
                                case"default":
                                case"finally":
                                    return !0
                            }
                            return !1;
                        case 10:
                            return "instanceof" === e
                    }
                }, 6: function (e) {
                    switch (e.length) {
                        case 5:
                            switch (e) {
                                case"break":
                                case"catch":
                                case"throw":
                                case"while":
                                case"false":
                                case"const":
                                case"class":
                                case"yield":
                                case"super":
                                    return !0
                            }
                            return !1;
                        case 4:
                            switch (e) {
                                case"case":
                                case"else":
                                case"with":
                                case"null":
                                case"true":
                                case"void":
                                case"this":
                                    return !0
                            }
                            return !1;
                        case 6:
                            switch (e) {
                                case"return":
                                case"switch":
                                case"typeof":
                                case"delete":
                                case"export":
                                case"import":
                                    return !0
                            }
                            return !1;
                        case 3:
                            switch (e) {
                                case"for":
                                case"try":
                                case"var":
                                case"new":
                                case"let":
                                    return !0
                            }
                            return !1;
                        case 8:
                            switch (e) {
                                case"continue":
                                case"debugger":
                                case"function":
                                    return !0
                            }
                            return !1;
                        case 7:
                            switch (e) {
                                case"default":
                                case"finally":
                                case"extends":
                                    return !0
                            }
                            return !1;
                        case 2:
                            switch (e) {
                                case"do":
                                case"if":
                                case"in":
                                    return !0
                            }
                            return !1;
                        case 10:
                            return "instanceof" === e
                    }
                }
            };
            var o = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠ-ࢲऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞭꞰꞱꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭟꭤꭥꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ",
                n = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࣤ-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఃా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഁ-ഃാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏ᦰ-ᧀᧈᧉ᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳸᳹᷀-᷵᷼-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-꣄꣐-꣙꣠-꣱꤀-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︭︳︴﹍-﹏０-９＿",
                i = new RegExp("[" + o + "]"), s = new RegExp("[" + o + n + "]");
            o = n = null;
            var a = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 99, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 98, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 955, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 38, 17, 2, 24, 133, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 32, 4, 287, 47, 21, 1, 2, 0, 185, 46, 82, 47, 21, 0, 60, 42, 502, 63, 32, 0, 449, 56, 1288, 920, 104, 110, 2962, 1070, 13266, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 16481, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 1340, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 16355, 541],
                c = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 16, 9, 83, 11, 168, 11, 6, 9, 8, 2, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 316, 19, 13, 9, 214, 6, 3, 8, 112, 16, 16, 9, 82, 12, 9, 9, 535, 9, 20855, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 4305, 6, 792618, 239];

            function l(e, t) {
                for (var r = 65536, o = 0; o < t.length; o += 2) {
                    if ((r += t[o]) > e) return !1;
                    if ((r += t[o + 1]) >= e) return !0
                }
            }
        }, {}],
        4: [function (e, t, r) {
            "use strict";
            var o = function () {
                function e(e, t) {
                    for (var r in t) {
                        var o = t[r];
                        o.configurable = !0, o.value && (o.writable = !0)
                    }
                    Object.defineProperties(e, t)
                }

                return function (t, r, o) {
                    return r && e(t.prototype, r), o && e(t, o), t
                }
            }(), n = function (e, t) {
                if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
            };
            r.getLineInfo = c, Object.defineProperty(r, "__esModule", {value: !0});
            var i = e("./state").Parser, s = e("./whitespace").lineBreakG, a = r.Position = function () {
                function e(t, r) {
                    n(this, e), this.line = t, this.column = r
                }

                return o(e, {
                    offset: {
                        value: function (t) {
                            return new e(this.line, this.column + t)
                        }
                    }
                }), e
            }();
            r.SourceLocation = function e(t, r, o) {
                n(this, e), this.start = r, this.end = o, null !== t.sourceFile && (this.source = t.sourceFile)
            };

            function c(e, t) {
                for (var r = 1, o = 0; ;) {
                    s.lastIndex = o;
                    var n = s.exec(e);
                    if (!(n && n.index < t)) return new a(r, t - o);
                    ++r, o = n.index + n[0].length
                }
            }

            var l = i.prototype;
            l.raise = function (e, t) {
                var r = c(this.input, e);
                t += " (" + r.line + ":" + r.column + ")";
                var o = new SyntaxError(t);
                throw o.pos = e, o.loc = r, o.raisedAt = this.pos, o
            }, l.curPosition = function () {
                return new a(this.curLine, this.pos - this.lineStart)
            }, l.markPosition = function () {
                return this.options.locations ? [this.start, this.startLoc] : this.start
            }
        }, {"./state": 9, "./whitespace": 15}],
        5: [function (e, t, r) {
            "use strict";
            var o = e("./tokentype").types, n = e("./state").Parser, i = e("./identifier").reservedWords,
                s = e("./util").has, a = n.prototype;
            a.toAssignable = function (e, t) {
                if (this.options.ecmaVersion >= 6 && e) switch (e.type) {
                    case"Identifier":
                    case"ObjectPattern":
                    case"ArrayPattern":
                    case"AssignmentPattern":
                        break;
                    case"ObjectExpression":
                        e.type = "ObjectPattern";
                        for (var r = 0; r < e.properties.length; r++) {
                            var o = e.properties[r];
                            "init" !== o.kind && this.raise(o.key.start, "Object pattern can't contain getter or setter"), this.toAssignable(o.value, t)
                        }
                        break;
                    case"ArrayExpression":
                        e.type = "ArrayPattern", this.toAssignableList(e.elements, t);
                        break;
                    case"AssignmentExpression":
                        "=" === e.operator ? e.type = "AssignmentPattern" : this.raise(e.left.end, "Only '=' operator can be used for specifying default value.");
                        break;
                    case"MemberExpression":
                        if (!t) break;
                    default:
                        this.raise(e.start, "Assigning to rvalue")
                }
                return e
            }, a.toAssignableList = function (e, t) {
                var r = e.length;
                if (r) {
                    var o = e[r - 1];
                    if (o && "RestElement" == o.type) --r; else if (o && "SpreadElement" == o.type) {
                        o.type = "RestElement";
                        var n = o.argument;
                        this.toAssignable(n, t), "Identifier" !== n.type && "MemberExpression" !== n.type && "ArrayPattern" !== n.type && this.unexpected(n.start), --r
                    }
                }
                for (var i = 0; i < r; i++) {
                    var s = e[i];
                    s && this.toAssignable(s, t)
                }
                return e
            }, a.parseSpread = function (e) {
                var t = this.startNode();
                return this.next(), t.argument = this.parseMaybeAssign(e), this.finishNode(t, "SpreadElement")
            }, a.parseRest = function () {
                var e = this.startNode();
                return this.next(), e.argument = this.type === o.name || this.type === o.bracketL ? this.parseBindingAtom() : this.unexpected(), this.finishNode(e, "RestElement")
            }, a.parseBindingAtom = function () {
                if (this.options.ecmaVersion < 6) return this.parseIdent();
                switch (this.type) {
                    case o.name:
                        return this.parseIdent();
                    case o.bracketL:
                        var e = this.startNode();
                        return this.next(), e.elements = this.parseBindingList(o.bracketR, !0, !0), this.finishNode(e, "ArrayPattern");
                    case o.braceL:
                        return this.parseObj(!0);
                    default:
                        this.unexpected()
                }
            }, a.parseBindingList = function (e, t, r) {
                for (var n = [], i = !0; !this.eat(e);) if (i ? i = !1 : this.expect(o.comma), t && this.type === o.comma) n.push(null); else {
                    if (r && this.afterTrailingComma(e)) break;
                    if (this.type === o.ellipsis) {
                        n.push(this.parseRest()), this.expect(e);
                        break
                    }
                    n.push(this.parseMaybeDefault())
                }
                return n
            }, a.parseMaybeDefault = function (e, t) {
                if (e = e || this.markPosition(), t = t || this.parseBindingAtom(), !this.eat(o.eq)) return t;
                var r = this.startNodeAt(e);
                return r.operator = "=", r.left = t, r.right = this.parseMaybeAssign(), this.finishNode(r, "AssignmentPattern")
            }, a.checkLVal = function (e, t, r) {
                switch (e.type) {
                    case"Identifier":
                        this.strict && (i.strictBind(e.name) || i.strict(e.name)) && this.raise(e.start, (t ? "Binding " : "Assigning to ") + e.name + " in strict mode"), r && (s(r, e.name) && this.raise(e.start, "Argument name clash in strict mode"), r[e.name] = !0);
                        break;
                    case"MemberExpression":
                        t && this.raise(e.start, (t ? "Binding" : "Assigning to") + " member expression");
                        break;
                    case"ObjectPattern":
                        for (var o = 0; o < e.properties.length; o++) this.checkLVal(e.properties[o].value, t, r);
                        break;
                    case"ArrayPattern":
                        for (o = 0; o < e.elements.length; o++) {
                            var n = e.elements[o];
                            n && this.checkLVal(n, t, r)
                        }
                        break;
                    case"AssignmentPattern":
                        this.checkLVal(e.left, t, r);
                        break;
                    case"RestElement":
                        this.checkLVal(e.argument, t, r);
                        break;
                    default:
                        this.raise(e.start, (t ? "Binding" : "Assigning to") + " rvalue")
                }
            }
        }, {"./identifier": 3, "./state": 9, "./tokentype": 13, "./util": 14}],
        6: [function (e, t, r) {
            "use strict";
            Object.defineProperty(r, "__esModule", {value: !0});
            var o = e("./state").Parser, n = e("./location").SourceLocation, i = o.prototype,
                s = r.Node = function e() {
                    !function (e, t) {
                        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                    }(this, e)
                };
            i.startNode = function () {
                var e = new s;
                return e.start = this.start, this.options.locations && (e.loc = new n(this, this.startLoc)), this.options.directSourceFile && (e.sourceFile = this.options.directSourceFile), this.options.ranges && (e.range = [this.start, 0]), e
            }, i.startNodeAt = function (e) {
                var t = new s, r = e;
                return this.options.locations && (t.loc = new n(this, r[1]), r = e[0]), t.start = r, this.options.directSourceFile && (t.sourceFile = this.options.directSourceFile), this.options.ranges && (t.range = [r, 0]), t
            }, i.finishNode = function (e, t) {
                return e.type = t, e.end = this.lastTokEnd, this.options.locations && (e.loc.end = this.lastTokEndLoc), this.options.ranges && (e.range[1] = this.lastTokEnd), e
            }, i.finishNodeAt = function (e, t, r) {
                return this.options.locations && (e.loc.end = r[1], r = r[0]), e.type = t, e.end = r, this.options.ranges && (e.range[1] = r), e
            }
        }, {"./location": 4, "./state": 9}],
        7: [function (e, t, r) {
            "use strict";
            r.getOptions = function (e) {
                var t = {};
                for (var r in a) t[r] = e && n(e, r) ? e[r] : a[r];
                i(t.onToken) && function () {
                    var e = t.onToken;
                    t.onToken = function (t) {
                        return e.push(t)
                    }
                }();
                i(t.onComment) && (t.onComment = function (e, t) {
                    return function (r, o, n, i, a, c) {
                        var l = {type: r ? "Block" : "Line", value: o, start: n, end: i};
                        e.locations && (l.loc = new s(this, a, c)), e.ranges && (l.range = [n, i]), t.push(l)
                    }
                }(t, t.onComment));
                return t
            }, Object.defineProperty(r, "__esModule", {value: !0});
            var o = e("./util"), n = o.has, i = o.isArray, s = e("./location").SourceLocation, a = {
                ecmaVersion: 5,
                sourceType: "script",
                onInsertedSemicolon: null,
                onTrailingComma: null,
                allowReserved: !0,
                allowReturnOutsideFunction: !1,
                allowImportExportEverywhere: !1,
                allowHashBang: !1,
                locations: !1,
                onToken: null,
                onComment: null,
                ranges: !1,
                program: null,
                sourceFile: null,
                directSourceFile: null,
                preserveParens: !1,
                plugins: {}
            };
            r.defaultOptions = a
        }, {"./location": 4, "./util": 14}],
        8: [function (e, t, r) {
            "use strict";
            var o = e("./tokentype").types, n = e("./state").Parser, i = e("./whitespace").lineBreak, s = n.prototype;
            s.isUseStrict = function (e) {
                return this.options.ecmaVersion >= 5 && "ExpressionStatement" === e.type && "Literal" === e.expression.type && "use strict" === e.expression.value
            }, s.eat = function (e) {
                return this.type === e && (this.next(), !0)
            }, s.isContextual = function (e) {
                return this.type === o.name && this.value === e
            }, s.eatContextual = function (e) {
                return this.value === e && this.eat(o.name)
            }, s.expectContextual = function (e) {
                this.eatContextual(e) || this.unexpected()
            }, s.canInsertSemicolon = function () {
                return this.type === o.eof || this.type === o.braceR || i.test(this.input.slice(this.lastTokEnd, this.start))
            }, s.insertSemicolon = function () {
                if (this.canInsertSemicolon()) return this.options.onInsertedSemicolon && this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc), !0
            }, s.semicolon = function () {
                this.eat(o.semi) || this.insertSemicolon() || this.unexpected()
            }, s.afterTrailingComma = function (e) {
                if (this.type == e) return this.options.onTrailingComma && this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc), this.next(), !0
            }, s.expect = function (e) {
                this.eat(e) || this.unexpected()
            }, s.unexpected = function (e) {
                this.raise(null != e ? e : this.start, "Unexpected token")
            }
        }, {"./state": 9, "./tokentype": 13, "./whitespace": 15}],
        9: [function (e, t, r) {
            "use strict";
            r.Parser = l, Object.defineProperty(r, "__esModule", {value: !0});
            var o = e("./identifier"), n = o.reservedWords, i = o.keywords, s = e("./tokentype"), a = s.types,
                c = s.lineBreak;

            function l(e, t, r) {
                this.options = e, this.loadPlugins(this.options.plugins), this.sourceFile = this.options.sourceFile || null, this.isKeyword = i[this.options.ecmaVersion >= 6 ? 6 : 5], this.isReservedWord = n[this.options.ecmaVersion], this.input = t, r ? (this.pos = r, this.lineStart = Math.max(0, this.input.lastIndexOf("\n", r)), this.curLine = this.input.slice(0, this.lineStart).split(c).length) : (this.pos = this.lineStart = 0, this.curLine = 1), this.type = a.eof, this.value = null, this.start = this.end = this.pos, this.startLoc = this.endLoc = null, this.lastTokEndLoc = this.lastTokStartLoc = null, this.lastTokStart = this.lastTokEnd = this.pos, this.context = this.initialContext(), this.exprAllowed = !0, this.strict = this.inModule = "module" === this.options.sourceType, this.inFunction = this.inGenerator = !1, this.labels = [], 0 === this.pos && this.options.allowHashBang && "#!" === this.input.slice(0, 2) && this.skipLineComment(2)
            }

            l.prototype.extend = function (e, t) {
                this[e] = t(this[e])
            };
            r.plugins = {}, l.prototype.loadPlugins = function (e) {
                for (var t in e) {
                    var o = r.plugins[t];
                    if (!o) throw new Error("Plugin '" + t + "' not found");
                    o(this, e[t])
                }
            }
        }, {"./identifier": 3, "./tokentype": 13}],
        10: [function (e, t, r) {
            "use strict";
            var o = e("./tokentype").types, n = e("./state").Parser, i = e("./whitespace").lineBreak, s = n.prototype;
            s.parseTopLevel = function (e) {
                var t = !0;
                for (e.body || (e.body = []); this.type !== o.eof;) {
                    var r = this.parseStatement(!0, !0);
                    e.body.push(r), t && this.isUseStrict(r) && this.setStrict(!0), t = !1
                }
                return this.next(), this.options.ecmaVersion >= 6 && (e.sourceType = this.options.sourceType), this.finishNode(e, "Program")
            };
            var a = {kind: "loop"}, c = {kind: "switch"};
            s.parseStatement = function (e, t) {
                var r = this.type, n = this.startNode();
                switch (r) {
                    case o._break:
                    case o._continue:
                        return this.parseBreakContinueStatement(n, r.keyword);
                    case o._debugger:
                        return this.parseDebuggerStatement(n);
                    case o._do:
                        return this.parseDoStatement(n);
                    case o._for:
                        return this.parseForStatement(n);
                    case o._function:
                        return !e && this.options.ecmaVersion >= 6 && this.unexpected(), this.parseFunctionStatement(n);
                    case o._class:
                        return e || this.unexpected(), this.parseClass(n, !0);
                    case o._if:
                        return this.parseIfStatement(n);
                    case o._return:
                        return this.parseReturnStatement(n);
                    case o._switch:
                        return this.parseSwitchStatement(n);
                    case o._throw:
                        return this.parseThrowStatement(n);
                    case o._try:
                        return this.parseTryStatement(n);
                    case o._let:
                    case o._const:
                        e || this.unexpected();
                    case o._var:
                        return this.parseVarStatement(n, r);
                    case o._while:
                        return this.parseWhileStatement(n);
                    case o._with:
                        return this.parseWithStatement(n);
                    case o.braceL:
                        return this.parseBlock();
                    case o.semi:
                        return this.parseEmptyStatement(n);
                    case o._export:
                    case o._import:
                        return this.options.allowImportExportEverywhere || (t || this.raise(this.start, "'import' and 'export' may only appear at the top level"), this.inModule || this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'")), r === o._import ? this.parseImport(n) : this.parseExport(n);
                    default:
                        var i = this.value, s = this.parseExpression();
                        return r === o.name && "Identifier" === s.type && this.eat(o.colon) ? this.parseLabeledStatement(n, i, s) : this.parseExpressionStatement(n, s)
                }
            }, s.parseBreakContinueStatement = function (e, t) {
                var r = "break" == t;
                this.next(), this.eat(o.semi) || this.insertSemicolon() ? e.label = null : this.type !== o.name ? this.unexpected() : (e.label = this.parseIdent(), this.semicolon());
                for (var n = 0; n < this.labels.length; ++n) {
                    var i = this.labels[n];
                    if (null == e.label || i.name === e.label.name) {
                        if (null != i.kind && (r || "loop" === i.kind)) break;
                        if (e.label && r) break
                    }
                }
                return n === this.labels.length && this.raise(e.start, "Unsyntactic " + t), this.finishNode(e, r ? "BreakStatement" : "ContinueStatement")
            }, s.parseDebuggerStatement = function (e) {
                return this.next(), this.semicolon(), this.finishNode(e, "DebuggerStatement")
            }, s.parseDoStatement = function (e) {
                return this.next(), this.labels.push(a), e.body = this.parseStatement(!1), this.labels.pop(), this.expect(o._while), e.test = this.parseParenExpression(), this.options.ecmaVersion >= 6 ? this.eat(o.semi) : this.semicolon(), this.finishNode(e, "DoWhileStatement")
            }, s.parseForStatement = function (e) {
                if (this.next(), this.labels.push(a), this.expect(o.parenL), this.type === o.semi) return this.parseFor(e, null);
                if (this.type === o._var || this.type === o._let || this.type === o._const) {
                    var t = this.startNode(), r = this.type;
                    return this.next(), this.parseVar(t, !0, r), this.finishNode(t, "VariableDeclaration"), !(this.type === o._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) || 1 !== t.declarations.length || r !== o._var && t.declarations[0].init ? this.parseFor(e, t) : this.parseForIn(e, t)
                }
                var n = {start: 0}, i = this.parseExpression(!0, n);
                return this.type === o._in || this.options.ecmaVersion >= 6 && this.isContextual("of") ? (this.toAssignable(i), this.checkLVal(i), this.parseForIn(e, i)) : (n.start && this.unexpected(n.start), this.parseFor(e, i))
            }, s.parseFunctionStatement = function (e) {
                return this.next(), this.parseFunction(e, !0)
            }, s.parseIfStatement = function (e) {
                return this.next(), e.test = this.parseParenExpression(), e.consequent = this.parseStatement(!1), e.alternate = this.eat(o._else) ? this.parseStatement(!1) : null, this.finishNode(e, "IfStatement")
            }, s.parseReturnStatement = function (e) {
                return this.inFunction || this.options.allowReturnOutsideFunction || this.raise(this.start, "'return' outside of function"), this.next(), this.eat(o.semi) || this.insertSemicolon() ? e.argument = null : (e.argument = this.parseExpression(), this.semicolon()), this.finishNode(e, "ReturnStatement")
            }, s.parseSwitchStatement = function (e) {
                this.next(), e.discriminant = this.parseParenExpression(), e.cases = [], this.expect(o.braceL), this.labels.push(c);
                for (var t, r; this.type != o.braceR;) if (this.type === o._case || this.type === o._default) {
                    var n = this.type === o._case;
                    t && this.finishNode(t, "SwitchCase"), e.cases.push(t = this.startNode()), t.consequent = [], this.next(), n ? t.test = this.parseExpression() : (r && this.raise(this.lastTokStart, "Multiple default clauses"), r = !0, t.test = null), this.expect(o.colon)
                } else t || this.unexpected(), t.consequent.push(this.parseStatement(!0));
                return t && this.finishNode(t, "SwitchCase"), this.next(), this.labels.pop(), this.finishNode(e, "SwitchStatement")
            }, s.parseThrowStatement = function (e) {
                return this.next(), i.test(this.input.slice(this.lastTokEnd, this.start)) && this.raise(this.lastTokEnd, "Illegal newline after throw"), e.argument = this.parseExpression(), this.semicolon(), this.finishNode(e, "ThrowStatement")
            };
            var l = [];
            s.parseTryStatement = function (e) {
                if (this.next(), e.block = this.parseBlock(), e.handler = null, this.type === o._catch) {
                    var t = this.startNode();
                    this.next(), this.expect(o.parenL), t.param = this.parseBindingAtom(), this.checkLVal(t.param, !0), this.expect(o.parenR), t.guard = null, t.body = this.parseBlock(), e.handler = this.finishNode(t, "CatchClause")
                }
                return e.guardedHandlers = l, e.finalizer = this.eat(o._finally) ? this.parseBlock() : null, e.handler || e.finalizer || this.raise(e.start, "Missing catch or finally clause"), this.finishNode(e, "TryStatement")
            }, s.parseVarStatement = function (e, t) {
                return this.next(), this.parseVar(e, !1, t), this.semicolon(), this.finishNode(e, "VariableDeclaration")
            }, s.parseWhileStatement = function (e) {
                return this.next(), e.test = this.parseParenExpression(), this.labels.push(a), e.body = this.parseStatement(!1), this.labels.pop(), this.finishNode(e, "WhileStatement")
            }, s.parseWithStatement = function (e) {
                return this.strict && this.raise(this.start, "'with' in strict mode"), this.next(), e.object = this.parseParenExpression(), e.body = this.parseStatement(!1), this.finishNode(e, "WithStatement")
            }, s.parseEmptyStatement = function (e) {
                return this.next(), this.finishNode(e, "EmptyStatement")
            }, s.parseLabeledStatement = function (e, t, r) {
                for (var n = 0; n < this.labels.length; ++n) this.labels[n].name === t && this.raise(r.start, "Label '" + t + "' is already declared");
                var i = this.type.isLoop ? "loop" : this.type === o._switch ? "switch" : null;
                return this.labels.push({
                    name: t,
                    kind: i
                }), e.body = this.parseStatement(!0), this.labels.pop(), e.label = r, this.finishNode(e, "LabeledStatement")
            }, s.parseExpressionStatement = function (e, t) {
                return e.expression = t, this.semicolon(), this.finishNode(e, "ExpressionStatement")
            }, s.parseBlock = function (e) {
                var t = this.startNode(), r = !0, n = void 0;
                for (t.body = [], this.expect(o.braceL); !this.eat(o.braceR);) {
                    var i = this.parseStatement(!0);
                    t.body.push(i), r && e && this.isUseStrict(i) && (n = this.strict, this.setStrict(this.strict = !0)), r = !1
                }
                return !1 === n && this.setStrict(!1), this.finishNode(t, "BlockStatement")
            }, s.parseFor = function (e, t) {
                return e.init = t, this.expect(o.semi), e.test = this.type === o.semi ? null : this.parseExpression(), this.expect(o.semi), e.update = this.type === o.parenR ? null : this.parseExpression(), this.expect(o.parenR), e.body = this.parseStatement(!1), this.labels.pop(), this.finishNode(e, "ForStatement")
            }, s.parseForIn = function (e, t) {
                var r = this.type === o._in ? "ForInStatement" : "ForOfStatement";
                return this.next(), e.left = t, e.right = this.parseExpression(), this.expect(o.parenR), e.body = this.parseStatement(!1), this.labels.pop(), this.finishNode(e, r)
            }, s.parseVar = function (e, t, r) {
                for (e.declarations = [], e.kind = r.keyword; ;) {
                    var n = this.startNode();
                    if (n.id = this.parseBindingAtom(), this.checkLVal(n.id, !0), this.eat(o.eq) ? n.init = this.parseMaybeAssign(t) : r !== o._const || this.type === o._in || this.options.ecmaVersion >= 6 && this.isContextual("of") ? "Identifier" == n.id.type || t && (this.type === o._in || this.isContextual("of")) ? n.init = null : this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value") : this.unexpected(), e.declarations.push(this.finishNode(n, "VariableDeclarator")), !this.eat(o.comma)) break
                }
                return e
            }, s.parseFunction = function (e, t, r) {
                return this.initFunction(e), this.options.ecmaVersion >= 6 && (e.generator = this.eat(o.star)), (t || this.type === o.name) && (e.id = this.parseIdent()), this.expect(o.parenL), e.params = this.parseBindingList(o.parenR, !1, !1), this.parseFunctionBody(e, r), this.finishNode(e, t ? "FunctionDeclaration" : "FunctionExpression")
            }, s.parseClass = function (e, t) {
                this.next(), e.id = this.type === o.name ? this.parseIdent() : t ? this.unexpected() : null, e.superClass = this.eat(o._extends) ? this.parseExprSubscripts() : null;
                var r = this.startNode();
                for (r.body = [], this.expect(o.braceL); !this.eat(o.braceR);) if (!this.eat(o.semi)) {
                    var n = this.startNode(), i = this.eat(o.star);
                    this.parsePropertyName(n), this.type === o.parenL || n.computed || "Identifier" !== n.key.type || "static" !== n.key.name ? n.static = !1 : (i && this.unexpected(), n.static = !0, i = this.eat(o.star), this.parsePropertyName(n)), n.kind = "method", n.computed || i || ("Identifier" === n.key.type ? this.type === o.parenL || "get" !== n.key.name && "set" !== n.key.name ? n.static || "constructor" !== n.key.name || (n.kind = "constructor") : (n.kind = n.key.name, this.parsePropertyName(n)) : n.static || "Literal" !== n.key.type || "constructor" !== n.key.value || (n.kind = "constructor")), n.value = this.parseMethod(i), r.body.push(this.finishNode(n, "MethodDefinition"))
                }
                return e.body = this.finishNode(r, "ClassBody"), this.finishNode(e, t ? "ClassDeclaration" : "ClassExpression")
            }, s.parseExport = function (e) {
                if (this.next(), this.eat(o.star)) return this.expectContextual("from"), e.source = this.type === o.string ? this.parseExprAtom() : this.unexpected(), this.semicolon(), this.finishNode(e, "ExportAllDeclaration");
                if (this.eat(o._default)) {
                    var t = this.parseMaybeAssign(), r = !0;
                    return "FunctionExpression" != t.type && "ClassExpression" != t.type || (r = !1, t.id && (t.type = "FunctionExpression" == t.type ? "FunctionDeclaration" : "ClassDeclaration")), e.declaration = t, r && this.semicolon(), this.finishNode(e, "ExportDefaultDeclaration")
                }
                return this.type.keyword ? (e.declaration = this.parseStatement(!0), e.specifiers = [], e.source = null) : (e.declaration = null, e.specifiers = this.parseExportSpecifiers(), this.eatContextual("from") ? e.source = this.type === o.string ? this.parseExprAtom() : this.unexpected() : e.source = null, this.semicolon()), this.finishNode(e, "ExportNamedDeclaration")
            }, s.parseExportSpecifiers = function () {
                var e = [], t = !0;
                for (this.expect(o.braceL); !this.eat(o.braceR);) {
                    if (t) t = !1; else if (this.expect(o.comma), this.afterTrailingComma(o.braceR)) break;
                    var r = this.startNode();
                    r.local = this.parseIdent(this.type === o._default), r.exported = this.eatContextual("as") ? this.parseIdent(!0) : r.local, e.push(this.finishNode(r, "ExportSpecifier"))
                }
                return e
            }, s.parseImport = function (e) {
                return this.next(), this.type === o.string ? (e.specifiers = l, e.source = this.parseExprAtom(), e.kind = "") : (e.specifiers = this.parseImportSpecifiers(), this.expectContextual("from"), e.source = this.type === o.string ? this.parseExprAtom() : this.unexpected()), this.semicolon(), this.finishNode(e, "ImportDeclaration")
            }, s.parseImportSpecifiers = function () {
                var e = [], t = !0;
                if (this.type === o.name && ((r = this.startNode()).local = this.parseIdent(), this.checkLVal(r.local, !0), e.push(this.finishNode(r, "ImportDefaultSpecifier")), !this.eat(o.comma))) return e;
                if (this.type === o.star) {
                    var r = this.startNode();
                    return this.next(), this.expectContextual("as"), r.local = this.parseIdent(), this.checkLVal(r.local, !0), e.push(this.finishNode(r, "ImportNamespaceSpecifier")), e
                }
                for (this.expect(o.braceL); !this.eat(o.braceR);) {
                    if (t) t = !1; else if (this.expect(o.comma), this.afterTrailingComma(o.braceR)) break;
                    (r = this.startNode()).imported = this.parseIdent(!0), r.local = this.eatContextual("as") ? this.parseIdent() : r.imported, this.checkLVal(r.local, !0), e.push(this.finishNode(r, "ImportSpecifier"))
                }
                return e
            }
        }, {"./state": 9, "./tokentype": 13, "./whitespace": 15}],
        11: [function (e, t, r) {
            "use strict";
            Object.defineProperty(r, "__esModule", {value: !0});
            var o = e("./state").Parser, n = e("./tokentype").types, i = e("./whitespace").lineBreak,
                s = r.TokContext = function e(t, r, o, n) {
                    !function (e, t) {
                        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                    }(this, e), this.token = t, this.isExpr = r, this.preserveSpace = o, this.override = n
                }, a = {
                    b_stat: new s("{", !1),
                    b_expr: new s("{", !0),
                    b_tmpl: new s("${", !0),
                    p_stat: new s("(", !1),
                    p_expr: new s("(", !0),
                    q_tmpl: new s("`", !0, !0, function (e) {
                        return e.readTmplToken()
                    }),
                    f_expr: new s("function", !0)
                };
            r.types = a;
            var c = o.prototype;
            c.initialContext = function () {
                return [a.b_stat]
            }, c.braceIsBlock = function (e) {
                var t = void 0;
                return e === n.colon && "{" == (t = this.curContext()).token ? !t.isExpr : e === n._return ? i.test(this.input.slice(this.lastTokEnd, this.start)) : e === n._else || e === n.semi || e === n.eof || (e == n.braceL ? this.curContext() === a.b_stat : !this.exprAllowed)
            }, c.updateContext = function (e) {
                var t = void 0, r = this.type;
                r.keyword && e == n.dot ? this.exprAllowed = !1 : (t = r.updateContext) ? t.call(this, e) : this.exprAllowed = r.beforeExpr
            }, n.parenR.updateContext = n.braceR.updateContext = function () {
                if (1 != this.context.length) {
                    var e = this.context.pop();
                    e === a.b_stat && this.curContext() === a.f_expr ? (this.context.pop(), this.exprAllowed = !1) : this.exprAllowed = e === a.b_tmpl || !e.isExpr
                } else this.exprAllowed = !0
            }, n.braceL.updateContext = function (e) {
                this.context.push(this.braceIsBlock(e) ? a.b_stat : a.b_expr), this.exprAllowed = !0
            }, n.dollarBraceL.updateContext = function () {
                this.context.push(a.b_tmpl), this.exprAllowed = !0
            }, n.parenL.updateContext = function (e) {
                var t = e === n._if || e === n._for || e === n._with || e === n._while;
                this.context.push(t ? a.p_stat : a.p_expr), this.exprAllowed = !0
            }, n.incDec.updateContext = function () {
            }, n._function.updateContext = function () {
                this.curContext() !== a.b_stat && this.context.push(a.f_expr), this.exprAllowed = !1
            }, n.backQuote.updateContext = function () {
                this.curContext() === a.q_tmpl ? this.context.pop() : this.context.push(a.q_tmpl), this.exprAllowed = !1
            }
        }, {"./state": 9, "./tokentype": 13, "./whitespace": 15}],
        12: [function (e, t, r) {
            "use strict";
            Object.defineProperty(r, "__esModule", {value: !0});
            var o = e("./identifier"), n = o.isIdentifierStart, i = o.isIdentifierChar, s = e("./tokentype"),
                a = s.types, c = s.keywords, l = e("./state").Parser, p = e("./location").SourceLocation,
                h = e("./whitespace"), u = h.lineBreak, d = h.lineBreakG, f = h.isNewLine, m = h.nonASCIIwhitespace,
                b = r.Token = function e(t) {
                    !function (e, t) {
                        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                    }(this, e), this.type = t.type, this.value = t.value, this.start = t.start, this.end = t.end, t.options.locations && (this.loc = new p(t, t.startLoc, t.endLoc)), t.options.ranges && (this.range = [t.start, t.end])
                }, y = l.prototype;
            y.next = function () {
                this.options.onToken && this.options.onToken(new b(this)), this.lastTokEnd = this.end, this.lastTokStart = this.start, this.lastTokEndLoc = this.endLoc, this.lastTokStartLoc = this.startLoc, this.nextToken()
            }, y.getToken = function () {
                return this.next(), new b(this)
            }, "undefined" != typeof Symbol && (y[Symbol.iterator] = function () {
                var e = this;
                return {
                    next: function () {
                        var t = e.getToken();
                        return {done: t.type === a.eof, value: t}
                    }
                }
            }), y.setStrict = function (e) {
                if (this.strict = e, this.type === a.num || this.type === a.string) {
                    if (this.pos = this.start, this.options.locations) for (; this.pos < this.lineStart;) this.lineStart = this.input.lastIndexOf("\n", this.lineStart - 2) + 1, --this.curLine;
                    this.nextToken()
                }
            }, y.curContext = function () {
                return this.context[this.context.length - 1]
            }, y.nextToken = function () {
                var e = this.curContext();
                return e && e.preserveSpace || this.skipSpace(), this.start = this.pos, this.options.locations && (this.startLoc = this.curPosition()), this.pos >= this.input.length ? this.finishToken(a.eof) : e.override ? e.override(this) : void this.readToken(this.fullCharCodeAtPos())
            }, y.readToken = function (e) {
                return n(e, this.options.ecmaVersion >= 6) || 92 === e ? this.readWord() : this.getTokenFromCode(e)
            }, y.fullCharCodeAtPos = function () {
                var e = this.input.charCodeAt(this.pos);
                return e <= 55295 || e >= 57344 ? e : (e << 10) + this.input.charCodeAt(this.pos + 1) - 56613888
            }, y.skipBlockComment = function () {
                var e = this.options.onComment && this.options.locations && this.curPosition(), t = this.pos,
                    r = this.input.indexOf("*/", this.pos += 2);
                if (-1 === r && this.raise(this.pos - 2, "Unterminated comment"), this.pos = r + 2, this.options.locations) {
                    d.lastIndex = t;
                    for (var o = void 0; (o = d.exec(this.input)) && o.index < this.pos;) ++this.curLine, this.lineStart = o.index + o[0].length
                }
                this.options.onComment && this.options.onComment(!0, this.input.slice(t + 2, r), t, this.pos, e, this.options.locations && this.curPosition())
            }, y.skipLineComment = function (e) {
                for (var t = this.pos, r = this.options.onComment && this.options.locations && this.curPosition(), o = this.input.charCodeAt(this.pos += e); this.pos < this.input.length && 10 !== o && 13 !== o && 8232 !== o && 8233 !== o;) ++this.pos, o = this.input.charCodeAt(this.pos);
                this.options.onComment && this.options.onComment(!1, this.input.slice(t + e, this.pos), t, this.pos, r, this.options.locations && this.curPosition())
            }, y.skipSpace = function () {
                for (; this.pos < this.input.length;) {
                    var e = this.input.charCodeAt(this.pos);
                    if (32 === e) ++this.pos; else if (13 === e) {
                        ++this.pos, 10 === (t = this.input.charCodeAt(this.pos)) && ++this.pos, this.options.locations && (++this.curLine, this.lineStart = this.pos)
                    } else if (10 === e || 8232 === e || 8233 === e) ++this.pos, this.options.locations && (++this.curLine, this.lineStart = this.pos); else if (e > 8 && e < 14) ++this.pos; else if (47 === e) {
                        var t;
                        if (42 === (t = this.input.charCodeAt(this.pos + 1))) this.skipBlockComment(); else {
                            if (47 !== t) break;
                            this.skipLineComment(2)
                        }
                    } else if (160 === e) ++this.pos; else {
                        if (!(e >= 5760 && m.test(String.fromCharCode(e)))) break;
                        ++this.pos
                    }
                }
            }, y.finishToken = function (e, t) {
                this.end = this.pos, this.options.locations && (this.endLoc = this.curPosition());
                var r = this.type;
                this.type = e, this.value = t, this.updateContext(r)
            }, y.readToken_dot = function () {
                var e = this.input.charCodeAt(this.pos + 1);
                if (e >= 48 && e <= 57) return this.readNumber(!0);
                var t = this.input.charCodeAt(this.pos + 2);
                return this.options.ecmaVersion >= 6 && 46 === e && 46 === t ? (this.pos += 3, this.finishToken(a.ellipsis)) : (++this.pos, this.finishToken(a.dot))
            }, y.readToken_slash = function () {
                var e = this.input.charCodeAt(this.pos + 1);
                return this.exprAllowed ? (++this.pos, this.readRegexp()) : 61 === e ? this.finishOp(a.assign, 2) : this.finishOp(a.slash, 1)
            }, y.readToken_mult_modulo = function (e) {
                return 61 === this.input.charCodeAt(this.pos + 1) ? this.finishOp(a.assign, 2) : this.finishOp(42 === e ? a.star : a.modulo, 1)
            }, y.readToken_pipe_amp = function (e) {
                var t = this.input.charCodeAt(this.pos + 1);
                return t === e ? this.finishOp(124 === e ? a.logicalOR : a.logicalAND, 2) : 61 === t ? this.finishOp(a.assign, 2) : this.finishOp(124 === e ? a.bitwiseOR : a.bitwiseAND, 1)
            }, y.readToken_caret = function () {
                return 61 === this.input.charCodeAt(this.pos + 1) ? this.finishOp(a.assign, 2) : this.finishOp(a.bitwiseXOR, 1)
            }, y.readToken_plus_min = function (e) {
                var t = this.input.charCodeAt(this.pos + 1);
                return t === e ? 45 == t && 62 == this.input.charCodeAt(this.pos + 2) && u.test(this.input.slice(this.lastTokEnd, this.pos)) ? (this.skipLineComment(3), this.skipSpace(), this.nextToken()) : this.finishOp(a.incDec, 2) : 61 === t ? this.finishOp(a.assign, 2) : this.finishOp(a.plusMin, 1)
            }, y.readToken_lt_gt = function (e) {
                var t = this.input.charCodeAt(this.pos + 1), r = 1;
                return t === e ? (r = 62 === e && 62 === this.input.charCodeAt(this.pos + 2) ? 3 : 2, 61 === this.input.charCodeAt(this.pos + r) ? this.finishOp(a.assign, r + 1) : this.finishOp(a.bitShift, r)) : 33 == t && 60 == e && 45 == this.input.charCodeAt(this.pos + 2) && 45 == this.input.charCodeAt(this.pos + 3) ? (this.inModule && unexpected(), this.skipLineComment(4), this.skipSpace(), this.nextToken()) : (61 === t && (r = 61 === this.input.charCodeAt(this.pos + 2) ? 3 : 2), this.finishOp(a.relational, r))
            }, y.readToken_eq_excl = function (e) {
                var t = this.input.charCodeAt(this.pos + 1);
                return 61 === t ? this.finishOp(a.equality, 61 === this.input.charCodeAt(this.pos + 2) ? 3 : 2) : 61 === e && 62 === t && this.options.ecmaVersion >= 6 ? (this.pos += 2, this.finishToken(a.arrow)) : this.finishOp(61 === e ? a.eq : a.prefix, 1)
            }, y.getTokenFromCode = function (e) {
                switch (e) {
                    case 46:
                        return this.readToken_dot();
                    case 40:
                        return ++this.pos, this.finishToken(a.parenL);
                    case 41:
                        return ++this.pos, this.finishToken(a.parenR);
                    case 59:
                        return ++this.pos, this.finishToken(a.semi);
                    case 44:
                        return ++this.pos, this.finishToken(a.comma);
                    case 91:
                        return ++this.pos, this.finishToken(a.bracketL);
                    case 93:
                        return ++this.pos, this.finishToken(a.bracketR);
                    case 123:
                        return ++this.pos, this.finishToken(a.braceL);
                    case 125:
                        return ++this.pos, this.finishToken(a.braceR);
                    case 58:
                        return ++this.pos, this.finishToken(a.colon);
                    case 63:
                        return ++this.pos, this.finishToken(a.question);
                    case 96:
                        if (this.options.ecmaVersion < 6) break;
                        return ++this.pos, this.finishToken(a.backQuote);
                    case 48:
                        var t = this.input.charCodeAt(this.pos + 1);
                        if (120 === t || 88 === t) return this.readRadixNumber(16);
                        if (this.options.ecmaVersion >= 6) {
                            if (111 === t || 79 === t) return this.readRadixNumber(8);
                            if (98 === t || 66 === t) return this.readRadixNumber(2)
                        }
                    case 49:
                    case 50:
                    case 51:
                    case 52:
                    case 53:
                    case 54:
                    case 55:
                    case 56:
                    case 57:
                        return this.readNumber(!1);
                    case 34:
                    case 39:
                        return this.readString(e);
                    case 47:
                        return this.readToken_slash();
                    case 37:
                    case 42:
                        return this.readToken_mult_modulo(e);
                    case 124:
                    case 38:
                        return this.readToken_pipe_amp(e);
                    case 94:
                        return this.readToken_caret();
                    case 43:
                    case 45:
                        return this.readToken_plus_min(e);
                    case 60:
                    case 62:
                        return this.readToken_lt_gt(e);
                    case 61:
                    case 33:
                        return this.readToken_eq_excl(e);
                    case 126:
                        return this.finishOp(a.prefix, 1)
                }
                this.raise(this.pos, "Unexpected character '" + T(e) + "'")
            }, y.finishOp = function (e, t) {
                var r = this.input.slice(this.pos, this.pos + t);
                return this.pos += t, this.finishToken(e, r)
            };
            var g, v = !1;
            try {
                new RegExp("￿", "u"), v = !0
            } catch (e) {
            }

            function T(e) {
                return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(55296 + (e - 65536 >> 10), 56320 + (e - 65536 & 1023))
            }

            y.readRegexp = function () {
                for (var e = void 0, t = void 0, r = this.pos; ;) {
                    this.pos >= this.input.length && this.raise(r, "Unterminated regular expression");
                    var o = this.input.charAt(this.pos);
                    if (u.test(o) && this.raise(r, "Unterminated regular expression"), e) e = !1; else {
                        if ("[" === o) t = !0; else if ("]" === o && t) t = !1; else if ("/" === o && !t) break;
                        e = "\\" === o
                    }
                    ++this.pos
                }
                var n = this.input.slice(r, this.pos);
                ++this.pos;
                var i = this.readWord1(), s = n;
                if (i) {
                    var c = /^[gmsiy]*$/;
                    this.options.ecmaVersion >= 6 && (c = /^[gmsiyu]*$/), c.test(i) || this.raise(r, "Invalid regular expression flag"), i.indexOf("u") >= 0 && !v && (s = s.replace(/\\u([a-fA-F0-9]{4})|\\u\{([0-9a-fA-F]+)\}|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x"))
                }
                try {
                    new RegExp(s)
                } catch (e) {
                    e instanceof SyntaxError && this.raise(r, "Error parsing regular expression: " + e.message), this.raise(e)
                }
                var l = void 0;
                try {
                    l = new RegExp(n, i)
                } catch (e) {
                    l = null
                }
                return this.finishToken(a.regexp, {pattern: n, flags: i, value: l})
            }, y.readInt = function (e, t) {
                for (var r = this.pos, o = 0, n = 0, i = null == t ? 1 / 0 : t; n < i; ++n) {
                    var s = this.input.charCodeAt(this.pos), a = void 0;
                    if ((a = s >= 97 ? s - 97 + 10 : s >= 65 ? s - 65 + 10 : s >= 48 && s <= 57 ? s - 48 : 1 / 0) >= e) break;
                    ++this.pos, o = o * e + a
                }
                return this.pos === r || null != t && this.pos - r !== t ? null : o
            }, y.readRadixNumber = function (e) {
                this.pos += 2;
                var t = this.readInt(e);
                return null == t && this.raise(this.start + 2, "Expected number in radix " + e), n(this.fullCharCodeAtPos()) && this.raise(this.pos, "Identifier directly after number"), this.finishToken(a.num, t)
            }, y.readNumber = function (e) {
                var t = this.pos, r = !1, o = 48 === this.input.charCodeAt(this.pos);
                e || null !== this.readInt(10) || this.raise(t, "Invalid number"), 46 === this.input.charCodeAt(this.pos) && (++this.pos, this.readInt(10), r = !0);
                var i = this.input.charCodeAt(this.pos);
                69 !== i && 101 !== i || (43 !== (i = this.input.charCodeAt(++this.pos)) && 45 !== i || ++this.pos, null === this.readInt(10) && this.raise(t, "Invalid number"), r = !0), n(this.fullCharCodeAtPos()) && this.raise(this.pos, "Identifier directly after number");
                var s = this.input.slice(t, this.pos), c = void 0;
                return r ? c = parseFloat(s) : o && 1 !== s.length ? /[89]/.test(s) || this.strict ? this.raise(t, "Invalid number") : c = parseInt(s, 8) : c = parseInt(s, 10), this.finishToken(a.num, c)
            }, y.readCodePoint = function () {
                var e = void 0;
                return 123 === this.input.charCodeAt(this.pos) ? (this.options.ecmaVersion < 6 && this.unexpected(), ++this.pos, e = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos), ++this.pos, e > 1114111 && this.unexpected()) : e = this.readHexChar(4), e
            }, y.readString = function (e) {
                for (var t = "", r = ++this.pos; ;) {
                    this.pos >= this.input.length && this.raise(this.start, "Unterminated string constant");
                    var o = this.input.charCodeAt(this.pos);
                    if (o === e) break;
                    92 === o ? (t += this.input.slice(r, this.pos), t += this.readEscapedChar(), r = this.pos) : (f(o) && this.raise(this.start, "Unterminated string constant"), ++this.pos)
                }
                return t += this.input.slice(r, this.pos++), this.finishToken(a.string, t)
            }, y.readTmplToken = function () {
                for (var e = "", t = this.pos; ;) {
                    this.pos >= this.input.length && this.raise(this.start, "Unterminated template");
                    var r = this.input.charCodeAt(this.pos);
                    if (96 === r || 36 === r && 123 === this.input.charCodeAt(this.pos + 1)) return this.pos === this.start && this.type === a.template ? 36 === r ? (this.pos += 2, this.finishToken(a.dollarBraceL)) : (++this.pos, this.finishToken(a.backQuote)) : (e += this.input.slice(t, this.pos), this.finishToken(a.template, e));
                    92 === r ? (e += this.input.slice(t, this.pos), e += this.readEscapedChar(), t = this.pos) : f(r) ? (e += this.input.slice(t, this.pos), ++this.pos, 13 === r && 10 === this.input.charCodeAt(this.pos) ? (++this.pos, e += "\n") : e += String.fromCharCode(r), this.options.locations && (++this.curLine, this.lineStart = this.pos), t = this.pos) : ++this.pos
                }
            }, y.readEscapedChar = function () {
                var e = this.input.charCodeAt(++this.pos), t = /^[0-7]+/.exec(this.input.slice(this.pos, this.pos + 3));
                for (t && (t = t[0]); t && parseInt(t, 8) > 255;) t = t.slice(0, -1);
                if ("0" === t && (t = null), ++this.pos, t) return this.strict && this.raise(this.pos - 2, "Octal literal in strict mode"), this.pos += t.length - 1, String.fromCharCode(parseInt(t, 8));
                switch (e) {
                    case 110:
                        return "\n";
                    case 114:
                        return "\r";
                    case 120:
                        return String.fromCharCode(this.readHexChar(2));
                    case 117:
                        return T(this.readCodePoint());
                    case 116:
                        return "\t";
                    case 98:
                        return "\b";
                    case 118:
                        return "\v";
                    case 102:
                        return "\f";
                    case 48:
                        return "\0";
                    case 13:
                        10 === this.input.charCodeAt(this.pos) && ++this.pos;
                    case 10:
                        return this.options.locations && (this.lineStart = this.pos, ++this.curLine), "";
                    default:
                        return String.fromCharCode(e)
                }
            }, y.readHexChar = function (e) {
                var t = this.readInt(16, e);
                return null === t && this.raise(this.start, "Bad character escape sequence"), t
            }, y.readWord1 = function () {
                g = !1;
                for (var e = "", t = !0, r = this.pos, o = this.options.ecmaVersion >= 6; this.pos < this.input.length;) {
                    var s = this.fullCharCodeAtPos();
                    if (i(s, o)) this.pos += s <= 65535 ? 1 : 2; else {
                        if (92 !== s) break;
                        g = !0, e += this.input.slice(r, this.pos);
                        var a = this.pos;
                        117 != this.input.charCodeAt(++this.pos) && this.raise(this.pos, "Expecting Unicode escape sequence \\uXXXX"), ++this.pos;
                        var c = this.readCodePoint();
                        (t ? n : i)(c, o) || this.raise(a, "Invalid Unicode escape"), e += T(c), r = this.pos
                    }
                    t = !1
                }
                return e + this.input.slice(r, this.pos)
            }, y.readWord = function () {
                var e = this.readWord1(), t = a.name;
                return (this.options.ecmaVersion >= 6 || !g) && this.isKeyword(e) && (t = c[e]), this.finishToken(t, e)
            }
        }, {"./identifier": 3, "./location": 4, "./state": 9, "./tokentype": 13, "./whitespace": 15}],
        13: [function (e, t, r) {
            "use strict";
            Object.defineProperty(r, "__esModule", {value: !0});
            var o = r.TokenType = function e(t) {
                var r = void 0 === arguments[1] ? {} : arguments[1];
                !function (e, t) {
                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                }(this, e), this.label = t, this.keyword = r.keyword, this.beforeExpr = !!r.beforeExpr, this.startsExpr = !!r.startsExpr, this.isLoop = !!r.isLoop, this.isAssign = !!r.isAssign, this.prefix = !!r.prefix, this.postfix = !!r.postfix, this.binop = r.binop || null, this.updateContext = null
            };

            function n(e, t) {
                return new o(e, {beforeExpr: !0, binop: t})
            }

            var i = {beforeExpr: !0}, s = {startsExpr: !0}, a = {
                num: new o("num", s),
                regexp: new o("regexp", s),
                string: new o("string", s),
                name: new o("name", s),
                eof: new o("eof"),
                bracketL: new o("[", {beforeExpr: !0, startsExpr: !0}),
                bracketR: new o("]"),
                braceL: new o("{", {beforeExpr: !0, startsExpr: !0}),
                braceR: new o("}"),
                parenL: new o("(", {beforeExpr: !0, startsExpr: !0}),
                parenR: new o(")"),
                comma: new o(",", i),
                semi: new o(";", i),
                colon: new o(":", i),
                dot: new o("."),
                question: new o("?", i),
                arrow: new o("=>", i),
                template: new o("template"),
                ellipsis: new o("...", i),
                backQuote: new o("`", s),
                dollarBraceL: new o("${", {beforeExpr: !0, startsExpr: !0}),
                eq: new o("=", {beforeExpr: !0, isAssign: !0}),
                assign: new o("_=", {beforeExpr: !0, isAssign: !0}),
                incDec: new o("++/--", {prefix: !0, postfix: !0, startsExpr: !0}),
                prefix: new o("prefix", {beforeExpr: !0, prefix: !0, startsExpr: !0}),
                logicalOR: n("||", 1),
                logicalAND: n("&&", 2),
                bitwiseOR: n("|", 3),
                bitwiseXOR: n("^", 4),
                bitwiseAND: n("&", 5),
                equality: n("==/!=", 6),
                relational: n("</>", 7),
                bitShift: n("<</>>", 8),
                plusMin: new o("+/-", {beforeExpr: !0, binop: 9, prefix: !0, startsExpr: !0}),
                modulo: n("%", 10),
                star: n("*", 10),
                slash: n("/", 10)
            };
            r.types = a;
            var c = {};

            function l(e) {
                var t = void 0 === arguments[1] ? {} : arguments[1];
                t.keyword = e, c[e] = a["_" + e] = new o(e, t)
            }

            r.keywords = c, l("break"), l("case", i), l("catch"), l("continue"), l("debugger"), l("default"), l("do", {isLoop: !0}), l("else", i), l("finally"), l("for", {isLoop: !0}), l("function"), l("if"), l("return", i), l("switch"), l("throw", i), l("try"), l("var"), l("let"), l("const"), l("while", {isLoop: !0}), l("with"), l("new", {
                beforeExpr: !0,
                startsExpr: !0
            }), l("this", s), l("super", s), l("class"), l("extends", i), l("export"), l("import"), l("yield", {
                beforeExpr: !0,
                startsExpr: !0
            }), l("null", s), l("true", s), l("false", s), l("in", {
                beforeExpr: !0,
                binop: 7
            }), l("instanceof", {beforeExpr: !0, binop: 7}), l("typeof", {
                beforeExpr: !0,
                prefix: !0,
                startsExpr: !0
            }), l("void", {beforeExpr: !0, prefix: !0, startsExpr: !0}), l("delete", {
                beforeExpr: !0,
                prefix: !0,
                startsExpr: !0
            })
        }, {}],
        14: [function (e, t, r) {
            "use strict";
            r.isArray = function (e) {
                return "[object Array]" === Object.prototype.toString.call(e)
            }, r.has = function (e, t) {
                return Object.prototype.hasOwnProperty.call(e, t)
            }, Object.defineProperty(r, "__esModule", {value: !0})
        }, {}],
        15: [function (e, t, r) {
            "use strict";
            r.isNewLine = function (e) {
                return 10 === e || 13 === e || 8232 === e || 8233 == e
            }, Object.defineProperty(r, "__esModule", {value: !0});
            var o = /\r\n?|\n|\u2028|\u2029/;
            r.lineBreak = o;
            var n = new RegExp(o.source, "g");
            r.lineBreakG = n;
            r.nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/
        }, {}]
    }, {}, [1])(1)
}), function (e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
        var t;
        ((t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).acorn || (t.acorn = {})).loose = e()
    }
}(function () {
    return function e(t, r, o) {
        function n(s, a) {
            if (!r[s]) {
                if (!t[s]) {
                    var c = "function" == typeof require && require;
                    if (!a && c) return c(s, !0);
                    if (i) return i(s, !0);
                    var l = new Error("Cannot find module '" + s + "'");
                    throw l.code = "MODULE_NOT_FOUND", l
                }
                var p = r[s] = {exports: {}};
                t[s][0].call(p.exports, function (e) {
                    var r = t[s][1][e];
                    return n(r || e)
                }, p, p.exports, e, t, r, o)
            }
            return r[s].exports
        }

        for (var i = "function" == typeof require && require, s = 0; s < o.length; s++) n(o[s]);
        return n
    }({
        1: [function (e, t, r) {
            "use strict";
            r.parse_dammit = s, Object.defineProperty(r, "__esModule", {value: !0});
            var o = function (e) {
                return e && e.__esModule ? e : {default: e}
            }(e("..")), n = e("./state"), i = n.LooseParser;

            function s(e, t) {
                var r = new i(e, t);
                return r.next(), r.parseTopLevel()
            }

            e("./tokenize"), e("./parseutil"), e("./statement"), e("./expression"), r.LooseParser = n.LooseParser, o.defaultOptions.tabSize = 4, o.parse_dammit = s, o.LooseParser = i
        }, {"..": 2, "./expression": 3, "./parseutil": 4, "./state": 5, "./statement": 6, "./tokenize": 7}],
        2: [function (e, t, r) {
            "use strict";
            t.exports = "undefined" != typeof acorn ? acorn : e("./acorn")
        }, {}],
        3: [function (e, t, r) {
            "use strict";
            var o = e("./state").LooseParser, n = e("./parseutil").isDummy, i = e("..").tokTypes, s = o.prototype;
            s.checkLVal = function (e, t) {
                if (!e) return e;
                switch (e.type) {
                    case"Identifier":
                        return e;
                    case"MemberExpression":
                        return t ? this.dummyIdent() : e;
                    case"ObjectPattern":
                    case"ArrayPattern":
                    case"RestElement":
                    case"AssignmentPattern":
                        if (this.options.ecmaVersion >= 6) return e;
                    default:
                        return this.dummyIdent()
                }
            }, s.parseExpression = function (e) {
                var t = this.storeCurrentPos(), r = this.parseMaybeAssign(e);
                if (this.tok.type === i.comma) {
                    var o = this.startNodeAt(t);
                    for (o.expressions = [r]; this.eat(i.comma);) o.expressions.push(this.parseMaybeAssign(e));
                    return this.finishNode(o, "SequenceExpression")
                }
                return r
            }, s.parseParenExpression = function () {
                this.pushCx(), this.expect(i.parenL);
                var e = this.parseExpression();
                return this.popCx(), this.expect(i.parenR), e
            }, s.parseMaybeAssign = function (e) {
                var t = this.storeCurrentPos(), r = this.parseMaybeConditional(e);
                if (this.tok.type.isAssign) {
                    var o = this.startNodeAt(t);
                    return o.operator = this.tok.value, o.left = this.tok.type === i.eq ? this.toAssignable(r) : this.checkLVal(r), this.next(), o.right = this.parseMaybeAssign(e), this.finishNode(o, "AssignmentExpression")
                }
                return r
            }, s.parseMaybeConditional = function (e) {
                var t = this.storeCurrentPos(), r = this.parseExprOps(e);
                if (this.eat(i.question)) {
                    var o = this.startNodeAt(t);
                    return o.test = r, o.consequent = this.parseMaybeAssign(), o.alternate = this.expect(i.colon) ? this.parseMaybeAssign(e) : this.dummyIdent(), this.finishNode(o, "ConditionalExpression")
                }
                return r
            }, s.parseExprOps = function (e) {
                var t = this.storeCurrentPos(), r = this.curIndent, o = this.curLineStart;
                return this.parseExprOp(this.parseMaybeUnary(e), t, -1, e, r, o)
            }, s.parseExprOp = function (e, t, r, o, n, s) {
                if (this.curLineStart != s && this.curIndent < n && this.tokenStartsLine()) return e;
                var a = this.tok.type.binop;
                if (null != a && (!o || this.tok.type !== i._in) && a > r) {
                    var c = this.startNodeAt(t);
                    if (c.left = e, c.operator = this.tok.value, this.next(), this.curLineStart != s && this.curIndent < n && this.tokenStartsLine()) c.right = this.dummyIdent(); else {
                        var l = this.storeCurrentPos();
                        c.right = this.parseExprOp(this.parseMaybeUnary(o), l, a, o, n, s)
                    }
                    return this.finishNode(c, /&&|\|\|/.test(c.operator) ? "LogicalExpression" : "BinaryExpression"), this.parseExprOp(c, t, r, o, n, s)
                }
                return e
            }, s.parseMaybeUnary = function (e) {
                if (this.tok.type.prefix) {
                    var t = this.startNode(), r = this.tok.type === i.incDec;
                    return t.operator = this.tok.value, t.prefix = !0, this.next(), t.argument = this.parseMaybeUnary(e), r && (t.argument = this.checkLVal(t.argument)), this.finishNode(t, r ? "UpdateExpression" : "UnaryExpression")
                }
                if (this.tok.type === i.ellipsis) {
                    t = this.startNode();
                    return this.next(), t.argument = this.parseMaybeUnary(e), this.finishNode(t, "SpreadElement")
                }
                for (var o = this.storeCurrentPos(), n = this.parseExprSubscripts(); this.tok.type.postfix && !this.canInsertSemicolon();) {
                    (t = this.startNodeAt(o)).operator = this.tok.value, t.prefix = !1, t.argument = this.checkLVal(n), this.next(), n = this.finishNode(t, "UpdateExpression")
                }
                return n
            }, s.parseExprSubscripts = function () {
                var e = this.storeCurrentPos();
                return this.parseSubscripts(this.parseExprAtom(), e, !1, this.curIndent, this.curLineStart)
            }, s.parseSubscripts = function (e, t, r, o, n) {
                for (; ;) {
                    if (this.curLineStart != n && this.curIndent <= o && this.tokenStartsLine()) {
                        if (this.tok.type != i.dot || this.curIndent != o) return e;
                        --o
                    }
                    if (this.eat(i.dot)) (s = this.startNodeAt(t)).object = e, this.curLineStart != n && this.curIndent <= o && this.tokenStartsLine() ? s.property = this.dummyIdent() : s.property = this.parsePropertyAccessor() || this.dummyIdent(), s.computed = !1, e = this.finishNode(s, "MemberExpression"); else if (this.tok.type == i.bracketL) {
                        this.pushCx(), this.next(), (s = this.startNodeAt(t)).object = e, s.property = this.parseExpression(), s.computed = !0, this.popCx(), this.expect(i.bracketR), e = this.finishNode(s, "MemberExpression")
                    } else if (r || this.tok.type != i.parenL) {
                        if (this.tok.type != i.backQuote) return e;
                        (s = this.startNodeAt(t)).tag = e, s.quasi = this.parseTemplate(), e = this.finishNode(s, "TaggedTemplateExpression")
                    } else {
                        var s;
                        (s = this.startNodeAt(t)).callee = e, s.arguments = this.parseExprList(i.parenR), e = this.finishNode(s, "CallExpression")
                    }
                }
            }, s.parseExprAtom = function () {
                var e = void 0;
                switch (this.tok.type) {
                    case i._this:
                    case i._super:
                        var t = this.tok.type === i._this ? "ThisExpression" : "Super";
                        return e = this.startNode(), this.next(), this.finishNode(e, t);
                    case i.name:
                        var r = this.storeCurrentPos(), o = this.parseIdent();
                        return this.eat(i.arrow) ? this.parseArrowExpression(this.startNodeAt(r), [o]) : o;
                    case i.regexp:
                        e = this.startNode();
                        var s = this.tok.value;
                        return e.regex = {
                            pattern: s.pattern,
                            flags: s.flags
                        }, e.value = s.value, e.raw = this.input.slice(this.tok.start, this.tok.end), this.next(), this.finishNode(e, "Literal");
                    case i.num:
                    case i.string:
                        return (e = this.startNode()).value = this.tok.value, e.raw = this.input.slice(this.tok.start, this.tok.end), this.next(), this.finishNode(e, "Literal");
                    case i._null:
                    case i._true:
                    case i._false:
                        return (e = this.startNode()).value = this.tok.type === i._null ? null : this.tok.type === i._true, e.raw = this.tok.type.keyword, this.next(), this.finishNode(e, "Literal");
                    case i.parenL:
                        var a = this.storeCurrentPos();
                        this.next();
                        var c = this.parseExpression();
                        if (this.expect(i.parenR), this.eat(i.arrow)) return this.parseArrowExpression(this.startNodeAt(a), c.expressions || (n(c) ? [] : [c]));
                        if (this.options.preserveParens) {
                            var l = this.startNodeAt(a);
                            l.expression = c, c = this.finishNode(l, "ParenthesizedExpression")
                        }
                        return c;
                    case i.bracketL:
                        return (e = this.startNode()).elements = this.parseExprList(i.bracketR, !0), this.finishNode(e, "ArrayExpression");
                    case i.braceL:
                        return this.parseObj();
                    case i._class:
                        return this.parseClass();
                    case i._function:
                        return e = this.startNode(), this.next(), this.parseFunction(e, !1);
                    case i._new:
                        return this.parseNew();
                    case i._yield:
                        return e = this.startNode(), this.next(), this.semicolon() || this.canInsertSemicolon() || this.tok.type != i.star && !this.tok.type.startsExpr ? (e.delegate = !1, e.argument = null) : (e.delegate = this.eat(i.star), e.argument = this.parseMaybeAssign()), this.finishNode(e, "YieldExpression");
                    case i.backQuote:
                        return this.parseTemplate();
                    default:
                        return this.dummyIdent()
                }
            }, s.parseNew = function () {
                var e = this.startNode(), t = this.curIndent, r = this.curLineStart, o = this.parseIdent(!0);
                if (this.options.ecmaVersion >= 6 && this.eat(i.dot)) return e.meta = o, e.property = this.parseIdent(!0), this.finishNode(e, "MetaProperty");
                var n = this.storeCurrentPos();
                return e.callee = this.parseSubscripts(this.parseExprAtom(), n, !0, t, r), this.tok.type == i.parenL ? e.arguments = this.parseExprList(i.parenR) : e.arguments = [], this.finishNode(e, "NewExpression")
            }, s.parseTemplateElement = function () {
                var e = this.startNode();
                return e.value = {
                    raw: this.input.slice(this.tok.start, this.tok.end),
                    cooked: this.tok.value
                }, this.next(), e.tail = this.tok.type === i.backQuote, this.finishNode(e, "TemplateElement")
            }, s.parseTemplate = function () {
                var e = this.startNode();
                this.next(), e.expressions = [];
                var t = this.parseTemplateElement();
                for (e.quasis = [t]; !t.tail;) this.next(), e.expressions.push(this.parseExpression()), this.expect(i.braceR) ? t = this.parseTemplateElement() : ((t = this.startNode()).value = {
                    cooked: "",
                    raw: ""
                }, t.tail = !0), e.quasis.push(t);
                return this.expect(i.backQuote), this.finishNode(e, "TemplateLiteral")
            }, s.parseObj = function () {
                var e = this.startNode();
                e.properties = [], this.pushCx();
                var t = this.curIndent + 1, r = this.curLineStart;
                for (this.eat(i.braceL), this.curIndent + 1 < t && (t = this.curIndent, r = this.curLineStart); !this.closes(i.braceR, t, r);) {
                    var o = this.startNode(), s = void 0, a = void 0;
                    if (this.options.ecmaVersion >= 6 && (a = this.storeCurrentPos(), o.method = !1, o.shorthand = !1, s = this.eat(i.star)), this.parsePropertyName(o), n(o.key)) n(this.parseMaybeAssign()) && this.next(), this.eat(i.comma); else {
                        if (this.eat(i.colon)) o.kind = "init", o.value = this.parseMaybeAssign(); else if (this.options.ecmaVersion >= 6 && (this.tok.type === i.parenL || this.tok.type === i.braceL)) o.kind = "init", o.method = !0, o.value = this.parseMethod(s); else if (this.options.ecmaVersion >= 5 && "Identifier" === o.key.type && !o.computed && ("get" === o.key.name || "set" === o.key.name) && this.tok.type != i.comma && this.tok.type != i.braceR) o.kind = o.key.name, this.parsePropertyName(o), o.value = this.parseMethod(!1); else {
                            if (o.kind = "init", this.options.ecmaVersion >= 6) if (this.eat(i.eq)) {
                                var c = this.startNodeAt(a);
                                c.operator = "=", c.left = o.key, c.right = this.parseMaybeAssign(), o.value = this.finishNode(c, "AssignmentExpression")
                            } else o.value = o.key; else o.value = this.dummyIdent();
                            o.shorthand = !0
                        }
                        e.properties.push(this.finishNode(o, "Property")), this.eat(i.comma)
                    }
                }
                return this.popCx(), this.eat(i.braceR) || (this.last.end = this.tok.start, this.options.locations && (this.last.loc.end = this.tok.loc.start)), this.finishNode(e, "ObjectExpression")
            }, s.parsePropertyName = function (e) {
                if (this.options.ecmaVersion >= 6) {
                    if (this.eat(i.bracketL)) return e.computed = !0, e.key = this.parseExpression(), void this.expect(i.bracketR);
                    e.computed = !1
                }
                var t = this.tok.type === i.num || this.tok.type === i.string ? this.parseExprAtom() : this.parseIdent();
                e.key = t || this.dummyIdent()
            }, s.parsePropertyAccessor = function () {
                if (this.tok.type === i.name || this.tok.type.keyword) return this.parseIdent()
            }, s.parseIdent = function () {
                var e = this.tok.type === i.name ? this.tok.value : this.tok.type.keyword;
                if (!e) return this.dummyIdent();
                var t = this.startNode();
                return this.next(), t.name = e, this.finishNode(t, "Identifier")
            }, s.initFunction = function (e) {
                e.id = null, e.params = [], this.options.ecmaVersion >= 6 && (e.generator = !1, e.expression = !1)
            }, s.toAssignable = function (e, t) {
                if (this.options.ecmaVersion >= 6 && e) switch (e.type) {
                    case"ObjectExpression":
                        e.type = "ObjectPattern";
                        for (var r = e.properties, o = 0; o < r.length; o++) this.toAssignable(r[o].value, t);
                        break;
                    case"ArrayExpression":
                        e.type = "ArrayPattern", this.toAssignableList(e.elements, t);
                        break;
                    case"SpreadElement":
                        e.type = "RestElement", e.argument = this.toAssignable(e.argument, t);
                        break;
                    case"AssignmentExpression":
                        e.type = "AssignmentPattern"
                }
                return this.checkLVal(e, t)
            }, s.toAssignableList = function (e, t) {
                for (var r = 0; r < e.length; r++) e[r] = this.toAssignable(e[r], t);
                return e
            }, s.parseFunctionParams = function (e) {
                return e = this.parseExprList(i.parenR), this.toAssignableList(e, !0)
            }, s.parseMethod = function (e) {
                var t = this.startNode();
                return this.initFunction(t), t.params = this.parseFunctionParams(), t.generator = e || !1, t.expression = this.options.ecmaVersion >= 6 && this.tok.type !== i.braceL, t.body = t.expression ? this.parseMaybeAssign() : this.parseBlock(), this.finishNode(t, "FunctionExpression")
            }, s.parseArrowExpression = function (e, t) {
                return this.initFunction(e), e.params = this.toAssignableList(t, !0), e.expression = this.tok.type !== i.braceL, e.body = e.expression ? this.parseMaybeAssign() : this.parseBlock(), this.finishNode(e, "ArrowFunctionExpression")
            }, s.parseExprList = function (e, t) {
                this.pushCx();
                var r = this.curIndent, o = this.curLineStart, s = [];
                for (this.next(); !this.closes(e, r + 1, o);) if (this.eat(i.comma)) s.push(t ? null : this.dummyIdent()); else {
                    var a = this.parseMaybeAssign();
                    if (n(a)) {
                        if (this.closes(e, r, o)) break;
                        this.next()
                    } else s.push(a);
                    this.eat(i.comma)
                }
                return this.popCx(), this.eat(e) || (this.last.end = this.tok.start, this.options.locations && (this.last.loc.end = this.tok.loc.start)), s
            }
        }, {"..": 2, "./parseutil": 4, "./state": 5}],
        4: [function (e, t, r) {
            "use strict";
            r.isDummy = function (e) {
                return "✖" == e.name
            }, Object.defineProperty(r, "__esModule", {value: !0});
            var o = e("./state").LooseParser, n = e(".."), i = n.Node, s = n.SourceLocation, a = n.lineBreak,
                c = n.isNewLine, l = n.tokTypes, p = o.prototype;
            p.startNode = function () {
                var e = new i;
                return e.start = this.tok.start, this.options.locations && (e.loc = new s(this.toks, this.tok.loc.start)), this.options.directSourceFile && (e.sourceFile = this.options.directSourceFile), this.options.ranges && (e.range = [this.tok.start, 0]), e
            }, p.storeCurrentPos = function () {
                return this.options.locations ? [this.tok.start, this.tok.loc.start] : this.tok.start
            }, p.startNodeAt = function (e) {
                var t = new i;
                return this.options.locations ? (t.start = e[0], t.loc = new s(this.toks, e[1]), e = e[0]) : t.start = e, this.options.directSourceFile && (t.sourceFile = this.options.directSourceFile), this.options.ranges && (t.range = [e, 0]), t
            }, p.finishNode = function (e, t) {
                return e.type = t, e.end = this.last.end, this.options.locations && (e.loc.end = this.last.loc.end), this.options.ranges && (e.range[1] = this.last.end), e
            }, p.dummyIdent = function () {
                var e = this.startNode();
                return e.name = "✖", this.finishNode(e, "Identifier")
            }, p.eat = function (e) {
                return this.tok.type === e && (this.next(), !0)
            }, p.isContextual = function (e) {
                return this.tok.type === l.name && this.tok.value === e
            }, p.eatContextual = function (e) {
                return this.tok.value === e && this.eat(l.name)
            }, p.canInsertSemicolon = function () {
                return this.tok.type === l.eof || this.tok.type === l.braceR || a.test(this.input.slice(this.last.end, this.tok.start))
            }, p.semicolon = function () {
                return this.eat(l.semi)
            }, p.expect = function (e) {
                if (this.eat(e)) return !0;
                for (var t = 1; t <= 2; t++) if (this.lookAhead(t).type == e) {
                    for (var r = 0; r < t; r++) this.next();
                    return !0
                }
            }, p.pushCx = function () {
                this.context.push(this.curIndent)
            }, p.popCx = function () {
                this.curIndent = this.context.pop()
            }, p.lineEnd = function (e) {
                for (; e < this.input.length && !c(this.input.charCodeAt(e));) ++e;
                return e
            }, p.indentationAfter = function (e) {
                for (var t = 0; ; ++e) {
                    var r = this.input.charCodeAt(e);
                    if (32 === r) ++t; else {
                        if (9 !== r) return t;
                        t += this.options.tabSize
                    }
                }
            }, p.closes = function (e, t, r, o) {
                return this.tok.type === e || this.tok.type === l.eof || r != this.curLineStart && this.curIndent < t && this.tokenStartsLine() && (!o || this.nextLineStart >= this.input.length || this.indentationAfter(this.nextLineStart) < t)
            }, p.tokenStartsLine = function () {
                for (var e = this.tok.start - 1; e >= this.curLineStart; --e) {
                    var t = this.input.charCodeAt(e);
                    if (9 !== t && 32 !== t) return !1
                }
                return !0
            }
        }, {"..": 2, "./state": 5}],
        5: [function (e, t, r) {
            "use strict";
            r.LooseParser = function (e, t) {
                if (this.toks = n(e, t), this.options = this.toks.options, this.input = this.toks.input, this.tok = this.last = {
                    type: s.eof,
                    start: 0,
                    end: 0
                }, this.options.locations) {
                    var r = this.toks.curPosition();
                    this.tok.loc = new i(this.toks, r, r)
                }
                this.ahead = [], this.context = [], this.curIndent = 0, this.curLineStart = 0, this.nextLineStart = this.lineEnd(this.curLineStart) + 1
            }, Object.defineProperty(r, "__esModule", {value: !0});
            var o = e(".."), n = o.tokenizer, i = o.SourceLocation, s = o.tokTypes
        }, {"..": 2}],
        6: [function (e, t, r) {
            "use strict";
            var o = e("./state").LooseParser, n = e("./parseutil").isDummy, i = e(".."), s = i.getLineInfo,
                a = i.tokTypes, c = o.prototype;
            c.parseTopLevel = function () {
                var e = this.startNodeAt(this.options.locations ? [0, s(this.input, 0)] : 0);
                for (e.body = []; this.tok.type !== a.eof;) e.body.push(this.parseStatement());
                return this.last = this.tok, this.options.ecmaVersion >= 6 && (e.sourceType = this.options.sourceType), this.finishNode(e, "Program")
            }, c.parseStatement = function () {
                var e = this.tok.type, t = this.startNode();
                switch (e) {
                    case a._break:
                    case a._continue:
                        this.next();
                        var r = e === a._break;
                        return this.semicolon() || this.canInsertSemicolon() ? t.label = null : (t.label = this.tok.type === a.name ? this.parseIdent() : null, this.semicolon()), this.finishNode(t, r ? "BreakStatement" : "ContinueStatement");
                    case a._debugger:
                        return this.next(), this.semicolon(), this.finishNode(t, "DebuggerStatement");
                    case a._do:
                        return this.next(), t.body = this.parseStatement(), t.test = this.eat(a._while) ? this.parseParenExpression() : this.dummyIdent(), this.semicolon(), this.finishNode(t, "DoWhileStatement");
                    case a._for:
                        if (this.next(), this.pushCx(), this.expect(a.parenL), this.tok.type === a.semi) return this.parseFor(t, null);
                        if (this.tok.type === a._var || this.tok.type === a._let || this.tok.type === a._const) {
                            var o = this.parseVar(!0);
                            return 1 !== o.declarations.length || this.tok.type !== a._in && !this.isContextual("of") ? this.parseFor(t, o) : this.parseForIn(t, o)
                        }
                        var i = this.parseExpression(!0);
                        return this.tok.type === a._in || this.isContextual("of") ? this.parseForIn(t, this.toAssignable(i)) : this.parseFor(t, i);
                    case a._function:
                        return this.next(), this.parseFunction(t, !0);
                    case a._if:
                        return this.next(), t.test = this.parseParenExpression(), t.consequent = this.parseStatement(), t.alternate = this.eat(a._else) ? this.parseStatement() : null, this.finishNode(t, "IfStatement");
                    case a._return:
                        return this.next(), this.eat(a.semi) || this.canInsertSemicolon() ? t.argument = null : (t.argument = this.parseExpression(), this.semicolon()), this.finishNode(t, "ReturnStatement");
                    case a._switch:
                        var s = this.curIndent, c = this.curLineStart;
                        this.next(), t.discriminant = this.parseParenExpression(), t.cases = [], this.pushCx(), this.expect(a.braceL);
                        for (var l = void 0; !this.closes(a.braceR, s, c, !0);) if (this.tok.type === a._case || this.tok.type === a._default) {
                            var p = this.tok.type === a._case;
                            l && this.finishNode(l, "SwitchCase"), t.cases.push(l = this.startNode()), l.consequent = [], this.next(), l.test = p ? this.parseExpression() : null, this.expect(a.colon)
                        } else l || (t.cases.push(l = this.startNode()), l.consequent = [], l.test = null), l.consequent.push(this.parseStatement());
                        return l && this.finishNode(l, "SwitchCase"), this.popCx(), this.eat(a.braceR), this.finishNode(t, "SwitchStatement");
                    case a._throw:
                        return this.next(), t.argument = this.parseExpression(), this.semicolon(), this.finishNode(t, "ThrowStatement");
                    case a._try:
                        if (this.next(), t.block = this.parseBlock(), t.handler = null, this.tok.type === a._catch) {
                            var h = this.startNode();
                            this.next(), this.expect(a.parenL), h.param = this.toAssignable(this.parseExprAtom(), !0), this.expect(a.parenR), h.guard = null, h.body = this.parseBlock(), t.handler = this.finishNode(h, "CatchClause")
                        }
                        return t.finalizer = this.eat(a._finally) ? this.parseBlock() : null, t.handler || t.finalizer ? this.finishNode(t, "TryStatement") : t.block;
                    case a._var:
                    case a._let:
                    case a._const:
                        return this.parseVar();
                    case a._while:
                        return this.next(), t.test = this.parseParenExpression(), t.body = this.parseStatement(), this.finishNode(t, "WhileStatement");
                    case a._with:
                        return this.next(), t.object = this.parseParenExpression(), t.body = this.parseStatement(), this.finishNode(t, "WithStatement");
                    case a.braceL:
                        return this.parseBlock();
                    case a.semi:
                        return this.next(), this.finishNode(t, "EmptyStatement");
                    case a._class:
                        return this.parseClass(!0);
                    case a._import:
                        return this.parseImport();
                    case a._export:
                        return this.parseExport();
                    default:
                        var u = this.parseExpression();
                        return n(u) ? (this.next(), this.tok.type === a.eof ? this.finishNode(t, "EmptyStatement") : this.parseStatement()) : e === a.name && "Identifier" === u.type && this.eat(a.colon) ? (t.body = this.parseStatement(), t.label = u, this.finishNode(t, "LabeledStatement")) : (t.expression = u, this.semicolon(), this.finishNode(t, "ExpressionStatement"))
                }
            }, c.parseBlock = function () {
                var e = this.startNode();
                this.pushCx(), this.expect(a.braceL);
                var t = this.curIndent, r = this.curLineStart;
                for (e.body = []; !this.closes(a.braceR, t, r, !0);) e.body.push(this.parseStatement());
                return this.popCx(), this.eat(a.braceR), this.finishNode(e, "BlockStatement")
            }, c.parseFor = function (e, t) {
                return e.init = t, e.test = e.update = null, this.eat(a.semi) && this.tok.type !== a.semi && (e.test = this.parseExpression()), this.eat(a.semi) && this.tok.type !== a.parenR && (e.update = this.parseExpression()), this.popCx(), this.expect(a.parenR), e.body = this.parseStatement(), this.finishNode(e, "ForStatement")
            }, c.parseForIn = function (e, t) {
                var r = this.tok.type === a._in ? "ForInStatement" : "ForOfStatement";
                return this.next(), e.left = t, e.right = this.parseExpression(), this.popCx(), this.expect(a.parenR), e.body = this.parseStatement(), this.finishNode(e, r)
            }, c.parseVar = function (e) {
                var t = this.startNode();
                t.kind = this.tok.type.keyword, this.next(), t.declarations = [];
                do {
                    var r;
                    (r = this.startNode()).id = this.options.ecmaVersion >= 6 ? this.toAssignable(this.parseExprAtom(), !0) : this.parseIdent(), r.init = this.eat(a.eq) ? this.parseMaybeAssign(e) : null, t.declarations.push(this.finishNode(r, "VariableDeclarator"))
                } while (this.eat(a.comma));
                t.declarations.length || ((r = this.startNode()).id = this.dummyIdent(), t.declarations.push(this.finishNode(r, "VariableDeclarator")));
                return e || this.semicolon(), this.finishNode(t, "VariableDeclaration")
            }, c.parseClass = function (e) {
                var t = this.startNode();
                this.next(), this.tok.type === a.name ? t.id = this.parseIdent() : t.id = e ? this.dummyIdent() : null, t.superClass = this.eat(a._extends) ? this.parseExpression() : null, t.body = this.startNode(), t.body.body = [], this.pushCx();
                var r = this.curIndent + 1, o = this.curLineStart;
                for (this.eat(a.braceL), this.curIndent + 1 < r && (r = this.curIndent, o = this.curLineStart); !this.closes(a.braceR, r, o);) if (!this.semicolon()) {
                    var i = this.startNode(), s = void 0;
                    this.options.ecmaVersion >= 6 && (i.static = !1, s = this.eat(a.star)), this.parsePropertyName(i), n(i.key) ? (n(this.parseMaybeAssign()) && this.next(), this.eat(a.comma)) : ("Identifier" !== i.key.type || i.computed || "static" !== i.key.name || this.tok.type == a.parenL || this.tok.type == a.braceL ? i.static = !1 : (i.static = !0, s = this.eat(a.star), this.parsePropertyName(i)), this.options.ecmaVersion >= 5 && "Identifier" === i.key.type && !i.computed && ("get" === i.key.name || "set" === i.key.name) && this.tok.type !== a.parenL && this.tok.type !== a.braceL ? (i.kind = i.key.name, this.parsePropertyName(i), i.value = this.parseMethod(!1)) : (i.computed || i.static || s || !("Identifier" === i.key.type && "constructor" === i.key.name || "Literal" === i.key.type && "constructor" === i.key.value) ? i.kind = "method" : i.kind = "constructor", i.value = this.parseMethod(s)), t.body.body.push(this.finishNode(i, "MethodDefinition")))
                }
                return this.popCx(), this.eat(a.braceR) || (this.last.end = this.tok.start, this.options.locations && (this.last.loc.end = this.tok.loc.start)), this.semicolon(), this.finishNode(t.body, "ClassBody"), this.finishNode(t, e ? "ClassDeclaration" : "ClassExpression")
            }, c.parseFunction = function (e, t) {
                return this.initFunction(e), this.options.ecmaVersion >= 6 && (e.generator = this.eat(a.star)), this.tok.type === a.name ? e.id = this.parseIdent() : t && (e.id = this.dummyIdent()), e.params = this.parseFunctionParams(), e.body = this.parseBlock(), this.finishNode(e, t ? "FunctionDeclaration" : "FunctionExpression")
            }, c.parseExport = function () {
                var e = this.startNode();
                if (this.next(), this.eat(a.star)) return e.source = this.eatContextual("from") ? this.parseExprAtom() : null, this.finishNode(e, "ExportAllDeclaration");
                if (this.eat(a._default)) {
                    var t = this.parseMaybeAssign();
                    if (t.id) switch (t.type) {
                        case"FunctionExpression":
                            t.type = "FunctionDeclaration";
                            break;
                        case"ClassExpression":
                            t.type = "ClassDeclaration"
                    }
                    return e.declaration = t, this.semicolon(), this.finishNode(e, "ExportDefaultDeclaration")
                }
                return this.tok.type.keyword ? (e.declaration = this.parseStatement(), e.specifiers = [], e.source = null) : (e.declaration = null, e.specifiers = this.parseExportSpecifierList(), e.source = this.eatContextual("from") ? this.parseExprAtom() : null, this.semicolon()), this.finishNode(e, "ExportNamedDeclaration")
            }, c.parseImport = function () {
                var e = this.startNode();
                if (this.next(), this.tok.type === a.string) e.specifiers = [], e.source = this.parseExprAtom(), e.kind = ""; else {
                    var t = void 0;
                    this.tok.type === a.name && "from" !== this.tok.value && ((t = this.startNode()).local = this.parseIdent(), this.finishNode(t, "ImportDefaultSpecifier"), this.eat(a.comma)), e.specifiers = this.parseImportSpecifierList(), e.source = this.eatContextual("from") ? this.parseExprAtom() : null, t && e.specifiers.unshift(t)
                }
                return this.semicolon(), this.finishNode(e, "ImportDeclaration")
            }, c.parseImportSpecifierList = function () {
                var e = [];
                if (this.tok.type === a.star) {
                    var t = this.startNode();
                    this.next(), this.eatContextual("as") && (t.local = this.parseIdent()), e.push(this.finishNode(t, "ImportNamespaceSpecifier"))
                } else {
                    var r = this.curIndent, o = this.curLineStart, n = this.nextLineStart;
                    for (this.pushCx(), this.eat(a.braceL), this.curLineStart > n && (n = this.curLineStart); !this.closes(a.braceR, r + (this.curLineStart <= n ? 1 : 0), o);) {
                        t = this.startNode();
                        if (this.eat(a.star)) this.eatContextual("as") && (t.local = this.parseIdent()), this.finishNode(t, "ImportNamespaceSpecifier"); else {
                            if (this.isContextual("from")) break;
                            t.imported = this.parseIdent(), t.local = this.eatContextual("as") ? this.parseIdent() : t.imported, this.finishNode(t, "ImportSpecifier")
                        }
                        e.push(t), this.eat(a.comma)
                    }
                    this.eat(a.braceR), this.popCx()
                }
                return e
            }, c.parseExportSpecifierList = function () {
                var e = [], t = this.curIndent, r = this.curLineStart, o = this.nextLineStart;
                for (this.pushCx(), this.eat(a.braceL), this.curLineStart > o && (o = this.curLineStart); !this.closes(a.braceR, t + (this.curLineStart <= o ? 1 : 0), r) && !this.isContextual("from");) {
                    var n = this.startNode();
                    n.local = this.parseIdent(), n.exported = this.eatContextual("as") ? this.parseIdent() : n.local, this.finishNode(n, "ExportSpecifier"), e.push(n), this.eat(a.comma)
                }
                return this.eat(a.braceR), this.popCx(), e
            }
        }, {"..": 2, "./parseutil": 4, "./state": 5}],
        7: [function (e, t, r) {
            "use strict";
            var o = e(".."), n = o.tokTypes, i = o.Token, s = o.isNewLine, a = o.SourceLocation, c = o.getLineInfo,
                l = o.lineBreakG, p = e("./state").LooseParser.prototype;

            function h(e) {
                return e < 14 && e > 8 || 32 === e || 160 === e || s(e)
            }

            p.next = function () {
                if (this.last = this.tok, this.ahead.length ? this.tok = this.ahead.shift() : this.tok = this.readToken(), this.tok.start >= this.nextLineStart) {
                    for (; this.tok.start >= this.nextLineStart;) this.curLineStart = this.nextLineStart, this.nextLineStart = this.lineEnd(this.curLineStart) + 1;
                    this.curIndent = this.indentationAfter(this.curLineStart)
                }
            }, p.readToken = function () {
                for (; ;) try {
                    return this.toks.next(), this.toks.type === n.dot && "." === this.input.substr(this.toks.end, 1) && this.options.ecmaVersion >= 6 && (this.toks.end++, this.toks.type = n.ellipsis), new i(this.toks)
                } catch (i) {
                    if (!(i instanceof SyntaxError)) throw i;
                    var e = i.message, t = i.raisedAt, r = !0;
                    if (/unterminated/i.test(e)) if (t = this.lineEnd(i.pos + 1), /string/.test(e)) r = {
                        start: i.pos,
                        end: t,
                        type: n.string,
                        value: this.input.slice(i.pos + 1, t)
                    }; else if (/regular expr/i.test(e)) {
                        var o = this.input.slice(i.pos, t);
                        try {
                            o = new RegExp(o)
                        } catch (e) {
                        }
                        r = {start: i.pos, end: t, type: n.regexp, value: o}
                    } else r = !!/template/.test(e) && {
                        start: i.pos,
                        end: t,
                        type: n.template,
                        value: this.input.slice(i.pos, t)
                    }; else if (/invalid (unicode|regexp|number)|expecting unicode|octal literal|is reserved|directly after number/i.test(e)) for (; t < this.input.length && !h(this.input.charCodeAt(t));) ++t; else if (/character escape|expected hexadecimal/i.test(e)) for (; t < this.input.length;) {
                        var l = this.input.charCodeAt(t++);
                        if (34 === l || 39 === l || s(l)) break
                    } else if (/unexpected character/i.test(e)) t++, r = !1; else {
                        if (!/regular expression/i.test(e)) throw i;
                        r = !0
                    }
                    if (this.resetTo(t), !0 === r && (r = {
                        start: t,
                        end: t,
                        type: n.name,
                        value: "✖"
                    }), r) return this.options.locations && (r.loc = new a(this.toks, c(this.input, r.start), c(this.input, r.end))), r
                }
            }, p.resetTo = function (e) {
                this.toks.pos = e;
                var t = this.input.charAt(e - 1);
                if (this.toks.exprAllowed = !t || /[\[\{\(,;:?\/*=+\-~!|&%^<>]/.test(t) || /[enwfd]/.test(t) && /\b(keywords|case|else|return|throw|new|in|(instance|type)of|delete|void)$/.test(this.input.slice(e - 10, e)), this.options.locations) {
                    this.toks.curLine = 1, this.toks.lineStart = l.lastIndex = 0;
                    for (var r = void 0; (r = l.exec(this.input)) && r.index < e;) ++this.toks.curLine, this.toks.lineStart = r.index + r[0].length
                }
            }, p.lookAhead = function (e) {
                for (; e > this.ahead.length;) this.ahead.push(this.readToken());
                return this.ahead[e - 1]
            }
        }, {"..": 2, "./state": 5}]
    }, {}, [1])(1)
}), function (e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
        var t;
        ((t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).acorn || (t.acorn = {})).walk = e()
    }
}(function () {
    return function e(t, r, o) {
        function n(s, a) {
            if (!r[s]) {
                if (!t[s]) {
                    var c = "function" == typeof require && require;
                    if (!a && c) return c(s, !0);
                    if (i) return i(s, !0);
                    var l = new Error("Cannot find module '" + s + "'");
                    throw l.code = "MODULE_NOT_FOUND", l
                }
                var p = r[s] = {exports: {}};
                t[s][0].call(p.exports, function (e) {
                    var r = t[s][1][e];
                    return n(r || e)
                }, p, p.exports, e, t, r, o)
            }
            return r[s].exports
        }

        for (var i = "function" == typeof require && require, s = 0; s < o.length; s++) n(o[s]);
        return n
    }({
        1: [function (e, t, r) {
            "use strict";

            function o(e) {
                return "string" == typeof e ? function (t) {
                    return t == e
                } : e || function () {
                    return !0
                }
            }

            r.simple = function (e, t, o, n) {
                o || (o = r.base);
                !function e(r, n, i) {
                    var s = i || r.type, a = t[s];
                    o[s](r, n, e), a && a(r, n)
                }(e, n)
            }, r.ancestor = function (e, t, o, n) {
                o || (o = r.base);
                n || (n = []);
                !function e(r, n, i) {
                    var s = i || r.type, a = t[s];
                    r != n[n.length - 1] && (n = n.slice()).push(r), o[s](r, n, e), a && a(r, n)
                }(e, n)
            }, r.recursive = function (e, t, o, n) {
                var i = o ? r.make(o, n) : n;
                !function e(t, r, o) {
                    i[o || t.type](t, r, e)
                }(e, t)
            }, r.findNodeAt = function (e, t, i, s, a, c) {
                s = o(s), a || (a = r.base);
                try {
                    !function e(r, o, c) {
                        var l = c || r.type;
                        if ((null == t || r.start <= t) && (null == i || r.end >= i) && a[l](r, o, e), s(l, r) && (null == t || r.start == t) && (null == i || r.end == i)) throw new n(r, o)
                    }(e, c)
                } catch (e) {
                    if (e instanceof n) return e;
                    throw e
                }
            }, r.findNodeAround = function (e, t, i, s, a) {
                i = o(i), s || (s = r.base);
                try {
                    !function e(r, o, a) {
                        var c = a || r.type;
                        if (!(r.start > t || r.end < t) && (s[c](r, o, e), i(c, r))) throw new n(r, o)
                    }(e, a)
                } catch (e) {
                    if (e instanceof n) return e;
                    throw e
                }
            }, r.findNodeAfter = function (e, t, i, s, a) {
                i = o(i), s || (s = r.base);
                try {
                    !function e(r, o, a) {
                        if (!(r.end < t)) {
                            var c = a || r.type;
                            if (r.start >= t && i(c, r)) throw new n(r, o);
                            s[c](r, o, e)
                        }
                    }(e, a)
                } catch (e) {
                    if (e instanceof n) return e;
                    throw e
                }
            }, r.findNodeBefore = function (e, t, i, s, a) {
                i = o(i), s || (s = r.base);
                var c = void 0;
                return function e(r, o, a) {
                    if (!(r.start > t)) {
                        var l = a || r.type;
                        r.end <= t && (!c || c.node.end < r.end) && i(l, r) && (c = new n(r, o)), s[l](r, o, e)
                    }
                }(e, a), c
            }, r.make = function (e, t) {
                t || (t = r.base);
                var o = {};
                for (var n in t) o[n] = t[n];
                for (var n in e) o[n] = e[n];
                return o
            }, Object.defineProperty(r, "__esModule", {value: !0});
            var n = function e(t, r) {
                !function (e, t) {
                    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                }(this, e), this.node = t, this.state = r
            };

            function i(e, t, r) {
                r(e, t)
            }

            function s(e, t, r) {
            }

            var a = {};
            r.base = a, a.Program = a.BlockStatement = function (e, t, r) {
                for (var o = 0; o < e.body.length; ++o) r(e.body[o], t, "Statement")
            }, a.Statement = i, a.EmptyStatement = s, a.ExpressionStatement = a.ParenthesizedExpression = function (e, t, r) {
                return r(e.expression, t, "Expression")
            }, a.IfStatement = function (e, t, r) {
                r(e.test, t, "Expression"), r(e.consequent, t, "Statement"), e.alternate && r(e.alternate, t, "Statement")
            }, a.LabeledStatement = function (e, t, r) {
                return r(e.body, t, "Statement")
            }, a.BreakStatement = a.ContinueStatement = s, a.WithStatement = function (e, t, r) {
                r(e.object, t, "Expression"), r(e.body, t, "Statement")
            }, a.SwitchStatement = function (e, t, r) {
                r(e.discriminant, t, "Expression");
                for (var o = 0; o < e.cases.length; ++o) {
                    var n = e.cases[o];
                    n.test && r(n.test, t, "Expression");
                    for (var i = 0; i < n.consequent.length; ++i) r(n.consequent[i], t, "Statement")
                }
            }, a.ReturnStatement = a.YieldExpression = function (e, t, r) {
                e.argument && r(e.argument, t, "Expression")
            }, a.ThrowStatement = a.SpreadElement = a.RestElement = function (e, t, r) {
                return r(e.argument, t, "Expression")
            }, a.TryStatement = function (e, t, r) {
                r(e.block, t, "Statement"), e.handler && r(e.handler.body, t, "ScopeBody"), e.finalizer && r(e.finalizer, t, "Statement")
            }, a.WhileStatement = a.DoWhileStatement = function (e, t, r) {
                r(e.test, t, "Expression"), r(e.body, t, "Statement")
            }, a.ForStatement = function (e, t, r) {
                e.init && r(e.init, t, "ForInit"), e.test && r(e.test, t, "Expression"), e.update && r(e.update, t, "Expression"), r(e.body, t, "Statement")
            }, a.ForInStatement = a.ForOfStatement = function (e, t, r) {
                r(e.left, t, "ForInit"), r(e.right, t, "Expression"), r(e.body, t, "Statement")
            }, a.ForInit = function (e, t, r) {
                "VariableDeclaration" == e.type ? r(e, t) : r(e, t, "Expression")
            }, a.DebuggerStatement = s, a.FunctionDeclaration = function (e, t, r) {
                return r(e, t, "Function")
            }, a.VariableDeclaration = function (e, t, r) {
                for (var o = 0; o < e.declarations.length; ++o) {
                    var n = e.declarations[o];
                    n.init && r(n.init, t, "Expression")
                }
            }, a.Function = function (e, t, r) {
                return r(e.body, t, "ScopeBody")
            }, a.ScopeBody = function (e, t, r) {
                return r(e, t, "Statement")
            }, a.Expression = i, a.ThisExpression = a.Super = a.MetaProperty = s, a.ArrayExpression = a.ArrayPattern = function (e, t, r) {
                for (var o = 0; o < e.elements.length; ++o) {
                    var n = e.elements[o];
                    n && r(n, t, "Expression")
                }
            }, a.ObjectExpression = a.ObjectPattern = function (e, t, r) {
                for (var o = 0; o < e.properties.length; ++o) r(e.properties[o], t)
            }, a.FunctionExpression = a.ArrowFunctionExpression = a.FunctionDeclaration, a.SequenceExpression = a.TemplateLiteral = function (e, t, r) {
                for (var o = 0; o < e.expressions.length; ++o) r(e.expressions[o], t, "Expression")
            }, a.UnaryExpression = a.UpdateExpression = function (e, t, r) {
                r(e.argument, t, "Expression")
            }, a.BinaryExpression = a.AssignmentExpression = a.AssignmentPattern = a.LogicalExpression = function (e, t, r) {
                r(e.left, t, "Expression"), r(e.right, t, "Expression")
            }, a.ConditionalExpression = function (e, t, r) {
                r(e.test, t, "Expression"), r(e.consequent, t, "Expression"), r(e.alternate, t, "Expression")
            }, a.NewExpression = a.CallExpression = function (e, t, r) {
                if (r(e.callee, t, "Expression"), e.arguments) for (var o = 0; o < e.arguments.length; ++o) r(e.arguments[o], t, "Expression")
            }, a.MemberExpression = function (e, t, r) {
                r(e.object, t, "Expression"), e.computed && r(e.property, t, "Expression")
            }, a.ExportNamedDeclaration = a.ExportDefaultDeclaration = function (e, t, r) {
                return r(e.declaration, t)
            }, a.ImportDeclaration = function (e, t, r) {
                for (var o = 0; o < e.specifiers.length; o++) r(e.specifiers[o], t)
            }, a.ImportSpecifier = a.ImportDefaultSpecifier = a.ImportNamespaceSpecifier = a.Identifier = a.Literal = s, a.TaggedTemplateExpression = function (e, t, r) {
                r(e.tag, t, "Expression"), r(e.quasi, t)
            }, a.ClassDeclaration = a.ClassExpression = function (e, t, r) {
                e.superClass && r(e.superClass, t, "Expression");
                for (var o = 0; o < e.body.body.length; o++) r(e.body.body[o], t)
            }, a.MethodDefinition = a.Property = function (e, t, r) {
                e.computed && r(e.key, t, "Expression"), r(e.value, t, "Expression")
            }, a.ComprehensionExpression = function (e, t, r) {
                for (var o = 0; o < e.blocks.length; o++) r(e.blocks[o].right, t, "Expression");
                r(e.body, t, "Expression")
            }
        }, {}]
    }, {}, [1])(1)
}), function (e, t) {
    "object" == typeof exports && "object" == typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t((e.tern || (e.tern = {})).signal = {})
}(this, function (e) {
    function t(e, t) {
        var r = this._handlers || (this._handlers = Object.create(null));
        (r[e] || (r[e] = [])).push(t)
    }

    function r(e, t) {
        var r = this._handlers && this._handlers[e];
        if (r) for (var o = 0; o < r.length; ++o) if (r[o] == t) {
            r.splice(o, 1);
            break
        }
    }

    function o(e, t, r, o, n) {
        var i = this._handlers && this._handlers[e];
        if (i) for (var s = 0; s < i.length; ++s) i[s].call(this, t, r, o, n)
    }

    e.mixin = function (e) {
        return e.on = t, e.off = r, e.signal = o, e
    }
}), function (e, t) {
    "object" == typeof exports && "object" == typeof module ? t(exports, require("./infer"), require("./signal"), require("acorn"), require("acorn/dist/walk")) : "function" == typeof define && define.amd ? define(["exports", "./infer", "./signal", "acorn/dist/acorn", "acorn/dist/walk"], t) : t(e.tern || (e.tern = {}), tern, tern.signal, acorn, acorn.walk)
}(this, function (e, t, r, o, n) {
    "use strict";
    var i = Object.create(null);
    e.registerPlugin = function (e, t) {
        i[e] = t
    };
    var s = e.defaultOptions = {
        debug: !1, async: !1, getFile: function (e, t) {
            this.async && t(null, null)
        }, defs: [], plugins: {}, fetchTimeout: 1e3, dependencyBudget: 2e4, reuseInstances: !0, stripCRs: !1
    }, a = {
        completions: {
            takesFile: !0, run: function (e, r, n) {
                if (null == r.end) throw m("missing .query.end field");
                if (e.passes.completion) for (var i = 0; i < e.passes.completion.length; i++) {
                    var s = e.passes.completion[i](n, r);
                    if (s) return s
                }
                var a = T(n, r.end), c = a, l = n.text;
                for (; a && o.isIdentifierChar(l.charCodeAt(a - 1));) --a;
                if (!1 !== r.expandWordForward) for (; c < l.length && o.isIdentifierChar(l.charCodeAt(c));) ++c;
                var p, h = l.slice(a, c), u = [];
                r.caseInsensitive && (h = h.toLowerCase());
                var d, f, b, y = r.types || r.depths || r.docs || r.urls || r.origins;

                function g(o, n, i, s) {
                    if ((!1 === r.omitObjectPrototype || n != e.cx.protos.Object || h) && !(!1 !== r.filter && h && 0 !== (r.caseInsensitive ? o.toLowerCase() : o).indexOf(h) || p && p.props[o])) {
                        for (var a = 0; a < u.length; ++a) {
                            var c = u[a];
                            if ((y ? c.name : c) == o) return
                        }
                        var l = y ? {name: o} : o;
                        if (u.push(l), n && (r.types || r.docs || r.urls || r.origins)) {
                            var d = n.props[o];
                            t.resetGuessing();
                            var f = d.getType();
                            l.guess = t.didGuess(), r.types && (l.type = t.toString(d)), r.docs && E(l, "doc", d.doc || f && f.doc), r.urls && E(l, "url", d.url || f && f.url), r.origins && E(l, "origin", d.origin || f && f.origin)
                        }
                        r.depths && (l.depth = i), y && s && s(l)
                    }
                }

                var v, S, R = t.findExpressionAround(n.ast, null, a, n.scope);
                if (R) if ("MemberExpression" == R.node.type && R.node.object.end < a) v = R; else if (function (e, t, r) {
                    return "Literal" == e.type && "string" == typeof e.value && e.start == t - 1 && e.end <= r + 1
                }(R.node, a, c)) {
                    var C = t.parentNode(R.node, n.ast);
                    "MemberExpression" == C.type && C.property == R.node && (v = {node: C, state: R.state})
                } else if ("ObjectExpression" == R.node.type) {
                    var _ = O(R.node, c);
                    _ ? (S = R, P = b = _.key.name) : h || /:\s*$/.test(n.text.slice(0, a)) || (S = R, P = b = !0)
                }
                if (S) f = t.typeFromContext(n.ast, S), p = S.node.objType; else if (v) P = "Literal" == (P = v.node.property).type ? P.value.slice(1) : P.name, v.node = v.node.object, f = t.expressionType(v); else if ("." == l.charAt(a - 1)) {
                    for (var j = a - 1; j && ("." == l.charAt(j - 1) || o.isIdentifierChar(l.charCodeAt(j - 1)));) j--;
                    var k = l.slice(j, a - 1);
                    k && (f = t.def.parsePath(k, n.scope).getObjType(), P = h)
                }
                if (null != P) {
                    if (e.cx.completingProperty = P, f && t.forAllPropertiesOf(f, g), !u.length && !1 !== r.guess && f && f.guessProperties && f.guessProperties(function (e, t, r) {
                        e != P && "✖" != e && g(e, t, r)
                    }), !u.length && h.length >= 2 && !1 !== r.guess) for (var P in e.cx.props) g(P, e.cx.props[P][0], 0);
                    d = "memberCompletion"
                } else t.forAllLocalsAt(n.ast, a, n.scope, g), r.includeKeywords && x.forEach(function (e) {
                    g(e, null, 0, function (e) {
                        e.isKeyword = !0
                    })
                }), d = "variableCompletion";
                e.passes[d] && e.passes[d].forEach(function (e) {
                    e(n, a, c, g)
                });
                !1 !== r.sort && u.sort(A);
                return e.cx.completingProperty = null, {
                    start: w(r, n, a),
                    end: w(r, n, c),
                    isProperty: !!P,
                    isObjectKey: !!b,
                    completions: u
                }
            }
        }, properties: {
            run: function (e, t) {
                var r = t.prefix, o = [];
                for (var n in e.cx.props) "<i>" == n || r && 0 !== n.indexOf(r) || o.push(n);
                !1 !== t.sort && o.sort(A);
                return {completions: o}
            }
        }, type: {
            takesFile: !0, run: function (e, r, o) {
                var n, i = C(o, r), s = k(e, r, o, i), a = s;
                s = r.preferFunction && s.getFunctionType() || s.getType();
                i && ("Identifier" == i.node.type ? n = i.node.name : "MemberExpression" != i.node.type || i.node.computed || (n = i.node.property.name));
                if (null != r.depth && "number" != typeof r.depth) throw m(".query.depth must be a number");
                var c = {guess: t.didGuess(), type: t.toString(a, r.depth), name: s && s.name, exprName: n};
                s && P(s, c);
                !c.doc && a.doc && (c.doc = a.doc);
                return R(c)
            }
        }, documentation: {
            takesFile: !0, run: function (e, r, o) {
                var n = C(o, r), i = k(e, r, o, n), s = {url: i.url, doc: i.doc, type: t.toString(i)}, a = i.getType();
                a && P(a, s);
                return R(s)
            }
        }, definition: {
            takesFile: !0, run: function (e, r, o) {
                var n = C(o, r), i = k(e, r, o, n);
                if (t.didGuess()) return {};
                var s = N(i), a = {url: i.url, doc: i.doc, origin: i.origin};
                if (i.types) for (var c = i.types.length - 1; c >= 0; --c) {
                    var l = i.types[c];
                    P(l, a), s || (s = N(l))
                }
                if (s && s.node) {
                    var p = s.node.sourceFile || e.findFile(s.origin), h = w(r, p, s.node.start),
                        u = w(r, p, s.node.end);
                    a.start = h, a.end = u, a.file = s.origin;
                    var d = Math.max(0, s.node.start - 50);
                    a.contextOffset = s.node.start - d, a.context = p.text.slice(d, d + 50)
                } else s && (a.file = s.origin, U(e, r, s, a));
                return R(a)
            }
        }, refs: {
            takesFile: !0, fullFile: !0, run: function (e, t, r) {
                var o = _(r, t, !0);
                if (o && "Identifier" == o.node.type) return I(e, t, r, o);
                if (o && "MemberExpression" == o.node.type && !o.node.computed) {
                    var n = o.node.property;
                    return o.node = o.node.object, L(e, t, o, n)
                }
                if (o && "ObjectExpression" == o.node.type) for (var i = T(r, t.end), s = 0; s < o.node.properties.length; ++s) {
                    var a = o.node.properties[s].key;
                    if (a.start <= i && a.end >= i) return L(e, t, o, a)
                }
                throw m("Not at a variable or property name.")
            }
        }, rename: {
            takesFile: !0, fullFile: !0, run: function (e, t, r) {
                if ("string" != typeof t.newName) throw m(".query.newName should be a string");
                var o = _(r, t);
                if (!o || "Identifier" != o.node.type) throw m("Not at a variable.");
                var n = I(e, t, r, o, t.newName), i = n.refs;
                delete n.refs, n.files = e.files.map(function (e) {
                    return e.name
                });
                for (var s = n.changes = [], a = 0; a < i.length; ++a) {
                    var c = i[a];
                    c.text = t.newName, s.push(c)
                }
                return n
            }
        }, files: {
            run: function (e) {
                return {
                    files: e.files.map(function (e) {
                        return e.name
                    })
                }
            }
        }
    };

    function c(e, t) {
        this.name = e, this.parent = t, this.scope = this.text = this.ast = this.lineOffsets = null
    }

    function l(e, r, o) {
        e.text = o.options.stripCRs ? r.replace(/\r\n/g, "\n") : r, t.withContext(o.cx, function () {
            e.ast = t.parse(e.text, o.passes, {directSourceFile: e, allowReturnOutsideFunction: !0})
        }), e.lineOffsets = null
    }

    function p(e, r) {
        return t.withContext(e.cx, function () {
            r.scope = e.cx.topScope, e.signal("beforeLoad", r), t.analyze(r.ast, r.name, r.scope, e.passes), e.signal("afterLoad", r)
        }), r
    }

    function h(e, t, r, o) {
        var n = e.findFile(t);
        if (n) return null != o && (n.scope && (e.needsPurge.push(t), n.scope = null), l(n, o, e)), void (b(e, n.parent) > b(e, r) && (n.parent = r, n.excluded && (n.excluded = null)));
        var i = new c(t, r);
        e.files.push(i), e.fileMap[t] = i, null != o ? l(i, o, e) : e.options.async ? (e.startAsyncAction(), e.options.getFile(t, function (t, r) {
            l(i, r || "", e), e.finishAsyncAction(t)
        })) : l(i, e.options.getFile(t) || "", e)
    }

    function u(e, t, r) {
        var o = function () {
            e.off("everythingFetched", o), clearTimeout(n), d(e, t, r)
        };
        e.on("everythingFetched", o);
        var n = setTimeout(o, e.options.fetchTimeout)
    }

    function d(e, r, o) {
        if (e.pending) return u(e, r, o);
        var n = e.fetchError;
        if (n) return e.fetchError = null, o(n);
        e.needsPurge.length > 0 && t.withContext(e.cx, function () {
            t.purge(e.needsPurge), e.needsPurge.length = 0
        });
        for (var i = !0, s = 0; s < e.files.length;) {
            for (var a = []; s < e.files.length; ++s) {
                null == (l = e.files[s]).text ? i = !1 : null != l.scope || l.excluded || a.push(l)
            }
            a.sort(function (t, r) {
                return b(e, t.parent) - b(e, r.parent)
            });
            for (var c = 0; c < a.length; c++) {
                var l;
                if ((l = a[c]).parent && !y(e, l)) l.excluded = !0; else if (r) {
                    var h = +new Date;
                    t.withTimeout(r[0], function () {
                        p(e, l)
                    }), r[0] -= +new Date - h
                } else p(e, l)
            }
        }
        i ? o() : u(e, r, o)
    }

    function f(e) {
        for (var t = 0; e; ++t, e = e.prev) ;
        return t
    }

    function m(e) {
        var t = new Error(e);
        return t.name = "TernError", t
    }

    function b(e, t) {
        for (var r = 0; t;) t = e.findFile(t).parent, ++r;
        return r
    }

    function y(e, t) {
        var r = function (e, t) {
            for (; ;) {
                var r = e.findFile(t.parent);
                if (!r.parent) break;
                t = r
            }
            return t.name
        }(e, t), o = function (e) {
            var t = 0;
            return n.simple(e, {
                Expression: function () {
                    ++t
                }
            }), t
        }(t.ast), i = e.budgets[r];
        return null == i && (i = e.budgets[r] = e.options.dependencyBudget), !(i < o) && (e.budgets[r] = i - o, !0)
    }

    function g(e) {
        return "number" == typeof e || "object" == typeof e && "number" == typeof e.line && "number" == typeof e.ch
    }

    e.defineQueryType = function (e, t) {
        a[e] = t
    }, c.prototype.asLineChar = function (e) {
        return S(this, e)
    }, (e.Server = function (e) {
        for (var t in this.cx = null, this.options = e || {}, s) e.hasOwnProperty(t) || (e[t] = s[t]);
        for (var r in this.handlers = Object.create(null), this.files = [], this.fileMap = Object.create(null), this.needsPurge = [], this.budgets = Object.create(null), this.uses = 0, this.pending = 0, this.asyncError = null, this.passes = Object.create(null), this.defs = e.defs.slice(0), e.plugins) if (e.plugins.hasOwnProperty(r) && r in i) {
            var o = i[r](this, e.plugins[r]);
            if (o && o.defs && (o.loadFirst ? this.defs.unshift(o.defs) : this.defs.push(o.defs)), o && o.passes) for (var n in o.passes) o.passes.hasOwnProperty(n) && (this.passes[n] || (this.passes[n] = [])).push(o.passes[n])
        }
        this.reset()
    }).prototype = r.mixin({
        addFile: function (e, t, r) {
            !r || r in this.fileMap || (r = null), h(this, e, r, t)
        }, delFile: function (e) {
            var t = this.findFile(e);
            t && (this.needsPurge.push(t.name), this.files.splice(this.files.indexOf(t), 1), delete this.fileMap[e])
        }, reset: function () {
            this.signal("reset"), this.cx = new t.Context(this.defs, this), this.uses = 0, this.budgets = Object.create(null);
            for (var e = 0; e < this.files.length; ++e) {
                this.files[e].scope = null
            }
        }, request: function (e, r) {
            var o = function (e) {
                if (e.query) {
                    if ("string" != typeof e.query.type) return ".query.type must be a string";
                    if (e.query.start && !g(e.query.start)) return ".query.start must be a position";
                    if (e.query.end && !g(e.query.end)) return ".query.end must be a position"
                }
                if (e.files) {
                    if (!Array.isArray(e.files)) return "Files property must be an array";
                    for (var t = 0; t < e.files.length; ++t) {
                        var r = e.files[t];
                        if ("object" != typeof r) return ".files[n] must be objects";
                        if ("string" != typeof r.name) return ".files[n].name must be a string";
                        if ("delete" != r.type) {
                            if ("string" != typeof r.text) return ".files[n].text must be a string";
                            if ("part" == r.type) {
                                if (!g(r.offset) && "number" != typeof r.offsetLines) return ".files[n].offset must be a position"
                            } else if ("full" != r.type) return '.files[n].type must be "full" or "part"'
                        }
                    }
                }
            }(e);
            if (o) return r(o);
            var i = this;
            !function (e, r, o) {
                if (r.query && !a.hasOwnProperty(r.query.type)) return o("No query type '" + r.query.type + "' defined");
                var i = r.query;
                i || o(null, {});
                var s = r.files || [];
                s.length && ++e.uses;
                for (var c = 0; c < s.length; ++c) {
                    var l = s[c];
                    "delete" == l.type ? e.delFile(l.name) : h(e, l.name, null, "full" == l.type ? l.text : null)
                }
                var p = "number" == typeof r.timeout ? [r.timeout] : null;
                if (!i) return void d(e, p, function () {
                });
                var u = a[i.type];
                if (u.takesFile) {
                    if ("string" != typeof i.file) return o(".query.file must be a string");
                    /^#/.test(i.file) || h(e, i.file, null)
                }
                d(e, p, function (r) {
                    if (r) return o(r);
                    var a = u.takesFile && function (e, r, o) {
                        var i = o.match(/^#(\d+)$/);
                        if (!i) return e.findFile(o);
                        var s = r[i[1]];
                        if (!s || "delete" == s.type) throw m("Reference to unknown file " + o);
                        if ("full" == s.type) return e.findFile(s.name);
                        var a = s.backing = e.findFile(s.name), c = s.offset;
                        s.offsetLines && (c = {line: s.offsetLines, ch: 0});
                        s.offset = c = T(a, null == s.offsetLines ? s.offset : {line: s.offsetLines, ch: 0}, !0);
                        var l, p, h = function (e) {
                            var t = e.indexOf("\n");
                            return t < 0 ? e : e.slice(0, t)
                        }(s.text), u = function (e, t, r) {
                            var o = Math.max(0, r - 500), n = null;
                            if (!/^\s*$/.test(e)) for (; ;) {
                                var i = t.indexOf(e, o);
                                if (i < 0 || i > r + 500) break;
                                (null == n || Math.abs(n - r) > Math.abs(i - r)) && (n = i), o = i + e.length
                            }
                            return n
                        }(h, a.text, c), d = null == u ? Math.max(0, a.text.lastIndexOf("\n", c)) : u;
                        return t.withContext(e.cx, function () {
                            t.purge(s.name, d, d + s.text.length);
                            var r, o = s.text;
                            if (r = o.match(/(?:"([^"]*)"|([\w$]+))\s*:\s*function\b/)) {
                                var i = n.findNodeAround(s.backing.ast, d, "ObjectExpression");
                                i && i.node.objType && (l = {type: i.node.objType, prop: r[2] || r[1]})
                            }
                            if (u && (r = h.match(/^(.*?)\bfunction\b/))) {
                                for (var c = r[1].length, m = "", b = 0; b < c; ++b) m += " ";
                                o = m + o.slice(c), p = !0
                            }
                            var y = t.scopeAt(a.ast, d, a.scope), g = t.scopeAt(a.ast, d + o.length, a.scope),
                                v = s.scope = f(y) < f(g) ? g : y;
                            s.ast = t.parse(o, e.passes, {
                                directSourceFile: s,
                                allowReturnOutsideFunction: !0
                            }), t.analyze(s.ast, s.name, v, e.passes);
                            e:if (l || p) {
                                var T = t.scopeAt(s.ast, h.length, y);
                                if (!T.fnType) break e;
                                if (l) l.type.getProp(l.prop).addType(T.fnType); else if (p) {
                                    var S = t.scopeAt(a.ast, d + h.length, a.scope);
                                    if (S == y || !S.fnType) break e;
                                    var w = S.fnType, R = T.fnType;
                                    if (!R || R.name != w.name && w.name) break e;
                                    b = 0;
                                    for (var E = Math.min(w.args.length, R.args.length); b < E; ++b) w.args[b].propagate(R.args[b]);
                                    w.self.propagate(R.self), R.retval.propagate(w.retval)
                                }
                            }
                        }), s
                    }(e, s, i.file);
                    if (u.fullFile && "part" == a.type) return o("Can't run a " + i.type + " query on a file fragment");

                    function c() {
                        var t;
                        try {
                            t = u.run(e, i, a)
                        } catch (t) {
                            return e.options.debug && t.name, o(t)
                        }
                        o(null, t)
                    }

                    t.withContext(e.cx, p ? function () {
                        t.withTimeout(p[0], c)
                    } : c)
                })
            }(this, e, function (e, t) {
                r(e, t), i.uses > 40 && (i.reset(), d(i, null, function () {
                }))
            })
        }, findFile: function (e) {
            return this.fileMap[e]
        }, flush: function (e) {
            var r = this.cx;
            d(this, null, function (o) {
                if (o) return e(o);
                t.withContext(r, e)
            })
        }, startAsyncAction: function () {
            ++this.pending
        }, finishAsyncAction: function (e) {
            e && (this.asyncError = e), 0 == --this.pending && this.signal("everythingFetched")
        }
    });
    var v = 25;
    var T = e.resolvePos = function (e, t, r) {
        if ("number" != typeof t) {
            var o = function (e, t) {
                var r = e.text, o = e.lineOffsets || (e.lineOffsets = [0]), n = 0, i = 0,
                    s = Math.min(Math.floor(t / v), o.length - 1);
                for (n = o[s], i = s * v; i < t;) {
                    if (++i, 0 === (n = r.indexOf("\n", n) + 1)) return null;
                    i % v == 0 && o.push(n)
                }
                return n
            }(e, t.line);
            if (null == o) {
                if (!r) throw m("File doesn't contain a line " + t.line);
                t = e.text.length
            } else t = o + t.ch
        }
        if (t > e.text.length) {
            if (!r) throw m("Position " + t + " is outside of file.");
            t = e.text.length
        }
        return t
    };

    function S(e, t) {
        if (!e) return {line: 0, ch: 0};
        for (var r, o, n = e.lineOffsets || (e.lineOffsets = [0]), i = e.text, s = n.length - 1; s >= 0; --s) n[s] <= t && (r = s * v, o = n[s]);
        for (; ;) {
            var a = i.indexOf("\n", o);
            if (a >= t || a < 0) break;
            o = a + 1, ++r
        }
        return {line: r, ch: t - o}
    }

    var w = e.outputPos = function (e, t, r) {
        if (e.lineCharPositions) {
            var o = S(t, r);
            return "part" == t.type && (o.line += null != t.offsetLines ? t.offsetLines : S(t.backing, t.offset).line), o
        }
        return r + ("part" == t.type ? t.offset : 0)
    };

    function R(e) {
        for (var t in e) null == e[t] && delete e[t];
        return e
    }

    function E(e, t, r) {
        null != r && (e[t] = r)
    }

    function A(e, t) {
        "string" != typeof e && (e = e.name, t = t.name);
        var r = /^[A-Z]/.test(e);
        return r == /^[A-Z]/.test(t) ? e < t ? -1 : e == t ? 0 : 1 : r ? 1 : -1
    }

    function O(e, t) {
        for (var r = 0; r < e.properties.length; r++) {
            var o = e.properties[r];
            if (o.key.start <= t && o.key.end >= t) return o
        }
    }

    var x = "break do instanceof typeof case else new var catch finally return void continue for switch while debugger function this with default if throw delete in try".split(" ");
    var C = e.findQueryExpr = function (e, r, o) {
        if (null == r.end) throw m("missing .query.end field");
        if (r.variable) {
            var n = t.scopeAt(e.ast, T(e, r.end), e.scope);
            return {node: {type: "Identifier", name: r.variable, start: r.end, end: r.end + 1}, state: n}
        }
        var i = r.start && T(e, r.start), s = T(e, r.end), a = t.findExpressionAt(e.ast, i, s, e.scope);
        return a || ((a = t.findExpressionAround(e.ast, i, s, e.scope)) && ("ObjectExpression" == a.node.type || o || (null == i ? s : i) - a.node.start < 20 || a.node.end - s < 20) ? a : null)
    };

    function _(e, t, r) {
        var o = C(e, t, r);
        if (o) return o;
        throw m("No expression at the given position.")
    }

    function j(e) {
        return e && (e = e.getType()) && e instanceof t.Obj ? e : null
    }

    function k(e, r, o, n) {
        var i, s;
        if (n && (t.resetGuessing(), i = t.expressionType(n)), e.passes.typeAt) {
            var a = T(o, r.end);
            e.passes.typeAt.forEach(function (e) {
                i = e(o, a, n, i)
            })
        }
        if (!i) throw m("No type found at the given position.");
        if ("ObjectExpression" == n.node.type && null != r.end && (s = O(n.node, T(o, r.end)))) {
            var c = s.key.name, l = j(t.typeFromContext(o.ast, n));
            if (l && l.hasProp(c)) i = l.hasProp(c); else {
                var p = j(i);
                p && p.hasProp(c) && (i = p.hasProp(c))
            }
        }
        return i
    }

    function P(e, r) {
        r.url || (r.url = e.url), r.doc || (r.doc = e.doc), r.origin || (r.origin = e.origin);
        var o, n = t.cx().protos;
        !r.url && !r.doc && e.proto && (o = e.proto.hasCtor) && e.proto != n.Object && e.proto != n.Function && e.proto != n.Array && (r.url = o.url, r.doc = o.doc)
    }

    var N = e.getSpan = function (e) {
        if (e.origin) {
            if (e.originNode) {
                var t = e.originNode;
                return /^Function/.test(t.type) && t.id && (t = t.id), {origin: e.origin, node: t}
            }
            return e.span ? {origin: e.origin, span: e.span} : void 0
        }
    }, U = e.storeSpan = function (e, t, r, o) {
        if (o.origin = r.origin, r.span) {
            var n = /^(\d+)\[(\d+):(\d+)\]-(\d+)\[(\d+):(\d+)\]$/.exec(r.span);
            o.start = t.lineCharPositions ? {
                line: Number(n[2]),
                ch: Number(n[3])
            } : Number(n[1]), o.end = t.lineCharPositions ? {line: Number(n[5]), ch: Number(n[6])} : Number(n[4])
        } else {
            var i = e.findFile(r.origin);
            o.start = w(t, i, r.node.start), o.end = w(t, i, r.node.end)
        }
    };

    function I(e, r, o, n, i) {
        for (var s = n.node.name, a = n.state; a && !(s in a.props); a = a.prev) ;
        if (!a) throw m("Could not find a definition for " + s + " " + !!e.cx.topScope.props.x);
        var c, l = [];

        function p(e) {
            return function (t, o) {
                if (i) for (var n = o; n != a; n = n.prev) {
                    var c = n.hasProp(i);
                    if (c) throw m("Renaming `" + s + "` to `" + i + "` would make a variable at line " + (S(e, t.start).line + 1) + " point to the definition at line " + (S(e, c.name.start).line + 1))
                }
                l.push({file: e.name, start: w(r, e, t.start), end: w(r, e, t.end)})
            }
        }

        if (a.originNode) {
            if (c = "local", i) {
                for (var h = a.prev; h && !(i in h.props); h = h.prev) ;
                h && t.findRefs(a.originNode, a, i, h, function (e) {
                    throw m("Renaming `" + s + "` to `" + i + "` would shadow the definition used at line " + (S(o, e.start).line + 1))
                })
            }
            t.findRefs(a.originNode, a, s, a, p(o))
        } else {
            c = "global";
            for (var u = 0; u < e.files.length; ++u) {
                var d = e.files[u];
                t.findRefs(d.ast, d.scope, s, a, p(d))
            }
        }
        return {refs: l, type: c, name: s}
    }

    function L(e, r, o, n) {
        var i = t.expressionType(o).getObjType();
        if (!i) throw m("Couldn't determine type of base object.");
        var s = [];

        function a(e) {
            return function (t) {
                s.push({file: e.name, start: w(r, e, t.start), end: w(r, e, t.end)})
            }
        }

        for (var c = 0; c < e.files.length; ++c) {
            var l = e.files[c];
            t.findPropRefs(l.ast, l.scope, i, n.name, a(l))
        }
        return {refs: s, name: n.name}
    }

    e.version = "0.10.0"
}), function (e) {
    "object" == typeof exports && "object" == typeof module ? exports.init = e : "function" == typeof define && define.amd ? define({init: e}) : tern.def = {init: e}
}(function (e, t) {
    "use strict";

    function r(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }

    var o = e.TypeParser = function (e, t, r, o) {
        this.pos = t || 0, this.spec = e, this.base = r, this.forceNew = o
    };

    function n(e, t, r) {
        return e.call ? e(t, r) : e
    }

    function i(e, r) {
        if ("!ret" == r) {
            if (e.retval) return e.retval;
            var o = new t.AVal;
            return e.propagate(new t.IsCallee(t.ANull, [], null, o)), o
        }
        return e.getProp(r)
    }

    function s(e, r) {
        return function (o, i) {
            for (var s = [], a = 0; a < e.length; a++) s.push(n(e[a], o, i));
            return new t.Fn(name, t.ANull, s, n(r, o, i))
        }
    }

    function a(e, r, n, i) {
        var s = new o(e, null, n, i).parseType(!1, r, !0);
        if (/^fn\(/.test(e)) for (var a = 0; a < s.args.length; ++a) !function (e) {
            var r = s.args[e];
            r instanceof t.Fn && r.args && r.args.length && c(s, function (o, n) {
                var i = n[e];
                i && i.propagate(new t.IsCallee(t.cx().topScope, r.args, null, t.ANull))
            })
        }(a);
        return s
    }

    function c(e, t, r) {
        var o = e.computeRet, n = e.retval;
        e.computeRet = function (e, i, s) {
            var a = t(e, i, s), c = o ? o(e, i, s) : n;
            return r ? a : c
        }
    }

    o.prototype = {
        eat: function (e) {
            if (1 == e.length ? this.spec.charAt(this.pos) == e : this.spec.indexOf(e, this.pos) == this.pos) return this.pos += e.length, !0
        }, word: function (e) {
            var t, r = "";
            for (e = e || /[\w$]/; (t = this.spec.charAt(this.pos)) && e.test(t);) r += t, ++this.pos;
            return r
        }, error: function () {
            throw new Error("Unrecognized type spec: " + this.spec + " (at " + this.pos + ")")
        }, parseFnType: function (e, r, o) {
            var n, i, a, c, l = [], p = [], h = !1;
            if (!this.eat(")")) for (var u = 0; ; ++u) {
                var d, f = this.spec.indexOf(": ", this.pos);
                -1 != f && (d = this.spec.slice(this.pos, f), /^[$\w?]+$/.test(d) ? this.pos = f + 2 : d = null), p.push(d);
                var m = this.parseType(e);
                if (m.call && (h = !0), l.push(m), !this.eat(", ")) {
                    this.eat(")") || this.error();
                    break
                }
            }
            if (this.eat(" -> ")) {
                var b = this.pos;
                (n = this.parseType(!0)).call && (o ? (i = n, n = t.ANull, a = b) : h = !0)
            } else n = t.ANull;
            return h ? s(l, n) : (o && (c = this.base) ? t.Fn.call(this.base, r, t.ANull, l, p, n) : c = new t.Fn(r, t.ANull, l, p, n), i && (c.computeRet = i), null != a && (c.computeRetSource = this.spec.slice(a, this.pos)), c)
        }, parseType: function (e, r, o) {
            var i = this.parseTypeMaybeProp(e, r, o);
            if (!this.eat("|")) return i;
            for (var s = [i], a = i.call; ;) {
                var c = this.parseTypeMaybeProp(e, r, o);
                if (s.push(c), c.call && (a = !0), !this.eat("|")) break
            }
            if (a) return function (e) {
                return function (r, o) {
                    for (var i = new t.AVal, s = 0; s < e.length; s++) n(e[s], r, o).propagate(i);
                    return i
                }
            }(s);
            for (var l = new t.AVal, p = 0; p < s.length; p++) s[p].propagate(l);
            return l
        }, parseTypeMaybeProp: function (e, t, r) {
            for (var o = this.parseTypeInner(e, t, r); e && this.eat(".");) o = this.extendWithProp(o);
            return o
        }, extendWithProp: function (e) {
            var t = this.word(/[\w<>$!]/) || this.error();
            return e.apply ? function (r, o) {
                return i(e(r, o), t)
            } : i(e, t)
        }, parseTypeInner: function (e, r, o) {
            if (this.eat("fn(")) return this.parseFnType(e, r, o);
            if (this.eat("[")) {
                var n = this.parseType(e);
                return this.eat("]") || this.error(), n.call ? function (e) {
                    return function (r, o) {
                        return new t.Arr(e(r, o))
                    }
                }(n) : o && this.base ? (t.Arr.call(this.base, n), this.base) : new t.Arr(n)
            }
            if (this.eat("+")) {
                var i = this.word(/[\w$<>\.!]/), s = h(i + ".prototype");
                return s instanceof t.Obj || (s = h(i)), s instanceof t.Obj ? e && this.eat("[") ? this.parsePoly(s) : o && this.forceNew ? new t.Obj(s) : t.getInstance(s) : s
            }
            if (e && this.eat("!")) {
                var a = this.word(/\d/);
                if (a) return a = Number(a), function (e, r) {
                    return r[a] || t.ANull
                };
                if (this.eat("this")) return function (e) {
                    return e
                };
                if (this.eat("custom:")) {
                    var c = this.word(/[\w$]/);
                    return y[c] || function () {
                        return t.ANull
                    }
                }
                return this.fromWord("!" + this.word(/[\w$<>\.!]/))
            }
            return this.eat("?") ? t.ANull : this.fromWord(this.word(/[\w$<>\.!`]/))
        }, fromWord: function (e) {
            var r = t.cx();
            switch (e) {
                case"number":
                    return r.num;
                case"string":
                    return r.str;
                case"bool":
                    return r.bool;
                case"<top>":
                    return r.topScope
            }
            return r.localDefs && e in r.localDefs ? r.localDefs[e] : h(e)
        }, parsePoly: function (e) {
            var r, o = "<i>";
            (r = this.spec.slice(this.pos).match(/^\s*(\w+)\s*=\s*/)) && (o = r[1], this.pos += r[0].length);
            var n = this.parseType(!0);
            if (this.eat("]") || this.error(), n.call) return function (r, i) {
                var s = t.getInstance(e);
                return n(r, i).propagate(s.defProp(o)), s
            };
            var i = t.getInstance(e);
            return n.propagate(i.defProp(o)), i
        }
    };
    var l, p = e.parseEffect = function (e, r) {
        var i;
        if (0 == e.indexOf("propagate ")) {
            var s = (f = new o(e, 10)).parseType(!0);
            f.eat(" ") || f.error();
            var a = f.parseType(!0);
            c(r, function (e, t) {
                n(s, e, t).propagate(n(a, e, t))
            })
        } else if (0 == e.indexOf("call ")) {
            var l = 5 == e.indexOf("and return ", 5), p = (f = new o(e, l ? 16 : 5)).parseType(!0), h = null, u = [];
            for (f.eat(" this=") && (h = f.parseType(!0)); f.eat(" ");) u.push(f.parseType(!0));
            c(r, function (e, r) {
                for (var o = n(p, e, r), i = h ? n(h, e, r) : t.ANull, s = [], a = 0; a < u.length; ++a) s.push(n(u[a], e, r));
                var c = l ? new t.AVal : t.ANull;
                return o.propagate(new t.IsCallee(i, s, null, c)), c
            }, l)
        } else if (i = e.match(/^custom (\S+)\s*(.*)/)) {
            var d = y[i[1]];
            d && c(r, i[2] ? d(i[2]) : d)
        } else {
            if (0 != e.indexOf("copy ")) throw new Error("Unknown effect type: " + e);
            var f, m = (f = new o(e, 5)).parseType(!0);
            f.eat(" ");
            var b = f.parseType(!0);
            c(r, function (e, r) {
                var o = n(m, e, r), i = n(b, e, r);
                o.forAllProps(function (e, r, o) {
                    o && "<i>" != e && i.propagate(new t.PropHasSubset(e, r))
                })
            })
        }
    }, h = e.parsePath = function (e, r) {
        var o = t.cx(), n = o.paths[e], i = e;
        if (null != n) return n;
        o.paths[e] = t.ANull;
        var s = r || l || o.topScope;
        if (o.localDefs) for (var a in o.localDefs) if (0 == e.indexOf(a)) {
            if (e == a) return o.paths[e] = o.localDefs[e];
            if ("." == e.charAt(a.length)) {
                s = o.localDefs[a], e = e.slice(a.length + 1);
                break
            }
        }
        for (var c = e.split("."), p = 0; p < c.length && s != t.ANull; ++p) {
            var h = c[p];
            if ("!" == h.charAt(0)) if ("!proto" == h) s = s instanceof t.Obj && s.proto || t.ANull; else {
                var u = s.getFunctionType();
                if (u) if ("!ret" == h) s = u.retval && u.retval.getType(!1) || t.ANull; else {
                    var d = u.args && u.args[Number(h.slice(1))];
                    s = d && d.getType(!1) || t.ANull
                } else s = t.ANull
            } else if (s instanceof t.Obj) {
                var f = "prototype" == h && s instanceof t.Fn ? s.getProp(h) : s.props[h];
                s = !f || f.isEmpty() ? t.ANull : f.types[0]
            }
        }
        return o.paths[i] = s == t.ANull ? null : s, s
    };

    function u(e) {
        var t = Object.create(e.prototype);
        return t.props = Object.create(null), t.isShell = !0, t
    }

    function d(e) {
        if (!e["!type"] || /^(fn\(|\[)/.test(e["!type"])) return !1;
        for (var t in e) if ("!type" != t && "!doc" != t && "!url" != t && "!span" != t && "!data" != t) return !1;
        return !0
    }

    function f(e, o, n) {
        if (!e) {
            var i = o["!type"];
            if (i) if (/^fn\(/.test(i)) e = u(t.Fn); else {
                if ("[" != i.charAt(0)) throw new Error("Invalid !type spec: " + i);
                e = u(t.Arr)
            } else e = o["!stdProto"] ? t.cx().protos[o["!stdProto"]] : u(t.Obj);
            e.name = n
        }
        for (var s in o) if (r(o, s) && 33 != s.charCodeAt(0)) {
            var a = o[s];
            if ("string" == typeof a || d(a)) continue;
            var c = e.defProp(s);
            f(c.getObjType(), a, n ? n + "." + s : s).propagate(c)
        }
        return e
    }

    function m(e, o, n) {
        if (e.isShell) {
            delete e.isShell;
            var i = o["!type"];
            if (i) a(i, n, e); else {
                var s = o["!proto"] && a(o["!proto"]);
                t.Obj.call(e, !(s instanceof t.Obj) || s, n)
            }
        }
        var c = o["!effects"];
        if (c && e instanceof t.Fn) for (var l = 0; l < c.length; ++l) p(c[l], e);
        for (var h in function (e, t) {
            e["!doc"] && (t.doc = e["!doc"]);
            e["!url"] && (t.url = e["!url"]);
            e["!span"] && (t.span = e["!span"]);
            e["!data"] && (t.metaData = e["!data"])
        }(o, e), o) if (r(o, h) && 33 != h.charCodeAt(0)) {
            var u = o[h], f = e.defProp(h), b = n ? n + "." + h : h;
            if ("string" == typeof u) f.isEmpty() && a(u, b).propagate(f); else {
                if (d(u)) {
                    if (!f.isEmpty()) continue;
                    a(u["!type"], b, null, !0).propagate(f)
                } else m(f.getObjType(), u, b);
                u["!doc"] && (f.doc = u["!doc"]), u["!url"] && (f.url = u["!url"]), u["!span"] && (f.span = u["!span"])
            }
        }
        return e
    }

    function b(e, r) {
        var o = t.cx().parent, n = o && o.passes && o.passes[e];
        if (n) for (var i = 0; i < n.length; i++) n[i](r)
    }

    e.load = function (e, r) {
        r || (r = t.cx().topScope);
        var o = l;
        l = r;
        try {
            !function (e, r) {
                var o = t.cx();
                t.addOrigin(o.curOrigin = e["!name"] || "env#" + o.origins.length), o.localDefs = o.definitions[o.curOrigin] = Object.create(null), b("preLoadDef", e), f(r, e);
                var n = e["!define"];
                if (n) {
                    for (var i in n) {
                        var s = n[i];
                        o.localDefs[i] = "string" == typeof s ? h(s) : f(null, s, i)
                    }
                    for (var i in n) "string" != typeof (s = n[i]) && m(o.localDefs[i], n[i], i)
                }
                m(r, e), b("postLoadDef", e), o.curOrigin = o.localDefs = null
            }(e, r)
        } finally {
            l = o
        }
    }, e.parse = function (e, r, o) {
        var n = t.cx();
        r && (n.origin = r, n.localDefs = n.definitions[r]);
        try {
            return "string" == typeof e ? a(e, o) : m(f(null, e, o), e, o)
        } finally {
            r && (n.origin = n.localDefs = null)
        }
    };
    var y = Object.create(null);
    t.registerFunction = function (e, t) {
        y[e] = t
    };
    var g = t.constraint("created, target, spec", {
        addType: function (e) {
            if (e instanceof t.Obj && this.created++ < 5) {
                var r = new t.Obj(e), o = this.spec;
                if (o instanceof t.AVal && (o = o.getObjType(!1)), o instanceof t.Obj) for (var n in o.props) {
                    var i = o.props[n].types[0], s = r.defProp(n);
                    if (i && i instanceof t.Obj && i.props.value) {
                        var a = i.props.value.getType(!1);
                        a && s.addType(a)
                    }
                }
                this.target.addType(r)
            }
        }
    });
    t.registerFunction("Object_create", function (e, r, o) {
        if (o && o.length && "Literal" == o[0].type && null == o[0].value) return new t.Obj;
        var n = new t.AVal;
        return r[0] && r[0].propagate(new g(0, n, r[1])), n
    });
    var v = t.constraint("target", {
        addType: function (e) {
            e instanceof t.Obj && (e.hasProp("value") ? e.getProp("value").propagate(this.target) : e.hasProp("get") && e.getProp("get").propagate(new t.IsCallee(t.ANull, [], null, this.target)))
        }
    });
    t.registerFunction("Object_defineProperty", function (e, r, o) {
        if (o && o.length >= 3 && "Literal" == o[1].type && "string" == typeof o[1].value) {
            var n = r[0], i = new t.AVal;
            n.propagate(new t.PropHasSubset(o[1].value, i, o[1])), r[2].propagate(new v(i))
        }
        return t.ANull
    });
    var T = t.constraint("self, args, target", {
        addType: function (e) {
            if (e instanceof t.Fn) {
                this.target.addType(new t.Fn(e.name, e.self, e.args.slice(this.args.length), e.argNames.slice(this.args.length), e.retval)), this.self.propagate(e.self);
                for (var r = 0; r < Math.min(e.args.length, this.args.length); ++r) this.args[r].propagate(e.args[r])
            }
        }
    });
    return t.registerFunction("Function_bind", function (e, r) {
        if (!r.length) return t.ANull;
        var o = new t.AVal;
        return e.propagate(new T(r[0], r.slice(1), o)), o
    }), t.registerFunction("Array_ctor", function (e, r) {
        var o = new t.Arr;
        if (1 != r.length || !r[0].hasType(t.cx().num)) for (var n = o.getProp("<i>"), i = 0; i < r.length; ++i) r[i].propagate(n);
        return o
    }), t.registerFunction("Promise_ctor", function (e, r, o) {
        if (r.length < 1) return t.ANull;
        var n = new t.Obj(t.cx().definitions.ecma6["Promise.prototype"]), i = n.defProp("value", o && o[0]),
            s = new t.AVal;
        s.propagate(i);
        var a = new t.Fn("execute", t.ANull, [s], ["value"], t.ANull), c = t.cx().definitions.ecma6.promiseReject;
        return r[0].propagate(new t.IsCallee(t.ANull, [a, c], null, t.ANull)), n
    }), e
}), function (e, t) {
    "object" == typeof exports && "object" == typeof module ? t(exports, require("acorn"), require("acorn/dist/acorn_loose"), require("acorn/dist/walk"), require("./def"), require("./signal")) : "function" == typeof define && define.amd ? define(["exports", "acorn/dist/acorn", "acorn/dist/acorn_loose", "acorn/dist/walk", "./def", "./signal"], t) : t(e.tern || (e.tern = {}), acorn, acorn, acorn.walk, tern.def, tern.signal)
}(this, function (e, t, r, o, n, i) {
    "use strict";
    var s = e.toString = function (e, t, r) {
        return e && e != r ? e.toString(t, r) : "?"
    }, a = e.ANull = i.mixin({
        addType: function () {
        }, propagate: function () {
        }, getProp: function () {
            return a
        }, forAllProps: function () {
        }, hasType: function () {
            return !1
        }, isEmpty: function () {
            return !0
        }, getFunctionType: function () {
        }, getObjType: function () {
        }, getType: function () {
        }, gatherProperties: function () {
        }, propagatesTo: function () {
        }, typeHint: function () {
        }, propHint: function () {
        }, toString: function () {
            return "?"
        }
    });

    function c(e, t) {
        var r = Object.create(e);
        if (t) for (var o in t) r[o] = t[o];
        return r
    }

    var l = e.AVal = function () {
        this.types = [], this.forward = null, this.maxWeight = 0
    };

    function p(e, t, r) {
        var o = e.getType(!1), n = t.getType(!1);
        return !o || !n || h(o, n, r)
    }

    function h(e, t, r) {
        if (!e || r >= 5) return t;
        if (!e || e == t) return e;
        if (!t) return e;
        if (e.constructor != t.constructor) return !1;
        if (e.constructor != N) {
            if (e.constructor == k) {
                var o = 0, n = 0, i = 0;
                for (var s in e.props) o++, s in t.props && p(e.props[s], t.props[s], r + 1) && i++;
                for (var s in t.props) n++;
                return !(o && n && i < Math.max(o, n) / 2) && (o > n ? e : t)
            }
            return e.constructor == P && (!!(e.args.length == t.args.length && e.args.every(function (e, o) {
                return p(e, t.args[o], r + 1)
            }) && p(e.retval, t.retval, r + 1) && p(e.self, t.self, r + 1)) && e)
        }
        var a = e.getProp("<i>").getType(!1);
        if (!a) return t;
        var c = t.getProp("<i>").getType(!1);
        return !c || h(a, c, r + 1) ? t : void 0
    }

    l.prototype = c(a, {
        addType: function (e, t) {
            if (t = t || 100, this.maxWeight < t) {
                if (this.maxWeight = t, 1 == this.types.length && this.types[0] == e) return;
                this.types.length = 0
            } else if (this.maxWeight > t || this.types.indexOf(e) > -1) return;
            this.signal("addType", e), this.types.push(e);
            var r = this.forward;
            r && G(function (o) {
                for (var n = 0; n < r.length; ++n) o(e, r[n], t)
            })
        }, propagate: function (e, t) {
            if (!(e == a || e instanceof _ && this.forward && this.forward.length > 2)) {
                t && 100 != t && (e = new C(e, t)), (this.forward || (this.forward = [])).push(e);
                var r = this.types;
                r.length && G(function (o) {
                    for (var n = 0; n < r.length; ++n) o(r[n], e, t)
                })
            }
        }, getProp: function (e) {
            if ("__proto__" == e || "✖" == e) return a;
            var t = (this.props || (this.props = Object.create(null)))[e];
            return t || (t = this.props[e] = new l, this.propagate(new b(e, t))), t
        }, forAllProps: function (e) {
            this.propagate(new g(e))
        }, hasType: function (e) {
            return this.types.indexOf(e) > -1
        }, isEmpty: function () {
            return 0 === this.types.length
        }, getFunctionType: function () {
            for (var e = this.types.length - 1; e >= 0; --e) if (this.types[e] instanceof P) return this.types[e]
        }, getObjType: function () {
            for (var e = null, t = this.types.length - 1; t >= 0; --t) {
                var r = this.types[t];
                if (r instanceof k) {
                    if (r.name) return r;
                    e || (e = r)
                }
            }
            return e
        }, getType: function (e) {
            return 0 === this.types.length && !1 !== e ? this.makeupType() : 1 === this.types.length ? this.types[0] : d(this.types)
        }, toString: function (e, t) {
            if (0 == this.types.length) return s(this.makeupType(), e, t);
            if (1 == this.types.length) return s(this.types[0], e, t);
            var r = u(this.types);
            return r.length > 2 ? "?" : r.map(function (r) {
                return s(r, e, t)
            }).join("|")
        }, computedPropType: function () {
            if (!this.propertyOf || !this.propertyOf.hasProp("<i>")) return null;
            var e = this.propertyOf.getProp("<i>");
            return e == this ? null : e.getType()
        }, makeupType: function () {
            var e = this.computedPropType();
            if (e) return e;
            if (!this.forward) return null;
            for (var t = this.forward.length - 1; t >= 0; --t) {
                var r = this.forward[t].typeHint();
                if (r && !r.isEmpty()) return ce = !0, r
            }
            var o = Object.create(null), n = null;
            for (t = 0; t < this.forward.length; ++t) {
                (c = this.forward[t].propHint()) && "length" != c && "<i>" != c && "✖" != c && c != L.completingProperty && (o[c] = !0, n = c)
            }
            if (!n) return null;
            var i = U(n);
            if (i) {
                var s = [];
                e:for (t = 0; t < i.length; ++t) {
                    var a = i[t];
                    for (var c in o) if (!a.hasProp(c)) continue e;
                    a.hasCtor && (a = w(a)), s.push(a)
                }
                var l = d(s);
                if (l) return ce = !0, l
            }
        }, typeHint: function () {
            return this.types.length ? this.getType() : null
        }, propagatesTo: function () {
            return this
        }, gatherProperties: function (e, t) {
            for (var r = 0; r < this.types.length; ++r) this.types[r].gatherProperties(e, t)
        }, guessProperties: function (e) {
            if (this.forward) for (var t = 0; t < this.forward.length; ++t) {
                var r = this.forward[t].propHint();
                r && e(r, null, 0)
            }
            var o = this.makeupType();
            o && o.gatherProperties(e)
        }
    });
    var u = e.simplifyTypes = function (e) {
        var t = [];
        e:for (var r = 0; r < e.length; ++r) {
            for (var o = e[r], n = 0; n < t.length; n++) {
                var i = h(o, t[n], 0);
                if (i) {
                    t[n] = i;
                    continue e
                }
            }
            t.push(o)
        }
        return t
    };

    function d(e) {
        for (var t = 0, r = 0, o = 0, n = null, i = 0; i < e.length; ++i) {
            if ((c = e[i]) instanceof N) ++t; else if (c instanceof P) ++r; else if (c instanceof k) ++o; else if (c instanceof j) {
                if (n && c.name != n.name) return null;
                n = c
            }
        }
        if ((t && 1) + (r && 1) + (o && 1) + (n && 1) > 1) return null;
        if (n) return n;
        var s = 0, a = null;
        for (i = 0; i < e.length; ++i) {
            var c = e[i], l = 0;
            if (t) l = c.getProp("<i>").isEmpty() ? 1 : 2; else if (r) {
                l = 1;
                for (var p = 0; p < c.args.length; ++p) c.args[p].isEmpty() || ++l;
                c.retval.isEmpty() || ++l
            } else o && (l = c.name ? 100 : 2);
            l >= s && (s = l, a = c)
        }
        return a
    }

    function f() {
    }

    f.prototype = c(a, {
        init: function () {
            this.origin = L.curOrigin
        }
    });
    var m = e.constraint = function (e, t) {
        var r = "this.init();";
        e = e ? e.split(", ") : [];
        for (var o = 0; o < e.length; ++o) r += "this." + e[o] + " = " + e[o] + ";";
        var n = Function.apply(null, e.concat([r]));
        for (var i in n.prototype = Object.create(f.prototype), t) t.hasOwnProperty(i) && (n.prototype[i] = t[i]);
        return n
    }, b = m("prop, target", {
        addType: function (e, t) {
            e.getProp && e.getProp(this.prop).propagate(this.target, t)
        }, propHint: function () {
            return this.prop
        }, propagatesTo: function () {
            if ("<i>" == this.prop || !/[^\w_]/.test(this.prop)) return {target: this.target, pathExt: "." + this.prop}
        }
    }), y = e.PropHasSubset = m("prop, type, originNode", {
        addType: function (e, t) {
            if (e instanceof k) {
                var r = e.defProp(this.prop, this.originNode);
                r.origin = this.origin, this.type.propagate(r, t)
            }
        }, propHint: function () {
            return this.prop
        }
    }), g = m("c", {
        addType: function (e) {
            e instanceof k && e.forAllProps(this.c)
        }
    });
    var v = e.IsCallee = m("self, args, argNodes, retval", {
        init: function () {
            f.prototype.init.call(this), this.disabled = L.disabledComputing
        }, addType: function (e, t) {
            if (e instanceof P) {
                for (var r = 0; r < this.args.length; ++r) r < e.args.length && this.args[r].propagate(e.args[r], t), e.arguments && this.args[r].propagate(e.arguments, t);
                this.self.propagate(e.self, this.self == L.topScope ? 90 : t);
                var o = e.computeRet;
                if (o) for (var n = this.disabled; n; n = n.prev) (n.fn == e || e.originNode && n.fn.originNode == e.originNode) && (o = null);
                o ? o(this.self, this.args, this.argNodes).propagate(this.retval, t) : e.retval.propagate(this.retval, t)
            }
        }, typeHint: function () {
            for (var e = [], t = 0; t < this.args.length; ++t) e.push("?");
            return new P(null, this.self, this.args, e, a)
        }, propagatesTo: function () {
            return {target: this.retval, pathExt: ".!ret"}
        }
    }), T = m("propName, args, argNodes, retval", {
        init: function () {
            f.prototype.init.call(this), this.disabled = L.disabledComputing
        }, addType: function (e, t) {
            var r = new v(e, this.args, this.argNodes, this.retval);
            r.disabled = this.disabled, e.getProp(this.propName).propagate(r, t)
        }, propHint: function () {
            return this.propName
        }
    }), S = e.IsCtor = m("target, noReuse", {
        addType: function (e, t) {
            e instanceof P && (L.parent && !L.parent.options.reuseInstances && (this.noReuse = !0), e.getProp("prototype").propagate(new R(!this.noReuse && e, this.target), t))
        }
    }), w = e.getInstance = function (e, t) {
        if (!1 === t) return new k(e);
        t || (t = e.hasCtor), e.instances || (e.instances = []);
        for (var r = 0; r < e.instances.length; ++r) {
            var o = e.instances[r];
            if (o.ctor == t) return o.instance
        }
        var n = new k(e, t && t.name);
        return n.origin = e.origin, e.instances.push({ctor: t, instance: n}), n
    }, R = e.IsProto = m("ctor, target", {
        addType: function (e, t) {
            e instanceof k && ((this.count = (this.count || 0) + 1) > 8 || (e == L.protos.Array ? this.target.addType(new N) : this.target.addType(w(e, this.ctor))))
        }
    }), E = m("fn", {
        addType: function (e, t) {
            if (e instanceof k && !e.hasCtor) {
                e.hasCtor = this.fn;
                var r = new x(e, this.fn);
                r.addType(this.fn), e.forAllProps(function (e, t, o) {
                    o && t.propagate(r)
                })
            }
        }
    }), A = m("other, target", {
        addType: function (e, t) {
            e == L.str ? this.target.addType(L.str, t) : e == L.num && this.other.hasType(L.num) && this.target.addType(L.num, t)
        }, typeHint: function () {
            return this.other
        }
    }), O = e.IfObj = m("target", {
        addType: function (e, t) {
            e instanceof k && this.target.addType(e, t)
        }, propagatesTo: function () {
            return this.target
        }
    }), x = m("obj, ctor", {
        addType: function (e) {
            e instanceof P && e.self && e.self.isEmpty() && e.self.addType(w(this.obj, this.ctor), 2)
        }
    }), C = m("inner, weight", {
        addType: function (e, t) {
            this.inner.addType(e, Math.min(t, this.weight))
        }, propagatesTo: function () {
            return this.inner.propagatesTo()
        }, typeHint: function () {
            return this.inner.typeHint()
        }, propHint: function () {
            return this.inner.propHint()
        }
    }), _ = e.Type = function () {
    };
    _.prototype = c(a, {
        constructor: _, propagate: function (e, t) {
            e.addType(this, t)
        }, hasType: function (e) {
            return e == this
        }, isEmpty: function () {
            return !1
        }, typeHint: function () {
            return this
        }, getType: function () {
            return this
        }
    });
    var j = e.Prim = function (e, t) {
        this.name = t, this.proto = e
    };
    j.prototype = c(_.prototype, {
        constructor: j, toString: function () {
            return this.name
        }, getProp: function (e) {
            return this.proto.hasProp(e) || a
        }, gatherProperties: function (e, t) {
            this.proto && this.proto.gatherProperties(e, t)
        }
    });
    var k = e.Obj = function (e, t) {
        if (this.props || (this.props = Object.create(null)), this.proto = !0 === e ? L.protos.Object : e, e && !t && e.name && !(this instanceof P)) {
            var r = /^(.*)\.prototype$/.exec(this.proto.name);
            r && (t = r[1])
        }
        this.name = t, this.maybeProps = null, this.origin = L.curOrigin
    };
    k.prototype = c(_.prototype, {
        constructor: k, toString: function (e) {
            if (!e && this.name) return this.name;
            var t = [], r = !1;
            for (var o in this.props) if ("<i>" != o) {
                if (t.length > 5) {
                    r = !0;
                    break
                }
                e ? t.push(o + ": " + s(this.props[o], e - 1)) : t.push(o)
            }
            return t.sort(), r && t.push("..."), "{" + t.join(", ") + "}"
        }, hasProp: function (e, t) {
            var r = this.props[e];
            if (!1 !== t) for (var o = this.proto; o && !r; o = o.proto) r = o.props[e];
            return r
        }, defProp: function (e, t) {
            var r = this.hasProp(e, !1);
            if (r) return t && !r.originNode && (r.originNode = t), r;
            if ("__proto__" == e || "✖" == e) return a;
            var o = this.maybeProps && this.maybeProps[e];
            return o ? (delete this.maybeProps[e], this.maybeUnregProtoPropHandler()) : (o = new l).propertyOf = this, this.props[e] = o, o.originNode = t, o.origin = L.curOrigin, this.broadcastProp(e, o, !0), o
        }, getProp: function (e) {
            var t = this.hasProp(e, !0) || this.maybeProps && this.maybeProps[e];
            if (t) return t;
            if ("__proto__" == e || "✖" == e) return a;
            var r = this.ensureMaybeProps()[e] = new l;
            return r.propertyOf = this, r
        }, broadcastProp: function (e, t, r) {
            if (r && (this.signal("addProp", e, t), this instanceof W || function (e, t) {
                (L.props[e] || (L.props[e] = [])).push(t)
            }(e, this)), this.onNewProp) for (var o = 0; o < this.onNewProp.length; ++o) {
                var n = this.onNewProp[o];
                n.onProtoProp ? n.onProtoProp(e, t, r) : n(e, t, r)
            }
        }, onProtoProp: function (e, t, r) {
            var o = this.maybeProps && this.maybeProps[e];
            o && (delete this.maybeProps[e], this.maybeUnregProtoPropHandler(), this.proto.getProp(e).propagate(o)), this.broadcastProp(e, t, !1)
        }, ensureMaybeProps: function () {
            return this.maybeProps || (this.proto && this.proto.forAllProps(this), this.maybeProps = Object.create(null)), this.maybeProps
        }, removeProp: function (e) {
            var t = this.props[e];
            delete this.props[e], this.ensureMaybeProps()[e] = t, t.types.length = 0
        }, forAllProps: function (e) {
            this.onNewProp || (this.onNewProp = [], this.proto && this.proto.forAllProps(this)), this.onNewProp.push(e);
            for (var t = this; t; t = t.proto) for (var r in t.props) e.onProtoProp ? e.onProtoProp(r, t.props[r], t == this) : e(r, t.props[r], t == this)
        }, maybeUnregProtoPropHandler: function () {
            if (this.maybeProps) {
                for (var e in this.maybeProps) return;
                this.maybeProps = null
            }
            !this.proto || this.onNewProp && this.onNewProp.length || this.proto.unregPropHandler(this)
        }, unregPropHandler: function (e) {
            for (var t = 0; t < this.onNewProp.length; ++t) if (this.onNewProp[t] == e) {
                this.onNewProp.splice(t, 1);
                break
            }
            this.maybeUnregProtoPropHandler()
        }, gatherProperties: function (e, t) {
            for (var r in this.props) "<i>" != r && e(r, this, t);
            this.proto && this.proto.gatherProperties(e, t + 1)
        }, getObjType: function () {
            return this
        }
    });
    var P = e.Fn = function (e, t, r, o, n) {
        k.call(this, L.protos.Function, e), this.self = t, this.args = r, this.argNames = o, this.retval = n
    };
    P.prototype = c(k.prototype, {
        constructor: P, toString: function (e) {
            e && e--;
            for (var t = "fn(", r = 0; r < this.args.length; ++r) {
                r && (t += ", ");
                var o = this.argNames[r];
                o && "?" != o && (t += o + ": "), t += s(this.args[r], e, this)
            }
            return t += ")", this.retval.isEmpty() || (t += " -> " + s(this.retval, e, this)), t
        }, getProp: function (e) {
            if ("prototype" == e) {
                var t = this.hasProp(e, !1);
                if (!t) {
                    t = this.defProp(e);
                    var r = new k(!0, this.name && this.name + ".prototype");
                    r.origin = this.origin, t.addType(r, 10)
                }
                return t
            }
            return k.prototype.getProp.call(this, e)
        }, defProp: function (e, t) {
            if ("prototype" == e) {
                var r = this.hasProp(e, !1);
                return r || ((r = k.prototype.defProp.call(this, e, t)).origin = this.origin, r.propagate(new E(this)), r)
            }
            return k.prototype.defProp.call(this, e, t)
        }, getFunctionType: function () {
            return this
        }
    });
    var N = e.Arr = function (e) {
        k.call(this, L.protos.Array);
        var t = this.defProp("<i>");
        e && e.propagate(t)
    };

    function U(e) {
        return L.props[e]
    }

    N.prototype = c(k.prototype, {
        constructor: N, toString: function (e) {
            return "[" + s(this.getProp("<i>"), e, this) + "]"
        }
    }), e.Context = function (t, r) {
        this.parent = r, this.props = Object.create(null), this.protos = Object.create(null), this.origins = [], this.curOrigin = "ecma5", this.paths = Object.create(null), this.definitions = Object.create(null), this.purgeGen = 0, this.workList = null, this.disabledComputing = null, e.withContext(this, function () {
            if (L.protos.Object = new k(null, "Object.prototype"), L.topScope = new W, L.topScope.name = "<top>", L.protos.Array = new k(!0, "Array.prototype"), L.protos.Function = new k(!0, "Function.prototype"), L.protos.RegExp = new k(!0, "RegExp.prototype"), L.protos.String = new k(!0, "String.prototype"), L.protos.Number = new k(!0, "Number.prototype"), L.protos.Boolean = new k(!0, "Boolean.prototype"), L.str = new j(L.protos.String, "string"), L.bool = new j(L.protos.Boolean, "bool"), L.num = new j(L.protos.Number, "number"), L.curOrigin = null, t) for (var e = 0; e < t.length; ++e) n.load(t[e])
        })
    };
    var I, L = null;
    e.cx = function () {
        return L
    }, e.withContext = function (e, t) {
        var r = L;
        L = e;
        try {
            return t()
        } finally {
            L = r
        }
    }, e.TimedOut = function () {
        this.message = "Timed out", this.stack = (new Error).stack
    }, e.TimedOut.prototype = Object.create(Error.prototype), e.TimedOut.prototype.name = "infer.TimedOut", e.withTimeout = function (e, t) {
        var r = +new Date + e, o = I;
        if (o && o < r) return t();
        I = r;
        try {
            return t()
        } finally {
            I = o
        }
    }, e.addOrigin = function (e) {
        L.origins.indexOf(e) < 0 && L.origins.push(e)
    };
    var M = 20, D = 1e-4;

    function G(t) {
        if (L.workList) return t(L.workList);
        var r = [], o = 0, n = L.workList = function (e, t, n) {
            o < M - D * r.length && r.push(e, t, n, o)
        };
        try {
            for (var i = t(n), s = 0; s < r.length; s += 4) {
                if (I && +new Date >= I) throw new e.TimedOut;
                o = r[s + 3] + 1, r[s + 1].addType(r[s], r[s + 2])
            }
            return i
        } finally {
            L.workList = null
        }
    }

    var W = e.Scope = function (e) {
        k.call(this, e || !0), this.prev = e
    };

    function F(e, t) {
        e.fnType && (e.fnType.instantiateScore = (e.fnType.instantiateScore || 0) + t)
    }

    W.prototype = c(k.prototype, {
        constructor: W, defVar: function (e, t) {
            for (var r = this; ; r = r.proto) {
                var o = r.props[e];
                if (o) return o;
                if (!r.prev) return r.defProp(e, t)
            }
        }
    });
    var z = {};

    function J(e, t) {
        var r = t.fnType.instantiateScore;
        if (!L.disabledComputing && r && t.fnType.args.length && function (e, t) {
            try {
                return o.simple(e, {
                    Expression: function () {
                        if (--t <= 0) throw z
                    }
                }), !0
            } catch (e) {
                if (e == z) return !1;
                throw e
            }
        }(e, 5 * r)) return F(t.prev, r / 2), function (e, t) {
            for (var r = t.fnType, n = 0; n < r.args.length; ++n) r.args[n] = new l;
            r.self = new l, r.computeRet = function (n, i) {
                return function (e, t) {
                    L.disabledComputing = {fn: e, prev: L.disabledComputing};
                    try {
                        return t()
                    } finally {
                        L.disabledComputing = L.disabledComputing.prev
                    }
                }(r, function () {
                    var s = L.curOrigin;
                    L.curOrigin = r.origin;
                    var c = new W(t.prev);
                    for (var p in c.originNode = t.originNode, t.props) for (var h = c.defProp(p, t.props[p].originNode), u = 0; u < i.length; ++u) r.argNames[u] == p && u < i.length && i[u].propagate(h);
                    for (var d = r.argNames.length != i.length ? r.argNames.slice(0, i.length) : r.argNames; d.length < i.length;) d.push("?");
                    if (c.fnType = new P(r.name, n, i, d, a), c.fnType.originNode = r.originNode, r.arguments) {
                        var f = c.fnType.arguments = new l;
                        c.defProp("arguments").addType(new N(f));
                        for (var u = 0; u < i.length; ++u) i[u].propagate(f)
                    }
                    return e.body.scope = c, o.recursive(e.body, c, null, B), o.recursive(e.body, c, null, te), L.curOrigin = s, c.fnType.retval
                })
            }
        }(e, t), !0;
        t.fnType.instantiateScore = null
    }

    function q(e) {
        var t = e.fnType, r = t.retval;
        if (r != a) {
            var o, i;
            !r.isEmpty() && (o = r.getType()) instanceof N && (r = i = o.getProp("<i>"));
            for (var s = h(t.self, "!this", 0), c = 0; !s && c < t.args.length; ++c) s = h(t.args[c], "!" + c, 0);
            if (s) {
                i && (s = "[" + s + "]");
                var p = new n.TypeParser(s).parseType(!0);
                return t.computeRet = p.apply ? p : function () {
                    return p
                }, t.computeRetSource = s, !0
            }
        }

        function h(e, t, o) {
            if (!(o > 3) && e.forward) for (var n = 0; n < e.forward.length; ++n) {
                var i = e.forward[n].propagatesTo();
                if (i) {
                    var s, a = t;
                    if (i instanceof l) s = i; else {
                        if (!(i.target instanceof l)) continue;
                        a += i.pathExt, s = i.target
                    }
                    if (s == r) return a;
                    var c = h(s, a, o + 1);
                    if (c) return c
                }
            }
        }
    }

    function Y(e, t) {
        return e.defProp(t.name, t)
    }

    var B = o.make({
        Function: function (e, t, r) {
            var o = e.body.scope = new W(t);
            o.originNode = e;
            for (var n = [], i = [], s = 0; s < e.params.length; ++s) {
                var c = e.params[s];
                i.push(c.name), n.push(Y(o, c))
            }
            (o.fnType = new P(e.id && e.id.name, new l, n, i, a), o.fnType.originNode = e, e.id) && Y("FunctionDeclaration" == e.type ? t : o, e.id);
            r(e.body, o, "ScopeBody")
        }, TryStatement: function (e, t, r) {
            if (r(e.block, t, "Statement"), e.handler) {
                var o = Y(t, e.handler.param);
                r(e.handler.body, t, "ScopeBody");
                var n = L.definitions.ecma5;
                n && o.isEmpty() && w(n["Error.prototype"]).propagate(o, 5)
            }
            e.finalizer && r(e.finalizer, t, "Statement")
        }, VariableDeclaration: function (e, t, r) {
            for (var o = 0; o < e.declarations.length; ++o) {
                var n = e.declarations[o];
                Y(t, n.id), n.init && r(n.init, t, "Expression")
            }
        }
    });

    function V(e, t, r) {
        var o = e.property;
        return e.computed ? "Literal" == o.type && "string" == typeof o.value ? o.value : (r && ee(o, t, r, a), "<i>") : o.name
    }

    function H(e) {
        switch (e) {
            case"+":
            case"-":
            case"~":
                return L.num;
            case"!":
                return L.bool;
            case"typeof":
                return L.str;
            case"void":
            case"delete":
                return a
        }
    }

    function K(e) {
        switch (e) {
            case"==":
            case"!=":
            case"===":
            case"!==":
            case"<":
            case">":
            case">=":
            case"<=":
            case"in":
            case"instanceof":
                return !0
        }
    }

    function X(e) {
        if (e.regex) return w(L.protos.RegExp);
        switch (typeof e.value) {
            case"boolean":
                return L.bool;
            case"number":
                return L.num;
            case"string":
                return L.str;
            case"object":
            case"function":
                return e.value ? w(L.protos.RegExp) : a
        }
    }

    function $(e) {
        return function (t, r, o, n, i) {
            var s = e(t, r, o, i);
            return n && s.propagate(n), s
        }
    }

    function Z(e) {
        return function (t, r, o, n, i) {
            return n || (n = new l), e(t, r, o, n, i), n
        }
    }

    var Q = {
        ArrayExpression: $(function (e, t, r) {
            for (var o = new l, n = 0; n < e.elements.length; ++n) {
                var i = e.elements[n];
                i && ee(i, t, r, o)
            }
            return new N(o)
        }), ObjectExpression: $(function (e, t, r, o) {
            var n = e.objType = new k(!0, o);
            n.originNode = e;
            for (var i = 0; i < e.properties.length; ++i) {
                var s = e.properties[i], c = s.key;
                if ("✖" != s.value.name) if ("Identifier" == c.type ? o = c.name : "string" == typeof c.value && (o = c.value), o && "set" != s.kind) {
                    var l = n.defProp(o, c), p = l;
                    l.initializer = !0, "get" == s.kind && (p = new v(n, [], null, l)), ee(s.value, t, r, p, o)
                } else ee(s.value, t, r, a)
            }
            return n
        }), FunctionExpression: $(function (e, t, r, o) {
            var n = e.body.scope, i = n.fnType;
            return o && !i.name && (i.name = o), r(e.body, t, "ScopeBody"), J(e, n) || q(n), e.id && n.getProp(e.id.name).addType(i), i
        }), SequenceExpression: $(function (e, t, r) {
            for (var o = 0, n = e.expressions.length - 1; o < n; ++o) ee(e.expressions[o], t, r, a);
            return ee(e.expressions[n], t, r)
        }), UnaryExpression: $(function (e, t, r) {
            return ee(e.argument, t, r, a), H(e.operator)
        }), UpdateExpression: $(function (e, t, r) {
            return ee(e.argument, t, r, a), L.num
        }), BinaryExpression: $(function (e, t, r) {
            if ("+" == e.operator) {
                var o = ee(e.left, t, r), n = ee(e.right, t, r);
                if (o.hasType(L.str) || n.hasType(L.str)) return L.str;
                if (o.hasType(L.num) && n.hasType(L.num)) return L.num;
                var i = new l;
                return o.propagate(new A(n, i)), n.propagate(new A(o, i)), i
            }
            return ee(e.left, t, r, a), ee(e.right, t, r, a), K(e.operator) ? L.bool : L.num
        }), AssignmentExpression: $(function (e, t, r) {
            var o, n, i;
            if ("MemberExpression" == e.left.type ? (i = V(e.left, t, r), "Identifier" == e.left.object.type && (n = e.left.object.name + "." + i)) : n = e.left.name, "=" != e.operator && "+=" != e.operator ? (ee(e.right, t, r, a), o = L.num) : o = ee(e.right, t, r, null, n), "MemberExpression" == e.left.type) {
                var s = ee(e.left.object, t, r);
                if ("prototype" == i && F(t, 20), "<i>" == i) {
                    var c = e.left.property.name, l = t.props[c], p = l && l.iteratesOver;
                    if (p) {
                        F(t, 20);
                        var h = "MemberExpression" == e.right.type && e.right.computed && e.right.property.name == c;
                        return p.forAllProps(function (e, t, r) {
                            r && "prototype" != e && "<i>" != e && s.propagate(new y(e, h ? t : a))
                        }), o
                    }
                }
                s.propagate(new y(i, o, e.left.property))
            } else o.propagate(t.defVar(e.left.name, e.left));
            return o
        }), LogicalExpression: Z(function (e, t, r, o) {
            ee(e.left, t, r, o), ee(e.right, t, r, o)
        }), ConditionalExpression: Z(function (e, t, r, o) {
            ee(e.test, t, r, a), ee(e.consequent, t, r, o), ee(e.alternate, t, r, o)
        }), NewExpression: Z(function (e, t, r, o, n) {
            "Identifier" == e.callee.type && e.callee.name in t.props && F(t, 20);
            for (var i = 0, s = []; i < e.arguments.length; ++i) s.push(ee(e.arguments[i], t, r));
            var a = ee(e.callee, t, r), c = new l;
            a.propagate(new S(c, n && /\.prototype$/.test(n))), c.propagate(o, 90), a.propagate(new v(c, s, e.arguments, new O(o)))
        }), CallExpression: Z(function (e, t, r, o) {
            for (var n = 0, i = []; n < e.arguments.length; ++n) i.push(ee(e.arguments[n], t, r));
            if ("MemberExpression" == e.callee.type) {
                var s = ee(e.callee.object, t, r), a = V(e.callee, t, r);
                ("call" == a || "apply" == a) && t.fnType && t.fnType.args.indexOf(s) > -1 && F(t, 30), s.propagate(new T(a, i, e.arguments, o))
            } else {
                var c = ee(e.callee, t, r);
                t.fnType && t.fnType.args.indexOf(c) > -1 && F(t, 30);
                var l = c.getFunctionType();
                l && l.instantiateScore && t.fnType && F(t, l.instantiateScore / 5), c.propagate(new v(L.topScope, i, e.arguments, o))
            }
        }), MemberExpression: Z(function (e, t, r, o) {
            var n = V(e, t), i = ee(e.object, t, r).getProp(n);
            if ("<i>" == n && !ee(e.property, t, r).hasType(L.num)) return i.propagate(o, 5);
            i.propagate(o)
        }), Identifier: $(function (e, t) {
            return "arguments" != e.name || !t.fnType || e.name in t.props || t.defProp(e.name, t.fnType.originNode).addType(new N(t.fnType.arguments = new l)), t.getProp(e.name)
        }), ThisExpression: $(function (e, t) {
            return t.fnType ? t.fnType.self : L.topScope
        }), Literal: $(function (e) {
            return X(e)
        })
    };

    function ee(e, t, r, o, n) {
        return Q[e.type](e, t, r, o, n)
    }

    var te = o.make({
        Expression: function (e, t, r) {
            ee(e, t, r, a)
        }, FunctionDeclaration: function (e, t, r) {
            var o = e.body.scope, n = o.fnType;
            r(e.body, t, "ScopeBody"), J(e, o) || q(o), t.getProp(e.id.name).addType(n)
        }, VariableDeclaration: function (e, t, r) {
            for (var o = 0; o < e.declarations.length; ++o) {
                var n = e.declarations[o], i = t.getProp(n.id.name);
                n.init && ee(n.init, t, r, i, n.id.name)
            }
        }, ReturnStatement: function (e, t, r) {
            if (e.argument) {
                var o = a;
                t.fnType && (t.fnType.retval == a && (t.fnType.retval = new l), o = t.fnType.retval), ee(e.argument, t, r, o)
            }
        }, ForInStatement: function (e, t, r) {
            var o, n = ee(e.right, t, r);
            ("Identifier" == e.right.type && e.right.name in t.props || "MemberExpression" == e.right.type && "prototype" == e.right.property.name) && (F(t, 5), "Identifier" == e.left.type ? o = e.left.name : "VariableDeclaration" == e.left.type && (o = e.left.declarations[0].id.name), o && o in t.props && (t.getProp(o).iteratesOver = n));
            r(e.body, t, "Statement")
        }, ScopeBody: function (e, t, r) {
            r(e, e.scope || t)
        }
    });

    function re(e, t) {
        var r = e && e[t], o = Array.prototype.slice.call(arguments, 2);
        if (r) for (var n = 0; n < r.length; ++n) r[n].apply(null, o)
    }

    var oe = e.parse = function (e, o, n) {
        var i;
        try {
            i = t.parse(e, n)
        } catch (t) {
            i = r.parse_dammit(e, n)
        }
        return re(o, "postParse", i, e), i
    };
    e.analyze = function (t, r, n, i) {
        "string" == typeof t && (t = oe(t)), r || (r = "file#" + L.origins.length), e.addOrigin(L.curOrigin = r), n || (n = L.topScope), o.recursive(t, n, null, B), re(i, "preInfer", t, n), o.recursive(t, n, null, te), re(i, "postInfer", t, n), L.curOrigin = null
    }, e.purge = function (e, t, r) {
        var o = function (e, t, r) {
            var o = Array.isArray(e);
            o && 1 == e.length && (e = e[0], o = !1);
            return o ? null == r ? function (t) {
                return e.indexOf(t.origin) > -1
            } : function (o, n) {
                return n && n.start >= t && n.end <= r && e.indexOf(o.origin) > -1
            } : null == r ? function (t) {
                return t.origin == e
            } : function (o, n) {
                return n && n.start >= t && n.end <= r && o.origin == e
            }
        }(e, t, r);
        for (var n in ++L.purgeGen, L.topScope.purge(o), L.props) {
            for (var i = L.props[n], s = 0; s < i.length; ++s) {
                var a = i[s].props[n];
                a && !o(a, a.originNode) || i.splice(s--, 1)
            }
            i.length || delete L.props[n]
        }
    }, l.prototype.purge = function (e) {
        if (this.purgeGen != L.purgeGen) {
            this.purgeGen = L.purgeGen;
            for (var t = 0; t < this.types.length; ++t) {
                var r = this.types[t];
                e(r, r.originNode) ? this.types.splice(t--, 1) : r.purge(e)
            }
            if (this.forward) for (t = 0; t < this.forward.length; ++t) {
                var o = this.forward[t];
                e(o) ? (this.forward.splice(t--, 1), this.props && (this.props = null)) : o.purge && o.purge(e)
            }
        }
    }, a.purge = function () {
    }, k.prototype.purge = function (e) {
        if (this.purgeGen == L.purgeGen) return !0;
        for (var t in this.purgeGen = L.purgeGen, this.props) {
            var r = this.props[t];
            e(r, r.originNode) && this.removeProp(t), r.purge(e)
        }
    }, P.prototype.purge = function (e) {
        if (!k.prototype.purge.call(this, e)) {
            this.self.purge(e), this.retval.purge(e);
            for (var t = 0; t < this.args.length; ++t) this.args[t].purge(e)
        }
    };
    var ne = {
        ArrayExpression: function (e, t) {
            for (var r = new l, o = 0; o < e.elements.length; ++o) {
                var n = e.elements[o];
                n && ie(n, t).propagate(r)
            }
            return new N(r)
        }, ObjectExpression: function (e) {
            return e.objType
        }, FunctionExpression: function (e) {
            return e.body.scope.fnType
        }, SequenceExpression: function (e, t) {
            return ie(e.expressions[e.expressions.length - 1], t)
        }, UnaryExpression: function (e) {
            return H(e.operator)
        }, UpdateExpression: function () {
            return L.num
        }, BinaryExpression: function (e, t) {
            if (K(e.operator)) return L.bool;
            if ("+" == e.operator) {
                var r = ie(e.left, t), o = ie(e.right, t);
                if (r.hasType(L.str) || o.hasType(L.str)) return L.str
            }
            return L.num
        }, AssignmentExpression: function (e, t) {
            return ie(e.right, t)
        }, LogicalExpression: function (e, t) {
            var r = ie(e.left, t);
            return r.isEmpty() ? ie(e.right, t) : r
        }, ConditionalExpression: function (e, t) {
            var r = ie(e.consequent, t);
            return r.isEmpty() ? ie(e.alternate, t) : r
        }, NewExpression: function (e, t) {
            var r = ie(e.callee, t).getFunctionType(), o = r && r.getProp("prototype").getObjType();
            return o ? w(o, r) : a
        }, CallExpression: function (e, t) {
            var r = ie(e.callee, t).getFunctionType();
            if (!r) return a;
            if (r.computeRet) {
                for (var o = 0, n = []; o < e.arguments.length; ++o) n.push(ie(e.arguments[o], t));
                var i = a;
                return "MemberExpression" == e.callee.type && (i = ie(e.callee.object, t)), r.computeRet(i, n, e.arguments)
            }
            return r.retval
        }, MemberExpression: function (e, t) {
            var r = V(e, t), o = ie(e.object, t).getType();
            return o ? o.getProp(r) : "<i>" == r ? a : function (e) {
                ce = !0;
                var t = U(e);
                if (t) for (var r = 0; r < t.length; ++r) {
                    var o = t[r].getProp(e);
                    if (!o.isEmpty()) return o
                }
                return a
            }(r)
        }, Identifier: function (e, t) {
            return t.hasProp(e.name) || a
        }, ThisExpression: function (e, t) {
            return t.fnType ? t.fnType.self : L.topScope
        }, Literal: function (e) {
            return X(e)
        }
    };

    function ie(e, t) {
        return ne[e.type](e, t)
    }

    var se = e.searchVisitor = o.make({
        Function: function (e, t, r) {
            var o = e.body.scope;
            e.id && r(e.id, o);
            for (var n = 0; n < e.params.length; ++n) r(e.params[n], o);
            r(e.body, o, "ScopeBody")
        }, TryStatement: function (e, t, r) {
            e.handler && r(e.handler.param, t), o.base.TryStatement(e, t, r)
        }, VariableDeclaration: function (e, t, r) {
            for (var o = 0; o < e.declarations.length; ++o) {
                var n = e.declarations[o];
                r(n.id, t), n.init && r(n.init, t, "Expression")
            }
        }
    });
    e.fullVisitor = o.make({
        MemberExpression: function (e, t, r) {
            r(e.object, t, "Expression"), r(e.property, t, e.computed ? "Expression" : null)
        }, ObjectExpression: function (e, t, r) {
            for (var o = 0; o < e.properties.length; ++o) r(e.properties[o].value, t, "Expression"), r(e.properties[o].key, t)
        }
    }, se), e.findExpressionAt = function (e, t, r, n, i) {
        var s = i || function (e, t) {
            return ("Identifier" != t.type || "✖" != t.name) && ne.hasOwnProperty(t.type)
        };
        return o.findNodeAt(e, t, r, s, se, n || L.topScope)
    }, e.findExpressionAround = function (e, t, r, n, i) {
        var s = i || function (e, r) {
            return !(null != t && r.start > t) && (("Identifier" != r.type || "✖" != r.name) && ne.hasOwnProperty(r.type))
        };
        return o.findNodeAround(e, r, s, se, n || L.topScope)
    }, e.expressionType = function (e) {
        return ie(e.node, e.state)
    }, e.parentNode = function (e, t) {
        var r = [];
        try {
            !function t(n, i, s) {
                if (n.start <= e.start && n.end >= e.end) {
                    var a = r[r.length - 1];
                    if (n == e) throw{found: a};
                    a != n && r.push(n), o.base[s || n.type](n, i, t), a != n && r.pop()
                }
            }(t, null)
        } catch (e) {
            if (e.found) return e.found;
            throw e
        }
    };
    var ae = {
        ArrayExpression: function (e, t, r) {
            return r(e, !0).getProp("<i>")
        }, ObjectExpression: function (e, t, r) {
            for (var o = 0; o < e.properties.length; ++o) {
                var n = t.properties[o];
                if (n.value == t) return r(e, !0).getProp(n.key.name)
            }
        }, UnaryExpression: function (e) {
            return H(e.operator)
        }, UpdateExpression: function () {
            return L.num
        }, BinaryExpression: function (e) {
            return K(e.operator) ? L.bool : L.num
        }, AssignmentExpression: function (e, t, r) {
            return r(e.left)
        }, LogicalExpression: function (e, t, r) {
            return r(e, !0)
        }, ConditionalExpression: function (e, t, r) {
            if (e.consequent == t || e.alternate == t) return r(e, !0)
        }, NewExpression: function (e, t, r) {
            return this.CallExpression(e, t, r)
        }, CallExpression: function (e, t, r) {
            for (var o = 0; o < e.arguments.length; o++) {
                if (e.arguments[o] == t) {
                    var n = r(e.callee).getFunctionType();
                    if (n instanceof P) return n.args[o];
                    break
                }
            }
        }, ReturnStatement: function (e, t, r) {
            var n = o.findNodeAround(t.sourceFile.ast, t.start, "Function");
            if (n) {
                var i = r(n.node, !0).getFunctionType();
                if (i) return i.retval.getType()
            }
        }, VariableDeclaration: function (e, t, r) {
            for (var o = 0; o < e.declarations.length; o++) {
                var n = e.declarations[o];
                if (n.init == t) return r(n.id)
            }
        }
    };
    e.typeFromContext = function (t, r) {
        var o = e.parentNode(r.node, t), n = null;
        return ae.hasOwnProperty(o.type) && (n = ae[o.type](o, r.node, function (o, n) {
            var i = {node: o, state: r.state};
            return (n ? e.typeFromContext(t, i) : e.expressionType(i)) || a
        })), n || e.expressionType(r)
    };
    var ce = !1;
    e.resetGuessing = function (e) {
        ce = e
    }, e.didGuess = function () {
        return ce
    }, e.forAllPropertiesOf = function (e, t) {
        e.gatherProperties(t, 0)
    };
    var le = o.make({}, se);
    e.findRefs = function (e, t, r, n, i) {
        le.Identifier = function (e, t) {
            if (e.name == r) for (var o = t; o; o = o.prev) if (o == n && i(e, t), r in o.props) return
        }, o.recursive(e, t, null, le)
    };
    var pe = o.make({
        Function: function (e, t, r) {
            r(e.body, e.body.scope, "ScopeBody")
        }
    });
    e.findPropRefs = function (e, t, r, n, i) {
        o.simple(e, {
            MemberExpression: function (e, t) {
                e.computed || e.property.name != n || ie(e.object, t).getType() == r && i(e.property)
            }, ObjectExpression: function (e, t) {
                if (ie(e, t).getType() == r) for (var o = 0; o < e.properties.length; ++o) e.properties[o].key.name == n && i(e.properties[o].key)
            }
        }, pe, t)
    };
    var he = e.scopeAt = function (e, t, r) {
        var n = o.findNodeAround(e, t, function (e, t) {
            return "ScopeBody" == e && t.scope
        });
        return n ? n.node.scope : r || L.topScope
    };
    e.forAllLocalsAt = function (e, t, r, o) {
        he(e, t, r).gatherProperties(o, 0)
    }, n = e.def = n.init({}, e)
}), function (e) {
    "object" == typeof exports && "object" == typeof module ? e(exports) : "function" == typeof define && define.amd ? define(["exports"], e) : e(tern.comment || (tern.comment = {}))
}(function (e) {
    function t(e) {
        return e < 14 && e > 8 || 32 === e || 160 === e
    }

    function r(e, r) {
        for (; r > 0; --r) {
            var o = e.charCodeAt(r - 1);
            if (10 == o) break;
            if (!t(o)) return !1
        }
        return !0
    }

    e.commentsBefore = function (e, o) {
        var n, i = null, s = 0;
        e:for (; o > 0;) {
            var a = e.charCodeAt(o - 1);
            if (10 == a) for (var c = --o, l = !1; c > 0; --c) {
                if (47 == (a = e.charCodeAt(c - 1)) && 47 == e.charCodeAt(c - 2)) {
                    if (!r(e, c - 2)) break e;
                    var p = e.slice(c, o);
                    !s && n ? i[0] = p + "\n" + i[0] : (i || (i = [])).unshift(p), n = !0, s = 0, o = c - 2;
                    break
                }
                if (10 == a) {
                    if (!l && ++s > 1) break e;
                    break
                }
                l || t(a) || (l = !0)
            } else if (47 == a && 42 == e.charCodeAt(o - 2)) {
                for (c = o - 2; c > 1; --c) if (42 == e.charCodeAt(c - 1) && 47 == e.charCodeAt(c - 2)) {
                    if (!r(e, c - 2)) break e;
                    (i || (i = [])).unshift(e.slice(c, o - 2)), n = !1, s = 0;
                    break
                }
                o = c - 2
            } else {
                if (!t(a)) break;
                --o
            }
        }
        return i
    }, e.commentAfter = function (e, r) {
        for (; r < e.length;) {
            var o = e.charCodeAt(r);
            if (47 == o) {
                var n, i = e.charCodeAt(r + 1);
                if (47 == i) n = e.indexOf("\n", r + 2); else {
                    if (42 != i) return;
                    n = e.indexOf("*/", r + 2)
                }
                return e.slice(r + 2, n < 0 ? e.length : n)
            }
            t(o) && ++r
        }
    }, e.ensureCommentsBefore = function (t, r) {
        return r.hasOwnProperty("commentsBefore") ? r.commentsBefore : r.commentsBefore = e.commentsBefore(t, r.start)
    }
}), function (e) {
    "object" == typeof exports && "object" == typeof module ? e(require("../lib/infer"), require("../lib/tern")) : "function" == typeof define && define.amd ? define(["../lib/infer", "../lib/tern"], e) : e(tern, tern)
}(function (e, t) {
    "use strict";

    function r(e) {
        if (!/(^|\/)(\.\/|[^\/]+\/\.\.\/)/.test(e)) return e;
        for (var t = e.split("/"), r = 0; r < t.length; ++r) "." != t[r] && t[r] ? r && ".." == t[r] && t.splice(r-- - 1, 2) : t.splice(r--, 1);
        return t.join("/")
    }

    function o(t) {
        var r = new e.Obj(!0, "exports");
        return s(t.currentFile, t).addType(r, a), r
    }

    function n(t, o) {
        if (o.options.override && Object.prototype.hasOwnProperty.call(o.options.override, t)) {
            var n = o.options.override[t];
            if ("string" == typeof n && "=" == n.charAt(0)) return e.def.parsePath(n.slice(1));
            if ("object" == typeof n) {
                if (l = i(t, o)) return l;
                var a = o.interfaces[c(t)] = new e.Obj(null, c(t));
                return e.def.load(n, a), a
            }
            t = n
        }
        var l;
        return /^(https?:|\/)|\.js$/.test(t) || (t = function (e, t) {
            var o = e.indexOf("!");
            o > -1 && (e = e.slice(0, o));
            var n = t.options, i = /\.js$/.test(e);
            if (i || /^(?:\w+:|\/)/.test(e)) return e + (i ? "" : ".js");
            var s = n.baseURL || "";
            if (s && "/" != s.charAt(s.length - 1) && (s += "/"), n.paths) {
                if (a = n.paths[e]) return r(s + a + ".js");
                var a, c = e.match(/^([^\/]+)(\/.*)$/);
                if (c && (a = n.paths[c[1]])) return r(s + a + c[2] + ".js")
            }
            return r(s + e + ".js")
        }(t, o)), (l = i(t = r(t), o)) || (l = s(t, o), o.server.addFile(t, null, o.currentFile)), l
    }

    function i(e, t) {
        return t.interfaces[c(e)]
    }

    function s(t, r) {
        var o = i(t, r);
        return o || ((o = r.interfaces[c(t)] = new e.AVal).origin = t), o
    }

    var a = 50;

    function c(e) {
        return e.replace(/\.js$/, "")
    }

    var l = {
        dirname: function (e) {
            var t = e.lastIndexOf("/");
            return -1 == t ? "" : e.slice(0, t)
        }, relative: function (e, t) {
            return 0 == t.indexOf(e) ? t.slice(e.length) : t
        }, join: function (e, t) {
            return t && "." != t.charAt(0) ? t : e && t ? e + "/" + t : (e || "") + (t || "")
        }
    };

    function p(e) {
        switch (e.type) {
            case"ArrayExpression":
                return e.elements.map(p);
            case"Literal":
                return e.value;
            case"ObjectExpression":
                var t = {};
                return e.properties.forEach(function (e) {
                    var r = e.key.name || e.key.value;
                    t[r] = p(e.value)
                }), t
        }
    }

    function h(t) {
        var r = e.cx().parent._requireJS.interfaces, o = t.roots["!requirejs"] = new e.Obj(null);
        for (var n in r) {
            var i = o.defProp(n.replace(/\./g, "`"));
            r[n].propagate(i), i.origin = r[n].origin
        }
    }

    function u(t) {
        var r = e.cx(), o = r.definitions[t["!name"]]["!requirejs"];
        t = r.parent._requireJS;
        if (o) for (var i in o.props) o.props[i].propagate(n(i, t))
    }

    e.registerFunction("requireJS", function (t, r, i) {
        var c = e.cx().parent, p = c && c._requireJS;
        if (!p || !r.length) return e.ANull;
        var h, u, d, f = s(p.currentFile, p), m = [];

        function b(t) {
            return "require" == t ? function (t) {
                return t.require || (t.require = new e.Fn("require", e.ANull, [e.cx().str], ["module"], new e.AVal), t.require.computeRet = function (r, o, i) {
                    return i.length && "Literal" == i[0].type && "string" == typeof i[0].value ? n(l.join(l.dirname(t.currentFile), i[0].value), t) : e.ANull
                }), t.require
            }(p) : "exports" == t ? u || (u = o(p)) : "module" == t ? d || (d = function (t, r) {
                var o = new e.Obj(e.cx().definitions.requirejs.module, "module"), n = o.defProp("exports");
                return n.propagate(s(t.currentFile, t)), r.propagate(n, a), o
            }(p, u || (u = o(p)))) : n(t, p)
        }

        if (i && r.length > 1) {
            var y = i[2 == r.length ? 0 : 1], g = l.relative(c.options.projectDir, l.dirname(y.sourceFile.name));
            if ("Literal" == y.type && "string" == typeof y.value) m.push(b(l.join(g, y.value))); else if ("ArrayExpression" == y.type) for (var v = 0; v < y.elements.length; ++v) {
                var T = y.elements[v];
                "Literal" == T.type && "string" == typeof T.value && m.push(b(l.join(g, T.value)))
            }
        } else i && 1 == r.length && "FunctionExpression" == i[0].type && i[0].params.length && (m.push(b("require"), b("exports"), b("module")), h = r[0]);
        return h || (h = r[Math.min(r.length - 1, 2)]).isEmpty() || h.getFunctionType() || (h = null), h ? h.propagate(new e.IsCallee(e.ANull, m, null, f)) : r.length && r[0].propagate(f), e.ANull
    }), e.registerFunction("requireJSConfig", function (t, r, o) {
        var n = e.cx().parent, i = n && n._requireJS;
        if (i && o && o.length && "ObjectExpression" == o[0].type) {
            var s = p(o[0]);
            for (var a in s) if (s.hasOwnProperty(a)) {
                var c = s[a];
                if (i.options[a]) {
                    if ("paths" == a) for (var l in c) c.hasOwnProperty(l) && !i.options.paths[l] && (i.options.paths[l] = c[l])
                } else i.options[a] = c
            }
        }
        return e.ANull
    }), t.registerPlugin("requirejs", function (e, t) {
        return e._requireJS = {
            interfaces: Object.create(null),
            options: t || {},
            currentFile: null,
            server: e
        }, e.on("beforeLoad", function (e) {
            this._requireJS.currentFile = e.name
        }), e.on("reset", function () {
            this._requireJS.interfaces = Object.create(null), this._requireJS.require = null
        }), {defs: d, passes: {preCondenseReach: h, postLoadDef: u}}
    });
    var d = {
        "!name": "requirejs",
        "!define": {
            module: {id: "string", uri: "string", config: "fn() -> ?"}, config: {
                "!url": "http://requirejs.org/docs/api.html#config",
                baseUrl: {
                    "!type": "string",
                    "!doc": "the root path to use for all module lookups",
                    "!url": "http://requirejs.org/docs/api.html#config-baseUrl"
                },
                paths: {
                    "!type": "?",
                    "!doc": "path mappings for module names not found directly under baseUrl. The path settings are assumed to be relative to baseUrl, unless the paths setting starts with a '/' or has a URL protocol in it ('like http:').",
                    "!url": "http://requirejs.org/docs/api.html#config-paths"
                },
                shim: {
                    "!type": "?",
                    "!doc": "Configure the dependencies, exports, and custom initialization for older, traditional 'browser globals' scripts that do not use define() to declare the dependencies and set a module value.",
                    "!url": "http://requirejs.org/docs/api.html#config-shim"
                },
                map: {
                    "!type": "?",
                    "!doc": "For the given module prefix, instead of loading the module with the given ID, substitute a different module ID.",
                    "!url": "http://requirejs.org/docs/api.html#config-map"
                },
                config: {
                    "!type": "?",
                    "!doc": "There is a common need to pass configuration info to a module. That configuration info is usually known as part of the application, and there needs to be a way to pass that down to a module. In RequireJS, that is done with the config option for requirejs.config(). Modules can then read that info by asking for the special dependency 'module' and calling module.config().",
                    "!url": "http://requirejs.org/docs/api.html#config-moduleconfig"
                },
                packages: {
                    "!type": "?",
                    "!doc": "configures loading modules from CommonJS packages. See the packages topic for more information.",
                    "!url": "http://requirejs.org/docs/api.html#config-packages"
                },
                nodeIdCompat: {
                    "!type": "?",
                    "!doc": "Node treats module ID example.js and example the same. By default these are two different IDs in RequireJS. If you end up using modules installed from npm, then you may need to set this config value to true to avoid resolution issues.",
                    "!url": "http://requirejs.org/docs/api.html#config-nodeIdCompat"
                },
                waitSeconds: {
                    "!type": "number",
                    "!doc": "The number of seconds to wait before giving up on loading a script. Setting it to 0 disables the timeout. The default is 7 seconds.",
                    "!url": "http://requirejs.org/docs/api.html#config-waitSeconds"
                },
                context: {
                    "!type": "number",
                    "!doc": "A name to give to a loading context. This allows require.js to load multiple versions of modules in a page, as long as each top-level require call specifies a unique context string. To use it correctly, see the Multiversion Support section.",
                    "!url": "http://requirejs.org/docs/api.html#config-context"
                },
                deps: {
                    "!type": "?",
                    "!doc": "An array of dependencies to load. Useful when require is defined as a config object before require.js is loaded, and you want to specify dependencies to load as soon as require() is defined. Using deps is just like doing a require([]) call, but done as soon as the loader has processed the configuration. It does not block any other require() calls from starting their requests for modules, it is just a way to specify some modules to load asynchronously as part of a config block.",
                    "!url": "http://requirejs.org/docs/api.html#config-deps"
                },
                callback: {
                    "!type": "fn()",
                    "!doc": "A function to execute after deps have been loaded. Useful when require is defined as a config object before require.js is loaded, and you want to specify a function to require after the configuration's deps array has been loaded.",
                    "!url": "http://requirejs.org/docs/api.html#config-callback"
                },
                enforceDefine: {
                    "!type": "bool",
                    "!doc": "If set to true, an error will be thrown if a script loads that does not call define() or have a shim exports string value that can be checked. See Catching load failures in IE for more information.",
                    "!url": "http://requirejs.org/docs/api.html#config-enforceDefine"
                },
                xhtml: {
                    "!type": "bool",
                    "!doc": "If set to true, document.createElementNS() will be used to create script elements.",
                    "!url": "http://requirejs.org/docs/api.html#config-xhtml"
                },
                urlArgs: {
                    "!type": "string",
                    "!doc": "Extra query string arguments appended to URLs that RequireJS uses to fetch resources. Most useful to cache bust when the browser or server is not configured correctly.",
                    "!url": "http://requirejs.org/docs/api.html#config-urlArgs"
                },
                scriptType: {
                    "!type": "string",
                    "!doc": "Specify the value for the type='' attribute used for script tags inserted into the document by RequireJS. Default is 'text/javascript'. To use Firefox's JavaScript 1.8 features, use 'text/javascript;version=1.8'.",
                    "!url": "http://requirejs.org/docs/api.html#config-scriptType"
                },
                skipDataMain: {
                    "!type": "bool",
                    "!doc": "Introduced in RequireJS 2.1.9: If set to true, skips the data-main attribute scanning done to start module loading. Useful if RequireJS is embedded in a utility library that may interact with other RequireJS library on the page, and the embedded version should not do data-main loading.",
                    "!url": "http://requirejs.org/docs/api.html#config-skipDataMain"
                }
            }
        },
        requirejs: {
            "!type": "fn(deps: [string], callback: fn(), errback: fn()) -> !custom:requireJS",
            onError: {
                "!type": "fn(err: +Error)",
                "!doc": "To detect errors that are not caught by local errbacks, you can override requirejs.onError()",
                "!url": "http://requirejs.org/docs/api.html#requirejsonerror"
            },
            load: {"!type": "fn(context: ?, moduleName: string, url: string)"},
            config: "fn(config: config) -> !custom:requireJSConfig",
            version: "string",
            isBrowser: "bool"
        },
        require: "requirejs",
        define: {"!type": "fn(deps: [string], callback: fn()) -> !custom:requireJS", amd: {jQuery: "bool"}}
    }
}),
    function (e) {
    "object" == typeof exports && "object" == typeof module ? e(require("../lib/infer"), require("../lib/tern"), require) : "function" == typeof define && define.amd ? define(["../lib/infer", "../lib/tern"], e) : e(tern, tern)
}(
    function (e, t, r) {
    "use strict";

    function o(e, t) {
        return e.addFile(t, null, e._component.currentName), n(e._component, t)
    }

    function n(t, r) {
        return t.modules[r] || (t.modules[r] = new e.AVal)
    }

    function i(t) {
        var r = t.getProp("module").getType(), o = r && r.getProp("exports");
        return o instanceof e.AVal && !o.isEmpty() ? o.types[o.types.length - 1] : t.getProp("exports")
    }

    function s(t, r, o) {
        var n = new e.Scope(t), i = e.cx();
        n.originNode = o, i.definitions.component.require.propagate(n.defProp("require"));
        var s = i.definitions.component.Module.getProp("prototype").getType(), a = new e.Obj(s);
        a.propagate(n.defProp("module"));
        var c = new e.Obj(!0, "exports", r);
        return c.propagate(n.defProp("exports")), c.propagate(a.defProp("exports")), n
    }

    r && function () {
        var t = r("fs"), n = r("path"), i = /win/.test(process.platform), s = n.resolve;
        i && (s = function (e, t) {
            return n.resolve(e, t).replace(/\\/g, "/")
        }), o = function (r, o, n) {
            var i = r._component, a = r.options.projectDir || "", c = o;
            if (1 == i.options.dontLoad) return e.ANull;
            if (i.options.dontLoad && new RegExp(i.options.dontLoad).test(o)) return e.ANull;
            if (i.options.load && !new RegExp(i.options.load).test(o)) return e.ANull;
            if (!n) try {
                var l = JSON.parse(t.readFileSync(s(a, "component.json")));
                if (!l.dependencies) return e.ANull;
                var p = new RegExp("(.*?)/" + o, "i"), h = Object.keys(l.dependencies).filter(function (e) {
                    return p.test(e)
                }).pop().match(/(.*?)\/.*?/i).shift();
                h = h.substring(0, h.length - 1), c = s(a, "components/" + h + "-" + o)
            } catch (e) {
            }
            try {
                var u = JSON.parse(t.readFileSync(s(a, c + "/component.json")))
            } catch (e) {
            }
            if (u && u.main) c += "/" + u.main; else try {
                t.statSync(s(a, c)).isDirectory() && (c += "/index.js")
            } catch (e) {
            }
            /\.js$/.test(c) || (c += ".js");
            try {
                if (!t.statSync(s(a, c)).isFile()) return e.ANull
            } catch (t) {
                return e.ANull
            }
            return r.addFile(c, null, i.currentName), i.modules[c] = i.modules[o] = new e.AVal
        }
    }(), t.registerPlugin("component", function (e, t) {
        return e._component = {
            modules: Object.create(null),
            options: t || {},
            currentFile: null,
            currentName: null,
            server: e
        }, e.on("beforeLoad", function (e) {
            this._component.currentFile = e.name.replace(/\\/g, "/"), this._component.currentName = e.name, e.scope = s(e.scope, e.name, e.ast)
        }), e.on("afterLoad", function (e) {
            this._component.currentFile = this._component.currentName = null, i(e.scope).propagate(n(this._component, e.name))
        }), e.on("reset", function () {
            this._component.modules = Object.create(null)
        }), {defs: a}
    }), e.registerFunction("componentRequire", function (t, r, n) {
        if (!n || !n.length || "Literal" != n[0].type || "string" != typeof n[0].value) return e.ANull;
        var a = e.cx(), c = a.parent, l = c._component, p = n[0].value, h = a.definitions.component;
        if (h[p] && /^[a-z_]*$/.test(p)) return h[p];
        var u, d = /^\.{0,2}\//.test(p);
        if (d) {
            if (!l.currentFile) return n[0].required || e.ANull;
            p = function (e, t) {
                var r, o = e.lastIndexOf("/");
                for (o >= 0 && (t = e.slice(0, o + 1) + t); r = /[^\/]*[^\/\.][^\/]*\/\.\.\//.exec(t);) t = t.slice(0, r.index) + t.slice(r.index + r[0].length);
                return t.replace(/(^|[^\.])\.\//g, "$1")
            }(l.currentFile, p)
        }
        if (p in l.modules) return l.modules[p];
        if (l.options.modules && l.options.modules.hasOwnProperty(p)) {
            var f = s(a.topScope, p);
            e.def.load(l.options.modules[p], f), u = l.modules[p] = i(f)
        } else u = o(c, p, d);
        return n[0].required = u
    });
    var a = {
        "!name": "component", "!define": {
            require: {
                "!type": "fn(id: string) -> !custom:componentRequire",
                "!doc": "Require the given path/module",
                modules: {"!doc": "Registered modules"},
                aliases: {"!doc": "Registered aliases"},
                resolve: {"!type": "fn(path: string) -> string", "!doc": "Resolve path"},
                normalize: {
                    "!type": "fn(curr: string, path: string) -> string",
                    "!doc": "Normalize `path` relative to the current path"
                },
                register: {
                    "!type": "fn(path: string, definition: fn())",
                    "!doc": "Register module at `path` with callback `definition`"
                },
                alias: {"!type": "fn(from: string, to: string)", "!doc": "Alias a module definition"},
                relative: {
                    "!type": "fn(parent: string) -> fn()",
                    "!doc": "Return a require function relative to the `parent` path"
                }
            },
            Module: {
                "!type": "fn()",
                prototype: {
                    exports: {
                        "!type": "?",
                        "!doc": "The exports object is created by the Module system. Sometimes this is not acceptable, many want their module to be an instance of some class. To do this assign the desired export object to module.exports. For example suppose we were making a module called a.js"
                    },
                    require: {
                        "!type": "require",
                        "!doc": "The module.require method provides a way to load a module as if require() was called from the original module."
                    },
                    id: {
                        "!type": "string",
                        "!doc": "The identifier for the module. Typically this is the fully resolved filename."
                    },
                    filename: {"!type": "string", "!doc": "The fully resolved filename to the module."},
                    loaded: {
                        "!type": "bool",
                        "!doc": "Whether or not the module is done loading, or is in the process of loading."
                    },
                    parent: {"!type": "+Module", "!doc": "The module that required this one."},
                    children: {"!type": "[+Module]", "!doc": "The module objects required by this one."}
                }
            }
        }
    }
}),
    function (e) {
    "object" == typeof exports && "object" == typeof module ? e(require("../lib/infer"), require("../lib/tern"), require("../lib/comment"), require("acorn"), require("acorn/dist/walk")) : "function" == typeof define && define.amd ? define(["../lib/infer", "../lib/tern", "../lib/comment", "acorn/dist/acorn", "acorn/dist/walk"], e) : e(tern, tern, tern.comment, acorn, acorn.walk)
}(
    function (e, t, r, o, n) {
    "use strict";
    var i = 1;

    function s(e, t) {
        function o(e) {
            r.ensureCommentsBefore(t, e)
        }

        n.simple(e, {
            VariableDeclaration: o, FunctionDeclaration: o, AssignmentExpression: function (e) {
                "=" == e.operator && o(e)
            }, ObjectExpression: function (e) {
                for (var t = 0; t < e.properties.length; ++t) o(e.properties[t])
            }, CallExpression: function (e) {
                a(e) && o(e)
            }
        })
    }

    function a(e) {
        return "MemberExpression" == e.callee.type && "Object" == e.callee.object.name && "defineProperty" == e.callee.property.name && e.arguments.length >= 3 && "string" == typeof e.arguments[1].value
    }

    function c(t, r) {
        !function (t, r) {
            var o, n = e.cx(), i = /\s@typedef\s+(.*)/g;
            for (; o = i.exec(t);) {
                var s = y(r, o[1]), a = s && o[1].slice(s.end).match(/^\s*(\S+)/);
                a && (n.parent.jsdocTypedefs[a[1]] = s.type)
            }
        }(t.sourceFile.text, r), n.simple(t, {
            VariableDeclaration: function (e, t) {
                e.commentsBefore && p(e, e.commentsBefore, t, t.getProp(e.declarations[0].id.name))
            }, FunctionDeclaration: function (e, t) {
                e.commentsBefore && p(e, e.commentsBefore, t, t.getProp(e.id.name), e.body.scope.fnType)
            }, AssignmentExpression: function (t, r) {
                t.commentsBefore && p(t, t.commentsBefore, r, e.expressionType({node: t.left, state: r}))
            }, ObjectExpression: function (e, t) {
                for (var r = 0; r < e.properties.length; ++r) {
                    var o = e.properties[r];
                    o.commentsBefore && p(o, o.commentsBefore, t, e.objType.getProp(o.key.name))
                }
            }, CallExpression: function (t, r) {
                if (t.commentsBefore && a(t)) {
                    var o = e.expressionType({node: t.arguments[0], state: r}).getObjType();
                    if (o && o instanceof e.Obj) {
                        var n = o.props[t.arguments[1].value];
                        n && p(t, t.commentsBefore, r, n)
                    }
                }
            }
        }, e.searchVisitor, r)
    }

    function l(t) {
        var r = t["!typedef"], o = e.cx(), n = t["!name"];
        if (r) for (var i in r) o.parent.jsdocTypedefs[i] = b(e.def.parse(r[i], n, i), i)
    }

    function p(t, r, o, n, i) {
        !function (e, t, r, o) {
            for (var n, i, s, a, c, l, p = 0; p < o.length; ++p) for (var h, u = o[p], d = /(?:\n|$|\*)\s*@(type|param|arg(?:ument)?|returns?|this)\s+(.*)/g; h = d.exec(u);) if ("this" == h[1] && (l = f(t, h[2], 0))) c = l, a = !0; else if (l = y(t, h[2])) switch (a = !0, h[1]) {
                case"returns":
                case"return":
                    s = l;
                    break;
                case"type":
                    n = l;
                    break;
                case"param":
                case"arg":
                case"argument":
                    var m = h[2].slice(l.end).match(/^\s*(\[?)\s*([^\]\s=]+)\s*(?:=[^\]]+\s*)?(\]?).*/);
                    if (!m) continue;
                    var b = m[2] + (l.isOptional || "[" === m[1] && "]" === m[3] ? "?" : "");
                    (i || (i = Object.create(null)))[b] = l
            }
            a && function (e, t, r, o, n, i) {
                var s;
                if ("VariableDeclaration" == n.type) {
                    var a = n.declarations[0];
                    a.init && "FunctionExpression" == a.init.type && (s = a.init.body.scope.fnType)
                } else "FunctionDeclaration" == n.type ? s = n.body.scope.fnType : "AssignmentExpression" == n.type ? "FunctionExpression" == n.right.type && (s = n.right.body.scope.fnType) : "CallExpression" == n.type || "FunctionExpression" == n.value.type && (s = n.value.body.scope.fnType);
                if (s && (r || o || t)) {
                    if (r) for (var c = 0; c < s.argNames.length; ++c) {
                        var l = s.argNames[c], p = r[l];
                        !p && (p = r[l + "?"]) && (s.argNames[c] += "?"), p && g(p, s.args[c])
                    }
                    o && g(o, s.retval), t && g(t, s.self)
                } else e && g(e, i)
            }(n, c, i, s, e, r)
        }(t, o, n, r);
        var s = e.cx();
        !i && n instanceof e.AVal && n.types.length && ((i = n.types[n.types.length - 1]) instanceof e.Obj && i.origin == s.curOrigin && !i.doc || (i = null));
        var a = r[r.length - 1];
        if (s.parent._docComment.fullDocs) a = a.trim().replace(/\n[ \t]*\* ?/g, "\n"); else {
            var c = a.search(/\.\s/);
            c > 5 && (a = a.slice(0, c + 1)), a = a.trim().replace(/\s*\n\s*\*\s*|\s{1,}/g, " ")
        }
        a = a.replace(/^\s*\*+\s*/, ""), n instanceof e.AVal && (n.doc = a), i && (i.doc = a)
    }

    function h(e, t) {
        for (; /\s/.test(e.charAt(t));) ++t;
        return t
    }

    function u(e) {
        if (!o.isIdentifierStart(e.charCodeAt(0))) return !1;
        for (var t = 1; t < e.length; t++) if (!o.isIdentifierChar(e.charCodeAt(t))) return !1;
        return !0
    }

    function d(e, t, r, o) {
        for (var n = [], i = [], s = !1, a = !0; r = h(t, r), !a || t.charAt(r) != o; a = !1) {
            var c = t.indexOf(":", r);
            if (c < 0) return null;
            var l = t.slice(r, c);
            if (!u(l)) return null;
            n.push(l);
            var p = f(e, t, r = c + 1);
            if (!p) return null;
            r = p.end, s = s || p.madeUp, i.push(p.type), r = h(t, r);
            var d = t.charAt(r);
            if (++r, d == o) break;
            if ("," != d) return null
        }
        return {labels: n, types: i, end: r, madeUp: s}
    }

    function f(t, r, o) {
        for (var n, i = !1, s = !1; ;) {
            var a = m(t, r, o);
            if (!a) return null;
            if (s = s || a.madeUp, i ? a.type.propagate(i) : n = a.type, o = h(r, a.end), "|" != r.charAt(o)) break;
            o++, i || (i = new e.AVal, n.propagate(i), n = i)
        }
        var c = !1;
        return "=" == r.charAt(o) && (++o, c = !0), {type: n, end: o, isOptional: c, madeUp: s}
    }

    function m(t, r, n) {
        n = h(r, n);
        var i, s = !1;
        if (r.indexOf("function(", n) == n) {
            var a = d(t, r, n + 9, ")"), c = e.ANull;
            if (!a) return null;
            if (n = h(r, a.end), ":" == r.charAt(n)) {
                var l = f(t, r, ++n + 1);
                if (!l) return null;
                n = l.end, c = l.type, s = l.madeUp
            }
            i = new e.Fn(null, e.ANull, a.types, a.labels, c)
        } else if ("[" == r.charAt(n)) {
            if (!(v = f(t, r, n + 1))) return null;
            if (n = h(r, v.end), s = v.madeUp, "]" != r.charAt(n)) return null;
            ++n, i = new e.Arr(v.type)
        } else if ("{" == r.charAt(n)) {
            var p = d(t, r, n + 1, "}");
            if (!p) return null;
            i = new e.Obj(!0);
            for (var u = 0; u < p.types.length; ++u) {
                var m = i.defProp(p.labels[u]);
                m.initializer = !0, p.types[u].propagate(m)
            }
            n = p.end, s = p.madeUp
        } else if ("(" == r.charAt(n)) {
            if (!(v = f(t, r, n + 1))) return null;
            if (n = h(r, v.end), ")" != r.charAt(n)) return null;
            ++n, i = v.type
        } else {
            var y = n;
            if (!o.isIdentifierStart(r.charCodeAt(n))) return null;
            for (; o.isIdentifierChar(r.charCodeAt(n));) ++n;
            if (y == n) return null;
            var g = r.slice(y, n);
            if (/^(number|integer)$/i.test(g)) i = e.cx().num; else if (/^bool(ean)?$/i.test(g)) i = e.cx().bool; else if (/^string$/i.test(g)) i = e.cx().str; else if (/^(null|undefined)$/i.test(g)) i = e.ANull; else if (/^array$/i.test(g)) {
                var v = null;
                if ("." == r.charAt(n) && "<" == r.charAt(n + 1)) {
                    var T = f(t, r, n + 2);
                    if (!T) return null;
                    if (n = h(r, T.end), s = T.madeUp, ">" != r.charAt(n++)) return null;
                    v = T.type
                }
                i = new e.Arr(v)
            } else if (/^object$/i.test(g)) {
                if (i = new e.Obj(!0), "." == r.charAt(n) && "<" == r.charAt(n + 1)) {
                    var S = f(t, r, n + 2);
                    if (!S) return null;
                    if (n = h(r, S.end), s = s || S.madeUp, "," != r.charAt(n++)) return null;
                    var w = f(t, r, n);
                    if (!w) return null;
                    if (n = h(r, w.end), s = S.madeUp || w.madeUp, ">" != r.charAt(n++)) return null;
                    w.type.propagate(i.defProp("<i>"))
                }
            } else {
                for (; 46 == r.charCodeAt(n) || o.isIdentifierChar(r.charCodeAt(n));) ++n;
                var R, E = r.slice(y, n), A = e.cx(), O = A.parent && A.parent.jsdocTypedefs;
                O && E in O ? i = O[E] : (R = e.def.parsePath(E, t).getObjType()) ? i = b(R, E) : (A.jsdocPlaceholders || (A.jsdocPlaceholders = Object.create(null)), i = E in A.jsdocPlaceholders ? A.jsdocPlaceholders[E] : A.jsdocPlaceholders[E] = new e.Obj(null, E), s = !0)
            }
        }
        return {type: i, end: n, madeUp: s}
    }

    function b(t, r) {
        if (t instanceof e.Fn && /^[A-Z]/.test(r)) {
            var o = t.getProp("prototype").getObjType();
            if (o instanceof e.Obj) return e.getInstance(o)
        }
        return t
    }

    function y(e, t, r) {
        if (r = h(t, r || 0), "{" != t.charAt(r)) return null;
        var o = f(e, t, r + 1);
        if (!o) return null;
        var n = h(t, o.end);
        return "}" != t.charAt(n) ? null : (o.end = n + 1, o)
    }

    function g(t, r) {
        var o = e.cx().parent._docComment.weight;
        t.type.propagate(r, o || (t.madeUp ? i : void 0))
    }

    t.registerPlugin("doc_comment", function (e, t) {
        return e.jsdocTypedefs = Object.create(null), e.on("reset", function () {
            e.jsdocTypedefs = Object.create(null)
        }), e._docComment = {weight: t && t.strong ? 101 : void 0, fullDocs: t && t.fullDocs}, {
            passes: {
                postParse: s,
                postInfer: c,
                postLoadDef: l
            }
        }
    })
}),
    function (e) {
    "object" == typeof exports && "object" == typeof module ? e(require("../lib/infer"), require("../lib/tern"), require("acorn/dist/walk")) : "function" == typeof define && define.amd ? define(["../lib/infer", "../lib/tern", "acorn/dist/walk"], e) : e(tern, tern, acorn.walk)
}
(function (e, t, r) {
    "use strict";

    function o(t) {
        var o = e.cx().parent._completeStrings;
        r.simple(t, {
            Literal: function (e) {
                "string" == typeof e.value && e.value && e.value.length < o.maxLen && (o.seen[e.value] = t.sourceFile.name)
            }
        })
    }

    function n(r, o) {
        var n = t.resolvePos(r, o.end), i = e.findExpressionAround(r.ast, null, n, r.scope, "Literal");
        if (i && "string" == typeof i.node.value) {
            var s = i.node.value.slice(0, n - i.node.start - 1), a = [], c = e.cx().parent._completeStrings.seen;
            for (var l in c) if (l.length > s.length && 0 == l.indexOf(s)) if (o.types || o.docs || o.urls || o.origins) {
                var p = {name: JSON.stringify(l), displayName: l};
                a.push(p), o.types && (p.type = "string"), o.origins && (p.origin = c[l])
            } else a.push(JSON.stringify(l));
            return a.length ? {
                start: t.outputPos(o, r, i.node.start),
                end: t.outputPos(o, r, n + (r.text.charAt(n) == r.text.charAt(i.node.start) ? 1 : 0)),
                isProperty: !1,
                completions: a
            } : void 0
        }
    }

    t.registerPlugin("complete_strings", function (e, t) {
        return e._completeStrings = {
            maxLen: t && t.maxLength || 15,
            seen: Object.create(null)
        }, e.on("reset", function () {
            e._completeStrings.seen = Object.create(null)
        }), {passes: {postParse: o, completion: n}}
    })
});

var def_ecma5 = {
    "!name": "ecma5",
    "!define": {"Error.prototype": "Error.prototype"},
    Infinity: {
        "!type": "number",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Infinity",
        "!doc": "A numeric value representing infinity."
    },
    undefined: {
        "!type": "?",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/undefined",
        "!doc": "The value undefined."
    },
    NaN: {
        "!type": "number",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/NaN",
        "!doc": "A value representing Not-A-Number."
    },
    Object: {
        "!type": "fn()",
        getPrototypeOf: {
            "!type": "fn(obj: ?) -> ?",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/getPrototypeOf",
            "!doc": "Returns the prototype (i.e. the internal prototype) of the specified object."
        },
        create: {
            "!type": "fn(proto: ?) -> !custom:Object_create",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create",
            "!doc": "Creates a new object with the specified prototype object and properties."
        },
        defineProperty: {
            "!type": "fn(obj: ?, prop: string, desc: ?) -> !custom:Object_defineProperty",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty",
            "!doc": "Defines a new property directly on an object, or modifies an existing property on an object, and returns the object. If you want to see how to use the Object.defineProperty method with a binary-flags-like syntax, see this article."
        },
        defineProperties: {
            "!type": "fn(obj: ?, props: ?)",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty",
            "!doc": "Defines a new property directly on an object, or modifies an existing property on an object, and returns the object. If you want to see how to use the Object.defineProperty method with a binary-flags-like syntax, see this article."
        },
        getOwnPropertyDescriptor: {
            "!type": "fn(obj: ?, prop: string) -> ?",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor",
            "!doc": "Returns a property descriptor for an own property (that is, one directly present on an object, not present by dint of being along an object's prototype chain) of a given object."
        },
        keys: {
            "!type": "fn(obj: ?) -> [string]",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys",
            "!doc": "Returns an array of a given object's own enumerable properties, in the same order as that provided by a for-in loop (the difference being that a for-in loop enumerates properties in the prototype chain as well)."
        },
        getOwnPropertyNames: {
            "!type": "fn(obj: ?) -> [string]",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames",
            "!doc": "Returns an array of all properties (enumerable or not) found directly upon a given object."
        },
        seal: {
            "!type": "fn(obj: ?)",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/seal",
            "!doc": "Seals an object, preventing new properties from being added to it and marking all existing properties as non-configurable. Values of present properties can still be changed as long as they are writable."
        },
        isSealed: {
            "!type": "fn(obj: ?) -> bool",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/isSealed",
            "!doc": "Determine if an object is sealed."
        },
        freeze: {
            "!type": "fn(obj: ?)",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/freeze",
            "!doc": "Freezes an object: that is, prevents new properties from being added to it; prevents existing properties from being removed; and prevents existing properties, or their enumerability, configurability, or writability, from being changed. In essence the object is made effectively immutable. The method returns the object being frozen."
        },
        isFrozen: {
            "!type": "fn(obj: ?) -> bool",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/isFrozen",
            "!doc": "Determine if an object is frozen."
        },
        preventExtensions: {
            "!type": "fn(obj: ?)",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/preventExtensions",
            "!doc": "Prevents new properties from ever being added to an object."
        },
        isExtensible: {
            "!type": "fn(obj: ?) -> bool",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible",
            "!doc": "The Object.isExtensible() method determines if an object is extensible (whether it can have new properties added to it)."
        },
        prototype: {
            "!stdProto": "Object",
            toString: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/toString",
                "!doc": "Returns a string representing the object."
            },
            toLocaleString: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/toLocaleString",
                "!doc": "Returns a string representing the object. This method is meant to be overriden by derived objects for locale-specific purposes."
            },
            valueOf: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/valueOf",
                "!doc": "Returns the primitive value of the specified object"
            },
            hasOwnProperty: {
                "!type": "fn(prop: string) -> bool",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/hasOwnProperty",
                "!doc": "Returns a boolean indicating whether the object has the specified property."
            },
            propertyIsEnumerable: {
                "!type": "fn(prop: string) -> bool",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable",
                "!doc": "Returns a Boolean indicating whether the specified property is enumerable."
            },
            isPrototypeOf: {
                "!type": "fn(obj: ?) -> bool",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isPrototypeOf",
                "!doc": "Tests for an object in another object's prototype chain."
            }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object",
        "!doc": "Creates an object wrapper."
    },
    Function: {
        "!type": "fn(body: string) -> fn()",
        prototype: {
            "!stdProto": "Function",
            apply: {
                "!type": "fn(this: ?, args: [?])",
                "!effects": ["call and return !this this=!0 !1.<i> !1.<i> !1.<i>"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/apply",
                "!doc": "Calls a function with a given this value and arguments provided as an array (or an array like object)."
            },
            call: {
                "!type": "fn(this: ?, args?: ?) -> !this.!ret",
                "!effects": ["call and return !this this=!0 !1 !2 !3 !4"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/call",
                "!doc": "Calls a function with a given this value and arguments provided individually."
            },
            bind: {
                "!type": "fn(this: ?, args?: ?) -> !custom:Function_bind",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind",
                "!doc": "Creates a new function that, when called, has its this keyword set to the provided value, with a given sequence of arguments preceding any provided when the new function was called."
            },
            prototype: "?"
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function",
        "!doc": "Every function in JavaScript is actually a Function object."
    },
    Array: {
        "!type": "fn(size: number) -> !custom:Array_ctor",
        isArray: {
            "!type": "fn(value: ?) -> bool",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/isArray",
            "!doc": "Returns true if an object is an array, false if it is not."
        },
        prototype: {
            "!stdProto": "Array",
            length: {
                "!type": "number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/length",
                "!doc": "An unsigned, 32-bit integer that specifies the number of elements in an array."
            },
            concat: {
                "!type": "fn(other: [?]) -> !this",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/concat",
                "!doc": "Returns a new array comprised of this array joined with other array(s) and/or value(s)."
            },
            join: {
                "!type": "fn(separator?: string) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/join",
                "!doc": "Joins all elements of an array into a string."
            },
            splice: {
                "!type": "fn(pos: number, amount: number)",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/splice",
                "!doc": "Changes the content of an array, adding new elements while removing old elements."
            },
            pop: {
                "!type": "fn() -> !this.<i>",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/pop",
                "!doc": "Removes the last element from an array and returns that element."
            },
            push: {
                "!type": "fn(newelt: ?) -> number",
                "!effects": ["propagate !0 !this.<i>"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/push",
                "!doc": "Mutates an array by appending the given elements and returning the new length of the array."
            },
            shift: {
                "!type": "fn() -> !this.<i>",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/shift",
                "!doc": "Removes the first element from an array and returns that element. This method changes the length of the array."
            },
            unshift: {
                "!type": "fn(newelt: ?) -> number",
                "!effects": ["propagate !0 !this.<i>"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/unshift",
                "!doc": "Adds one or more elements to the beginning of an array and returns the new length of the array."
            },
            slice: {
                "!type": "fn(from: number, to?: number) -> !this",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/slice",
                "!doc": "Returns a shallow copy of a portion of an array."
            },
            reverse: {
                "!type": "fn()",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/reverse",
                "!doc": "Reverses an array in place.  The first array element becomes the last and the last becomes the first."
            },
            sort: {
                "!type": "fn(compare?: fn(a: ?, b: ?) -> number)",
                "!effects": ["call !0 !this.<i> !this.<i>"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/sort",
                "!doc": "Sorts the elements of an array in place and returns the array."
            },
            indexOf: {
                "!type": "fn(elt: ?, from?: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf",
                "!doc": "Returns the first index at which a given element can be found in the array, or -1 if it is not present."
            },
            lastIndexOf: {
                "!type": "fn(elt: ?, from?: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/lastIndexOf",
                "!doc": "Returns the last index at which a given element can be found in the array, or -1 if it is not present. The array is searched backwards, starting at fromIndex."
            },
            every: {
                "!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> bool",
                "!effects": ["call !0 this=!1 !this.<i> number"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/every",
                "!doc": "Tests whether all elements in the array pass the test implemented by the provided function."
            },
            some: {
                "!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> bool",
                "!effects": ["call !0 this=!1 !this.<i> number"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/some",
                "!doc": "Tests whether some element in the array passes the test implemented by the provided function."
            },
            filter: {
                "!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> !this",
                "!effects": ["call !0 this=!1 !this.<i> number"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter",
                "!doc": "Creates a new array with all elements that pass the test implemented by the provided function."
            },
            forEach: {
                "!type": "fn(f: fn(elt: ?, i: number), context?: ?)",
                "!effects": ["call !0 this=!1 !this.<i> number"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach",
                "!doc": "Executes a provided function once per array element."
            },
            map: {
                "!type": "fn(f: fn(elt: ?, i: number) -> ?, context?: ?) -> [!0.!ret]",
                "!effects": ["call !0 this=!1 !this.<i> number"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map",
                "!doc": "Creates a new array with the results of calling a provided function on every element in this array."
            },
            reduce: {
                "!type": "fn(combine: fn(sum: ?, elt: ?, i: number) -> ?, init?: ?) -> !0.!ret",
                "!effects": ["call !0 !1 !this.<i> number"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/Reduce",
                "!doc": "Apply a function against an accumulator and each value of the array (from left-to-right) as to reduce it to a single value."
            },
            reduceRight: {
                "!type": "fn(combine: fn(sum: ?, elt: ?, i: number) -> ?, init?: ?) -> !0.!ret",
                "!effects": ["call !0 !1 !this.<i> number"],
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/ReduceRight",
                "!doc": "Apply a function simultaneously against two values of the array (from right-to-left) as to reduce it to a single value."
            }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array",
        "!doc": "The JavaScript Array global object is a constructor for arrays, which are high-level, list-like objects."
    },
    String: {
        "!type": "fn(value: ?) -> string",
        fromCharCode: {
            "!type": "fn(code: number) -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/fromCharCode",
            "!doc": "Returns a string created by using the specified sequence of Unicode values."
        },
        prototype: {
            "!stdProto": "String",
            length: {
                "!type": "number",
                "!url": "https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/String/length",
                "!doc": "Represents the length of a string."
            },
            "<i>": "string",
            charAt: {
                "!type": "fn(i: number) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/charAt",
                "!doc": "Returns the specified character from a string."
            },
            charCodeAt: {
                "!type": "fn(i: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/charCodeAt",
                "!doc": "Returns the numeric Unicode value of the character at the given index (except for unicode codepoints > 0x10000)."
            },
            indexOf: {
                "!type": "fn(char: string, from?: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/indexOf",
                "!doc": "Returns the index within the calling String object of the first occurrence of the specified value, starting the search at fromIndex,\nreturns -1 if the value is not found."
            },
            lastIndexOf: {
                "!type": "fn(char: string, from?: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/lastIndexOf",
                "!doc": "Returns the index within the calling String object of the last occurrence of the specified value, or -1 if not found. The calling string is searched backward, starting at fromIndex."
            },
            substring: {
                "!type": "fn(from: number, to?: number) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/substring",
                "!doc": "Returns a subset of a string between one index and another, or through the end of the string."
            },
            substr: {
                "!type": "fn(from: number, length?: number) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/substr",
                "!doc": "Returns the characters in a string beginning at the specified location through the specified number of characters."
            },
            slice: {
                "!type": "fn(from: number, to?: number) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/slice",
                "!doc": "Extracts a section of a string and returns a new string."
            },
            trim: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/Trim",
                "!doc": "Removes whitespace from both ends of the string."
            },
            toUpperCase: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toUpperCase",
                "!doc": "Returns the calling string value converted to uppercase."
            },
            toLowerCase: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toLowerCase",
                "!doc": "Returns the calling string value converted to lowercase."
            },
            toLocaleUpperCase: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase",
                "!doc": "Returns the calling string value converted to upper case, according to any locale-specific case mappings."
            },
            toLocaleLowerCase: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase",
                "!doc": "Returns the calling string value converted to lower case, according to any locale-specific case mappings."
            },
            split: {
                "!type": "fn(pattern: string) -> [string]",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/split",
                "!doc": "Splits a String object into an array of strings by separating the string into substrings."
            },
            concat: {
                "!type": "fn(other: string) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/concat",
                "!doc": "Combines the text of two or more strings and returns a new string."
            },
            localeCompare: {
                "!type": "fn(other: string) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/localeCompare",
                "!doc": "Returns a number indicating whether a reference string comes before or after or is the same as the given string in sort order."
            },
            match: {
                "!type": "fn(pattern: +RegExp) -> [string]",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/match",
                "!doc": "Used to retrieve the matches when matching a string against a regular expression."
            },
            replace: {
                "!type": "fn(pattern: +RegExp, replacement: string) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/replace",
                "!doc": "Returns a new string with some or all matches of a pattern replaced by a replacement.  The pattern can be a string or a RegExp, and the replacement can be a string or a function to be called for each match."
            },
            search: {
                "!type": "fn(pattern: +RegExp) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/search",
                "!doc": "Executes the search for a match between a regular expression and this String object."
            }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String",
        "!doc": "The String global object is a constructor for strings, or a sequence of characters."
    },
    Number: {
        "!type": "fn(value: ?) -> number",
        MAX_VALUE: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/MAX_VALUE",
            "!doc": "The maximum numeric value representable in JavaScript."
        },
        MIN_VALUE: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/MIN_VALUE",
            "!doc": "The smallest positive numeric value representable in JavaScript."
        },
        POSITIVE_INFINITY: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/POSITIVE_INFINITY",
            "!doc": "A value representing the positive Infinity value."
        },
        NEGATIVE_INFINITY: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/NEGATIVE_INFINITY",
            "!doc": "A value representing the negative Infinity value."
        },
        prototype: {
            "!stdProto": "Number",
            toString: {
                "!type": "fn(radix?: number) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toString",
                "!doc": "Returns a string representing the specified Number object"
            },
            toFixed: {
                "!type": "fn(digits: number) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed",
                "!doc": "Formats a number using fixed-point notation"
            },
            toExponential: {
                "!type": "fn(digits: number) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toExponential",
                "!doc": "Returns a string representing the Number object in exponential notation"
            },
            toPrecision: {
                "!type": "fn(digits: number) -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toPrecision",
                "!doc": "The toPrecision() method returns a string representing the number to the specified precision."
            }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number",
        "!doc": "The Number JavaScript object is a wrapper object allowing you to work with numerical values. A Number object is created using the Number() constructor."
    },
    Boolean: {
        "!type": "fn(value: ?) -> bool",
        prototype: {"!stdProto": "Boolean"},
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Boolean",
        "!doc": "The Boolean object is an object wrapper for a boolean value."
    },
    RegExp: {
        "!type": "fn(source: string, flags?: string)",
        prototype: {
            "!stdProto": "RegExp",
            exec: {
                "!type": "fn(input: string) -> [string]",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec",
                "!doc": "Executes a search for a match in a specified string. Returns a result array, or null."
            },
            test: {
                "!type": "fn(input: string) -> bool",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/test",
                "!doc": "Executes the search for a match between a regular expression and a specified string. Returns true or false."
            },
            global: {
                "!type": "bool",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp",
                "!doc": "Creates a regular expression object for matching text with a pattern."
            },
            ignoreCase: {
                "!type": "bool",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp",
                "!doc": "Creates a regular expression object for matching text with a pattern."
            },
            multiline: {
                "!type": "bool",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/multiline",
                "!doc": "Reflects whether or not to search in strings across multiple lines.\n"
            },
            source: {
                "!type": "string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/source",
                "!doc": "A read-only property that contains the text of the pattern, excluding the forward slashes.\n"
            },
            lastIndex: {
                "!type": "number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/lastIndex",
                "!doc": "A read/write integer property that specifies the index at which to start the next match."
            }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp",
        "!doc": "Creates a regular expression object for matching text with a pattern."
    },
    Date: {
        "!type": "fn(ms: number)",
        parse: {
            "!type": "fn(source: string) -> +Date",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/parse",
            "!doc": "Parses a string representation of a date, and returns the number of milliseconds since January 1, 1970, 00:00:00 UTC."
        },
        UTC: {
            "!type": "fn(year: number, month: number, date: number, hour?: number, min?: number, sec?: number, ms?: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/UTC",
            "!doc": "Accepts the same parameters as the longest form of the constructor, and returns the number of milliseconds in a Date object since January 1, 1970, 00:00:00, universal time."
        },
        now: {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/now",
            "!doc": "Returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC."
        },
        prototype: {
            toUTCString: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toUTCString",
                "!doc": "Converts a date to a string, using the universal time convention."
            },
            toISOString: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toISOString",
                "!doc": "JavaScript provides a direct way to convert a date object into a string in ISO format, the ISO 8601 Extended Format."
            },
            toDateString: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toDateString",
                "!doc": "Returns the date portion of a Date object in human readable form in American English."
            },
            toTimeString: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toTimeString",
                "!doc": "Returns the time portion of a Date object in human readable form in American English."
            },
            toLocaleDateString: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toLocaleDateString",
                "!doc": "Converts a date to a string, returning the \"date\" portion using the operating system's locale's conventions.\n"
            },
            toLocaleTimeString: {
                "!type": "fn() -> string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString",
                "!doc": 'Converts a date to a string, returning the "time" portion using the current locale\'s conventions.'
            },
            getTime: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTime",
                "!doc": "Returns the numeric value corresponding to the time for the specified date according to universal time."
            },
            getFullYear: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getFullYear",
                "!doc": "Returns the year of the specified date according to local time."
            },
            getYear: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getYear",
                "!doc": "Returns the year in the specified date according to local time."
            },
            getMonth: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getMonth",
                "!doc": "Returns the month in the specified date according to local time."
            },
            getUTCMonth: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCMonth",
                "!doc": "Returns the month of the specified date according to universal time.\n"
            },
            getDate: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getDate",
                "!doc": "Returns the day of the month for the specified date according to local time."
            },
            getUTCDate: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCDate",
                "!doc": "Returns the day (date) of the month in the specified date according to universal time.\n"
            },
            getDay: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getDay",
                "!doc": "Returns the day of the week for the specified date according to local time."
            },
            getUTCDay: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCDay",
                "!doc": "Returns the day of the week in the specified date according to universal time.\n"
            },
            getHours: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getHours",
                "!doc": "Returns the hour for the specified date according to local time."
            },
            getUTCHours: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCHours",
                "!doc": "Returns the hours in the specified date according to universal time.\n"
            },
            getMinutes: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getMinutes",
                "!doc": "Returns the minutes in the specified date according to local time."
            },
            getUTCMinutes: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date",
                "!doc": "Creates JavaScript Date instances which let you work with dates and times."
            },
            getSeconds: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getSeconds",
                "!doc": "Returns the seconds in the specified date according to local time."
            },
            getUTCSeconds: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCSeconds",
                "!doc": "Returns the seconds in the specified date according to universal time.\n"
            },
            getMilliseconds: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getMilliseconds",
                "!doc": "Returns the milliseconds in the specified date according to local time."
            },
            getUTCMilliseconds: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getUTCMilliseconds",
                "!doc": "Returns the milliseconds in the specified date according to universal time.\n"
            },
            getTimezoneOffset: {
                "!type": "fn() -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset",
                "!doc": "Returns the time-zone offset from UTC, in minutes, for the current locale."
            },
            setTime: {
                "!type": "fn(date: +Date) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setTime",
                "!doc": "Sets the Date object to the time represented by a number of milliseconds since January 1, 1970, 00:00:00 UTC.\n"
            },
            setFullYear: {
                "!type": "fn(year: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setFullYear",
                "!doc": "Sets the full year for a specified date according to local time.\n"
            },
            setUTCFullYear: {
                "!type": "fn(year: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCFullYear",
                "!doc": "Sets the full year for a specified date according to universal time.\n"
            },
            setMonth: {
                "!type": "fn(month: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setMonth",
                "!doc": "Set the month for a specified date according to local time."
            },
            setUTCMonth: {
                "!type": "fn(month: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCMonth",
                "!doc": "Sets the month for a specified date according to universal time.\n"
            },
            setDate: {
                "!type": "fn(day: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setDate",
                "!doc": "Sets the day of the month for a specified date according to local time."
            },
            setUTCDate: {
                "!type": "fn(day: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCDate",
                "!doc": "Sets the day of the month for a specified date according to universal time.\n"
            },
            setHours: {
                "!type": "fn(hour: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setHours",
                "!doc": "Sets the hours for a specified date according to local time, and returns the number of milliseconds since 1 January 1970 00:00:00 UTC until the time represented by the updated Date instance."
            },
            setUTCHours: {
                "!type": "fn(hour: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCHours",
                "!doc": "Sets the hour for a specified date according to universal time.\n"
            },
            setMinutes: {
                "!type": "fn(min: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setMinutes",
                "!doc": "Sets the minutes for a specified date according to local time."
            },
            setUTCMinutes: {
                "!type": "fn(min: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCMinutes",
                "!doc": "Sets the minutes for a specified date according to universal time.\n"
            },
            setSeconds: {
                "!type": "fn(sec: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setSeconds",
                "!doc": "Sets the seconds for a specified date according to local time."
            },
            setUTCSeconds: {
                "!type": "fn(sec: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCSeconds",
                "!doc": "Sets the seconds for a specified date according to universal time.\n"
            },
            setMilliseconds: {
                "!type": "fn(ms: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setMilliseconds",
                "!doc": "Sets the milliseconds for a specified date according to local time.\n"
            },
            setUTCMilliseconds: {
                "!type": "fn(ms: number) -> number",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/setUTCMilliseconds",
                "!doc": "Sets the milliseconds for a specified date according to universal time.\n"
            }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date",
        "!doc": "Creates JavaScript Date instances which let you work with dates and times."
    },
    Error: {
        "!type": "fn(message: string)",
        prototype: {
            name: {
                "!type": "string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error/name",
                "!doc": "A name for the type of error."
            },
            message: {
                "!type": "string",
                "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error/message",
                "!doc": "A human-readable description of the error."
            }
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Error",
        "!doc": "Creates an error object."
    },
    SyntaxError: {
        "!type": "fn(message: string)",
        prototype: "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/SyntaxError",
        "!doc": "Represents an error when trying to interpret syntactically invalid code."
    },
    ReferenceError: {
        "!type": "fn(message: string)",
        prototype: "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/ReferenceError",
        "!doc": "Represents an error when a non-existent variable is referenced."
    },
    URIError: {
        "!type": "fn(message: string)",
        prototype: "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/URIError",
        "!doc": "Represents an error when a malformed URI is encountered."
    },
    EvalError: {
        "!type": "fn(message: string)",
        prototype: "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/EvalError",
        "!doc": "Represents an error regarding the eval function."
    },
    RangeError: {
        "!type": "fn(message: string)",
        prototype: "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RangeError",
        "!doc": "Represents an error when a number is not within the correct range allowed."
    },
    TypeError: {
        "!type": "fn(message: string)",
        prototype: "Error.prototype",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/TypeError",
        "!doc": "Represents an error an error when a value is not of the expected type."
    },
    parseInt: {
        "!type": "fn(string: string, radix?: number) -> number",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/parseInt",
        "!doc": "Parses a string argument and returns an integer of the specified radix or base."
    },
    parseFloat: {
        "!type": "fn(string: string) -> number",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/parseFloat",
        "!doc": "Parses a string argument and returns a floating point number."
    },
    isNaN: {
        "!type": "fn(value: number) -> bool",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/isNaN",
        "!doc": "Determines whether a value is NaN or not. Be careful, this function is broken. You may be interested in ECMAScript 6 Number.isNaN."
    },
    isFinite: {
        "!type": "fn(value: number) -> bool",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/isFinite",
        "!doc": "Determines whether the passed value is a finite number."
    },
    eval: {
        "!type": "fn(code: string) -> ?",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/eval",
        "!doc": "Evaluates JavaScript code represented as a string."
    },
    encodeURI: {
        "!type": "fn(uri: string) -> string",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURI",
        "!doc": 'Encodes a Uniform Resource Identifier (URI) by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character (will only be four escape sequences for characters composed of two "surrogate" characters).'
    },
    encodeURIComponent: {
        "!type": "fn(uri: string) -> string",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent",
        "!doc": 'Encodes a Uniform Resource Identifier (URI) component by replacing each instance of certain characters by one, two, three, or four escape sequences representing the UTF-8 encoding of the character (will only be four escape sequences for characters composed of two "surrogate" characters).'
    },
    decodeURI: {
        "!type": "fn(uri: string) -> string",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/decodeURI",
        "!doc": "Decodes a Uniform Resource Identifier (URI) previously created by encodeURI or by a similar routine."
    },
    decodeURIComponent: {
        "!type": "fn(uri: string) -> string",
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/decodeURIComponent",
        "!doc": "Decodes a Uniform Resource Identifier (URI) component previously created by encodeURIComponent or by a similar routine."
    },
    Math: {
        E: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/E",
            "!doc": "The base of natural logarithms, e, approximately 2.718."
        },
        LN2: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LN2",
            "!doc": "The natural logarithm of 2, approximately 0.693."
        },
        LN10: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LN10",
            "!doc": "The natural logarithm of 10, approximately 2.302."
        },
        LOG2E: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LOG2E",
            "!doc": "The base 2 logarithm of E (approximately 1.442)."
        },
        LOG10E: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/LOG10E",
            "!doc": "The base 10 logarithm of E (approximately 0.434)."
        },
        SQRT1_2: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/SQRT1_2",
            "!doc": "The square root of 1/2; equivalently, 1 over the square root of 2, approximately 0.707."
        },
        SQRT2: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/SQRT2",
            "!doc": "The square root of 2, approximately 1.414."
        },
        PI: {
            "!type": "number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/PI",
            "!doc": "The ratio of the circumference of a circle to its diameter, approximately 3.14159."
        },
        abs: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/abs",
            "!doc": "Returns the absolute value of a number."
        },
        cos: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/cos",
            "!doc": "Returns the cosine of a number."
        },
        sin: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/sin",
            "!doc": "Returns the sine of a number."
        },
        tan: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/tan",
            "!doc": "Returns the tangent of a number."
        },
        acos: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/acos",
            "!doc": "Returns the arccosine (in radians) of a number."
        },
        asin: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/asin",
            "!doc": "Returns the arcsine (in radians) of a number."
        },
        atan: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/atan",
            "!doc": "Returns the arctangent (in radians) of a number."
        },
        atan2: {
            "!type": "fn(y: number, x: number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/atan2",
            "!doc": "Returns the arctangent of the quotient of its arguments."
        },
        ceil: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/ceil",
            "!doc": "Returns the smallest integer greater than or equal to a number."
        },
        floor: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/floor",
            "!doc": "Returns the largest integer less than or equal to a number."
        },
        round: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/round",
            "!doc": "Returns the value of a number rounded to the nearest integer."
        },
        exp: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/exp",
            "!doc": "Returns Ex, where x is the argument, and E is Euler's constant, the base of the natural logarithms."
        },
        log: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/log",
            "!doc": "Returns the natural logarithm (base E) of a number."
        },
        sqrt: {
            "!type": "fn(number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/sqrt",
            "!doc": "Returns the square root of a number."
        },
        pow: {
            "!type": "fn(number, number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/pow",
            "!doc": "Returns base to the exponent power, that is, baseexponent."
        },
        max: {
            "!type": "fn(number, number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/max",
            "!doc": "Returns the largest of zero or more numbers."
        },
        min: {
            "!type": "fn(number, number) -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/min",
            "!doc": "Returns the smallest of zero or more numbers."
        },
        random: {
            "!type": "fn() -> number",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random",
            "!doc": "Returns a floating-point, pseudo-random number in the range [0, 1) that is, from 0 (inclusive) up to but not including 1 (exclusive), which you can then scale to your desired range."
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math",
        "!doc": "A built-in object that has properties and methods for mathematical constants and functions."
    },
    JSON: {
        parse: {
            "!type": "fn(json: string) -> ?",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/parse",
            "!doc": "Parse a string as JSON, optionally transforming the value produced by parsing."
        },
        stringify: {
            "!type": "fn(value: ?) -> string",
            "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify",
            "!doc": "Convert a value to JSON, optionally replacing values if a replacer function is specified, or optionally including only the specified properties if a replacer array is specified."
        },
        "!url": "https://developer.mozilla.org/en-US/docs/JSON",
        "!doc": "JSON (JavaScript Object Notation) is a data-interchange format.  It closely resembles a subset of JavaScript syntax, although it is not a strict subset. (See JSON in the JavaScript Reference for full details.)  It is useful when writing any kind of JavaScript-based application, including websites and browser extensions.  For example, you might store user information in JSON format in a cookie, or you might store extension preferences in JSON in a string-valued browser preference."
    }
},
    def_ecma6 = {
    "!name": "ecma6",
    "!define": {
        "Promise.prototype": {
            catch: {
                "!doc": "The catch() method returns a Promise and deals with rejected cases only. It behaves the same as calling Promise.prototype.then(undefined, onRejected).",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch",
                "!type": "fn(onRejected: fn(reason: ?))"
            },
            then: {
                "!doc": "The then() method returns a Promise. It takes two arguments, both are callback functions for the success and failure cases of the Promise.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then",
                "!type": "fn(onFulfilled: fn(value: ?), onRejected: fn(reason: ?))",
                "!effects": ["call !0 !this.value"]
            }
        }, promiseReject: {"!type": "fn(reason: ?)"}
    },
    Array: {
        from: {
            "!type": "fn(arrayLike: [], mapFn?: fn(), thisArg?: ?) -> !custom:Array_ctor",
            "!doc": "The Array.from() method creates a new Array instance from an array-like or iterable object.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from"
        },
        of: {
            "!type": "fn(elementN: ?) -> !custom:Array_ctor",
            "!doc": "The Array.of() method creates a new Array instance with a variable number of arguments, regardless of number or type of the arguments.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of"
        },
        prototype: {
            copyWithin: {
                "!type": "fn(target: number, start: number, end?: number) -> !custom:Array_ctor",
                "!doc": "The copyWithin() method copies the sequence of array elements within the array to the position starting at target. The copy is taken from the index positions of the second and third arguments start and end. The end argument is optional and defaults to the length of the array.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin"
            },
            entries: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The entries() method returns a new Array Iterator object that contains the key/value pairs for each index in the array.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/entries"
            },
            fill: {
                "!type": "fn(value: ?, start?: number, end?: number)",
                "!doc": "The fill() method fills all the elements of an array from a start index to an end index with a static value.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill"
            },
            find: {
                "!type": "fn(callback: fn(element: ?, index: number, array: []), thisArg?: ?) -> ?",
                "!doc": "The find() method returns a value in the array, if an element in the array satisfies the provided testing function. Otherwise undefined is returned.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find"
            },
            findIndex: {
                "!type": "fn(callback: fn(element: ?, index: number, array: []), thisArg?: ?) -> number",
                "!doc": "The findIndex() method returns an index in the array, if an element in the array satisfies the provided testing function. Otherwise -1 is returned.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex"
            },
            keys: {
                "!type": "fn() -> !custom:Array_ctor",
                "!doc": "The keys() method returns a new Array Iterator that contains the keys for each index in the array.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/keys"
            },
            values: {
                "!type": "fn() -> !custom:Array_ctor",
                "!doc": "The values() method returns a new Array Iterator object that contains the values for each index in the array.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/values"
            }
        }
    },
    ArrayBuffer: {
        "!type": "fn(length: number)",
        "!doc": "The ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer. You can not directly manipulate the contents of an ArrayBuffer; instead, you create one of the typed array objects or a DataView object which represents the buffer in a specific format, and use that to read and write the contents of the buffer.",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer",
        isView: {
            "!type": "fn(arg: ?) -> bool",
            "!doc": "The ArrayBuffer.isView() method returns true if arg is a view one of the ArrayBuffer views, such as typed array objects or a DataView; false otherwise.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView"
        },
        transfer: {
            "!type": "fn(oldBuffer: ?, newByteLength: ?)",
            "!doc": "The static ArrayBuffer.transfer() method returns a new ArrayBuffer whose contents are taken from the oldBuffer's data and then is either truncated or zero-extended by newByteLength. If newByteLength is undefined, the byteLength of the oldBuffer is used. This operation leaves oldBuffer in a detached state.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer"
        },
        prototype: {
            byteLength: {
                "!type": "number",
                "!doc": "The byteLength accessor property represents the length of an ArrayBuffer in bytes.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/byteLength"
            },
            slice: {
                "!type": "fn(begin: number, end?: number) -> +ArrayBuffer",
                "!doc": "The slice() method returns a new ArrayBuffer whose contents are a copy of this ArrayBuffer's bytes from begin, inclusive, up to end, exclusive.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/slice"
            }
        }
    },
    DataView: {
        "!type": "fn(buffer: +ArrayBuffer, byteOffset?: number, byteLength?: number)",
        "!doc": "The DataView view provides a low-level interface for reading data from and writing it to an ArrayBuffer.",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView",
        prototype: {
            buffer: {
                "!type": "+ArrayBuffer",
                "!doc": "The buffer accessor property represents the ArrayBuffer referenced by the DataView at construction time.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/buffer"
            },
            byteLength: {
                "!type": "number",
                "!doc": "The byteLength accessor property represents the length (in bytes) of this view from the start of its ArrayBuffer.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/byteLength"
            },
            byteOffset: {
                "!type": "number",
                "!doc": "The byteOffset accessor property represents the offset (in bytes) of this view from the start of its ArrayBuffer.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/byteOffset"
            },
            getFloat32: {
                "!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
                "!doc": "The getFloat32() method gets a signed 32-bit integer (float) at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getFloat32"
            },
            getFloat64: {
                "!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
                "!doc": "The getFloat64() method gets a signed 64-bit float (double) at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getFloat64"
            },
            getInt16: {
                "!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
                "!doc": "The getInt16() method gets a signed 16-bit integer (short) at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt16"
            },
            getInt32: {
                "!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
                "!doc": "The getInt32() method gets a signed 32-bit integer (long) at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt32"
            },
            getInt8: {
                "!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
                "!doc": "The getInt8() method gets a signed 8-bit integer (byte) at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getInt8"
            },
            getUint16: {
                "!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
                "!doc": "The getUint16() method gets an unsigned 16-bit integer (unsigned short) at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint16"
            },
            getUint32: {
                "!type": "fn(byteOffset: number, littleEndian?: bool) -> number",
                "!doc": "The getUint32() method gets an unsigned 32-bit integer (unsigned long) at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint32"
            },
            getUint8: {
                "!type": "fn(byteOffset: number) -> number",
                "!doc": "The getUint8() method gets an unsigned 8-bit integer (unsigned byte) at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint8"
            },
            setFloat32: {
                "!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
                "!doc": "The setFloat32() method stores a signed 32-bit integer (float) value at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setFloat32"
            },
            setFloat64: {
                "!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
                "!doc": "The setFloat64() method stores a signed 64-bit integer (double) value at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setFloat64"
            },
            setInt16: {
                "!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
                "!doc": "The setInt16() method stores a signed 16-bit integer (short) value at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt16"
            },
            setInt32: {
                "!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
                "!doc": "The setInt32() method stores a signed 32-bit integer (long) value at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt32"
            },
            setInt8: {
                "!type": "fn(byteOffset: number, value: number)",
                "!doc": "The setInt8() method stores a signed 8-bit integer (byte) value at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt8"
            },
            setUint16: {
                "!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
                "!doc": "The setUint16() method stores an unsigned 16-bit integer (unsigned short) value at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setUint16"
            },
            setUint32: {
                "!type": "fn(byteOffset: number, value: number, littleEndian?: bool)",
                "!doc": "The setUint32() method stores an unsigned 32-bit integer (unsigned long) value at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setUint32"
            },
            setUint8: {
                "!type": "fn(byteOffset: number, value: number)",
                "!doc": "The setUint8() method stores an unsigned 8-bit integer (byte) value at the specified byte offset from the start of the DataView.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setUint8"
            }
        }
    },
    Float32Array: {
        "!type": "fn(length: number)",
        "!doc": "The Float32Array typed array represents an array of 32-bit floating point numbers (corresponding to the C float data type) in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array",
        prototype: {"!proto": "TypedArray.prototype"},
        length: "TypedArray.length",
        BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
        name: "TypedArray.name",
        from: "TypedArray.from",
        of: "TypedArray.of"
    },
    Float64Array: {
        "!type": "fn(length: number)",
        "!doc": "The Float64Array typed array represents an array of 64-bit floating point numbers (corresponding to the C double data type) in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array",
        prototype: {"!proto": "TypedArray.prototype"},
        length: "TypedArray.length",
        BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
        name: "TypedArray.name",
        from: "TypedArray.from",
        of: "TypedArray.of"
    },
    Int16Array: {
        "!type": "fn(length: number)",
        "!doc": "The Int16Array typed array represents an array of twos-complement 16-bit signed integers in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array",
        prototype: {"!proto": "TypedArray.prototype"},
        length: "TypedArray.length",
        BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
        name: "TypedArray.name",
        from: "TypedArray.from",
        of: "TypedArray.of"
    },
    Int32Array: {
        "!type": "fn(length: number)",
        "!doc": "The Int32Array typed array represents an array of twos-complement 32-bit signed integers in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array",
        prototype: {"!proto": "TypedArray.prototype"},
        length: "TypedArray.length",
        BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
        name: "TypedArray.name",
        from: "TypedArray.from",
        of: "TypedArray.of"
    },
    Int8Array: {
        "!type": "fn(length: number)",
        "!doc": "The Int8Array typed array represents an array of twos-complement 8-bit signed integers. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array",
        prototype: {"!proto": "TypedArray.prototype"},
        length: "TypedArray.length",
        BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
        name: "TypedArray.name",
        from: "TypedArray.from",
        of: "TypedArray.of"
    },
    Map: {
        "!type": "fn(iterable?: [])",
        "!doc": "The Map object is a simple key/value map. Any value (both objects and primitive values) may be used as either a key or a value.",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
        prototype: {
            clear: {
                "!type": "fn()",
                "!doc": "The clear() method removes all elements from a Map object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear"
            },
            delete: {
                "!type": "fn(key: ?)",
                "!doc": "The delete() method removes the specified element from a Map object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete"
            },
            entries: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The entries() method returns a new Iterator object that contains the [key, value] pairs for each element in the Map object in insertion order.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries"
            },
            forEach: {
                "!type": "fn(callback: fn(value: ?, key: ?, map: +Map), thisArg?: ?)",
                "!effects": ["call !0 this=!1 !this.<i> number !this"],
                "!doc": "The forEach() method executes a provided function once per each key/value pair in the Map object, in insertion order.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach"
            },
            get: {
                "!type": "fn(key: ?) -> !this.<i>",
                "!doc": "The get() method returns a specified element from a Map object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get"
            },
            has: {
                "!type": "fn(key: ?) -> bool",
                "!doc": "The has() method returns a boolean indicating whether an element with the specified key exists or not.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has"
            },
            keys: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The keys() method returns a new Iterator object that contains the keys for each element in the Map object in insertion order.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys"
            },
            set: {
                "!type": "fn(key: ?, value: ?) -> !this",
                "!doc": "The set() method adds a new element with a specified key and value to a Map object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set"
            },
            size: {
                "!type": "number",
                "!doc": "The size accessor property returns the number of elements in a Map object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size"
            },
            values: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The values() method returns a new Iterator object that contains the values for each element in the Map object in insertion order.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values"
            },
            "prototype[@@iterator]": {
                "!type": "fn()",
                "!doc": "The initial value of the @@iterator property is the same function object as the initial value of the entries property.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@iterator"
            }
        }
    },
    Math: {
        acosh: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.acosh() function returns the hyperbolic arc-cosine of a number, that is",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acosh"
        },
        asinh: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.asinh() function returns the hyperbolic arcsine of a number, that is",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/asinh"
        },
        atanh: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.atanh() function returns the hyperbolic arctangent of a number, that is",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atanh"
        },
        cbrt: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.cbrt() function returns the cube root of a number, that is",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cbrt"
        },
        clz32: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.clz32() function returns the number of leading zero bits in the 32-bit binary representation of a number.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32"
        },
        cosh: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.cosh() function returns the hyperbolic cosine of a number, that can be expressed using the constant e:",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cosh"
        },
        expm1: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.expm1() function returns ex - 1, where x is the argument, and e the base of the natural logarithms.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/expm1"
        },
        fround: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.fround() function returns the nearest single precision float representation of a number.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround"
        },
        hypot: {
            "!type": "fn(value: number) -> number",
            "!doc": "The Math.hypot() function returns the square root of the sum of squares of its arguments, that is",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot"
        },
        imul: {
            "!type": "fn(a: number, b: number) -> number",
            "!doc": "The Math.imul() function returns the result of the C-like 32-bit multiplication of the two parameters.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul"
        },
        log10: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.log10() function returns the base 10 logarithm of a number, that is",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log10"
        },
        log1p: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.log1p() function returns the natural logarithm (base e) of 1 + a number, that is",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log1p"
        },
        log2: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.log2() function returns the base 2 logarithm of a number, that is",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log2"
        },
        sign: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.sign() function returns the sign of a number, indicating whether the number is positive, negative or zero.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign"
        },
        sinh: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.sinh() function returns the hyperbolic sine of a number, that can be expressed using the constant e:",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sinh"
        },
        tanh: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.tanh() function returns the hyperbolic tangent of a number, that is",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tanh"
        },
        trunc: {
            "!type": "fn(x: number) -> number",
            "!doc": "The Math.trunc() function returns the integral part of a number by removing any fractional digits. It does not round any numbers. The function can be expressed with the floor() and ceil() function:",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc"
        }
    },
    Number: {
        EPSILON: {
            "!type": "number",
            "!doc": "The Number.EPSILON property represents the difference between one and the smallest value greater than one that can be represented as a Number.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON"
        },
        MAX_SAFE_INTEGER: {
            "!type": "number",
            "!doc": "The Number.MAX_SAFE_INTEGER constant represents the maximum safe integer in JavaScript (253 - 1).",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER"
        },
        MIN_SAFE_INTEGER: {
            "!type": "number",
            "!doc": "The Number.MIN_SAFE_INTEGER constant represents the minimum safe integer in JavaScript (-(253 - 1)).",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MIN_SAFE_INTEGER"
        },
        isFinite: {
            "!type": "fn(testValue: ?) -> bool",
            "!doc": "The Number.isFinite() method determines whether the passed value is finite.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite"
        },
        isInteger: {
            "!type": "fn(testValue: ?) -> bool",
            "!doc": "The Number.isInteger() method determines whether the passed value is an integer.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger"
        },
        isNaN: {
            "!type": "fn(testValue: ?) -> bool",
            "!doc": "The Number.isNaN() method determines whether the passed value is NaN. More robust version of the original global isNaN().",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN"
        },
        isSafeInteger: {
            "!type": "fn(testValue: ?) -> bool",
            "!doc": "The Number.isSafeInteger() method determines whether the provided value is a number that is a safe integer. A safe integer is an integer that",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger"
        },
        parseFloat: {
            "!type": "fn(string: string) -> number",
            "!doc": "The Number.parseFloat() method parses a string argument and returns a floating point number. This method behaves identically to the global function parseFloat() and is part of ECMAScript 6 (its purpose is modularization of globals).",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat"
        },
        parseInt: {
            "!type": "fn(string: string, radix?: number) -> number",
            "!doc": "The Number.parseInt() method parses a string argument and returns an integer of the specified radix or base. This method behaves identically to the global function parseInt() and is part of ECMAScript 6 (its purpose is modularization of globals).",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseInt"
        }
    },
    Object: {
        assign: {
            "!type": "fn(target: ?, sources: ?) -> ?",
            "!doc": "The Object.assign() method is used to copy the values of all enumerable own properties from one or more source objects to a target object. It will return the target object.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign"
        },
        getOwnPropertySymbols: {
            "!type": "fn(obj: ?) -> [?]",
            "!doc": "The Object.getOwnPropertySymbols() method returns an array of all symbol properties found directly upon a given object.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols"
        },
        is: {
            "!type": "fn(value1: ?, value2: ?) -> bool",
            "!doc": "The Object.is() method determines whether two values are the same value.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is"
        },
        setPrototypeOf: {
            "!type": "fn(obj: ?, prototype: ?)",
            "!doc": "The Object.setPrototype() method sets the prototype (i.e., the internal [[Prototype]] property) of a specified object to another object or null.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf"
        }
    },
    Promise: {
        "!type": "fn(executor: fn(resolve: fn(value: ?), reject: promiseReject)) -> !custom:Promise_ctor",
        "!doc": "The Promise object is used for deferred and asynchronous computations. A Promise is in one of the three states:",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
        all: {
            "!type": "fn(iterable: [+Promise]) -> !0.<i>",
            "!doc": "The Promise.all(iterable) method returns a promise that resolves when all of the promises in the iterable argument have resolved.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all"
        },
        race: {
            "!type": "fn(iterable: [+Promise]) -> !0.<i>",
            "!doc": "The Promise.race(iterable) method returns a promise that resolves or rejects as soon as one of the promises in the iterable resolves or rejects, with the value or reason from that promise.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race"
        },
        reject: {
            "!type": "fn(reason: ?) -> !this",
            "!doc": "The Promise.reject(reason) method returns a Promise object that is rejected with the given reason.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject"
        },
        resolve: {
            "!type": "fn(value: ?) -> +Promise[value=!0]",
            "!doc": "The Promise.resolve(value) method returns a Promise object that is resolved with the given value. If the value is a thenable (i.e. has a then method), the returned promise will 'follow' that thenable, adopting its eventual state; otherwise the returned promise will be fulfilled with the value.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve"
        },
        prototype: "Promise.prototype"
    },
    Proxy: {
        "!type": "fn(target: ?, handler: ?)",
        "!doc": "The Proxy object is used to define the custom behavior in JavaScript fundamental operation (e.g. property lookup, assignment, enumeration, function invocation, etc).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy",
        revocable: {
            "!doc": "The Proxy.revocable() method is used to create a revocable Proxy object.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable"
        }
    },
    RegExp: {
        prototype: {
            flags: {
                "!type": "string",
                "!doc": "The flags property returns a string consisting of the flags of the current regular expression object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/flags"
            },
            sticky: {
                "!type": "bool",
                "!doc": "The sticky property reflects whether or not the search is sticky (searches in strings only from the index indicated by the lastIndex property of this regular expression). sticky is a read-only property of an individual regular expression object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky"
            }
        }
    },
    Set: {
        "!type": "fn(iterable: [?])",
        "!doc": "The Set object lets you store unique values of any type, whether primitive values or object references.",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set",
        length: {"!type": "number", "!doc": "The value of the length property is 1."},
        prototype: {
            add: {
                "!type": "fn(value: ?) -> !this",
                "!doc": "The add() method appends a new element with a specified�value to the end of a Set object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/add"
            },
            clear: {
                "!type": "fn()",
                "!doc": "The clear() method removes all elements from a Set object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/clear"
            },
            delete: {
                "!type": "fn(value: ?) -> bool",
                "!doc": "The delete() method removes the specified element from a Set object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/delete"
            },
            entries: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The entries() method returns a new Iterator object that contains an array of [value, value] for each element in the Set object, in insertion order. For Set objects there is no key like in Map objects. However, to keep the API similar to the Map object, each entry has the same value for its key and value here, so that an array [value, value] is returned.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/entries"
            },
            forEach: {
                "!type": "fn(callback: fn(value: ?, value2: ?, set: +Set), thisArg?: ?)",
                "!effects": ["call !0 this=!1 !this.<i> number !this"]
            },
            has: {
                "!type": "fn(value: ?) -> bool",
                "!doc": "The has() method returns a boolean indicating whether an element with the specified value exists in a Set object or not.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/has"
            },
            keys: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The values() method returns a new Iterator object that contains the values for each element in the Set object in insertion order.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/keys"
            },
            size: {
                "!type": "number",
                "!doc": "The size accessor property returns the number of elements in a Set object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/size"
            },
            values: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The values() method returns a new Iterator object that contains the values for each element in the Set object in insertion order.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/values"
            },
            "prototype[@@iterator]": {
                "!type": "fn()",
                "!doc": "The initial value of the @@iterator property is the same function object as the initial value of the values property.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/@@iterator"
            }
        }
    },
    String: {
        fromCodePoint: {
            "!type": "fn(num1: ?) -> string",
            "!doc": "The static String.fromCodePoint() method returns a string created by using the specified sequence of code points.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint"
        },
        raw: {
            "!type": "fn(callSite: ?, substitutions: ?, templateString: ?) -> string",
            "!doc": "The static String.raw() method is a tag function of template strings, like the r prefix in Python or the @ prefix in C# for string literals, this function is used to get the raw string form of template strings.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw"
        },
        prototype: {
            codePointAt: {
                "!type": "fn(pos: number) -> number",
                "!doc": "The codePointAt() method returns a non-negative integer that is the UTF-16 encoded code point value.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt"
            },
            endsWith: {
                "!type": "fn(searchString: string, position?: number) -> bool",
                "!doc": "The endsWith() method determines whether a string ends with the characters of another string, returning true or false as appropriate.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith"
            },
            includes: {
                "!type": "fn(searchString: string, position?: number) -> bool",
                "!doc": "The includes() method determines whether one string may be found within another string, returning true or false as appropriate.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/contains"
            },
            normalize: {
                "!type": "fn(form: string) -> string",
                "!doc": "The normalize() method returns the Unicode Normalization Form of a given string (if the value isn't a string, it will be converted to one first).",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize"
            },
            repeat: {
                "!type": "fn(count: number) -> string",
                "!doc": "The repeat() method constructs and returns a new string which contains the specified number of copies of the string on which it was called, concatenated together.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat"
            },
            startsWith: {
                "!type": "fn(searchString: string, position?: number) -> bool",
                "!doc": "The startsWith() method determines whether a string begins with the characters of another string, returning true or false as appropriate.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith"
            }
        }
    },
    Symbol: {
        "!type": "fn(description?: string)",
        "!doc": "A symbol is a unique and immutable data type and may be used as an identifier for object properties. The symbol object is an implicit object wrapper for the symbol primitive data type.",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol",
        for: {
            "!type": "fn(key: string) -> +Symbol",
            "!doc": "The Symbol.for(key) method searches for existing symbols in a runtime-wide symbol registry with the given key and returns it if found. Otherwise a new symbol gets created in the global symbol registry with this key.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for"
        },
        keyFor: {
            "!type": "fn(sym: +Symbol) -> +Symbol",
            "!doc": "The Symbol.keyFor(sym) method retrieves a shared symbol key from the global symbol registry for the given symbol.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/keyFor"
        },
        prototype: {
            toString: {
                "!type": "fn() -> string",
                "!doc": "The toString() method returns a string representing the specified Symbol object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toString"
            },
            valueOf: {
                "!type": "fn() -> ?",
                "!doc": "The valueOf() method returns the primitive value of a Symbol object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/valueOf"
            }
        }
    },
    TypedArray: {
        "!type": "fn(length: number)",
        "!doc": "A TypedArray object describes an array-like view of an underlying binary data buffer. There is no global property named TypedArray, nor is there a directly visible TypedArray constructor.  Instead, there are a number of different global properties, whose values are typed array constructors for specific element types, listed below. On the following pages you will find common properties and methods that can be used with any typed array containing elements of any type.",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray",
        BYTES_PER_ELEMENT: {
            "!type": "number",
            "!doc": "The TypedArray.BYTES_PER_ELEMENT property represents the size in bytes of each element in an typed array.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/BYTES_PER_ELEMENT"
        },
        length: {
            "!type": "number",
            "!doc": "The length accessor property represents the length (in elements) of a typed array.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/length"
        },
        name: {
            "!type": "string",
            "!doc": "The TypedArray.name property represents a string value of the typed array constructor name.",
            "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/name"
        },
        prototype: {
            buffer: {
                "!type": "+ArrayBuffer",
                "!doc": "The buffer accessor property represents the ArrayBuffer referenced by a TypedArray at construction time.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/buffer"
            },
            byteLength: {
                "!type": "number",
                "!doc": "The byteLength accessor property represents the length (in bytes) of a typed array from the start of its ArrayBuffer.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/byteLength"
            },
            byteOffset: {
                "!type": "number",
                "!doc": "The byteOffset accessor property represents the offset (in bytes) of a typed array from the start of its ArrayBuffer.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/byteOffset"
            },
            copyWithin: {
                "!type": "fn(target: number, start: number, end?: number) -> ?",
                "!doc": "The copyWithin() method copies the sequence of array elements within the array to the position starting at target. The copy is taken from the index positions of the second and third arguments start and end. The end argument is optional and defaults to the length of the array. This method has the same algorithm as Array.prototype.copyWithin. TypedArray is one of the typed array types here.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/copyWithin"
            },
            entries: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The entries() method returns a new Array Iterator object that contains the key/value pairs for each index in the array.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/entries"
            },
            every: {
                "!type": "fn(callback: fn(currentValue: ?, index: number, array: +TypedArray) -> bool, thisArg?: ?) -> bool",
                "!effects": ["call !0 this=!1 !this.<i> number !this"],
                "!doc": "The every() method tests whether all elements in the typed array pass the test implemented by the provided function. This method has the same algorithm as Array.prototype.every(). TypedArray is one of the typed array types here.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/every"
            },
            fill: {
                "!type": "fn(value: ?, start?: number, end?: number)",
                "!doc": "The fill() method fills all the elements of a typed array from a start index to an end index with a static value. This method has the same algorithm as Array.prototype.fill(). TypedArray is one of the typed array types here.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/fill"
            },
            filter: {
                "!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> !this",
                "!effects": ["call !0 this=!1 !this.<i> number"],
                "!doc": "Creates a new array with all of the elements of this array for which the provided filtering function returns true. See also Array.prototype.filter().",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/filter"
            },
            find: {
                "!type": "fn(callback: fn(element: ?, index: number, array: +TypedArray) -> bool, thisArg?: ?) -> ?",
                "!effects": ["call !0 this=!1 !this.<i> number !this"],
                "!doc": "The find() method returns a value in the typed array, if an element satisfies the provided testing function. Otherwise undefined is returned. TypedArray is one of the typed array types here.\nSee also the findIndex() method, which returns the index of a found element in the typed array instead of its value.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/find"
            },
            findIndex: {
                "!type": "fn(callback: fn(element: ?, index: number, array: +TypedArray) -> bool, thisArg?: ?) -> number",
                "!effects": ["call !0 this=!1 !this.<i> number !this"],
                "!doc": "The findIndex() method returns an index in the typed array, if an element in the typed array satisfies the provided testing function. Otherwise -1 is returned.\nSee also the find() method, which returns the value of a found element in the typed array instead of its index.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/findIndex"
            },
            forEach: {
                "!type": "fn(callback: fn(value: ?, key: ?, array: +TypedArray), thisArg?: ?)",
                "!effects": ["call !0 this=!1 !this.<i> number !this"],
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/forEach"
            },
            includes: {
                "!type": "fn(searchElement: ?, fromIndex?: number) -> bool",
                "!doc": "The includes() method determines whether a typed array includes a certain element, returning true or false as appropriate. This method has the same algorithm as Array.prototype.includes(). TypedArray is one of the typed array types here.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/includes"
            },
            indexOf: {
                "!type": "fn(searchElement: ?, fromIndex?: number) -> number",
                "!doc": "The indexOf() method returns the first index at which a given element can be found in the typed array, or -1 if it is not present. This method has the same algorithm as Array.prototype.indexOf(). TypedArray is one of the typed array types here.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/indexOf"
            },
            join: {
                "!type": "fn(separator?: string) -> string",
                "!doc": "The join() method joins all elements of an array into a string. This method has the same algorithm as Array.prototype.join(). TypedArray is one of the typed array types here.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/join"
            },
            keys: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The keys() method returns a new Array Iterator object that contains the keys for each index in the array.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/keys"
            },
            lastIndexOf: {
                "!type": "fn(searchElement: ?, fromIndex?: number) -> number",
                "!doc": "The lastIndexOf() method returns the last index at which a given element can be found in the typed array, or -1 if it is not present. The typed array is searched backwards, starting at fromIndex. This method has the same algorithm as Array.prototype.lastIndexOf(). TypedArray is one of the typed array types here.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/lastIndexOf"
            },
            length: {
                "!type": "number",
                "!doc": "Returns the number of elements hold in the typed array. Fixed at construction time and thus read only.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/length"
            },
            map: {
                "!type": "fn(f: fn(elt: ?, i: number) -> ?, context?: ?) -> [!0.!ret]",
                "!effects": ["call !0 this=!1 !this.<i> number"],
                "!doc": "Creates a new array with the results of calling a provided function on every element in this array. See also Array.prototype.map().",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/map"
            },
            reduce: {
                "!type": "fn(combine: fn(sum: ?, elt: ?, i: number) -> ?, init?: ?) -> !0.!ret",
                "!effects": ["call !0 !1 !this.<i> number"],
                "!doc": "Apply a function against an accumulator and each value of the array (from left-to-right) as to reduce it to a single value. See also Array.prototype.reduce().",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/reduce"
            },
            reduceRight: {
                "!type": "fn(combine: fn(sum: ?, elt: ?, i: number) -> ?, init?: ?) -> !0.!ret",
                "!effects": ["call !0 !1 !this.<i> number"],
                "!doc": "Apply a function against an accumulator and each value of the array (from right-to-left) as to reduce it to a single value. See also Array.prototype.reduceRight().",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/reduceRight"
            },
            reverse: {
                "!type": "fn()",
                "!doc": "The reverse() method reverses a typed array in place. The first typed array element becomes the last and the last becomes the first. This method has the same algorithm as Array.prototype.reverse(). TypedArray is one of the typed array types here.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/reverse"
            },
            set: {
                "!type": "fn(array: [?], offset?: ?)",
                "!doc": "The set() method stores multiple values in the typed array, reading input values from a specified array.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/set"
            },
            slice: {
                "!type": "fn(from: number, to?: number) -> !this",
                "!type": "Extracts a section of an array and returns a new array. See also Array.prototype.slice().",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice"
            },
            some: {
                "!type": "fn(test: fn(elt: ?, i: number) -> bool, context?: ?) -> bool",
                "!effects": ["call !0 this=!1 !this.<i> number"],
                "!doc": "The some() method tests whether some element in the typed array passes the test implemented by the provided function. This method has the same algorithm as Array.prototype.some(). TypedArray is one of the typed array types here.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/some"
            },
            sort: {
                "!type": "fn(compare?: fn(a: ?, b: ?) -> number)",
                "!effects": ["call !0 !this.<i> !this.<i>"],
                "!doc": "Sorts the elements of an array in place and returns the array. See also Array.prototype.sort().",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/sort"
            },
            subarray: {
                "!type": "fn(begin?: number, end?: number) -> +TypedArray",
                "!doc": "The subarray() method returns a new TypedArray on the same ArrayBuffer store and with the same element types as for this TypedArray object. The begin offset is inclusive and the end offset is exclusive. TypedArray is one of the typed array types.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray"
            },
            values: {
                "!type": "fn() -> TODO_ITERATOR",
                "!doc": "The values() method returns a new Array Iterator object that contains the values for each index in the array.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/values"
            },
            "prototype[@@iterator]": {
                "!type": "fn()",
                "!doc": "The initial value of the @@iterator property is the same function object as the initial value of the values property.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/@@iterator"
            }
        }
    },
    Uint16Array: {
        "!type": "fn()",
        "!doc": "The Uint16Array typed array represents an array of 16-bit unsigned integers in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array",
        length: "TypedArray.length",
        BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
        name: "TypedArray.name",
        from: "TypedArray.from",
        of: "TypedArray.of",
        prototype: {"!proto": "TypedArray.prototype"}
    },
    Uint32Array: {
        "!type": "fn()",
        "!doc": "The Uint32Array typed array represents an array of 32-bit unsigned integers in the platform byte order. If control over byte order is needed, use DataView instead. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array",
        length: "TypedArray.length",
        BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
        name: "TypedArray.name",
        from: "TypedArray.from",
        of: "TypedArray.of",
        prototype: {"!proto": "TypedArray.prototype"}
    },
    Uint8Array: {
        "!type": "fn()",
        "!doc": "The Uint8Array typed array represents an array of 8-bit unsigned integers. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array",
        length: "TypedArray.length",
        BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
        name: "TypedArray.name",
        from: "TypedArray.from",
        of: "TypedArray.of",
        prototype: {"!proto": "TypedArray.prototype"}
    },
    Uint8ClampedArray: {
        "!type": "fn()",
        "!doc": "The Uint8ClampedArray typed array represents an array of 8-bit unsigned integers clamped to 0-255. The contents are initialized to 0. Once established, you can reference elements in the array using the object's methods, or using standard array index syntax (that is, using bracket notation).",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray",
        length: "TypedArray.length",
        BYTES_PER_ELEMENT: "TypedArray.BYTES_PER_ELEMENT",
        name: "TypedArray.name",
        from: "TypedArray.from",
        of: "TypedArray.of",
        prototype: {"!proto": "TypedArray.prototype"}
    },
    WeakMap: {
        "!type": "fn(iterable: [?])",
        "!doc": "The WeakMap object is a collection of key/value pairs in which the keys are objects and the values can be arbitrary values.",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap",
        prototype: {
            delete: {
                "!type": "fn(key: ?) -> bool",
                "!doc": "The delete() method removes the specified element from a WeakMap object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/delete"
            },
            get: {
                "!type": "fn(key: ?) !this.<i>",
                "!doc": "The get() method returns a specified element from a WeakMap object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/get"
            },
            has: {
                "!type": "fn(key: ?) -> bool",
                "!doc": "The has() method returns a boolean indicating whether an element with the specified key exists in the WeakMap object or not.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/has"
            },
            set: {
                "!type": "fn(key: ?, value: ?)",
                "!doc": "The set() method adds a new element with a specified key and value to a WeakMap object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/set"
            }
        }
    },
    WeakSet: {
        "!type": "fn(iterable: [?])",
        "!doc": "The WeakSet object lets you store weakly held objects in a collection.",
        "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet",
        prototype: {
            add: {
                "!type": "fn(value: ?)",
                "!doc": "The add() method appends a new object to the end of a WeakSet object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet/add"
            },
            delete: {
                "!type": "fn(value: ?) -> bool",
                "!doc": "The delete() method removes the specified element from a WeakSet object.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet/delete"
            },
            has: {
                "!type": "fn(value: ?) -> bool",
                "!doc": "The has() method returns a boolean indicating whether an object exists in a WeakSet or not.",
                "!url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet/has"
            }
        }
    }
},
    def_screeps = {
    "!name": "screeps",
    "!define": {
        object: {},
        BodyPart: {
            type: {"!doc": "One of the body part types constants", "!type": "string"},
            hits: {"!doc": "The remaining amount of hit points of this body part.", "!type": "number"},
            boost: {
                "!doc": "If the body part is boosted, this property specifies the mineral type which is used for boosting. One of the RESOURCE_* constants.",
                "!type": "string"
            }
        },
        PathStep: {x: "number", y: "number", dx: "number", dy: "number", direction: "number"},
        Path: {"!type": "[PathStep]"},
        PathfindingResult: {
            path: {"!doc": "An array of RoomPosition objects.", "!type": "[+RoomPosition]"},
            ops: {"!doc": "Total number of operations performed before this path was calculated.", "!type": "number"},
            cost: {
                "!doc": "The total cost of the path as derived from plainCost, swampCost and any given CostMatrix instances.",
                "!type": "number"
            },
            incomplete: {
                "!doc": "If the pathfinder fails to find a complete path, this will be true. Note that path will still be populated with a partial path which represents the closest path it could find given the search parameters.",
                "!type": "boolean"
            }
        },
        PathfindingOptions: {
            roomCallback: {
                "!doc": "Request from the pathfinder to generate a CostMatrix for a certain room. The callback accepts one argument, roomName. This callback will only be called once per room per search. If you are running multiple pathfinding operations in a single room and in a single tick you may consider caching your CostMatrix to speed up your code. Please read the CostMatrix documentation below for more information on CostMatrix. If you return false from the callback the requested room will not be searched, and it won't count against maxRooms",
                "!type": "fn(roomName: string) -> +CostMatrix"
            },
            plainCost: {"!doc": "Cost for walking on plain positions. The default is 1.", "!type": "number"},
            swampCost: {"!doc": "Cost for walking on swamp positions. The default is 5.", "!type": "number"},
            flee: {
                "!doc": "Instead of searching for a path to the goals this will search for a path away from the goals. The cheapest path that is out of range of every goal will be returned. The default is false.",
                "!type": "bool"
            },
            maxOps: {
                "!doc": "The maximum allowed pathfinding operations. You can limit CPU time used for the search based on ratio 1 op ~ 0.001 CPU. The default value is 2000.",
                "!type": "number"
            },
            maxRooms: {
                "!doc": "The maximum allowed rooms to search. The default is 16, maximum is 64.",
                "!type": "number"
            },
            maxCost: {
                "!doc": "The maximum allowed cost of the path returned. If at any point the pathfinder detects that it is impossible to find a path with a cost less than or equal to maxCost it will immediately halt the search. The default is Infinity.",
                "!type": "number"
            },
            heuristicWeight: {
                "!doc": "Weight to apply to the heuristic in the A* formula F = G + weight * H. Use this option only if you understand the underlying A* algorithm mechanics! The default value is 1.",
                "!type": "number"
            }
        },
        RoomFindPathOptions: {
            roomCallback: {
                "!doc": "Request from the pathfinder to generate a CostMatrix for a certain room. The callback accepts one argument, roomName. This callback will only be called once per room per search. If you are running multiple pathfinding operations in a single room and in a single tick you may consider caching your CostMatrix to speed up your code. Please read the CostMatrix documentation below for more information on CostMatrix. If you return false from the callback the requested room will not be searched, and it won't count against maxRooms",
                "!type": "fn(roomName: string) -> +CostMatrix"
            },
            plainCost: {"!doc": "Cost for walking on plain positions. The default is 1.", "!type": "number"},
            swampCost: {"!doc": "Cost for walking on swamp positions. The default is 5.", "!type": "number"},
            flee: {
                "!doc": "Instead of searching for a path to the goals this will search for a path away from the goals. The cheapest path that is out of range of every goal will be returned. The default is false.",
                "!type": "bool"
            },
            maxOps: {
                "!doc": "The maximum allowed pathfinding operations. You can limit CPU time used for the search based on ratio 1 op ~ 0.001 CPU. The default value is 2000.",
                "!type": "number"
            },
            maxRooms: {
                "!doc": "The maximum allowed rooms to search. The default is 16, maximum is 64.",
                "!type": "number"
            },
            maxCost: {
                "!doc": "The maximum allowed cost of the path returned. If at any point the pathfinder detects that it is impossible to find a path with a cost less than or equal to maxCost it will immediately halt the search. The default is Infinity.",
                "!type": "number"
            },
            heuristicWeight: {
                "!doc": "Weight to apply to the heuristic in the A* formula F = G + weight * H. Use this option only if you understand the underlying A* algorithm mechanics! The default value is 1.",
                "!type": "number"
            },
            ignoreCreeps: {
                "!doc": "Treat squares with creeps as walkable. Can be useful with too many moving creeps around or in some other cases. The default value is false.",
                "!type": "boolean"
            },
            ignoreDestructibleStructures: {
                "!doc": "Treat squares with destructible structures (constructed walls, ramparts, spawns, extensions) as walkable. The default value is false.",
                "!type": "boolean"
            },
            ignoreRoads: {
                "!doc": "Ignore road structures. Enabling this option can speed up the search. The default value is false. This is only used when the new PathFinder is enabled.",
                "!type": "boolean"
            },
            ignore: {
                "!doc": "An array of the room's objects or RoomPosition objects which should be treated as walkable tiles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).",
                "!type": "[+RoomObject]"
            },
            avoid: {
                "!doc": "An array of the room's objects or RoomPosition objects which should be treated as obstacles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).",
                "!type": "[+RoomObject]"
            },
            serialize: {
                "!doc": "If true, the result path will be serialized using Room.serializePath. The default is false.",
                "!type": "boolean"
            },
            range: {
                "!doc": "Find a path to a position in specified linear range of target. The default is 0.",
                "!type": "number"
            }
        },
        MoveToOptions: {
            roomCallback: {
                "!doc": "Request from the pathfinder to generate a CostMatrix for a certain room. The callback accepts one argument, roomName. This callback will only be called once per room per search. If you are running multiple pathfinding operations in a single room and in a single tick you may consider caching your CostMatrix to speed up your code. Please read the CostMatrix documentation below for more information on CostMatrix. If you return false from the callback the requested room will not be searched, and it won't count against maxRooms",
                "!type": "fn(roomName: string) -> +CostMatrix"
            },
            plainCost: {"!doc": "Cost for walking on plain positions. The default is 1.", "!type": "number"},
            swampCost: {"!doc": "Cost for walking on swamp positions. The default is 5.", "!type": "number"},
            flee: {
                "!doc": "Instead of searching for a path to the goals this will search for a path away from the goals. The cheapest path that is out of range of every goal will be returned. The default is false.",
                "!type": "bool"
            },
            maxOps: {
                "!doc": "The maximum allowed pathfinding operations. You can limit CPU time used for the search based on ratio 1 op ~ 0.001 CPU. The default value is 2000.",
                "!type": "number"
            },
            maxRooms: {
                "!doc": "The maximum allowed rooms to search. The default is 16, maximum is 64.",
                "!type": "number"
            },
            maxCost: {
                "!doc": "The maximum allowed cost of the path returned. If at any point the pathfinder detects that it is impossible to find a path with a cost less than or equal to maxCost it will immediately halt the search. The default is Infinity.",
                "!type": "number"
            },
            heuristicWeight: {
                "!doc": "Weight to apply to the heuristic in the A* formula F = G + weight * H. Use this option only if you understand the underlying A* algorithm mechanics! The default value is 1.",
                "!type": "number"
            },
            ignoreCreeps: {
                "!doc": "Treat squares with creeps as walkable. Can be useful with too many moving creeps around or in some other cases. The default value is false.",
                "!type": "boolean"
            },
            ignoreDestructibleStructures: {
                "!doc": "Treat squares with destructible structures (constructed walls, ramparts, spawns, extensions) as walkable. The default value is false.",
                "!type": "boolean"
            },
            ignoreRoads: {
                "!doc": "Ignore road structures. Enabling this option can speed up the search. The default value is false. This is only used when the new PathFinder is enabled.",
                "!type": "boolean"
            },
            ignore: {
                "!doc": "An array of the room's objects or RoomPosition objects which should be treated as walkable tiles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).",
                "!type": "[+RoomObject]"
            },
            avoid: {
                "!doc": "An array of the room's objects or RoomPosition objects which should be treated as obstacles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).",
                "!type": "[+RoomObject]"
            },
            serialize: {
                "!doc": "If true, the result path will be serialized using Room.serializePath. The default is false.",
                "!type": "boolean"
            },
            range: {
                "!doc": "Find a path to a position in specified linear range of target. The default is 0.",
                "!type": "number"
            },
            reusePath: {
                "!doc": "This option enables reusing the path found along multiple game ticks. It allows to save CPU time, but can result in a slightly slower creep reaction behavior. The path is stored into the creep's memory to the _move property. The reusePath value defines the amount of ticks which the path should be reused for. The default value is 5. Increase the amount to save more CPU, decrease to make the movement more consistent. Set to 0 if you want to disable path reusing.",
                "!type": "boolean"
            },
            serializeMemory: {
                "!doc": "If reusePath is enabled and this option is set to true, the path will be stored in memory in the short serialized form using Room.serializePath. The default value is true.",
                "!type": "boolean"
            },
            noPathFinding: {
                "!doc": "If this option is set to true, moveTo method will return ERR_NOT_FOUND if there is no memorized path to reuse. This can significantly save CPU time in some cases. The default value is false.",
                "!type": "boolean"
            },
            visualizePathStyle: {
                "!doc": "Draw a line along the creep’s path using RoomVisual.poly. You can provide either an empty object or custom style parameters.",
                "!type": "object"
            }
        },
        FindRouteOptions: {
            routeCallback: {
                "!doc": "This callback accepts two arguments: function(roomName, fromRoomName). It can be used to calculate the cost of entering that room. You can use this to do things like prioritize your own rooms, or avoid some rooms. You can return a floating point cost or Infinity to block the room.",
                "!type": "fn(roomName: string, fromRoomName: string) -> number"
            }
        },
        LookItem: {
            type: "string",
            creep: "+Creep",
            structure: "+Structure",
            energy: "+Resource",
            resource: "+Resource",
            flag: "+Flag",
            source: "+Source",
            constructionSite: "+ConstructionSite",
            terrain: "string"
        },
        LookArray: {"!type": "[LookItem]"},
        LookRowArray: {"!type": "[LookArray]"},
        LookAreaArray: {"!type": "[LookRowArray]"},
        MapRouteStep: {exit: "number", room: "string"},
        CostMatrix: {
            "!type": "fn()",
            "!doc": "Container for custom navigation cost data. By default PathFinder will only consider terrain data (plain, swamp, wall) — if you need to route around obstacles such as buildings or creeps you must put them into a CostMatrix. Generally you will create your CostMatrix from within roomCallback. If a non-0 value is found in a room's CostMatrix then that value will be used instead of the default terrain cost. You should avoid using large values in your CostMatrix and terrain cost flags. For example, running PathFinder.search with { plainCost: 1, swampCost: 5 } is faster than running it with {plainCost: 2, swampCost: 10 } even though your paths will be the same.",
            prototype: {
                set: {
                    "!doc": "Set the cost of a position in this CostMatrix.",
                    "!type": "fn(x: number, y: number, cost: number)"
                },
                get: {"!doc": "Get the cost of a position in this CostMatrix.", "!type": "fn(x: number, y: number)"},
                clone: {
                    "!doc": "Copy this CostMatrix into a new CostMatrix with the same data.",
                    "!type": "fn() -> +CostMatrix"
                },
                serialize: {
                    "!doc": "Returns a compact representation of this CostMatrix which can be stored via JSON.stringify",
                    "!type": "fn() -> [number]"
                }
            },
            deserialize: {
                "!doc": "Static method which deserializes a new CostMatrix using the return value of `serialize`.",
                "!type": "fn(val: [number]) -> +CostMatrix"
            }
        },
        Transaction: {
            transactionId: "string",
            time: "number",
            sender: {username: "string"},
            recipient: {username: "string"},
            resouceType: "string",
            amount: "number",
            from: "string",
            to: "string",
            description: "string",
            order: {id: "string", type: "string", price: "number"}
        },
        MarketOrder: {
            id: "string",
            created: "number",
            type: "string",
            resourceType: "string",
            roomName: "string",
            amount: "number",
            remainingAmount: "number",
            price: "number",
            active: "boolean",
            totalAmount: "number"
        },
        MarketHistoryItem: {
            resourceType: "string",
            date: "string",
            transactions: "number",
            volume: "number",
            avgPrice: "number",
            stddevPrice: "number"
        },
        HeapStatistics: {
            total_heap_size: "number",
            total_heap_size_executable: "number",
            total_physical_size: "number",
            total_available_size: "number",
            used_heap_size: "number",
            heap_size_limit: "number",
            malloced_memory: "number",
            peak_malloced_memory: "number",
            does_zap_garbage: "number",
            externally_allocated_size: "number"
        },
        Effect: {
            effect: {
                "!doc": "Effect ID of the applied effect. Can be either natural effect ID or Power ID.",
                "!type": "number"
            },
            level: {
                "!doc": "Power level of the applied effect. Absent if the effect is not a Power effect.",
                "!type": "number"
            },
            ticksRemaining: {"!doc": "How many ticks will the effect last.", "!type": "number"}
        },
        RoomTerrain: {
            "!type": "fn()",
            "!doc": "An object which provides fast access to room terrain data. These objects can be constructed for any room in the world even if you have no access to it. Technically every Room.Terrain object is a very lightweight adapter to underlying static terrain buffers with corresponding minimal accessors.",
            prototype: {
                get: {
                    "!doc": "Get terrain type at the specified room position by (x,y) coordinates. Unlike the Game.map.getTerrainAt(...) method, this one doesn't perform any string operations and returns integer terrain type values (see below).\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n\nCPU Cost: LOW",
                    "!type": "fn(x: number, y: number) -> number"
                },
                getRawBuffer: {
                    "!doc": "Get copy of underlying static terrain buffer. Current underlying representation is Uint8Array.\n\nArguments:\n* destinationArray (optional) - A typed array view in which terrain will be copied to.\n\nCPU Cost: LOW",
                    "!type": "fn(destinationArray?: bool) -> +Uint8Array"
                }
            }
        },
        StructureSpawnSpawning: {
            "!type": "fn()",
            "!doc": "Details of the creep being spawned currently that can be addressed by the StructureSpawn.spawning property.",
            prototype: {
                name: {"!doc": "The name of a new creep.", "!type": "string"},
                needTime: {"!doc": "Time needed in total to complete the spawning.", "!type": "number"},
                remainingTime: {"!doc": "Remaining time to go.", "!type": "number"},
                directions: {
                    "!doc": "An array with the spawn directions, see StructureSpawn.Spawning.setDirections.",
                    "!type": "[number]"
                },
                spawn: {"!doc": "A link to the spawn.", "!type": "+StructureSpawn"},
                cancel: {
                    "!doc": "Cancel spawning immediately. Energy spent on spawning is not returned.",
                    "!type": "fn() -> number"
                },
                setDirections: {
                    "!doc": "Set desired directions where the creep should move when spawned.\n\nArguments:\n* directions - An array with the direction constants as items.\n\nCPU cost: CONST",
                    "!type": "fn(directions: [number]) -> number"
                }
            }
        },
        Power: {
            level: {"!doc": "Current level of the power.", "!type": "number"},
            cooldown: {
                "!doc": "Cooldown ticks remaining, or undefined if the power creep is not spawned in the world.",
                "!type": "number"
            }
        },
        LineStyle: {
            width: {"!doc": "Line width, default is 0.1.", "!type": "number"},
            color: {"!doc": "Line color in any web format, default is #ffffff (white).", "!type": "string"},
            opacity: {"!doc": "Opacity value, default is 0.5.", "!type": "number"},
            lineStyle: {
                "!doc": "Either undefined (solid line), dashed, or dotted. Default is undefined.",
                "!type": "string"
            }
        },
        CircleStyle: {
            radius: {"!doc": "Circle radius, default is 0.15.", "!type": "number"},
            fill: {"!doc": "Fill color in any web format, default is #ffffff (white).", "!type": "string"},
            opacity: {"!doc": "Opacity value, default is 0.5.", "!type": "number"},
            stroke: {"!doc": "Stroke color in any web format, default is undefined (no stroke).", "!type": "string"},
            strokeWidth: {"!doc": "Stroke line width, default is 0.1.", "!type": "number"},
            lineStyle: {
                "!doc": "Either undefined (solid line), dashed, or dotted. Default is undefined.",
                "!type": "string"
            }
        },
        PolyStyle: {
            fill: {"!doc": "Fill color in any web format, default is #ffffff (white).", "!type": "string"},
            opacity: {"!doc": "Opacity value, default is 0.5.", "!type": "number"},
            stroke: {"!doc": "Stroke color in any web format, default is undefined (no stroke).", "!type": "string"},
            strokeWidth: {"!doc": "Stroke line width, default is 0.1.", "!type": "number"},
            lineStyle: {
                "!doc": "Either undefined (solid line), dashed, or dotted. Default is undefined.",
                "!type": "string"
            }
        },
        TextStyle: {
            color: {"!doc": "Font color in any web format, default is #ffffff (white).", "!type": "string"},
            font: {"!doc": "Either a number or a string in one of the following forms:\n0.7 - relative size in game coordinates\n20px - absolute size in pixels\n0.7 serif\nbold italic 1.5 Times New Roman"},
            stroke: {"!doc": "Stroke color in any web format, default is undefined (no stroke).", "!type": "string"},
            strokeWidth: {"!doc": "Stroke line width, default is 0.1.", "!type": "number"},
            backgroundColor: {
                "!doc": "Background color in any web format, default is undefined (no background). When background is enabled, text vertical align is set to middle (default is baseline).",
                "!type": "string"
            },
            backgroundPadding: {"!doc": "Background rectangle padding, default is 0.3.", "!type": "number"},
            align: {"!doc": "Text align, either center, left, or right. Default is center.", "!type": "string"},
            opacity: {"!doc": "Opacity value, default is 1.0.", "!type": "number"}
        }
    },
    RoomObject: {
        "!type": "fn()",
        "!doc": "Any object with a position in a room. Almost all game objects prototypes are derived from RoomObject.",
        prototype: {
            pos: {
                "!doc": "An object representing the position of this object in a room.",
                "!type": "+RoomPosition"
            },
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"}
        }
    },
    Store: {
        "!type": "fn()",
        "!doc": "An object that can contain resources in its cargo.",
        prototype: {
            getCapacity: {
                "!doc": "Returns capacity of this store for the specified resource, or total capacity if resource is undefined.\n\nReturns capacity number, or null in case of a not valid resource for this store type.\n\nArguments:\n* resource (optional) - The type of the resource.",
                "!type": "fn(resource?: string) -> number"
            },
            getFreeCapacity: {
                "!doc": "A shorthand for getCapacity(resource) - getUsedCapacity(resource).\n\nArguments:\n* resource (optional) - The type of the resource.",
                "!type": "fn(resource?: string) -> number"
            },
            getUsedCapacity: {
                "!doc": "Returns the capacity used by the specified resource, or total used capacity for general purpose stores if resource is undefined.\n\nReturns used capacity number, or null in case of a not valid resource for this store type.\n\nArguments:\n* resource (optional) - The type of the resource.",
                "!type": "fn(resource?: string) -> number"
            }
        }
    },
    Structure: {
        "!type": "fn()",
        "!doc": "Creeps are your units. Creeps can move, harvest energy, construct structures, attack another creeps, and perform other actions.",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            }
        }
    },
    OwnedStructure: {
        "!type": "fn()",
        "!doc": "The base prototype for a structure that has an owner. Such structures can be found using FIND_MY_STRUCTURES and FIND_HOSTILE_STRUCTURES constants.",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            }
        }
    },
    ConstructionSite: {
        "!type": "fn()",
        "!doc": "A site of a structure which is currently under construction. A construction site can be created using the 'Construct' button at the left of the game field or the Room.createConstructionSite() method. Construction sites are visible to their owners only.\n\nTo build a structure on the construction site, give a worker creep some amount of energy and perform Creep.build() action.",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            my: {"!type": "bool", "!doc": "Whether it is your own construction site."},
            owner: {
                "!doc": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            progress: {"!doc": "The current construction progress.", "!type": "number"},
            progressTotal: {
                "!doc": "The total construction progress needed for the structure to be built.",
                "!type": "number"
            },
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            remove: {"!doc": "Remove the construction site.\n\nCPU cost: CONST", "!type": "fn() -> number"}
        }
    },
    Creep: {
        "!type": "fn()",
        "!doc": "Creeps are your units. Creeps can move, harvest energy, construct structures, attack another creeps, and perform other actions.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            body: {
                "!doc": "An array describing the creep’s body.",
                "!type": "[BodyPart]",
                "!url": "http://docs.screeps.com/api/#Creep.body"
            },
            fatigue: {
                "!type": "number",
                "!doc": "The movement fatigue indicator. If it is greater than zero, the creep cannot move."
            },
            hits: {"!type": "number", "!doc": "The current amount of hit points of the creep."},
            hitsMax: {"!type": "number", "!doc": "The maximum amount of hit points of the creep."},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            memory: {"!doc": "A shorthand to `Memory.creeps[creep.name]`. You can use it for quick access the creep’s specific memory data object."},
            my: {"!type": "bool", "!doc": "Whether it is your creep or foe."},
            name: {
                "!doc": "Creep's name. You can choose the name while creating a new creep, and it cannot be changed later. This name is a hash key to access the creep via the `Game.creeps` object.",
                "!type": "string"
            },
            owner: {
                "!doc": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            spawning: {"!doc": "Whether this creep is still being spawned.", "!type": "bool"},
            ticksToLive: {
                "!doc": "The remaining amount of game ticks after which the creep will die.",
                "!type": "number"
            },
            attack: {
                "!type": "fn(target: object) -> number",
                "!doc": "Attack another creep or structure in a short-ranged attack. Requires the ATTACK body part. If the target is inside a rampart, then the rampart is attacked instead. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target object to be attacked.\n\nCPU cost: CONST"
            },
            build: {
                "!doc": "Build a structure at the target construction site using carried energy. Requires WORK and CARRY body parts. The target has to be within 3 squares range of the creep.\n\nArguments:\n* target - The target construction site to be built.\n\nCPU cost:CONST",
                "!type": "fn(target: +ConstructionSite) -> number"
            },
            cancelOrder: {
                "!doc": "Cancel the order given during the current game tick.\n\nArguments:\n* methodName - The name of a creep's method to be cancelled.\n\nCPU cost:NONE",
                "!type": "fn(methodName: string) -> number"
            },
            claimController: {
                "!doc": "Claims a neutral controller under your control. Requires the CLAIM body part. \n\nArguments:\n* target - The target controller object.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure) -> number"
            },
            attackController: {
                "!doc": "Decreases the controller's downgrade or reservation timer for 1 tick per every 5 CLAIM body parts (so the creep must have at least 5xCLAIM). The controller under attack cannot be upgraded for the next 1,000 ticks. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target controller object.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure) -> number"
            },
            getActiveBodyparts: {
                "!doc": "Get the quantity of live body parts of the given type. Fully damaged parts do not count.\n\nArguments:\n* type - A body part type, one of the body part constants.\n\nCPU cost: NONE",
                "!type": "fn(type: string) -> number"
            },
            harvest: {
                "!doc": "Harvest energy from the source. Requires the WORK body part. If the creep has an empty CARRY body part, the harvested energy is put into it; otherwise it is dropped on the ground. The target has to be at an adjacent square to the creep. You cannot harvest a source if the room controller is owned or reserved by another player.\n\nArguments:\n* target - The source object to be harvested.\n\nCPU cost: CONST",
                "!type": "fn(target: +Source) -> number"
            },
            heal: {
                "!doc": "Heal self or another creep. It will restore the target creep’s damaged body parts function and increase the hits counter. Requires the HEAL body part. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target creep object.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            move: {
                "!doc": "Move the creep one square in the specified direction. Requires the MOVE body part.\n\nArguments:\n* direction - One of the direction constants.\n\nCPU cost: CONST",
                "!type": "fn(direction: number) -> number"
            },
            moveByPath: {
                "!doc": "Move the creep using the specified predefined path. Requires the MOVE body part.\n\nArguments:\n* path - A path value as returned from `Room.findPath`, `RoomPosition.findPathTo`, or `PathFinder.search` methods. Both array form and serialized string form are accepted.\n\nCPU cost: CONST",
                "!type": "fn(path: Path) -> number"
            },
            moveTo: {
                "!doc": "Syntax:\nmoveTo(x, y, [opts])\nmoveTo(target, [opts])\n\nFind the optimal path to the target within the same room and move to it. A shorthand to consequent calls of pos.findPathTo() and move() methods. If the target is in another room, then the corresponding exit will be used as a target. Requires the MOVE body part.\n\nArguments:\n* x - X position of the target in the same room.\n* y - Y position of the target in the same room.\n* target - Can be a RoomPosition object or any object containing RoomPosition. The position doesn't have to be in the same room.\n* opts (optional) - An object containing pathfinding options flags (see Room.findPath for more info) or one of the following:\n  - reusePath - This option enables reusing the path found along multiple game ticks. It allows to save CPU time, but can result in a slightly slower creep reaction behavior. The path is stored into the creep's memory to the _move property. The reusePath value defines the amount of ticks which the path should be reused for. The default value is 5. Increase the amount to save more CPU, decrease to make the movement more consistent. Set to 0 if you want to disable path reusing.\n  - serializeMemory - If reusePath is enabled and this option is set to true, the path will be stored in memory in the short serialized form using Room.serializePath. The default value is true.\n  - noPathFinding - If this option is set to true, moveTo method will return ERR_NOT_FOUND if there is no memorized path to reuse. This can significantly save CPU time in some cases. The default value is false.\n  - visualizePathStyle - draw a line along the creep’s path using RoomVisual.poly. You can provide either an empty object or custom style parameters.\n\nCPU cost: HIGH",
                "!type": "fn(arg1: ?, arg2?: ?, arg3?: ?) -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the creep is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            pickup: {
                "!doc": "Pick up an item (a dropped piece of energy). Requires the CARRY body part. The target has to be at adjacent square to the creep or at the same square.\n\nArguments:\n* target - The target object to be picked up.\n\nCPU cost: CONST",
                "!type": "fn(target: +Resource) -> number"
            },
            rangedAttack: {
                "!doc": "A ranged attack against another creep or structure. Requires the RANGED_ATTACK body part. If the target is inside a rampart, the rampart is attacked instead. The target has to be within 3 squares range of the creep.\n\nArguments:\n* target - The target object to be attacked.\n\nCPU cost: CONST",
                "!type": "fn(target: object) -> number"
            },
            rangedHeal: {
                "!doc": "Heal another creep at a distance. It will restore the target creep’s damaged body parts function and increase the hits counter. Requires the HEAL body part. The target has to be within 3 squares range of the creep.\n\nArguments:\n* target - The target creep object.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            rangedMassAttack: {
                "!doc": "A ranged attack against all hostile creeps or structures within 3 squares range. Requires the RANGED_ATTACK body part. The attack power depends on the range to each target. Friendly units are not affected.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            repair: {
                "!doc": "Repair a damaged structure using carried energy. Requires the WORK and CARRY body parts. The target has to be within 3 squares range of the creep.\n\nArguments:\n* target - The target structure to be repaired.\n\nCPU cost: CONST",
                "!type": "fn(target: object) -> number"
            },
            reserveController: {
                "!doc": "Temporarily block a neutral controller from claiming by other players. Each tick, this command increases the counter of the period during which the controller is unavailable by 1 tick per each CLAIM body part. The maximum reservation period to maintain is 5,000 ticks. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target controller object to be reserved.\n\nCPU cost: CONST",
                "!type": "fn(target: +StructureController) -> number"
            },
            signController: {
                "!doc": "Sign a controller with a random text visible to all players. This text will appear in the room UI, in the world map, and can be accessed via the API. You can sign unowned and hostile controllers. The target has to be at adjacent square to the creep. Pass an empty string to remove the sign.\n\nArguments:\n* target - The target controller object to be signed.\n* text - The sign text. The maximum text length is 100 characters.\n\nCPU cost: CONST",
                "!type": "fn(target: +StructureController, target: string) -> number"
            },
            say: {
                "!doc": "Display a visual speech balloon above the creep with the specified message. The message will be available for one tick. You can read the last message using the `saying` property.\n\nArguments:\n* message - The message to be displayed. Maximum length is 10 characters.\n* public (optional) - Set to true to allow other players to see this message. Default is false.\n\nCPU cost: NONE",
                "!type": "fn(message: string, public?: boolean) -> number"
            },
            saying: {"!doc": "The text message that the creep was saying at the last tick.", "!type": "string"},
            suicide: {"!doc": "Kill the creep immediately.\n\nCPU cost: CONST", "!type": "fn() -> number"},
            upgradeController: {
                "!doc": "Upgrade your controller to the next level using carried energy. Upgrading controllers raises your Global Control Level in parallel. Requires WORK and CARRY body parts. The target has to be within 3 squares range of the creep. A fully upgraded level 8 controller can't be upgraded with the power over 15 energy units per tick regardless of creeps power. The cumulative effect of all the creeps performing upgradeController in the current tick is taken into account. This limit can be increased by using ghodium mineral boost.\n\nArguments:\n* target - The target controller object to be upgraded.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure) -> number"
            },
            drop: {
                "!doc": "Drop resource on the ground.\n\nArguments:\n* resourceType - One of the RESOURCE_* constants.\n* amount - The amount of resource units to be dropped.\n\nCPU cost: CONST",
                "!type": "fn(resourceType: string, amount?: number) -> number"
            },
            transfer: {
                "!doc": "Transfer resource from the creep to another creep, storage, or power spawn. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target object.\n* resourceType - One of the RESOURCE_* constants.\n* amount (optional) - The amount of resources to be transferred. If omitted, all the available carried amount is used.\n\nCPU cost: CONST",
                "!type": "fn(target: object, resourceType: string, amount?: number) -> number"
            },
            dismantle: {
                "!type": "fn(target: +Structure) -> number",
                "!doc": "Dismantles any (even hostile) structure returning 50% of the energy spent on its repair. Requires the WORK body part. If the creep has an empty CARRY body part, the energy is put into it; otherwise it is dropped on the ground. The target has to be at adjacent square to the creep.\n\nArguments:\n* target - The target structure.\n\nCPU cost: CONST"
            },
            withdraw: {
                "!doc": "Withdraw resources from a structure. The target has to be at adjacent square to the creep. Multiple creeps can withdraw from the same structure in the same tick. Your creeps can withdraw resources from hostile structures as well, in case if there is no hostile rampart on top of it.\n\nArguments:\n* target - The target object.\n* resourceType - One of the RESOURCE_* constants.\n* amount (optional) - The amount of resources to be transferred. If omitted, all the available amount is used.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure, resourceType: string, amount?: number) -> number"
            },
            generateSafeMode: {
                "!doc": "Add one more available safe mode activation to a room controller. The creep has to be at adjacent square to the target room controller and have 1000 ghodium resource.\n\nArguments:\n* target - The target room controller.\n\nCPU cost: CONST",
                "!type": "fn(target: +StructureController) -> number"
            }
        }
    },
    PowerCreep: {
        "!type": "fn()",
        "!doc": 'Power Creeps are immortal "heroes" that are tied to your account and can be respawned in any PowerSpawn after death.',
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            cancelOrder: {
                "!doc": "Cancel the order given during the current game tick.\n\nArguments:\n* methodName - The name of a power creep's method to be cancelled.\n\nCPU cost:NONE",
                "!type": "fn(methodName: string) -> number"
            },
            className: {"!type": "string", "!doc": "The power creep's class, one of the POWER_CLASS constants."},
            delete: {
                "!doc": "Delete the power creep permanently from your account. It should NOT be spawned in the world. The creep is not deleted immediately, but a 24-hours delete timer is started instead (see deleteTime). You can cancel deletion by calling delete(true).",
                "!type": "fn(cancel?: boolean) -> number"
            },
            deleteTime: {
                "!type": "number",
                "!doc": "A timestamp when this creep is marked to be permanently deleted from the account, or undefined otherwise."
            },
            drop: {
                "!doc": "Drop resource on the ground.\n\nArguments:\n* resourceType - One of the RESOURCE_* constants.\n* amount - The amount of resource units to be dropped.\n\nCPU cost: CONST",
                "!type": "fn(resourceType: string, amount?: number) -> number"
            },
            enableRoom: {
                "!doc": "Enable powers usage in this room.\n\nArguments:\n* controller - The room controller.\n\nCPU cost: CONST",
                "!type": "fn(controller: +StructureController) -> number"
            },
            hits: {"!type": "number", "!doc": "The current amount of hit points of the power creep."},
            hitsMax: {"!type": "number", "!doc": "The maximum amount of hit points of the power creep."},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            level: {"!type": "number", "!doc": "The power creep's level."},
            memory: {"!doc": "A shorthand to `Memory.powerCreeps[creep.name]`. You can use it for quick access the power creep’s specific memory data object."},
            move: {
                "!doc": "Move the power creep one square in the specified direction.\n\nArguments:\n* direction - One of the direction constants.\n\nCPU cost: CONST",
                "!type": "fn(direction: number) -> number"
            },
            moveByPath: {
                "!doc": "Move the power creep using the specified predefined path.\n\nArguments:\n* path - A path value as returned from `Room.findPath`, `RoomPosition.findPathTo`, or `PathFinder.search` methods. Both array form and serialized string form are accepted.\n\nCPU cost: CONST",
                "!type": "fn(path: Path) -> number"
            },
            moveTo: {
                "!doc": "Syntax:\nmoveTo(x, y, [opts])\nmoveTo(target, [opts])\n\nFind the optimal path to the target within the same room and move to it.\n\nArguments:\n* x - X position of the target in the same room.\n* y - Y position of the target in the same room.\n* target - Can be a RoomPosition object or any object containing RoomPosition. The position doesn't have to be in the same room.\n* opts (optional) - An object containing pathfinding options flags (see Room.findPath for more info) or one of the following:\n  - reusePath - This option enables reusing the path found along multiple game ticks. It allows to save CPU time, but can result in a slightly slower creep reaction behavior. The path is stored into the creep's memory to the _move property. The reusePath value defines the amount of ticks which the path should be reused for. The default value is 5. Increase the amount to save more CPU, decrease to make the movement more consistent. Set to 0 if you want to disable path reusing.\n  - serializeMemory - If reusePath is enabled and this option is set to true, the path will be stored in memory in the short serialized form using Room.serializePath. The default value is true.\n  - noPathFinding - If this option is set to true, moveTo method will return ERR_NOT_FOUND if there is no memorized path to reuse. This can significantly save CPU time in some cases. The default value is false.\n  - visualizePathStyle - draw a line along the creep’s path using RoomVisual.poly. You can provide either an empty object or custom style parameters.\n\nCPU cost: HIGH",
                "!type": "fn(arg1: ?, arg2?: ?, arg3?: ?) -> number"
            },
            my: {"!type": "bool", "!doc": "Whether it is your power creep or foe."},
            name: {
                "!doc": "Power creep's name. You can choose the name while creating a new power creep, and it cannot be changed later. This name is a hash key to access the creep via the `Game.powerCreeps` object.",
                "!type": "string"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the power creep is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            owner: {
                "!doc": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            pickup: {
                "!doc": "Pick up an item (a dropped piece of energy). The target has to be at adjacent square to the creep or at the same square.\n\nArguments:\n* target - The target object to be picked up.\n\nCPU cost: CONST",
                "!type": "fn(target: +Resource) -> number"
            },
            rename: {
                "!doc": "Rename the power creep. It must not be spawned in the world.\n\nArguments:\n* name - The new name of the power creep.\n\nCPU cost: NONE",
                "!type": "fn(name: string) -> number"
            },
            renew: {
                "!doc": "Instantly restore time to live to the maximum using a Power Spawn or a Power Bank nearby.\n\nArguments:\n* target - The target structure\n\nCPU cost: CONST",
                "!type": "fn(target: object) -> number"
            },
            powers: {"!doc": "Available powers, an object with power ID as a key", "!type": "[+Power]"},
            say: {
                "!doc": "Display a visual speech balloon above the power creep with the specified message. The message will be available for one tick. You can read the last message using the `saying` property.\n\nArguments:\n* message - The message to be displayed. Maximum length is 10 characters.\n* public (optional) - Set to true to allow other players to see this message. Default is false.\n\nCPU cost: NONE",
                "!type": "fn(message: string, public?: boolean) -> number"
            },
            saying: {"!doc": "The text message that the power creep was saying at the last tick.", "!type": "string"},
            shard: {"!doc": "The name of the shard where the power creep is spawned, or undefined.", "!type": "string"},
            spawn: {
                "!doc": "Spawn this power creep in the specified Power Spawn.\n\nArguments:\n* powerSpawn - Your Power Spawn structure.\n\nCPU cost: CONST",
                "!type": "fn(powerSpawn: +StructurePowerSpawn) -> number"
            },
            spawnCooldownTime: {
                "!doc": "The timestamp when spawning or deleting this creep will become available. Undefined if the power creep is spawned in the world.",
                "!type": "number"
            },
            suicide: {
                "!doc": "Kill the power creep immediately. It will not be destroyed permanently, but will become unspawned, so that you can spawn it again.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            ticksToLive: {
                "!doc": "The remaining amount of game ticks after which the creep will die and become unspawned. Undefined if the creep is not spawned in the world.",
                "!type": "number"
            },
            transfer: {
                "!doc": "Transfer resource from the power creep to another power creep, creep, or structure. The target has to be at adjacent square to the power creep.\n\nArguments:\n* target - The target object.\n* resourceType - One of the RESOURCE_* constants.\n* amount (optional) - The amount of resources to be transferred. If omitted, all the available carried amount is used.\n\nCPU cost: CONST",
                "!type": "fn(target: object, resourceType: string, amount?: number) -> number"
            },
            upgrade: {
                "!doc": "Upgrade the creep, adding a new power ability to it or increasing level of the existing power. You need one free Power Level in your account to perform this action.\n\nArguments:\n* power - The power ability to upgrade, one of the PWR_* constants.\n\nCPU cost: CONST",
                "!type": "fn(power: number) -> number"
            },
            usePower: {
                "!doc": "Apply one the creep's powers on the specified target. You can only use powers in rooms either without a controller, or with a power-enabled controller. Only one power can be used during the same tick, each usePower call will override the previous one. If the target has the same effect of a lower or equal level, it is overridden. If the existing effect level is higher, an error is returned.\n\nArguments:\n* power - The power ability to use, one of the PWR_* constants.\n* target - A target object in the room.\n\nCPU cost: CONST",
                "!type": "fn(power: number, target?: +RoomObject) -> number"
            },
            withdraw: {
                "!doc": "Withdraw resources from a structure, tombstone, or ruin. The target has to be at adjacent square to the power creep. Your power creeps can withdraw resources from hostile structures as well, in case if there is no hostile rampart on top of it.\n\nArguments:\n* target - The target object.\n* resourceType - One of the RESOURCE_* constants.\n* amount (optional) - The amount of resources to be transferred. If omitted, all the available amount is used.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure, resourceType: string, amount?: number) -> number"
            }
        },
        create: {
            "!doc": "A static method to create new Power Creep instance in your account. It will be added in an unspawned state, use spawn method to spawn it in the world.\nYou need one free Power Level in your account to perform this action.\n\nArguments:\n* name - The name of the new power creep.\n* className - The class of the new power creep, one of the POWER_CLASS constants.\n\nCPU cost: CONST",
            "!type": "fn(name: string, className: string) -> number"
        }
    },
    Resource: {
        "!type": "fn()",
        "!doc": "A dropped pile of resource units, either energy or power. Dropped energy pile decays for `ceil(amount/1000)` units per tick if not picked up.",
        prototype: {
            pos: {
                "!doc": "An object representing the position of this object in a room.",
                "!type": "+RoomPosition"
            },
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            amount: {"!doc": "The amount of resource units containing.", "!type": "number"},
            resourceType: {"!doc": "One of the RESOURCE_* constants.", "!type": "string"}
        }
    },
    Flag: {
        "!type": "fn()",
        "!doc": "A flag. Flags can be used to mark particular spots in a room. Flags are visible to their owners only.",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            color: {"!doc": "Primary color of the flag. One of the COLOR_* constants.", "!type": "string"},
            secondaryColor: {"!doc": "Secondary color of the flag. One of the COLOR_* constants.", "!type": "string"},
            memory: {"!doc": "A shorthand to Memory.flags[flag.name]. You can use it for quick access the flag's specific memory data object."},
            name: {
                "!doc": "Flag’s name. You can choose the name while creating a new flag, and it cannot be changed later. This name is a hash key to access the spawn via the Game.flags object.",
                "!type": "string"
            },
            remove: {"!doc": "Remove the flag.\n\nCPU cost: CONST", "!type": "fn() -> number"},
            setColor: {
                "!doc": "Set new color of the flag\n\nArguments:\n* color - One of the COLOR_* constants\n* secondaryColor (optional) - One of the COLOR_* constants.\n\nCPU cost: CONST",
                "!type": "fn(color: string, secondaryColor: string) -> number"
            },
            setPosition: {
                "!doc": "Syntax:\nsetPosition(x,y)\nsetPosition(pos)\n\nSet new position of the flag.\n\nArguments:\n* x - The X position in the room.\n* y - The Y position in the room.\n* pos - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: CONST",
                "!type": "fn(arg1: ?, arg2?: ?) -> number"
            }
        }
    },
    Source: {
        "!type": "fn()",
        "!doc": "An energy source object. Can be harvested by creeps with a WORK body part.",
        prototype: {
            pos: {
                "!doc": "An object representing the position of this object in a room.",
                "!type": "+RoomPosition"
            },
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            energy: {"!doc": "The remaining amount of energy.", "!type": "number"},
            energyCapacity: {
                "!doc": "The total amount of energy in the source. Equals to 3000 in most cases.",
                "!type": "number"
            },
            ticksToRegeneration: {
                "!doc": "The remaining time after which the source will be refilled.",
                "!type": "number"
            }
        }
    },
    Mineral: {
        "!type": "fn()",
        "!doc": "A mineral deposit object. Can be harvested by creeps with a WORK body part using the extractor structure.",
        prototype: {
            pos: {
                "!doc": "An object representing the position of this object in a room.",
                "!type": "+RoomPosition"
            },
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            mineralAmount: {"!doc": "The remaining amount of resource.", "!type": "number"},
            mineralType: {"!doc": "The resource type, one of the RESOURCE_* constants.", "!type": "string"},
            ticksToRegeneration: {
                "!doc": "The remaining time after which the deposit will be refilled.",
                "!type": "number"
            },
            density: {"!doc": "The density of this mineral deposit, one of the DENSITY_* constants.", "!type": "number"}
        }
    },
    Nuke: {
        "!type": "fn()",
        "!doc": "",
        prototype: {
            pos: {
                "!doc": "An object representing the position of this object in a room.",
                "!type": "+RoomPosition"
            },
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            launchRoomName: {"!type": "string", "!doc": "The name of the room where this nuke has been launched from."},
            timeToLand: {"!type": "number", "!doc": "The remaining landing time."}
        }
    },
    StructureContainer: {
        "!type": "fn()",
        "!doc": "A small container that can be used to store resources. This is a walkable structure. All dropped resources automatically goes to the container at the same tile.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            ticksToDecay: {
                "!doc": "The amount of game ticks when this container will lose some hit points.",
                "!type": "number"
            }
        }
    },
    StructureController: {
        "!type": "fn()",
        "!doc": "Claim this structure to take control over the room. The controller structure cannot be damaged or destroyed. It can be addressed by Room.controller property.",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            isPowerEnabled: {
                "!doc": "Whether using power is enabled in this room. Use PowerCreep.enableRoom to turn powers on.",
                "!type": "number"
            },
            level: {"!doc": "Current controller level, from 0 to 8.", "!type": "number"},
            progress: {
                "!doc": "The current progress of upgrading the controller to the next level.",
                "!type": "number"
            },
            progressTotal: {"!doc": "The progress needed to reach the next level.", "!type": "number"},
            reservation: {
                "!doc": "An object with the controller reservation info if present.",
                username: {"!doc": "The name of a player who reserved this controller.", "!type": "string"},
                ticksToEnd: {"!doc": "The amount of game ticks when the reservation will end.", "!type": "number"}
            },
            sign: {
                "!doc": "An object with the controller sign info if present.",
                username: {"!doc": "The name of a player who signed this controller.", "!type": "string"},
                text: {"!doc": "The sign text.", "!type": "string"},
                time: {"!doc": "The sign time in game ticks.", "!type": "number"},
                datetime: {"!doc": "The sign real date.", "!type": "Date"}
            },
            ticksToDowngrade: {
                "!doc": "The amount of game ticks when this controller will lose one level. This timer can be reset by using Creep.upgradeController.",
                "!type": "number"
            },
            upgradeBlocked: {
                "!doc": "The amount of game ticks while this controller cannot be upgraded due to attack.",
                "!type": "number"
            },
            unclaim: {
                "!doc": "Make your claimed controller neutral again.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            safeMode: {"!doc": "How many ticks of safe mode remaining, or undefined.", "!type": "number"},
            safeModeAvailable: {"!doc": "Safe mode activations available to use.", "!type": "number"},
            safeModeCooldown: {
                "!doc": "During this period in ticks new safe mode activations will be blocked, undefined if cooldown is inactive.",
                "!type": "number"
            },
            activateSafeMode: {
                "!doc": "Activate safe mode if available.\n\nArguments:\n* \n\nCPU cost: CONST",
                "!type": "fn() -> number"
            }
        }
    },
    StructureExtension: {
        "!type": "fn()",
        "!doc": "Contains energy which can be spent on spawning bigger creeps. Extensions can be placed anywhere in the room, any spawns will be able to use them regardless of distance.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            }
        }
    },
    StructureExtractor: {
        "!type": "fn()", "!doc": "Allows to harvest a mineral deposit.", prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            cooldown: {"!doc": "The amount of game ticks until the next harvest action is possible.", "!type": "number"}
        }
    },
    StructureKeeperLair: {
        "!type": "fn()",
        "!doc": "Non-player structure. Spawns NPC Source Keepers that guards energy sources and minerals in some rooms. This structure cannot be destroyed.",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            ticksToSpawn: {"!doc": "Time to spawning of the next Source Keeper.", "!type": "number"}
        }
    },
    StructureLab: {
        "!type": "fn()", "!doc": "Produces mineral compounds from base minerals and boosts creeps.", prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            cooldown: {
                "!doc": "The amount of game ticks the lab has to wait until the next reaction is possible.",
                "!type": "number"
            },
            mineralType: {
                "!doc": "The type of minerals containing in the lab. Labs can contain only one mineral type at the same time.",
                "!type": "number"
            },
            boostCreep: {
                "!doc": "Boosts creep body part using the containing mineral compound. The creep has to be at adjacent square to the lab. Boosting one body part consumes 30 mineral units and 20 energy units.\n\nArguments:\n* creep - The target creep.\n* bodyPartsCount (optional) - The number of body parts of the corresponding type to be boosted. Body parts are always counted left-to-right for TOUGH, and right-to-left for other types. If undefined, all the eligible body parts are boosted.\n\nCPU cost: CONST",
                "!type": "fn(creep: +Creep, bodyPartsCount?: number) -> number"
            },
            runReaction: {
                "!doc": "Produce mineral compounds using reagents from two another labs. Labs have to be within 2 squares range. Each reaction produces 10 mineral units and has a 10 ticks cooldown period. The same input labs can be used by many output labs.\n\nArguments:\n* lab1 - The first source lab.\n* lab2 - The second source lab.\n\nCPU cost: CONST",
                "!type": "fn(lab1: +Structure, lab2: +Structure) -> number"
            },
            unboostCreep: {
                "!doc": "Immediately remove boosts from the creep and drop 50% of the mineral compounds used to boost it onto the ground regardless of the creep's remaining time to live. The creep has to be at adjacent square to the lab. Unboosting requires cooldown time equal to the total sum of the reactions needed to produce all the compounds applied to the creep.\n\nArguments:\n* creep - The target creep.\n\nCPU cost: CONST",
                "!type": "fn(creep: +Creep) -> number"
            }
        }
    },
    StructureLink: {
        "!type": "fn()", "!doc": "Remotely transfers energy to another Link in the same room.", prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            cooldown: {
                "!doc": "The amount of game ticks the link has to wait until the next transfer is possible.",
                "!type": "number"
            },
            transferEnergy: {
                "!doc": "Transfer energy from the link to another link or a creep. If the target is a creep, it has to be at adjacent square to the link. If the target is a link, it can be at any location in the same room. Remote transfer process implies 3% energy loss and cooldown delay depending on the distance.\n\nArguments:\n* target - The target object.\n* amount (optional) - The amount of energy to be transferred. If omitted, all the available energy is used.\n\nCPU cost: CONST",
                "!type": "fn(target: object, amount: number) -> number"
            }
        }
    },
    StructureObserver: {
        "!type": "fn()", "!doc": "Provides visibility into a distant room from your script.", prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            observeRoom: {
                "!doc": "Provide visibility into a distant room from your script. The target room object will be available on the next tick. The maximum range is 5 rooms.\n\nArguments:\n* roomName - The name of the target room.\n\nCPU cost: CONST",
                "!type": "fn(roomName: string) -> number"
            }
        }
    },
    StructurePowerBank: {
        "!type": "fn()",
        "!doc": "Non-player structure. Contains power resource which can be obtained by destroying the structure. Hits the attacker creep back on each attack. ",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            power: {"!doc": "The amount of power containing.", "!type": "number"},
            ticksToDecay: {"!doc": "The amount of game ticks when this structure will disappear.", "!type": "number"}
        }
    },
    StructurePowerSpawn: {
        "!type": "fn()",
        "!doc": "Processes power into your account, and spawns power creeps with special unique powers (in development).",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            processPower: {
                "!doc": "Register power resource units into your account. Registered power allows to develop power creeps skills. Consumes 1 power resource unit and 50 energy resource units.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            }
        }
    },
    StructureRampart: {
        "!type": "fn()",
        "!doc": "Blocks movement of hostile creeps, and defends your creeps and structures on the same tile.",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            ticksToDecay: {
                "!doc": "The amount of game ticks when this rampart will lose some hit points.",
                "!type": "number"
            },
            isPublic: {
                "!doc": "If false (default), only your creeps can step on the same square. If true, any hostile creeps can pass through.",
                "!type": "bool"
            },
            setPublic: {
                "!doc": "Make this rampart public to allow other players' creeps to pass through.\n\nArguments:\n* isPublic - Whether this rampart should be public or non-public.\n\nCPU cost: CONST",
                "!type": "fn(isPublic) -> number"
            }
        }
    },
    StructureRoad: {
        "!type": "fn()",
        "!doc": "Decreases movement cost to 1. Using roads allows creating creeps with less MOVE body parts.",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            ticksToDecay: {
                "!doc": "The amount of game ticks when this road will lose some hit points.",
                "!type": "number"
            }
        }
    },
    StructureStorage: {
        "!type": "fn()",
        "!doc": "A structure that can store huge amount of resource units. Only one structure per room is allowed that can be addressed by Room.storage property.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            }
        }
    },
    StructureTerminal: {
        "!type": "fn()",
        "!doc": "Sends any resources to a Terminal in another room. The destination Terminal can belong to any player. If its storage is full, the resources are dropped on the ground. Each transaction requires additional energy (regardless of the transfer resource type) according to this formula: ceil(0.2 * amount * linearDistanceBetweenRooms). For example, sending 100 mineral units from W1N1 to W2N3 will consume 40 energy units. You can track your incoming and outgoing transactions and estimate range cost between rooms using the Game.market object. Only one Terminal per room is allowed that can be addressed by Room.terminal property.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            send: {
                "!doc": "Sends resource to a Terminal in another room with the specified name.\n\nArguments:\n* resourceType - One of the RESOURCE_* constants.\n* amount - The amount of resources to be sent. The minimum amount is 100.\n* destination - The name of the target room. You don't have to gain visibility in this room.\n* description (optional) - The description of the transaction. It is visible to the recipient. The maximum length is 100 characters.\n\nCPU cost: CONST",
                "!type": "fn(resourceType: string, amount: number, destination: string, description?: string) -> number"
            },
            cooldown: {
                "!doc": "The remaining amount of ticks while this terminal cannot be used to make `StructureTerminal.send` or `Game.market.deal` calls.",
                "!type": "number"
            }
        }
    },
    StructureTower: {
        "!type": "fn()",
        "!doc": "Remotely attacks or heals creeps, or repairs structures. Can be targeted to any object in the room. However, its effectiveness highly depends on the distance. Each action consumes energy.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            attack: {
                "!doc": "Remotely attack any creep in a room. \n\nArguments:\n* target - The target creep.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            heal: {
                "!doc": "Remotely heal any creep in a room. \n\nArguments:\n* target - The target creep.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            repair: {
                "!doc": "Remotely repair any structure in a room. \n\nArguments:\n* target - The target structure.\n\nCPU cost: CONST",
                "!type": "fn(target: +Structure) -> number"
            }
        }
    },
    StructureNuker: {
        "!type": "fn()",
        "!doc": "Launches a nuke to any room within 5 rooms range dealing huge damage to the landing area. Each launch has a cooldown and requires energy and ghodium resources. Launching creates a Nuke object at the target room position which is visible to any player until it is landed. Incoming nuke cannot be moved or cancelled.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            launchNuke: {
                "!doc": "Launch a nuke to the specified position. \n\nArguments:\n* pos - The target room position.\n\nCPU cost: CONST",
                "!type": "fn(pos: +RoomPosition) -> number"
            },
            cooldown: {"!doc": "The amount of game ticks until the next launch is possible.", "!type": "number"}
        }
    },
    StructureWall: {
        "!type": "fn()", "!doc": "Blocks movement of all creeps.", prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            ticksToLive: {
                "!doc": "The amount of game ticks when the wall will disappear (only for automatically placed border walls at the start of the game).",
                "!type": "number"
            }
        }
    },
    StructureSpawn: {
        "!type": "fn()",
        "!doc": "Spawn is your colony center. This structure can create, renew, and recycle creeps. All your spawns are accessible through Game.spawns hash list.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            memory: {"!doc": "A shorthand to Memory.spawns[spawn.name]. You can use it for quick access the spawn’s specific memory data object."},
            name: {
                "!doc": "Spawn’s name. You choose the name upon creating a new spawn, and it cannot be changed later. This name is a hash key to access the spawn via the Game.spawns object.",
                "!type": "string"
            },
            spawning: {
                "!doc": "If the spawn is in process of spawning a new creep, this object will contain the new creep’s information, or null otherwise.",
                "!type": "+StructureSpawnSpawning"
            },
            spawnCreep: {
                "!doc": "Start the creep spawning process. The required energy amount can be withdrawn from all spawns and extensions in the room.\n\nArguments:\n* body - An array describing the new creep’s body. Should contain 1 to 50 elements with one of the body part constants.\n* name - The name of a new creep. It should be unique creep name, i.e. the Game.creeps object should not contain another creep with the same name (hash key).\n* opts (optional) - An object with following properties:\n  - memory - The memory of a new creep. If provided, it will be immediately stored into Memory.creeps[name].\n  - energyStructures - Array of spawns/extensions from which to draw energy for the spawning process.\n  - dryRun - If dryRun is true, the operation will only check if it is possible to create a creep.\n  - directions - Set desired directions where the creep should move when spawned. An array with the direction constants.\n\nCPU cost: CONST",
                "!type": "fn(body: [string], name: string, opts?: object) -> number"
            },
            renewCreep: {
                "!doc": "Increase the remaining time to live of the target creep. The target should be at adjacent square. The spawn should not be busy with the spawning process. Each execution increases the creep's timer by amount of ticks according to this formula: floor(600/body_size). Energy required for each execution is determined using this formula: ceil(creep_cost/2.5/body_size).\n\nArguments:\n* target - The creep to be renewed.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            },
            recycleCreep: {
                "!doc": "Kill the creep and drop up to 100% of resources spent on its spawning and boosting depending on remaining life time. The target should be at adjacent square. \n\nArguments:\n* target - The creep to be recycled.\n\nCPU cost: CONST",
                "!type": "fn(target: +Creep) -> number"
            }
        },
        Spawning: {"!type": "StructureSpawnSpawning"}
    },
    StructurePortal: {
        "!type": "fn()",
        "!doc": "A non-player structure. Instantly teleports your creeps to a distant room acting as a room exit tile. Portals appear randomly in the central room of each sector.",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            destination: {"!doc": "The position object in the destination room.", "!type": "+RoomPosition"},
            ticksToDecay: {
                "!doc": "The amount of game ticks when the portal disappears, or undefined when the portal is stable.",
                "!type": "number"
            }
        }
    },
    StructureFactory: {
        "!type": "fn()", "!doc": "Produces trade commodities from base minerals and other commodities.", prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            produce: {
                "!doc": "Produces the specified commodity. All ingredients should be available in the factory store. \n\nArguments:\n* resourceType - One of the RESOURCE_* constants.\n\nCPU cost: CONST",
                "!type": "fn(resourceType: string) -> number"
            },
            cooldown: {
                "!doc": "The amount of game ticks the factory has to wait until the next production is possible.",
                "!type": "number"
            },
            level: {
                "!doc": "The factory's level. Can be set by applying the PWR_OPERATE_FACTORY power to a newly built factory. Once set, the level cannot be changed.",
                "!type": "number"
            }
        }
    },
    StructureInvaderCore: {
        "!type": "fn()",
        "!doc": "This NPC structure is a control center of NPC Strongholds, and also rules all invaders in the sector. ",
        prototype: {
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            hits: {"!doc": "The current amount of hit points of the structure.", "!type": "number"},
            hitsMax: {"!doc": "The total amount of hit points of the structure.", "!type": "number"},
            structureType: {"!doc": "One of the STRUCTURE_* constants.", "!type": "string"},
            destroy: {
                "!doc": "Destroy this structure immediately. You are not allowed to destroy a structure when there are hostile creeps in the room.\n\nCPU cost: CONST",
                "!type": "fn() -> number"
            },
            notifyWhenAttacked: {
                "!doc": "Toggle auto notification when the structure is under attack. The notification will be sent to your account email. Turned on by default.\n\nArguments:\n* enabled - Whether to enable notification or disable.\n\nCPU cost: CONST",
                "!type": "fn(enabled: bool) -> number"
            },
            isActive: {
                "!doc": "Check whether this structure can be used. If the room controller level is not enough, then this method will return false, and the structure will be highlighted with red in the game.\n\nCPU cost: LOW",
                "!type": "fn() -> bool"
            },
            my: {"!type": "bool", "!doc": "Whether it is your own structure."},
            owner: {
                "!": "An object with the owner info",
                username: {"!doc": "The name of the owner user.", "!type": "string"}
            },
            ticksToDeploy: {
                "!doc": "Shows the timer for a ot yet deployed stronghold, undefined otherwise.",
                "!type": "number"
            },
            level: {
                "!doc": "The level of the stronghold. The amount and quality of the loot depends on the level.",
                "!type": "number"
            }
        }
    },
    Tombstone: {
        "!type": "fn()",
        "!doc": "A remnant of dead creeps. This is a walkable structure.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            creep: {"!doc": "An object containing the deceased creep.", "!type": "+Creep"},
            deathTime: {"!doc": "Time of death.", "!type": "number"},
            ticksToDecay: {"!doc": "The amount of game ticks before this tombstone decays.", "!type": "number"}
        }
    },
    Ruin: {
        "!type": "fn()",
        "!doc": "A destroyed structure. This is a walkable object.",
        prototype: {
            store: {"!doc": "A Store object that contains cargo of this creep.", "!type": "+Store"},
            pos: {"!doc": "An object representing the position of this object in a room.", "!type": "+RoomPosition"},
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            structure: {"!doc": "An object containing basic data of the destroyed structure.", "!type": "+Structure"},
            destroyTime: {"!doc": "The time when the structure has been destroyed.", "!type": "number"},
            ticksToDecay: {"!doc": "The amount of game ticks before this ruin decays.", "!type": "number"}
        }
    },
    Deposit: {
        "!type": "fn()",
        "!doc": "A rare resource deposit needed for producing commodities.",
        prototype: {
            pos: {
                "!doc": "An object representing the position of this object in a room.",
                "!type": "+RoomPosition"
            },
            room: {
                "!doc": "The link to the Room object of this object. May be undefined in case if an object is a flag and is placed in a room that is not visible to you.",
                "!type": "+Room"
            },
            effects: {"!doc": "Applied effects, an array of objects.", "!type": "[Effect]"},
            id: {
                "!type": "string",
                "!doc": "A unique object identificator. You can use `Game.getObjectById` method to retrieve an object instance by its `id`."
            },
            cooldown: {
                "!doc": "The amount of game ticks until the next harvest action is possible.",
                "!type": "number"
            },
            depositType: {
                "!doc": "The deposit type, one of the following constants: RESOURCE_MIST, RESOURCE_BIOMASS, RESOURCE_METAL, RESOURCE_SILICON.",
                "!type": "number"
            },
            lastCooldown: {"!doc": "The cooldown of the last harvest operation on this deposit.", "!type": "number"},
            ticksToDecay: {"!doc": "The amount of game ticks when this deposit will disappear.", "!type": "number"}
        }
    },
    PathFinder: {
        "!doc": "Contains powerful methods for pathfinding in the game world. Support exists for custom navigation costs and paths which span multiple rooms. Additionally PathFinder can search for paths through rooms you can't see, although you won't be able to detect any dynamic obstacles like creeps or buildings.\n\nThis module is experimental and disabled by default. Run `PathFinder.use(true)` to enable it in the game methods.",
        search: {
            "!doc": "Find an optimal path between origin and goal.\n\nArguments:\n* origin - The start position.\n* goal - A goal or an array of goals. If more than one goal is supplied then the cheapest path found out of all the goals will be returned. A goal is either a RoomPosition or an object as defined below. Important: Please note that if your goal is not walkable (for instance, a source) then you should set range to at least 1 or else you will waste many CPU cycles searching for a target that you can't walk on.\n  - pos - The target.\n  - range - Range to pos before goal is considered reached. The default is 0.\n\n* opts (optional) - An object containing additional pathfinding flags.\n  - roomCallback - Request from the pathfinder to generate a CostMatrix for a certain room. The callback accepts one argument, roomName. This callback will only be called once per room per search. If you are running multiple pathfinding operations in a single room and in a single tick you may consider caching your CostMatrix to speed up your code. Please read the CostMatrix documentation below for more information on CostMatrix.\n  - plainCost - Cost for walking on plain positions. The default is 1.\n  - swampCost - Cost for walking on swamp positions. The default is 5.\n  - flee - Instead of searching for a path to the goals this will search for a path away from the goals. The cheapest path that is out of range of every goal will be returned. The default is false.\n  - maxOps - The maximum allowed pathfinding operations. You can limit CPU time used for the search based on ratio 1 op ~ 0.001 CPU. The default value is 2000.\n  - maxCost - The maximum allowed cost of the path returned. If at any point the pathfinder detects that it is impossible to find a path with a cost less than or equal to `maxCost` it will immediately halt the search. The default is Infinity.\n  - maxRooms - The maximum allowed rooms to search. The default (and maximum) is 16.\n  - heuristicWeight - Weight to apply to the heuristic in the A* formula F = G + weight * H. Use this option only if you understand the underlying A* algorithm mechanics! The default value is 1.2.\n\nReturn value\n\nAn object containing:\n* path - An array of RoomPosition objects.\n* ops - Total number of operations performed before this path was calculated.",
            "!type": "fn(origin: +RoomPosition, goal: ?, opts?: +PathfindingOptions) -> +PathfindingResult"
        },
        CostMatrix: {"!type": "CostMatrix"}
    },
    Room: {
        "!type:": "fn()",
        "!doc": "An object representing the room in which your units and structures are in. It can be used to look around, find paths, etc. Every object in the room contains its linked Room instance in the `room` property.",
        prototype: {
            controller: {
                "!doc": "The Controller structure of this room, if present, otherwise undefined.",
                "!type": "+StructureController"
            },
            energyAvailable: {
                "!doc": "Total amount of energy available in all spawns and extensions in the room.",
                "!type": "number"
            },
            energyCapacityAvailable: {
                "!doc": "Total amount of energy capacity of all spawns and extensions in the room.",
                "!type": "number"
            },
            memory: {"!doc": "A shorthand to Memory.rooms[room.name]. You can use it for quick access the room’s specific memory data object."},
            mode: {"!doc": "One of the MODE_* constants.", "!type": "string"},
            name: {"!doc": "The name of the room.", "!type": "string"},
            storage: {
                "!doc": "The Storage structure of this room, if present, otherwise undefined.",
                "!type": "+StructureStorage"
            },
            terminal: {
                "!doc": "The Terminal structure of this room, if present, otherwise undefined.",
                "!type": "+StructureTerminal"
            },
            createConstructionSite: {
                "!doc": "Syntax:\ncreateConstructionSite(x, y, structureType, [name])\ncreateConstructionSite(pos, structureType, [name])\n\nCreate new ConstructionSite at the specified location.\n\nArguments:\n* x - The X position.\n* y - The Y position.\n* pos - Can be a RoomPosition object or any object containing RoomPosition.\n* structureType - One of the STRUCTURE_* constants.\n* name (optional) - The name of the structure, for structures that support it (currently only spawns).\n\nCPU cost: CONST",
                "!type": "fn(arg1: ?, arg2: ?, arg3?: ?, arg4?: ?) -> number"
            },
            createFlag: {
                "!doc": "Syntax:\ncreateFlag(x, y, [name], [color], [secondaryColor])\ncreateFlag(pos, [name], [color], [secondaryColor])\n\nCreate new Flag at the specified location.\n\nArguments:\n* x - The X position.\n* y - The Y position.\n* pos - Can be a RoomPosition object or any object containing RoomPosition.\n* name (optional) - The name of a new flag. It should be unique, i.e. the Game.flags object should not contain another flag with the same name (hash key). If not defined, a random name will be generated.\n* color (optional) - The color of a new flag.\n* secondaryColor (optional) - The secondary color of a new flag.\n\nCPU cost: CONST",
                "!type": "fn(arg1: ?, arg2?: ?, arg3?: ?, arg4?: ?) -> number"
            },
            find: {
                "!doc": "Find all objects of the specified type in the room.\n\nArguments:\n* type - One of the FIND_* constants.\n* opts (optional) - An object with additional options:\n  - filter - The result list will be filtered using the Lodash.filter method.\n\nCPU cost: AVERAGE",
                "!type": "fn(type: number, opts?: object) -> [object]"
            },
            findExitTo: {
                "!doc": "Find the exit direction en route to another room.\n\nArguments:\n* room - Another room name or room object.\n\nCPU cost: HIGH",
                "!type": "fn(room: ?) -> number"
            },
            findPath: {
                "!doc": "Find an optimal path inside the room between fromPos and toPos using A* search algorithm.\n\nArguments:\n* fromPos - The start position.\n* toPos - The end position.\n* opts (optional) - An object containing additonal pathfinding flags:\n  - ignoreCreeps - Treat squares with creeps as walkable. Can be useful with too many moving creeps around or in some other cases. The default value is false.\n  - ignoreDestructibleStructures - Treat squares with destructible structures (constructed walls, ramparts, spawns, extensions) as walkable. Use this flag when you need to move through a territory blocked by hostile structures. If a creep with an ATTACK body part steps on such a square, it automatically attacks the structure. The default value is false.\n  - ignoreRoads - Ignore road structures. Enabling this option can speed up the search. The default value is false. This is only used when the new PathFinder is enabled.\n  - costCallback - You can use this callback to modify a CostMatrix for any room during the search. The callback accepts two arguments, roomName and costMatrix. Use the costMatrix instance to make changes to the positions costs. If you return a new matrix from this callback, it will be used instead of the built-in cached one. This option is only used when the new PathFinder is enabled.\n  - ignore - An array of the room's objects or RoomPosition objects which should be treated as walkable tiles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).\n  - avoid - An array of the room's objects or RoomPosition objects which should be treated as obstacles during the search. This option cannot be used when the new PathFinder is enabled (use costCallback option instead).\n  - maxOps - The maximum limit of possible pathfinding operations. You can limit CPU time used for the search based on ratio 1 op ~ 0.001 CPU. The default value is 2000.\n  - heuristicWeight - Weight to apply to the heuristic in the A* formula F = G + weight * H. Use this option only if you understand the underlying A* algorithm mechanics! The default value is 1.2.\n  - serialize - If true, the result path will be serialized using Room.serializePath. The default is false.\n  - maxRooms - The maximum allowed rooms to search. The default (and maximum) is 16. This is only used when the new PathFinder is enabled.\n  - range - Find a path to a position in specified linear range of target. The default is 0.\n  - plainCost - Cost for walking on plain positions. The default is 1.\n  - swampCost - Cost for walking on swamp positions. The default is 5.\n\nCPU cost: HIGH",
                "!type": "fn(fromPos: +RoomPosition, toPos: +RoomPosition, opts?: +RoomFindPathOptions) -> Path"
            },
            getPositionAt: {
                "!doc": "Creates a RoomPosition object at the specified location.\n\nArguments:\n* x - The X position.\n* y - The Y Position.\n\nCPU cost: LOW",
                "!type": "fn(x: number, y: number) -> +RoomPosition"
            },
            lookAt: {
                "!doc": "Syntax:\nlookAt(x, y)\nlookAt(target)\n\nGet the list of objects at the specified room position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n* target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: AVERAGE",
                "!type": "fn(arg1: ?, arg2?: ?) -> LookArray"
            },
            lookAtArea: {
                "!doc": "Get the list of objects at the specified room area.\n\nArguments:\n* top - The top Y boundary of the area.\n* left - The left X boundary of the area.\n* bottom - The bottom Y boundary of the area.\n* right - The right X boundary of the area.\n* asArray (optional) - Set to true if you want to get the result as a plain array.\n\nCPU cost: AVERAGE",
                "!type": "fn(top: number, left: number, bottom: number, right: number, asArray?: bool) -> LookAreaArray"
            },
            lookForAt: {
                "!doc": "Syntax:\nlookForAt(type, x, y)\nlookForAt(type, target)\n\nGet an object with the given type at the specified room position.\n\nArguments:\n* type - One of the following string constants:\n  - constructionSite\n  - creep\n  - energy\n  - exit\n  - flag\n  - source\n  - structure\n  - terrain\n* x - X position in the room.\n* y - Y position in the room.\n* target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2: ?, arg3?: ?) -> [object]"
            },
            lookForAtArea: {
                "!doc": "Get the list of objects with the given type at the specified room area.\n\nArguments:\n* type - One of the following string constants:\n  - constructionSite\n  - creep\n  - energy\n  - exit\n  - flag\n  - source\n  - structure\n  - terrain\n* top - The top Y boundary of the area.\n* left - The left X boundary of the area.\n* bottom - The bottom Y boundary of the area.\n* right - The right X boundary of the area.\n* asArray (optional) - Set to true if you want to get the result as a plain array.\n\nCPU cost: LOW",
                "!type": "fn(type: string, top: number, left: number, bottom: number, right: number, asArray?: bool) -> LookAreaArray"
            },
            visual: {
                "!doc": "A RoomVisual object for this room. You can use this object to draw simple shapes (lines, circles, text labels) in the room.",
                "!type": "+RoomVisual"
            },
            getTerrain: {
                "!doc": "Get a Room.Terrain object which provides fast access to static terrain data. This method works for any room in the world even if you have no access to it.",
                "!type": "fn() -> +RoomTerrain"
            },
            getEventLog: {
                "!doc": "Returns an array of events happened on the previous tick in this room.\n\nArguments:\n* raw (optional) - If this parameter is false or undefined, the method returns an object parsed using JSON.parse which incurs some CPU cost on the first access (the return value is cached on subsequent calls). If raw is truthy, then raw JSON in string format is returned.\n\nCPU Cost: NONE",
                "!type": "fn(raw?: bool) -> [object]"
            }
        },
        serializePath: {
            "!doc": "Serialize a path array into a short string representation, which is suitable to store in memory.\n\nArguments:\n* path - A path array retrieved from Room.findPath.\n\nCPU cost: LOW",
            "!type": "fn(path: Path) -> string"
        },
        deserializePath: {
            "!doc": "Deserialize a short string path representation into an array form.\n\nArguments:\n* path - A serialized path string.\n\nCPU cost: LOW",
            "!type": "fn(path: string) -> Path"
        },
        Terrain: {"!type": "RoomTerrain"}
    },
    RoomPosition: {
        "!type:": "fn(x: number, y: number, roomName: string) -> +RoomPosition",
        "!doc": "An object representing the specified position in the room. Every object in the room contains RoomPosition as the pos property. The position object of a custom location can be obtained using the `Room.getPositionAt()` method or using the constructor.",
        prototype: {
            roomName: {"!doc": "The name of the room.", "!type": "string"},
            x: {"!doc": "X position in the room.", "!type": "number"},
            y: {"!doc": "Y position in the room.", "!type": "number"},
            createConstructionSite: {
                "!doc": "Create new ConstructionSite at the specified location.\n\nArguments:\n* structureType - One of the STRUCTURE_* constants.\n* name (optional) - The name of the structure, for structures that support it (currently only spawns).\n\nCPU cost: CONST",
                "!type": "fn(structureType: string, name?: string) -> number"
            },
            createFlag: {
                "!doc": "Create new Flag at the specified location.\n\nArguments:\n* name (optional) - The name of a new flag. It should be unique, i.e. the Game.flags object should not contain another flag with the same name (hash key). If not defined, a random name will be generated.\n* color (optional) - The color of a new flag.\n* secondaryColor (optional) - The secondary color of a new flag.\n\nCPU cost: CONST",
                "!type": "fn(name?: string, color?: string, secondaryColor?: string) -> number"
            },
            findClosestByPath: {
                "!doc": "Syntax:\nfindClosestByPath(type, [opts])\nfindClosestByPath(objects, [opts])\n\nFind an object with the shortest path from the given position. Uses A* search algorithm and Dijkstra's algorithm.\n\nArguments:\n* type - See Room.find.\n* objects - An array of room's objects or RoomPosition objects that the search should be executed against.\n* opts (optional) - An object containing pathfinding options (see Room.findPath), or one of the following:\n  - filter - Only the objects which pass the filter using the Lodash.filter method will be used.\n  - algorithm - One of the following constants:\n    +  astar - is faster when there are relatively few possible targets;\n    + dijkstra - is faster when there are a lot of possible targets or when the closest target is nearby.\n    The default value is determined automatically using heuristics.\n\nCPU cost: HIGH",
                "!type": "fn(arg1: ?, opts?: object) -> object"
            },
            findClosestByRange: {
                "!doc": "Syntax:\nfindClosestByRange(type, [opts])\nfindClosestByRange(objects, [opts])\n\nFind an object with the shortest linear distance from the given position.\n\nArguments:\n* type - See Room.find.\n* objects - An array of room's objects or RoomPosition objects that the search should be executed against.\n* opts (optional) - An object containing one of the following options:\n  - filter - Only the objects which pass the filter using the Lodash.filter method will be used.\n\nCPU cost: AVERAGE",
                "!type": "fn(arg1: ?, opts?: object) -> number"
            },
            findInRange: {
                "!doc": "Syntax:\nfindInRange(type, range, [opts])\nfindInRange(objects, range, [opts])\n\nFind all objects in the specified linear range.\n\nArguments:\n* type - See Room.find.\n* objects - An array of room's objects or RoomPosition objects that the search should be executed against.\n* range - The range distance\n* opts (optional) - See Room.find.\n\nCPU cost: CONST",
                "!type": "fn(arg1: ?, range: number, opts?: object) -> [object]"
            },
            findPathTo: {
                "!type": "fn(arg1?: ?, arg2?: ?, arg3?: ?) -> Path",
                "!doc": "Syntax:\nfindPathTo(x, y, [opts])\nfindPathTo(target, [opts])\n\nFind an optimal path to the specified position using A* search algorithm. This method is a shorthand for `Room.findPath`. If the target is in another room, then the corresponding exit will be used as a target.\n\nCPU cost: HIGH"
            },
            getDirectionTo: {
                "!doc": "Syntax:\ngetDirectionTo(x,y)\ngetDirectionTo(target)\n\nGet linear direction to the specified position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n * target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2?: ?) -> number"
            },
            getRangeTo: {
                "!doc": "Syntax:\ngetRangeTo(x,y)\ngetRangeTo(target)\n\nGet linear range to the specified position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n * target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2?: ?) -> number"
            },
            inRangeTo: {
                "!doc": "Syntax:\ninRangeTo(x,y,range)\ninRangeTo(target,range)\n\nCheck whether this position is in the given range of another position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n* target - The target position.\n* range - The range distance.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2: ?, arg3?: ?) -> bool"
            },
            isEqualTo: {
                "!doc": "Syntax:\nisEqualTo(x,y)\nisEqualTo(target)\n\nCheck whether this position is the same as the specified position.\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n * target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2?: ?) -> bool"
            },
            isNearTo: {
                "!doc": "Syntax:\nisNearTo(x,y)\nisNearTo(target)\n\nCheck whether this position is on the adjacent square to the specified position. The same as inRangeTo(target, 1).\n\nArguments:\n* x - X position in the room.\n* y - Y position in the room.\n * target - Can be a RoomPosition object or any object containing RoomPosition.\n\nCPU cost: LOW",
                "!type": "fn(arg1: ?, arg2?: ?) -> bool"
            },
            look: {
                "!doc": "Get the list of objects at the specified room position.\n\nCPU cost: AVERAGE",
                "!type": "fn() -> LookArray"
            },
            lookFor: {
                "!doc": "Get an object with the given type at the specified room position.\n\nArguments:\n* type - One of the following string constants:\n  - constructionSite\n  - creep\n  - energy\n  - exit\n  - flag\n  - source\n  - structure\n  - terrain\n\nCPU cost: LOW",
                "!type": "fn(type: string) -> [object]"
            }
        }
    },
    RoomVisual: {
        "!type:": "fn(roomName: string) -> +RoomVisual",
        "!doc": "Room visuals provide a way to show various visual debug info in game rooms. You can use the RoomVisual object to draw simple shapes that are visible only to you.",
        roomName: {"!doc": "The name of the room.", "!type": "string"},
        line: {
            "!doc": "Syntax:\nline(x1, y1, x2, y2, [style])\nline(pos1, pos2, [style])\n\nDraw a line.\n\nArguments:\n* x1 - The start X coordinate.\n* y1 - The start Y coordinate.\n* x2 - The finish X coordinate.\n* y2 - The finish Y coordinate.\n* pos1 - The start position object.\n* pos2 - The finish position object.\n* style (optional) - An object with the following properties:\n  - width - Line width, default is 0.1.\n  - color - Line color in any web format, default is #ffffff (white).\n  - opacity - Opacity value, default is 0.5.\n  - lineStyle - Either undefined (solid line), dashed, or dotted. Default is undefined.",
            "!type": "fn(x1: number, y1: number, x2: number, y2: number, style?: +LineStyle) -> +RoomVisual"
        },
        circle: {
            "!doc": "Syntax:\ncircle(x, y, [style])\ncircle(pos, [style])\n\nDraw a circle.\n\nArguments:\n* x - The X coordinate of the center.\n* y - The Y coordinate of the center.\n* pos - The position object of the center.\n* style (optional) - An object with the following properties:\n  - radius - Circle radius, default is 0.15.\n  - fill - Fill color in any web format, default is #ffffff (white).\n  - opacity - Opacity value, default is 0.5.\n  - stroke - Stroke color in any web format, default is undefined (no stroke).\n  - strokeWidth - Stroke line width, default is 0.1.\n  - lineStyle - Either undefined (solid line), 'dashed', or 'dotted'. Default is undefined.",
            "!type": "fn(x: number, y: number, style?: +CircleStyle) -> +RoomVisual"
        },
        rect: {
            "!doc": "Syntax:\nrect(x, y, width, height, [style])\nrect(topLeftPos, width, height, [style])\n\nDraw a rectangle.\n\nArguments:\n* x - The X coordinate of the top-left corner.\n* y - The Y coordinate of the top-left corner.\n* topLeftPos - The position object of the top-left corner.\n* width - The width of the rectangle.\n* height - The height of the rectangle.\n* style (optional) - An object with the following properties:\n  - fill - Fill color in any web format, default is #ffffff (white).\n  - opacity - Opacity value, default is 0.5.\n  - stroke - Stroke color in any web format, default is undefined (no stroke).\n  - strokeWidth - Stroke line width, default is 0.1.\n  - lineStyle - Either undefined (solid line), 'dashed', or 'dotted'. Default is undefined.",
            "!type": "fn(x: number, y: number, width: number, height: number, style?: +PolyStyle) -> +RoomVisual"
        },
        poly: {
            "!doc": "Draw a polyline.\n\nArguments:\n* points - An array of points. Every item should be either an array with 2 numbers (i.e. [10,15]), or a RoomPosition object.\n* style (optional) - An object with the following properties:\n  - fill - Fill color in any web format, default is undefined (no fill).\n  - opacity - Opacity value, default is 0.5.\n  - stroke - Stroke color in any web format, default is #ffffff (white).\n  - strokeWidth - Stroke line width, default is 0.1.\n  - lineStyle - Either undefined (solid line), 'dashed', or 'dotted'. Default is undefined.",
            "!type": "fn(points: [object], style?: +PolyStyle) -> +RoomVisual"
        },
        text: {
            "!doc": "Syntax:\ntext(text, x, y, [style])\ntext(text, pos, [style])\n\nDraw a text label.\n\nArguments:\n* text - The text message.\n* x - The X coordinate of the label baseline point.\n* y - The Y coordinate of the label baseline point.\n* pos - The position object of the label baseline.\n* style (optional) - An object with the following properties:\n  - color - Font color in any web format, default is #ffffff (white).\n  - font - Either a number or a string.\n  - stroke - Stroke color in any web format, default is undefined (no stroke).\n  - strokeWidth - Stroke width, default is 0.15.\n  - background - Background color in any web format, default is undefined (no background). When background is enabled, text vertical align is set to middle (default is baseline).\n  - backgroundPadding - Background rectangle padding, default is 0.3.\n  - align - Text align, either 'center', 'left', or 'right'. Default is 'center'.\n  - opacity - Opacity value, default is 1.0.",
            "!type": "fn(x: number, y: number, width: number, height: number, style?: +TextStyle) -> +RoomVisual"
        },
        clear: {"!doc": "Remove all visuals from the room.", "!type": "fn() -> +RoomVisual"},
        getSize: {
            "!doc": "Get the stored size of all visuals added in the room in the current tick. It must not exceed 512,000 (500 KB).",
            "!type": "fn() -> number"
        }
    },
    RawMemory: {
        "!doc": "RawMemory object allows to implement your own memory stringifier instead of built-in serializer based on JSON.stringify.",
        get: {"!doc": "Get a raw string representation of the Memory object.", "!type": "fn() -> string"},
        set: {
            "!doc": "Set new memory value.\n\nArguments:\n* value - New memory value as a string.",
            "!type": "fn(value: string)"
        },
        segments: {"!doc": "An object with asynchronous memory segments available on this tick. Each object key is the segment ID with data in string values. Use RawMemory.setActiveSegments to fetch segments on the next tick. Segments data is saved automatically in the end of the tick."},
        setActiveSegments: {
            "!doc": "Request memory segments using the list of their IDs. Memory segments will become available on the next tick in RawMemory.segments object.\n\nArguments:\n* ids - An array of segment IDs. Each ID should be a number from 0 to 99. Maximum 10 segments can be requested simultaneously. Subsequent calls of setActiveSegments override previous ones.",
            "!type": "fn(ids: [number])"
        },
        foreignSegment: {
            "!doc": "An object with a memory segment of another player available on this tick. Use setActiveForeignSegment to fetch segments on the next tick. ",
            username: {"!doc": "Another player's name", "!type": "string"},
            id: {"!doc": "The ID of the requested memory segment.", "!type": "number"},
            data: {"!doc": "The segment contents", "!type": "string"}
        },
        setActiveForeignSegment: {
            "!doc": "Request a memory segment of another user. The segment should be marked by its owner as public using setPublicSegments. The segment data will become available on the next tick in foreignSegment object. You can only have access to one foreign segment at the same time.\n\nArguments:\n* username - The name of another user. Pass null to clear the foreign segment.\n* id - The ID of the requested segment from 0 to 99. If undefined, the user's default public segment is requested as set by setDefaultPublicSegment.",
            "!type": "fn(username: string, id?: number)"
        },
        setDefaultPublicSegment: {
            "!doc": "Set the specified segment as your default public segment. It will be returned if no id parameter is passed to setActiveForeignSegment by another user.\n\nArguments:\n* id - The ID of the memory segment from 0 to 99. Pass null to remove your default public segment.",
            "!type": "fn(id: number)"
        },
        setPublicSegments: {
            "!doc": "Set specified segments as public. Other users will be able to request access to them using setActiveForeignSegment.\n\nArguments:\n* ids - An array of segment IDs. Each ID should be a number from 0 to 99. Subsequent calls of setPublicSegments override previous ones.",
            "!type": "fn(ids: [number])"
        }
    },
    Memory: {"!doc": "The global object Memory in which you may store any information in the JSON format."},
    InterShardMemory: {
        "!doc": "InterShardMemory object provides an interface for communicating between shards.\n\nEvery shard can have its own 100 KB of data in string format that can be accessed by all other shards. A shard can write only to its own data, other shards' data is read-only.\n\nThis data has nothing to do with Memory contents, it's a separate data container.",
        getLocal: {"!doc": "Returns the string contents of the current shard's data.", "!type": "fn() -> string"},
        setLocal: {
            "!doc": "Replace the current shard's data with the new value.\n\nArguments:\n* value - New data value in string format.\n",
            "!type": "fn(value: string)"
        },
        getRemote: {
            "!doc": "Returns the string contents of another shard's data.\n\nArguments:\n* shard - Shard name.\n",
            "!type": "fn(shard: string) -> string"
        }
    },
    Game: {
        "!doc": "The main global game object containing all the gameplay information.",
        cpu: {
            "!doc": "An object containing information about your CPU usage.",
            limit: {"!doc": "Your CPU limit depending on your Global Control Level.", "!type": "number"},
            tickLimit: {
                "!doc": "An amount of available CPU time at the current game tick. It can be higher than `Game.cpu.limit`.",
                "!type": "number"
            },
            bucket: {"!doc": "An amount of unused CPU accumulated in your bucket.", "!type": "number"},
            getUsed: {
                "!doc": "Get amount of CPU time used from the beginning of the current game tick. Always returns 0 in the Simulation mode.\n\nCPU cost: LOW",
                "!type": "fn() -> number"
            },
            shardLimits: {"!doc": "An object with limits for each shard with shard names as keys. You can use setShardLimits method to re-assign them."},
            setShardLimits: {
                "!doc": "Allocate CPU limits to different shards. Total amount of CPU should remain equal to Game.cpu.shardLimits. This method can be used only once per 12 hours.",
                "!type": "fn(limits: object) -> number"
            },
            getHeapStatistics: {
                "!doc": "Use this method to get heap statistics for your virtual machine. The return value is almost identical to the Node.js function v8.getHeapStatistics(). This function returns one additional property: externally_allocated_size which is the total amount of currently allocated memory which is not included in the v8 heap but counts against this isolate's memory limit. ArrayBuffer instances over a certain size are externally allocated and will be counted here.",
                "!type": "fn() -> +HeapStatistics"
            }
        },
        constructionSites: {
            "!doc": "A hash containing all your construction sites with their id as hash keys.",
            "!type": "[+ConstructionSite]"
        },
        creeps: {"!doc": "A hash containing all your creeps with creep names as hash keys.", "!type": "[+Creep]"},
        powerCreeps: {
            "!doc": "A hash containing all your Power Creeps with their names as hash keys.",
            "!type": "[+PowerCreep]"
        },
        flags: {"!doc": "A hash containing all your flags with flag names as hash keys.", "!type": "[+Flag]"},
        gcl: {
            "!doc": "Your Global Control Level, an object with the following properties :",
            level: {"!doc": "The current level.", "!type": "number"},
            progress: {"!doc": "The current progress to the next level.", "!type": "number"},
            progressTotal: {"!doc": "The progress required to reach the next level.", "!type": "number"}
        },
        gpl: {
            "!doc": "Your Global Power Level, an object with the following properties:",
            level: {"!doc": "The current level.", "!type": "number"},
            progress: {"!doc": "The current progress to the next level.", "!type": "number"},
            progressTotal: {"!doc": "The progress required to reach the next level.", "!type": "number"}
        },
        market: {
            "!doc": "A global object representing the in-game market. You can use this object to track resource transactions to/from your terminals, and your buy/sell orders.",
            incomingTransactions: {
                "!doc": "An array of the last 100 incoming transactions to your terminals.",
                "!type": "[Transaction]"
            },
            outgoingTransactions: {
                "!doc": "An array of the last 100 outgoing transactions from your terminals.",
                "!type": "[Transaction]"
            },
            calcTransactionCost: {
                "!doc": "Estimate the energy transaction cost of StructureTerminal.send and Market.deal methods. The formula: Math.ceil( amount * (Math.log(0.1*linearDistanceBetweenRooms + 0.9) + 0.1) )\n\nArguments:\n* amount - Amount of resources to be sent.\n* roomName1 - The name of the first room.\n* roomName2 - The name of the second room.\n\nCPU cost: NONE",
                "!type": "fn(amount: number, roomName1: string, roomName2: string) -> number"
            },
            credits: {"!doc": "Your current credits balance.", "!type": "number"},
            orders: {
                "!doc": "An object with your active and inactive buy/sell orders on the market.",
                "!type": "[MarketOrder]"
            },
            cancelOrder: {
                "!doc": "Cancel a previously created order. The 5% fee is not returned.\n\nArguments:\n* orderId - The order ID as provided in Game.market.orders.\n\nCPU cost: CONST",
                "!type": "fn(orderId: string) -> number"
            },
            createOrder: {
                "!doc": "Create a market order in your terminal. You will be charged price*amount*0.05 credits when the order is placed. The maximum orders count is 20 per player. You can create an order at any time with any amount, it will be automatically activated and deactivated depending on the resource/credits availability.\n\nArguments:\n* type - The order type, either ORDER_SELL or ORDER_BUY.\n* resourceType - Either one of the RESOURCE_* constants or SUBSCRIPTION_TOKEN. If your Terminal doesn't have the specified resource, the order will be temporary inactive.\n* price - The price for one resource unit in credits. Can be a decimal number.\n* totalAmount - The amount of resources to be traded in total. The minimum amount is 100.\n* roomName (optional) - The room where your order will be created. You must have your own Terminal structure in this room, otherwise the created order will be temporary inactive. This argument is not used when resourceType equals to SUBSCRIPTION_TOKEN.\n\nCPU cost: CONST",
                "!type": "fn(type: string, resourceType: string, price: number, totalAmount: number, roomName?: string) -> number"
            },
            deal: {
                "!doc": "Execute a trade deal from your Terminal to another player's Terminal using the specified buy/sell order. Your Terminal will be charged energy units of transfer cost regardless of the order resource type. You can use Game.market.calcTransactionCost method to estimate it. When multiple players try to execute the same deal, the one with the shortest distance takes precedence.\n\nArguments:\n* orderId - The order ID as provided in Game.market.getAllOrders.\n* amount - The amount of resources to transfer. The minimum amount is 100.\n* targetRoomName (optional) - The name of your room which has to contain an active Terminal with enough amount of energy. This argument is not used when the order resource type equals to SUBSCRIPTION_TOKEN.\n\nCPU cost: CONST",
                "!type": "fn(orderId: string, amount: number, targetRoomName?: string) -> number"
            },
            getAllOrders: {
                "!doc": "Get other players' orders currently active on the market.\n\nArguments:\n* filter (optional) - An object or function that will filter the resulting list using the lodash.filter method.\n\nCPU cost: AVERAGE",
                "!type": "fn(filter?: any) -> [MarketOrder]"
            },
            getOrderById: {
                "!doc": "Retrieve info for specific market order.\n\nArguments:\n* orderId - The order ID.\n\nCPU cost: LOW",
                "!type": "fn(id: string) -> +MarketOrder"
            },
            extendOrder: {
                "!doc": "Add more capacity to an existing order. It will affect remainingAmount and totalAmount properties. You will be charged price*addAmount*0.05 credits.\n\nArguments:\n* orderId - The order ID as provided in Game.market.orders.\n* addAmount - How much capacity to add. Cannot be a negative value.\n\nCPU cost: CONST",
                "!type": "fn(orderId: string, addAmount: number) -> number"
            },
            changeOrderPrice: {
                "!doc": "Change the price of an existing order. If newPrice is greater than old price, you will be charged (newPrice-oldPrice)*remainingAmount*0.05 credits.\n\nArguments:\n* orderId - The order ID as provided in Game.market.orders.\n* newPrice - The new order price.\n\nCPU cost: CONST",
                "!type": "fn(orderId: string, newPrice: number) -> number"
            },
            getHistory: {
                "!doc": "Get daily price history of the specified resource on the market for the last 14 days.\n\nArguments\n\n* resorceType (optional) - One of the RESOURCE_* constants. If undefined, returns history data for all resources.",
                "!type": "fn(resourceType?: string) -> [MarketHistoryItem]"
            }
        },
        map: {
            "!doc": "A global object representing world map. Use it to navigate between rooms.",
            describeExits: {
                "!doc": "List all exits available from the room with the given name.\n\nArguments:\n* roomName - The room name.\n\nCPU cost: LOW",
                "!type": "fn(roomName: string) -> [string]"
            },
            findExit: {
                "!doc": "Find the exit direction from the given room en route to another room.\n\nArguments:\n* fromRoom - Start room name or room object.\n* toRoom - Finish room name or room object.\n\nCPU cost: HIGH",
                "!type": "fn(fromRoom: ?, toRoom: ?) -> number"
            },
            findRoute: {
                "!doc": "Find route from the given room to another room.\n\nArguments:\n* fromRoom - Start room name or room object.\n* toRoom - Finish room name or room object.\n* opts - An object with the following options:\n  - routeCallback - This callback accepts two arguments: function(roomName, fromRoomName). It can be used to calculate the cost of entering that room. You can use this to do things like prioritize your own rooms, or avoid some rooms. You can return a floating point cost or Infinity to block the room.\n\nCPU cost: HIGH",
                "!type": "fn(fromRoom: ?, toRoom: ?, opts?: +FindRouteOptions) -> [MapRouteStep]"
            },
            isRoomProtected: {
                "!doc": 'Check if the room with the given name is protected by temporary "newbie" walls.\n\nArguments:\n* roomName - The room name.\n\nCPU cost: AVERAGE',
                "!type": "fn(roomName: string) -> bool"
            },
            getRoomLinearDistance: {
                "!doc": "Get linear distance (in rooms) between two rooms. You can use this function to estimate the energy cost of sending resources through terminals, or using observers and nukes. \n\nArguments:\n* roomName1 - The name of the first room.\n* roomName2 - The name of the second room.\n* continuous (optional) - Whether to treat the world map continuous on borders. Set to true if you want to calculate the terminal send or trade fee.\n\nCPU cost: NONE",
                "!type": "fn(roomName1: string, roomName2: string, continuous?: boolean) -> number"
            },
            getWorldSize: {
                "!doc": "Returns the world size as a number of rooms between world corners. For example, for a world with rooms from W50N50 to E50S50 this method will return 102.\n\nCPU cost: NONE",
                "!type": "fn() -> number"
            },
            getRoomTerrain: {
                "!doc": "Get a Room.Terrain object which provides fast access to static terrain data. This method works for any room in the world even if you have no access to it.\n\nArguments:\n* roomName - The room name\n\nCPU Cost: LOW",
                "!type": "fn(roomName: string) -> +RoomTerrain"
            }
        },
        resources: {"!doc": "An object with your global resources that are bound to the account, like subscription tokens. Each object key is a resource constant, values are resources amounts."},
        rooms: {
            "!doc": "A hash containing all the rooms available to you with room names as hash keys. A room is visible if you have a creep or an owned structure in it.",
            "!type": "[+Room]"
        },
        shard: {
            "!doc": "An object describing the world shard where your script is currently being executed in.",
            name: {"!doc": "The name of the shard", "!type": "string"},
            type: {"!doc": "Currently always equals to 'normal'.", "!type": "string"},
            ptr: {"!doc": "Whether this shard belongs to the PTR.", "!type": "boolean"}
        },
        spawns: {
            "!doc": "A hash containing all your spawns with spawn names as hash keys.",
            "!type": "[+StructureSpawn]"
        },
        structures: {
            "!doc": "A hash containing all your structures with structure id as hash keys.",
            "!type": "[+OwnedStructure]"
        },
        time: {"!doc": "System game tick counter. It is automatically incremented on every tick.", "!type": "number"},
        getObjectById: {
            "!doc": "Get an object with the specified unique ID. It may be a game object of any type. Only objects from the rooms which are visible to you can be accessed.\n\nArguments:\n* id - The unique identificator.\n\nCPU cost: NONE",
            "!type": "fn(id: string) -> object"
        },
        notify: {
            "!doc": "Send a custom message at your profile email. This way, you can set up notifications to yourself on any occasion within the game. You can schedule up to 20 notifications during one game tick. Not available in the Simulation Room.\n\nArguments:\n* message - Custom text which will be sent in the message. Maximum length is 1000 characters.\n* groupInterval - If set to 0 (default), the notification will be scheduled immediately. Otherwise, it will be grouped with other notifications and mailed out later using the specified time in minutes.\n\nCPU cost: CONST",
            "!type": "fn(message: string, groupInterval?: number) -> number"
        }
    },
    OK: "number",
    ERR_NOT_OWNER: "number",
    ERR_NO_PATH: "number",
    ERR_NAME_EXISTS: "number",
    ERR_BUSY: "number",
    ERR_NOT_FOUND: "number",
    ERR_NOT_ENOUGH_ENERGY: "number",
    ERR_NOT_ENOUGH_RESOURCES: "number",
    ERR_INVALID_TARGET: "number",
    ERR_FULL: "number",
    ERR_NOT_IN_RANGE: "number",
    ERR_INVALID_ARGS: "number",
    ERR_TIRED: "number",
    ERR_NO_BODYPART: "number",
    ERR_NOT_ENOUGH_EXTENSIONS: "number",
    ERR_RCL_NOT_ENOUGH: "number",
    ERR_GCL_NOT_ENOUGH: "number",
    FIND_EXIT_TOP: "number",
    FIND_EXIT_RIGHT: "number",
    FIND_EXIT_BOTTOM: "number",
    FIND_EXIT_LEFT: "number",
    FIND_EXIT: "number",
    FIND_CREEPS: "number",
    FIND_MY_CREEPS: "number",
    FIND_HOSTILE_CREEPS: "number",
    FIND_SOURCES_ACTIVE: "number",
    FIND_SOURCES: "number",
    FIND_DROPPED_RESOURCES: "number",
    FIND_STRUCTURES: "number",
    FIND_MY_STRUCTURES: "number",
    FIND_HOSTILE_STRUCTURES: "number",
    FIND_FLAGS: "number",
    FIND_CONSTRUCTION_SITES: "number",
    FIND_MY_SPAWNS: "number",
    FIND_HOSTILE_SPAWNS: "number",
    FIND_MY_CONSTRUCTION_SITES: "number",
    FIND_HOSTILE_CONSTRUCTION_SITES: "number",
    FIND_MINERALS: "number",
    FIND_NUKES: "number",
    FIND_TOMBSTONES: "number",
    FIND_POWER_CREEPS: "number",
    FIND_MY_POWER_CREEPS: "number",
    FIND_HOSTILE_POWER_CREEPS: "number",
    FIND_DEPOSITS: "number",
    FIND_RUINS: "number",
    TOP: "number",
    TOP_RIGHT: "number",
    RIGHT: "number",
    BOTTOM_RIGHT: "number",
    BOTTOM: "number",
    BOTTOM_LEFT: "number",
    LEFT: "number",
    TOP_LEFT: "number",
    COLOR_RED: "number",
    COLOR_PURPLE: "number",
    COLOR_BLUE: "number",
    COLOR_CYAN: "number",
    COLOR_GREEN: "number",
    COLOR_YELLOW: "number",
    COLOR_ORANGE: "number",
    COLOR_BROWN: "number",
    COLOR_GREY: "number",
    COLOR_WHITE: "number",
    LOOK_CREEPS: "string",
    LOOK_ENERGY: "string",
    LOOK_RESOURCES: "string",
    LOOK_SOURCES: "string",
    LOOK_MINERALS: "string",
    LOOK_DEPOSITS: "string",
    LOOK_STRUCTURES: "string",
    LOOK_FLAGS: "string",
    LOOK_CONSTRUCTION_SITES: "string",
    LOOK_NUKES: "string",
    LOOK_TERRAIN: "string",
    LOOK_TOMBSTONES: "string",
    LOOK_POWER_CREEPS: "string",
    LOOK_RUINS: "string",
    OBSTACLE_OBJECT_TYPES: "object",
    MOVE: "string",
    WORK: "string",
    CARRY: "string",
    ATTACK: "string",
    RANGED_ATTACK: "string",
    TOUGH: "string",
    HEAL: "string",
    CLAIM: "string",
    BODYPART_COST: "object",
    WORLD_WIDTH: "number",
    WORLD_HEIGHT: "number",
    CREEP_LIFE_TIME: "number",
    CREEP_CLAIM_LIFE_TIME: "number",
    CREEP_CORPSE_RATE: "number",
    CREEP_PART_MAX_ENERGY: "number",
    CARRY_CAPACITY: "number",
    HARVEST_POWER: "number",
    HARVEST_MINERAL_POWER: "number",
    HARVEST_DEPOSIT_POWER: "number",
    REPAIR_POWER: "number",
    DISMANTLE_POWER: "number",
    BUILD_POWER: "number",
    ATTACK_POWER: "number",
    UPGRADE_CONTROLLER_POWER: "number",
    RANGED_ATTACK_POWER: "number",
    HEAL_POWER: "number",
    RANGED_HEAL_POWER: "number",
    REPAIR_COST: "number",
    DISMANTLE_COST: "number",
    RAMPART_DECAY_AMOUNT: "number",
    RAMPART_DECAY_TIME: "number",
    RAMPART_HITS: "number",
    RAMPART_HITS_MAX: "object",
    ENERGY_REGEN_TIME: "number",
    ENERGY_DECAY: "number",
    SPAWN_HITS: "number",
    SPAWN_ENERGY_START: "number",
    SPAWN_ENERGY_CAPACITY: "number",
    CREEP_SPAWN_TIME: "number",
    SPAWN_RENEW_RATIO: "number",
    SOURCE_ENERGY_CAPACITY: "number",
    SOURCE_ENERGY_NEUTRAL_CAPACITY: "number",
    SOURCE_ENERGY_KEEPER_CAPACITY: "number",
    WALL_HITS: "number",
    WALL_HITS_MAX: "number",
    EXTENSION_HITS: "number",
    EXTENSION_ENERGY_CAPACITY: "object",
    ROAD_HITS: "number",
    ROAD_WEAROUT: "number",
    ROAD_WEAROUT_POWER_CREEP: "number",
    ROAD_DECAY_AMOUNT: "number",
    ROAD_DECAY_TIME: "number",
    LINK_HITS: "number",
    LINK_HITS_MAX: "number",
    LINK_CAPACITY: "number",
    LINK_COOLDOWN: "number",
    LINK_LOSS_RATIO: "number",
    STORAGE_CAPACITY: "number",
    STORAGE_HITS: "number",
    STRUCTURE_SPAWN: "string",
    STRUCTURE_EXTENSION: "string",
    STRUCTURE_ROAD: "string",
    STRUCTURE_WALL: "string",
    STRUCTURE_RAMPART: "string",
    STRUCTURE_KEEPER_LAIR: "string",
    STRUCTURE_PORTAL: "string",
    STRUCTURE_CONTROLLER: "string",
    STRUCTURE_LINK: "string",
    STRUCTURE_STORAGE: "string",
    STRUCTURE_TOWER: "string",
    STRUCTURE_OBSERVER: "string",
    STRUCTURE_POWER_BANK: "string",
    STRUCTURE_POWER_SPAWN: "string",
    STRUCTURE_EXTRACTOR: "string",
    STRUCTURE_LAB: "string",
    STRUCTURE_TERMINAL: "string",
    STRUCTURE_CONTAINER: "string",
    STRUCTURE_NUKER: "string",
    STRUCTURE_FACTORY: "string",
    STRUCTURE_INVADER_CORE: "string",
    CONSTRUCTION_COST: "object",
    CONSTRUCTION_COST_ROAD_SWAMP_RATIO: "number",
    CONSTRUCTION_COST_ROAD_WALL_RATIO: "number",
    CONTROLLER_LEVELS: "object",
    CONTROLLER_STRUCTURES: "object",
    CONTROLLER_DOWNGRADE: "object",
    CONTROLLER_DOWNGRADE_RESTORE: "number",
    CONTROLLER_DOWNGRADE_SAFEMODE_THRESHOLD: "number",
    CONTROLLER_CLAIM_DOWNGRADE: "number",
    CONTROLLER_RESERVE: "number",
    CONTROLLER_RESERVE_MAX: "number",
    CONTROLLER_MAX_UPGRADE_PER_TICK: "number",
    CONTROLLER_ATTACK_BLOCKED_UPGRADE: "number",
    CONTROLLER_NUKE_BLOCKED_UPGRADE: "number",
    SAFE_MODE_DURATION: "number",
    SAFE_MODE_COOLDOWN: "number",
    SAFE_MODE_COST: "number",
    TOWER_HITS: "number",
    TOWER_CAPACITY: "number",
    TOWER_ENERGY_COST: "number",
    TOWER_POWER_ATTACK: "number",
    TOWER_POWER_HEAL: "number",
    TOWER_POWER_REPAIR: "number",
    TOWER_OPTIMAL_RANGE: "number",
    TOWER_FALLOFF_RANGE: "number",
    TOWER_FALLOFF: "number",
    OBSERVER_HITS: "number",
    OBSERVER_RANGE: "number",
    POWER_BANK_HITS: "number",
    POWER_BANK_CAPACITY_MAX: "number",
    POWER_BANK_CAPACITY_MIN: "number",
    POWER_BANK_CAPACITY_CRIT: "number",
    POWER_BANK_DECAY: "number",
    POWER_BANK_HIT_BACK: "number",
    POWER_SPAWN_HITS: "number",
    POWER_SPAWN_ENERGY_CAPACITY: "number",
    POWER_SPAWN_POWER_CAPACITY: "number",
    POWER_SPAWN_ENERGY_RATIO: "number",
    EXTRACTOR_HITS: "number",
    EXTRACTOR_COOLDOWN: "number",
    LAB_HITS: "number",
    LAB_MINERAL_CAPACITY: "number",
    LAB_ENERGY_CAPACITY: "number",
    LAB_BOOST_ENERGY: "number",
    LAB_BOOST_MINERAL: "number",
    LAB_COOLDOWN: "number",
    LAB_REACTION_AMOUNT: "number",
    LAB_UNBOOST_ENERGY: "number",
    LAB_UNBOOST_MINERAL: "number",
    GCL_POW: "number",
    GCL_MULTIPLY: "number",
    GCL_NOVICE: "number",
    MODE_SIMULATION: "object",
    MODE_WORLD: "object",
    TERRAIN_MASK_WALL: "number",
    TERRAIN_MASK_SWAMP: "number",
    TERRAIN_MASK_LAVA: "number",
    MAX_CONSTRUCTION_SITES: "number",
    MAX_CREEP_SIZE: "number",
    MINERAL_REGEN_TIME: "number",
    MINERAL_MIN_AMOUNT: "object",
    MINERAL_RANDOM_FACTOR: "number",
    MINERAL_DENSITY: "object",
    MINERAL_DENSITY_PROBABILITY: "object",
    MINERAL_DENSITY_CHANGE: "number",
    DENSITY_LOW: "number",
    DENSITY_MODERATE: "number",
    DENSITY_HIGH: "number",
    DENSITY_ULTRA: "number",
    DEPOSIT_EXHAUST_MULTIPLY: "number",
    DEPOSIT_EXHAUST_POW: "number",
    DEPOSIT_DECAY_TIME: "number",
    TERMINAL_CAPACITY: "number",
    TERMINAL_HITS: "number",
    TERMINAL_SEND_COST: "number",
    TERMINAL_MIN_SEND: "number",
    TERMINAL_COOLDOWN: "number",
    CONTAINER_HITS: "number",
    CONTAINER_CAPACITY: "number",
    CONTAINER_DECAY: "number",
    CONTAINER_DECAY_TIME: "number",
    CONTAINER_DECAY_TIME_OWNED: "number",
    NUKER_HITS: "number",
    NUKER_COOLDOWN: "number",
    NUKER_ENERGY_CAPACITY: "number",
    NUKER_GHODIUM_CAPACITY: "number",
    NUKE_LAND_TIME: "number",
    NUKE_RANGE: "number",
    NUKE_DAMAGE: "object",
    FACTORY_HITS: "number",
    FACTORY_CAPACITY: "number",
    TOMBSTONE_DECAY_PER_PART: "number",
    TOMBSTONE_DECAY_POWER_CREEP: "number",
    RUIN_DECAY: "number",
    RUIN_DECAY_STRUCTURES: "object",
    PORTAL_DECAY: "number",
    ORDER_SELL: "string",
    ORDER_BUY: "string",
    MARKET_FEE: "number",
    MARKET_MAX_ORDERS: "number",
    MARKET_ORDER_LIFE_TIME: "number",
    FLAGS_LIMIT: "number",
    SUBSCRIPTION_TOKEN: "string",
    RESOURCE_ENERGY: "string",
    RESOURCE_POWER: "string",
    RESOURCE_HYDROGEN: "string",
    RESOURCE_OXYGEN: "string",
    RESOURCE_UTRIUM: "string",
    RESOURCE_LEMERGIUM: "string",
    RESOURCE_KEANIUM: "string",
    RESOURCE_ZYNTHIUM: "string",
    RESOURCE_CATALYST: "string",
    RESOURCE_GHODIUM: "string",
    RESOURCE_SILICON: "string",
    RESOURCE_METAL: "string",
    RESOURCE_BIOMASS: "string",
    RESOURCE_MIST: "string",
    RESOURCE_HYDROXIDE: "string",
    RESOURCE_ZYNTHIUM_KEANITE: "string",
    RESOURCE_UTRIUM_LEMERGITE: "string",
    RESOURCE_UTRIUM_HYDRIDE: "string",
    RESOURCE_UTRIUM_OXIDE: "string",
    RESOURCE_KEANIUM_HYDRIDE: "string",
    RESOURCE_KEANIUM_OXIDE: "string",
    RESOURCE_LEMERGIUM_HYDRIDE: "string",
    RESOURCE_LEMERGIUM_OXIDE: "string",
    RESOURCE_ZYNTHIUM_HYDRIDE: "string",
    RESOURCE_ZYNTHIUM_OXIDE: "string",
    RESOURCE_GHODIUM_HYDRIDE: "string",
    RESOURCE_GHODIUM_OXIDE: "string",
    RESOURCE_UTRIUM_ACID: "string",
    RESOURCE_UTRIUM_ALKALIDE: "string",
    RESOURCE_KEANIUM_ACID: "string",
    RESOURCE_KEANIUM_ALKALIDE: "string",
    RESOURCE_LEMERGIUM_ACID: "string",
    RESOURCE_LEMERGIUM_ALKALIDE: "string",
    RESOURCE_ZYNTHIUM_ACID: "string",
    RESOURCE_ZYNTHIUM_ALKALIDE: "string",
    RESOURCE_GHODIUM_ACID: "string",
    RESOURCE_GHODIUM_ALKALIDE: "string",
    RESOURCE_CATALYZED_UTRIUM_ACID: "string",
    RESOURCE_CATALYZED_UTRIUM_ALKALIDE: "string",
    RESOURCE_CATALYZED_KEANIUM_ACID: "string",
    RESOURCE_CATALYZED_KEANIUM_ALKALIDE: "string",
    RESOURCE_CATALYZED_LEMERGIUM_ACID: "string",
    RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE: "string",
    RESOURCE_CATALYZED_ZYNTHIUM_ACID: "string",
    RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE: "string",
    RESOURCE_CATALYZED_GHODIUM_ACID: "string",
    RESOURCE_CATALYZED_GHODIUM_ALKALIDE: "string",
    RESOURCE_OPS: "string",
    RESOURCE_UTRIUM_BAR: "string",
    RESOURCE_LEMERGIUM_BAR: "string",
    RESOURCE_ZYNTHIUM_BAR: "string",
    RESOURCE_KEANIUM_BAR: "string",
    RESOURCE_GHODIUM_MELT: "string",
    RESOURCE_OXIDANT: "string",
    RESOURCE_REDUCTANT: "string",
    RESOURCE_PURIFIER: "string",
    RESOURCE_BATTERY: "string",
    RESOURCE_COMPOSITE: "string",
    RESOURCE_CRYSTAL: "string",
    RESOURCE_LIQUID: "string",
    RESOURCE_WIRE: "string",
    RESOURCE_SWITCH: "string",
    RESOURCE_TRANSISTOR: "string",
    RESOURCE_MICROCHIP: "string",
    RESOURCE_CIRCUIT: "string",
    RESOURCE_DEVICE: "string",
    RESOURCE_CELL: "string",
    RESOURCE_PHLEGM: "string",
    RESOURCE_TISSUE: "string",
    RESOURCE_MUSCLE: "string",
    RESOURCE_ORGANOID: "string",
    RESOURCE_ORGANISM: "string",
    RESOURCE_ALLOY: "string",
    RESOURCE_TUBE: "string",
    RESOURCE_FIXTURES: "string",
    RESOURCE_FRAME: "string",
    RESOURCE_HYDRAULICS: "string",
    RESOURCE_MACHINE: "string",
    RESOURCE_CONDENSATE: "string",
    RESOURCE_CONCENTRATE: "string",
    RESOURCE_EXTRACT: "string",
    RESOURCE_SPIRIT: "string",
    RESOURCE_EMANATION: "string",
    RESOURCE_ESSENCE: "string",
    REACTIONS: "object",
    BOOSTS: "object",
    REACTION_TIME: "object",
    PORTAL_UNSTABLE: "number",
    PORTAL_MIN_TIMEOUT: "number",
    PORTAL_MAX_TIMEOUT: "number",
    POWER_BANK_RESPAWN_TIME: "number",
    INVADERS_ENERGY_GOAL: "number",
    SYSTEM_USERNAME: "string",
    SIGN_NOVICE_AREA: "string",
    SIGN_RESPAWN_AREA: "string",
    SIGN_PLANNED_AREA: "string",
    EVENT_ATTACK: "number",
    EVENT_OBJECT_DESTROYED: "number",
    EVENT_ATTACK_CONTROLLER: "number",
    EVENT_BUILD: "number",
    EVENT_HARVEST: "number",
    EVENT_HEAL: "number",
    EVENT_REPAIR: "number",
    EVENT_RESERVE_CONTROLLER: "number",
    EVENT_UPGRADE_CONTROLLER: "number",
    EVENT_EXIT: "number",
    EVENT_POWER: "number",
    EVENT_TRANSFER: "number",
    EVENT_ATTACK_TYPE_MELEE: "number",
    EVENT_ATTACK_TYPE_RANGED: "number",
    EVENT_ATTACK_TYPE_RANGED_MASS: "number",
    EVENT_ATTACK_TYPE_DISMANTLE: "number",
    EVENT_ATTACK_TYPE_HIT_BACK: "number",
    EVENT_ATTACK_TYPE_NUKE: "number",
    EVENT_HEAL_TYPE_MELEE: "number",
    EVENT_HEAL_TYPE_RANGED: "number",
    POWER_LEVEL_MULTIPLY: "number",
    POWER_LEVEL_POW: "number",
    POWER_CREEP_SPAWN_COOLDOWN: "number",
    POWER_CREEP_DELETE_COOLDOWN: "number",
    POWER_CREEP_MAX_LEVEL: "number",
    POWER_CREEP_LIFE_TIME: "number",
    POWER_CLASS: "object",
    PWR_GENERATE_OPS: "number",
    PWR_OPERATE_SPAWN: "number",
    PWR_OPERATE_TOWER: "number",
    PWR_OPERATE_STORAGE: "number",
    PWR_OPERATE_LAB: "number",
    PWR_OPERATE_EXTENSION: "number",
    PWR_OPERATE_OBSERVER: "number",
    PWR_OPERATE_TERMINAL: "number",
    PWR_DISRUPT_SPAWN: "number",
    PWR_DISRUPT_TOWER: "number",
    PWR_DISRUPT_SOURCE: "number",
    PWR_SHIELD: "number",
    PWR_REGEN_SOURCE: "number",
    PWR_REGEN_MINERAL: "number",
    PWR_DISRUPT_TERMINAL: "number",
    PWR_OPERATE_POWER: "number",
    PWR_FORTIFY: "number",
    PWR_OPERATE_CONTROLLER: "number",
    PWR_OPERATE_FACTORY: "number",
    EFFECT_INVULNERABILITY: "number",
    EFFECT_COLLAPSE_TIMER: "number",
    INVADER_CORE_HITS: "number",
    INVADER_CORE_CREEP_SPAWN_TIME: "object",
    INVADER_CORE_EXPAND_TIME: "object",
    INVADER_CORE_CONTROLLER_POWER: "number",
    INVADER_CORE_CONTROLLER_DOWNGRADE: "number",
    STRONGHOLD_RAMPART_HITS: "object",
    STRONGHOLD_DECAY_TICKS: "number",
    POWER_INFO: "object",
    BODYPARTS_ALL: "object",
    RESOURCES_ALL: "object",
    COLORS_ALL: "object",
    INTERSHARD_RESOURCES: "object",
    COMMODITIES: "object"
};