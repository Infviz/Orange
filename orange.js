var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
if (typeof window.WeakMap === 'undefined') {
    (function () {
        var defineProperty = Object.defineProperty;
        var counter = Date.now() % 1e9;
        var WeakMap = function () {
            this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
        };
        WeakMap.prototype = {
            set: function (key, value) {
                var entry = key[this.name];
                if (entry && entry[0] === key)
                    entry[1] = value;
                else
                    defineProperty(key, this.name, { value: [key, value], writable: true });
            },
            get: function (key) {
                var entry;
                return (entry = key[this.name]) && entry[0] === key ?
                    entry[1] : undefined;
            },
            delete: function (key) {
                var entry = key[this.name];
                if (!entry)
                    return false;
                var hasValue = entry[0] === key;
                entry[0] = entry[1] = undefined;
                return hasValue;
            },
            has: function (key) {
                var entry = key[this.name];
                if (!entry)
                    return false;
                return entry[0] === key;
            }
        };
        window.WeakMap = WeakMap;
    })();
}
(function (global) {
    var registrationsTable = new window.WeakMap();
    var setImmediate = window.msSetImmediate;
    if (!setImmediate) {
        var setImmediateQueue = [];
        var sentinel = String(Math.random());
        window.addEventListener('message', function (e) {
            if (e.data === sentinel) {
                var queue = setImmediateQueue;
                setImmediateQueue = [];
                queue.forEach(function (func) {
                    func();
                });
            }
        });
        setImmediate = function (func) {
            setImmediateQueue.push(func);
            window.postMessage(sentinel, '*');
        };
    }
    var isScheduled = false;
    var scheduledObservers = [];
    function scheduleCallback(observer) {
        scheduledObservers.push(observer);
        if (!isScheduled) {
            isScheduled = true;
            setImmediate(dispatchCallbacks);
        }
    }
    function wrapIfNeeded(node) {
        return window.ShadowDOMPolyfill &&
            window.ShadowDOMPolyfill.wrapIfNeeded(node) ||
            node;
    }
    function dispatchCallbacks() {
        isScheduled = false;
        var observers = scheduledObservers;
        scheduledObservers = [];
        observers.sort(function (o1, o2) {
            return o1.uid_ - o2.uid_;
        });
        var anyNonEmpty = false;
        observers.forEach(function (observer) {
            var queue = observer.takeRecords();
            removeTransientObserversFor(observer);
            if (queue.length) {
                observer.callback_(queue, observer);
                anyNonEmpty = true;
            }
        });
        if (anyNonEmpty)
            dispatchCallbacks();
    }
    function removeTransientObserversFor(observer) {
        observer.nodes_.forEach(function (node) {
            var registrations = registrationsTable.get(node);
            if (!registrations)
                return;
            registrations.forEach(function (registration) {
                if (registration.observer === observer)
                    registration.removeTransientObservers();
            });
        });
    }
    function forEachAncestorAndObserverEnqueueRecord(target, callback) {
        for (var node = target; node; node = node.parentNode) {
            var registrations = registrationsTable.get(node);
            if (registrations) {
                for (var j = 0; j < registrations.length; j++) {
                    var registration = registrations[j];
                    var options = registration.options;
                    if (node !== target && !options.subtree)
                        continue;
                    var record = callback(options);
                    if (record)
                        registration.enqueue(record);
                }
            }
        }
    }
    var uidCounter = 0;
    function JsMutationObserver(callback) {
        this.callback_ = callback;
        this.nodes_ = [];
        this.records_ = [];
        this.uid_ = ++uidCounter;
    }
    JsMutationObserver.prototype = {
        observe: function (target, options) {
            target = wrapIfNeeded(target);
            if (!options.childList && !options.attributes && !options.characterData ||
                options.attributeOldValue && !options.attributes ||
                options.attributeFilter && options.attributeFilter.length &&
                    !options.attributes ||
                options.characterDataOldValue && !options.characterData) {
                throw new SyntaxError();
            }
            var registrations = registrationsTable.get(target);
            if (!registrations)
                registrationsTable.set(target, registrations = []);
            var registration;
            for (var i = 0; i < registrations.length; i++) {
                if (registrations[i].observer === this) {
                    registration = registrations[i];
                    registration.removeListeners();
                    registration.options = options;
                    break;
                }
            }
            if (!registration) {
                registration = new Registration(this, target, options);
                registrations.push(registration);
                this.nodes_.push(target);
            }
            registration.addListeners();
        },
        disconnect: function () {
            this.nodes_.forEach(function (node) {
                var registrations = registrationsTable.get(node);
                for (var i = 0; i < registrations.length; i++) {
                    var registration = registrations[i];
                    if (registration.observer === this) {
                        registration.removeListeners();
                        registrations.splice(i, 1);
                        break;
                    }
                }
            }, this);
            this.records_ = [];
        },
        takeRecords: function () {
            var copyOfRecords = this.records_;
            this.records_ = [];
            return copyOfRecords;
        }
    };
    function MutationRecord(type, target) {
        this.type = type;
        this.target = target;
        this.addedNodes = [];
        this.removedNodes = [];
        this.previousSibling = null;
        this.nextSibling = null;
        this.attributeName = null;
        this.attributeNamespace = null;
        this.oldValue = null;
    }
    function copyMutationRecord(original) {
        var record = new MutationRecord(original.type, original.target);
        record.addedNodes = original.addedNodes.slice();
        record.removedNodes = original.removedNodes.slice();
        record.previousSibling = original.previousSibling;
        record.nextSibling = original.nextSibling;
        record.attributeName = original.attributeName;
        record.attributeNamespace = original.attributeNamespace;
        record.oldValue = original.oldValue;
        return record;
    }
    ;
    var currentRecord, recordWithOldValue;
    function getRecord(type, target) {
        return currentRecord = new MutationRecord(type, target);
    }
    function getRecordWithOldValue(oldValue) {
        if (recordWithOldValue)
            return recordWithOldValue;
        recordWithOldValue = copyMutationRecord(currentRecord);
        recordWithOldValue.oldValue = oldValue;
        return recordWithOldValue;
    }
    function clearRecords() {
        currentRecord = recordWithOldValue = undefined;
    }
    function recordRepresentsCurrentMutation(record) {
        return record === recordWithOldValue || record === currentRecord;
    }
    function selectRecord(lastRecord, newRecord) {
        if (lastRecord === newRecord)
            return lastRecord;
        if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord))
            return recordWithOldValue;
        return null;
    }
    function Registration(observer, target, options) {
        this.observer = observer;
        this.target = target;
        this.options = options;
        this.transientObservedNodes = [];
    }
    Registration.prototype = {
        enqueue: function (record) {
            var records = this.observer.records_;
            var length = records.length;
            if (records.length > 0) {
                var lastRecord = records[length - 1];
                var recordToReplaceLast = selectRecord(lastRecord, record);
                if (recordToReplaceLast) {
                    records[length - 1] = recordToReplaceLast;
                    return;
                }
            }
            else {
                scheduleCallback(this.observer);
            }
            records[length] = record;
        },
        addListeners: function () {
            this.addListeners_(this.target);
        },
        addListeners_: function (node) {
            var options = this.options;
            if (options.attributes)
                node.addEventListener('DOMAttrModified', this, true);
            if (options.characterData)
                node.addEventListener('DOMCharacterDataModified', this, true);
            if (options.childList)
                node.addEventListener('DOMNodeInserted', this, true);
            if (options.childList || options.subtree)
                node.addEventListener('DOMNodeRemoved', this, true);
        },
        removeListeners: function () {
            this.removeListeners_(this.target);
        },
        removeListeners_: function (node) {
            var options = this.options;
            if (options.attributes)
                node.removeEventListener('DOMAttrModified', this, true);
            if (options.characterData)
                node.removeEventListener('DOMCharacterDataModified', this, true);
            if (options.childList)
                node.removeEventListener('DOMNodeInserted', this, true);
            if (options.childList || options.subtree)
                node.removeEventListener('DOMNodeRemoved', this, true);
        },
        addTransientObserver: function (node) {
            if (node === this.target)
                return;
            this.addListeners_(node);
            this.transientObservedNodes.push(node);
            var registrations = registrationsTable.get(node);
            if (!registrations)
                registrationsTable.set(node, registrations = []);
            registrations.push(this);
        },
        removeTransientObservers: function () {
            var transientObservedNodes = this.transientObservedNodes;
            this.transientObservedNodes = [];
            transientObservedNodes.forEach(function (node) {
                this.removeListeners_(node);
                var registrations = registrationsTable.get(node);
                for (var i = 0; i < registrations.length; i++) {
                    if (registrations[i] === this) {
                        registrations.splice(i, 1);
                        break;
                    }
                }
            }, this);
        },
        handleEvent: function (e) {
            e.stopImmediatePropagation();
            switch (e.type) {
                case 'DOMAttrModified':
                    var name = e.attrName;
                    var namespace = e.relatedNode.namespaceURI;
                    var target = e.target;
                    var record = new getRecord('attributes', target);
                    record.attributeName = name;
                    record.attributeNamespace = namespace;
                    var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
                    forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                        if (!options.attributes)
                            return;
                        if (options.attributeFilter && options.attributeFilter.length &&
                            options.attributeFilter.indexOf(name) === -1 &&
                            options.attributeFilter.indexOf(namespace) === -1) {
                            return;
                        }
                        if (options.attributeOldValue)
                            return getRecordWithOldValue(oldValue);
                        return record;
                    });
                    break;
                case 'DOMCharacterDataModified':
                    var target = e.target;
                    var record = getRecord('characterData', target);
                    var oldValue = e.prevValue;
                    forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                        if (!options.characterData)
                            return;
                        if (options.characterDataOldValue)
                            return getRecordWithOldValue(oldValue);
                        return record;
                    });
                    break;
                case 'DOMNodeRemoved':
                    this.addTransientObserver(e.target);
                case 'DOMNodeInserted':
                    var target = e.relatedNode;
                    var changedNode = e.target;
                    var addedNodes, removedNodes;
                    if (e.type === 'DOMNodeInserted') {
                        addedNodes = [changedNode];
                        removedNodes = [];
                    }
                    else {
                        addedNodes = [];
                        removedNodes = [changedNode];
                    }
                    var previousSibling = changedNode.previousSibling;
                    var nextSibling = changedNode.nextSibling;
                    var record = getRecord('childList', target);
                    record.addedNodes = addedNodes;
                    record.removedNodes = removedNodes;
                    record.previousSibling = previousSibling;
                    record.nextSibling = nextSibling;
                    forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                        if (!options.childList)
                            return;
                        return record;
                    });
            }
            clearRecords();
        }
    };
    global.JsMutationObserver = JsMutationObserver;
    if (!global.MutationObserver)
        global.MutationObserver = JsMutationObserver;
})(this);
var Orange;
(function (Orange) {
    var Uuid = (function () {
        function Uuid(uuid) {
            if (uuid == null)
                this._value = Uuid.generateV4Uuid();
            else if (Uuid.isUuid(uuid))
                this._value = uuid;
            else
                throw "The argument passed to Orange.Uuid() is not a valid Uuid.";
        }
        Object.defineProperty(Uuid.prototype, "value", {
            get: function () { return this._value; },
            enumerable: true,
            configurable: true
        });
        Uuid.generateV4Uuid = function () {
            var tc = Uuid.getTime();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
                .replace(/[xy]/g, function (c) {
                var rnd = (tc + Math.random() * 16) % 16 | 0;
                tc = Math.floor(tc / 16);
                return (c == 'x' ? rnd : (rnd & 0x3 | 0x8)).toString(16);
            });
        };
        Uuid.generate = function () {
            return new Uuid();
        };
        Uuid.isUuid = function (value) {
            var chars = "[0-9a-fA-F]";
            var pattern = new RegExp(chars + "{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}");
            return pattern.test(value);
        };
        Uuid.prototype.sameValueAs = function (uuid) { return this._value.toLowerCase() === uuid._value.toLowerCase(); };
        Uuid.prototype.toString = function () { return this._value; };
        return Uuid;
    }());
    Uuid._counter = 0;
    Uuid._tStart = Date.now == null ? Date.now() : new Date().getTime();
    Uuid.getTime = (window.performance == null && window.performance.now == null) ?
        function () { return Math.round(performance.now() + Uuid._tStart); } :
        (Date.now == null ?
            function () { return Date.now(); } :
            function () { return (new Date()).getTime(); });
    Orange.Uuid = Uuid;
})(Orange || (Orange = {}));
var Orange;
(function (Orange) {
    var Modularity;
    (function (Modularity) {
        function inject(target) {
            if (window.Reflect == null)
                throw "An attempt to use Orange.Modularity.inject decorator was made without an available Reflect implementation.";
            target.dependencies = function () {
                var deps = window.Reflect.getMetadata("design:paramtypes", target);
                return deps || [];
            };
        }
        Modularity.inject = inject;
        var ResolveError = (function (_super) {
            __extends(ResolveError, _super);
            function ResolveError(message, innerError) {
                var _this = _super.call(this) || this;
                _this.innerError = innerError;
                _this.message = message;
                _this.name = "ResolveError";
                return _this;
            }
            return ResolveError;
        }(Error));
        Modularity.ResolveError = ResolveError;
        var Container = (function () {
            function Container() {
                this.typeMap = [];
                this.instances = [];
                this.registerInstance(Container, this);
            }
            Object.defineProperty(Container, "defaultContainer", {
                get: function () { return Container._defaultContainer; },
                enumerable: true,
                configurable: true
            });
            Container.prototype.registerInstance = function (type, instance) {
                this.instances.push({ key: type, value: instance });
            };
            Container.prototype.registerType = function (type, instance) {
                this.typeMap.push({ key: type, value: instance });
            };
            Container.prototype.tryResolve = function (type, register) {
                if (register === void 0) { register = false; }
                return __awaiter(this, void 0, void 0, function () {
                    var ctr, e_1, instance, resolvedType;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(typeof type === "string")) return [3 /*break*/, 4];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, Container.getConstructorFromString(type)];
                            case 2:
                                ctr = _a.sent();
                                if (ctr == null)
                                    return [2 /*return*/, { instance: null, success: false }];
                                type = ctr;
                                return [3 /*break*/, 4];
                            case 3:
                                e_1 = _a.sent();
                                return [2 /*return*/, { instance: null, success: false }];
                            case 4:
                                instance = this.lookup(this.instances, type);
                                if (instance != null)
                                    return [2 /*return*/, { instance: instance, success: true }];
                                resolvedType = this.lookup(this.typeMap, type) || type;
                                if (false == Container.isValidConstructor(resolvedType))
                                    return [2 /*return*/, { instance: null, success: false }];
                                if (false == this.checkArity(resolvedType))
                                    return [2 /*return*/, { instance: null, success: false }];
                                return [4 /*yield*/, this.createInstance(resolvedType)];
                            case 5:
                                instance = _a.sent();
                                if (register === true)
                                    this.registerInstance(type, instance);
                                return [2 /*return*/, { instance: instance, success: true }];
                        }
                    });
                });
            };
            Container.prototype.resolve = function (type, register) {
                if (register === void 0) { register = false; }
                return __awaiter(this, void 0, void 0, function () {
                    var typeConstructor, ctr, e_2, instance, resolvedType;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                typeConstructor = type;
                                if (!(typeof type === "string")) return [3 /*break*/, 5];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, Container.getConstructorFromString(type)];
                            case 2:
                                ctr = _a.sent();
                                typeConstructor = ctr;
                                return [3 /*break*/, 4];
                            case 3:
                                e_2 = _a.sent();
                                throw new ResolveError("Failed to resolve type '" + type + "', see innerError for details", e_2);
                            case 4:
                                if (typeConstructor == null)
                                    throw new ResolveError("No constructor identified by \"" + type + "\" could be found");
                                _a.label = 5;
                            case 5:
                                instance = this.lookup(this.instances, typeConstructor);
                                if (instance != null)
                                    return [2 /*return*/, instance];
                                resolvedType = this.lookup(this.typeMap, typeConstructor) || typeConstructor;
                                if (false == Container.isValidConstructor(resolvedType))
                                    throw new ResolveError("Orange.Modularity.Container failed to resolve type \"" + type + "\"");
                                if (false == this.checkArity(resolvedType))
                                    throw new ResolveError("Orange.Modularity.Container failed to resolve type \"" + type + "\"");
                                return [4 /*yield*/, this.createInstance(resolvedType)];
                            case 6:
                                instance = _a.sent();
                                if (register === true)
                                    this.registerInstance(typeConstructor, instance);
                                return [2 /*return*/, instance];
                        }
                    });
                });
            };
            Container.prototype.resolveWithOverride = function (type, overrides) {
                var sub = new Container();
                sub.typeMap = this.typeMap;
                sub.instances = overrides.concat(this.instances);
                return sub.resolve(type, false);
            };
            Container.getConstructorFromString = function (constructorName) {
                return __awaiter(this, void 0, void 0, function () {
                    var path, func, _i, path_1, fragment, sjs, module, e_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                path = constructorName.split(".");
                                func = window;
                                for (_i = 0, path_1 = path; _i < path_1.length; _i++) {
                                    fragment = path_1[_i];
                                    if (func[fragment] == null)
                                        break;
                                    func = func[fragment];
                                }
                                if (Container.isValidConstructor(func))
                                    return [2 /*return*/, func];
                                func = null;
                                if (window.require != null) {
                                    func = window.require(constructorName);
                                }
                                if (!(func == null)) return [3 /*break*/, 4];
                                if (!(window.SystemJS != null)) return [3 /*break*/, 4];
                                sjs = window.SystemJS;
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, sjs.import(constructorName)];
                            case 2:
                                module = _a.sent();
                                func = module;
                                return [3 /*break*/, 4];
                            case 3:
                                e_3 = _a.sent();
                                return [2 /*return*/, null];
                            case 4:
                                if (func == null)
                                    return [2 /*return*/, null];
                                if (Container.isValidConstructor(func))
                                    return [2 /*return*/, func];
                                if (func.default != null && Container.isValidConstructor(func.default))
                                    return [2 /*return*/, func.default];
                                return [2 /*return*/, null];
                        }
                    });
                });
            };
            Container.prototype.lookup = function (dict, key) {
                for (var _i = 0, dict_1 = dict; _i < dict_1.length; _i++) {
                    var kvp = dict_1[_i];
                    if (kvp.key === key)
                        return kvp.value;
                }
            };
            Container.prototype.createInstance = function (resolvedType) {
                return __awaiter(this, void 0, void 0, function () {
                    var instance, depCount, ctrArgs, deps, _i, deps_1, dep, _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                depCount = resolvedType.dependencies ? resolvedType.dependencies().length : 0;
                                if (!(depCount == 0)) return [3 /*break*/, 1];
                                instance = new resolvedType();
                                return [3 /*break*/, 6];
                            case 1:
                                ctrArgs = [];
                                deps = resolvedType.dependencies();
                                _i = 0, deps_1 = deps;
                                _d.label = 2;
                            case 2:
                                if (!(_i < deps_1.length)) return [3 /*break*/, 5];
                                dep = deps_1[_i];
                                _b = (_a = ctrArgs).push;
                                return [4 /*yield*/, this.resolve(dep)];
                            case 3:
                                _b.apply(_a, [_d.sent()]);
                                _d.label = 4;
                            case 4:
                                _i++;
                                return [3 /*break*/, 2];
                            case 5:
                                instance = this.applyConstructor(resolvedType, ctrArgs);
                                _d.label = 6;
                            case 6: return [2 /*return*/, instance];
                        }
                    });
                });
            };
            Container.prototype.checkArity = function (type) {
                var depCount = type.dependencies ? type.dependencies().length : 0;
                var ctrCount = (type.length || type.arity || 0);
                return depCount === ctrCount;
            };
            Container.isValidConstructor = function (type) {
                return type != null && (typeof (type) == "function");
            };
            Container.prototype.applyConstructor = function (ctor, args) {
                return new (Function.bind.apply(ctor, [null].concat(args)));
            };
            return Container;
        }());
        Container._defaultContainer = new Container();
        Modularity.Container = Container;
    })(Modularity = Orange.Modularity || (Orange.Modularity = {}));
})(Orange || (Orange = {}));
var Orange;
(function (Orange) {
    var Modularity;
    (function (Modularity) {
        var RegionManager = (function () {
            function RegionManager(container) {
                this.container = container;
            }
            RegionManager.prototype.disposeRegions = function (root) {
                var attr = root.getAttribute("data-view");
                if (attr == null || attr == "") {
                    if (typeof root.children !== "undefined") {
                        for (var i = 0; i < root.children.length; i++)
                            this.disposeRegions(root.children[i]);
                    }
                }
                else {
                    var view = root["instance"];
                    if (typeof view.dispose === 'function')
                        view.dispose();
                }
            };
            RegionManager.prototype.initializeRegions = function (root) {
                return __awaiter(this, void 0, void 0, function () {
                    var attr, i, viewType, view, idAttr;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                attr = root.getAttribute("data-view");
                                if (!(attr == null || attr == "")) return [3 /*break*/, 1];
                                if (typeof root.children !== "undefined") {
                                    for (i = 0; i < root.children.length; i++)
                                        this.initializeRegions(root.children[i]);
                                }
                                return [3 /*break*/, 3];
                            case 1:
                                viewType = eval(attr);
                                return [4 /*yield*/, this.container.resolve(viewType)];
                            case 2:
                                view = _a.sent();
                                if (typeof view.element !== "undefined")
                                    view.element = root;
                                idAttr = root.getAttribute("data-view-id");
                                if (idAttr != null && attr != "") {
                                    if (view.setViewId !== "undefined") {
                                        view.setViewId(idAttr);
                                    }
                                }
                                root["instance"] = view;
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            };
            return RegionManager;
        }());
        Modularity.RegionManager = RegionManager;
    })(Modularity = Orange.Modularity || (Orange.Modularity = {}));
})(Orange || (Orange = {}));
var TemplateLoader = (function () {
    function TemplateLoader() {
    }
    TemplateLoader.staticlyLoaded = function () {
        if (TemplateLoader.onload)
            TemplateLoader.onload();
    };
    TemplateLoader.load = function (templates) {
        var loadedTemplates = 0;
        for (var i = 0; i < templates.length; i++) {
            (function () {
                var tpl = templates[i];
                var id = tpl.id;
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange =
                    function () {
                        if (xmlhttp.readyState !== 4)
                            return;
                        if (xmlhttp.status !== 200 && xmlhttp.status !== 0)
                            throw "Failed to load template.";
                        var scriptEl = document.createElement("script");
                        var typeAttr = document.createAttribute("type");
                        typeAttr.value = "text/html";
                        var idAttr = document.createAttribute("id");
                        idAttr.value = id;
                        scriptEl.setAttributeNode(typeAttr);
                        scriptEl.setAttributeNode(idAttr);
                        scriptEl.innerHTML = xmlhttp.responseText;
                        document.body.appendChild(scriptEl);
                        loadedTemplates++;
                        if (loadedTemplates == templates.length && TemplateLoader.onload)
                            TemplateLoader.onload();
                    };
                xmlhttp.open("GET", tpl.path, true);
                xmlhttp.send();
            })();
        }
        ;
    };
    return TemplateLoader;
}());
var Orange;
(function (Orange) {
    var Controls;
    (function (Controls) {
        var Control = (function () {
            function Control() {
                this._element = null;
                this._id = null;
                this.disposables = new Array();
                this._propertyChangedListeners = new Array();
            }
            Object.defineProperty(Control.prototype, "element", {
                get: function () { return this._element; },
                set: function (element) {
                    if (this._element != null)
                        throw "The 'element' property can only ever be set once.";
                    this._element = element;
                    this.onElementSet();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Control.prototype, "id", {
                get: function () { return this._id; },
                set: function (v) {
                    if (this._id != null)
                        throw "The 'id' property can only ever be set once.";
                    this._id = v;
                },
                enumerable: true,
                configurable: true
            });
            Control.prototype.addDisposable = function (disposable) {
                this.disposables.push(disposable);
            };
            Control.prototype.dispose = function () {
                Controls.ControlManager.disposeControl(this);
            };
            Control.prototype.addPropertyChangedListener = function (listener) {
                this._propertyChangedListeners.push(listener);
            };
            Control.prototype.removePropertyChangedListener = function (listener) {
                var idx = this._propertyChangedListeners.indexOf(listener);
                if (idx > -1)
                    this._propertyChangedListeners.splice(idx, 1);
            };
            Control.getPropertyName = function (property) {
                var regexMatch = Control.propertyRegex.exec(String(property));
                return regexMatch[regexMatch.length - 1];
            };
            Control.prototype.raisePropertyChanged = function (property) {
                var propertyName = null;
                if (typeof property === "string") {
                    propertyName = property;
                }
                else if (typeof property === "function") {
                    propertyName = Control.getPropertyName(property);
                }
                else {
                    throw "Invalid argument passed to raisePropertyChanged";
                }
                if (typeof (this[propertyName]) === "undefined")
                    throw "Attempt to access undefined property '" + propertyName + "' was made.";
                var value = this[propertyName];
                this.onPropertyChanged(propertyName, value);
                for (var plIdx = this._propertyChangedListeners.length - 1; plIdx >= 0; plIdx--)
                    this._propertyChangedListeners[plIdx](propertyName, value);
            };
            Control.prototype.onElementSet = function () { };
            ;
            Control.prototype.onPropertyChanged = function (propertyName, value) { };
            Control.prototype.onControlCreated = function () { };
            return Control;
        }());
        Control.propertyRegex = /return ([_a-zA-Z0-9]+)(\.([_a-zA-Z0-9]+))*;?/;
        Controls.Control = Control;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
var Orange;
(function (Orange) {
    var Controls;
    (function (Controls) {
        var StringTemplateProvider = (function () {
            function StringTemplateProvider(template) {
                this._template = template;
            }
            StringTemplateProvider.prototype.applyTemplate = function (element, onTemplateAppliedCallback) {
                element.innerHTML = this._template;
                onTemplateAppliedCallback(true);
            };
            return StringTemplateProvider;
        }());
        Controls.StringTemplateProvider = StringTemplateProvider;
        var ScriptTemplateProvider = (function () {
            function ScriptTemplateProvider(templateName) {
                this._templateName = templateName;
            }
            ScriptTemplateProvider.prototype.applyTemplate = function (element, onTemplateAppliedCallback) {
                var template = document.body.querySelector("#" + this._templateName);
                if (template == null) {
                    onTemplateAppliedCallback(false, "No script tag with id='" + this._templateName + "' found");
                    return;
                }
                element.innerHTML = template.innerHTML;
                onTemplateAppliedCallback(true);
            };
            return ScriptTemplateProvider;
        }());
        Controls.ScriptTemplateProvider = ScriptTemplateProvider;
        var TemplatedControl = (function (_super) {
            __extends(TemplatedControl, _super);
            function TemplatedControl(templateProvider) {
                var _this = _super.call(this) || this;
                _this._templateProvider = null;
                _this._isTemplateApplied = false;
                _this._templateProvider = templateProvider;
                return _this;
            }
            Object.defineProperty(TemplatedControl.prototype, "isTemplateApplied", {
                get: function () { return this._isTemplateApplied; },
                enumerable: true,
                configurable: true
            });
            TemplatedControl.prototype.onApplyTemplate = function () { };
            TemplatedControl.prototype.applyTemplate = function (doneCallback) {
                var _this = this;
                this._templateProvider
                    .applyTemplate(this.element, function (success, error) {
                    if (success) {
                        _this._isTemplateApplied = true;
                        _this.onApplyTemplate();
                        doneCallback();
                    }
                    else {
                        throw {
                            message: "TemplatedControl.applyTemplate: A template provider failed to apply its template: " + (error || "").toString(),
                            templateProvider: _this._templateProvider,
                            element: _this.element
                        };
                    }
                });
            };
            return TemplatedControl;
        }(Controls.Control));
        Controls.TemplatedControl = TemplatedControl;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
var Orange;
(function (Orange) {
    var Controls;
    (function (Controls) {
        var ViewBase = (function (_super) {
            __extends(ViewBase, _super);
            function ViewBase(templateName, context) {
                var _this = _super.call(this, new Controls.ScriptTemplateProvider(templateName)) || this;
                _this._dataContext = null;
                _this._dataContext = context == null ? null : context;
                return _this;
            }
            Object.defineProperty(ViewBase.prototype, "dataContext", {
                get: function () { return this._dataContext; },
                set: function (context) {
                    this._dataContext = context;
                    this.applyTemplate(function () { });
                },
                enumerable: true,
                configurable: true
            });
            ViewBase.prototype.getControl = function (selector) {
                var element = this.element.querySelector(selector);
                if (element == null || (element.orange) == null || (element.orange).control == null)
                    return null;
                return ((element.orange).control);
            };
            ViewBase.prototype.applyTemplate = function (doneCallback) {
                if (null == this.element)
                    return;
                this.element.innerHTML = "";
                if (this.dataContext != null)
                    _super.prototype.applyTemplate.call(this, doneCallback);
                else
                    doneCallback();
            };
            ViewBase.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
                this.applyBindings();
            };
            ViewBase.prototype.applyBindings = function () {
                if (false == this.isTemplateApplied)
                    return;
                this.onApplyBindings();
            };
            ViewBase.prototype.onApplyBindings = function () { };
            return ViewBase;
        }(Controls.TemplatedControl));
        Controls.ViewBase = ViewBase;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
var Orange;
(function (Orange) {
    var Controls;
    (function (Controls) {
        var OrangeElementExtension = (function () {
            function OrangeElementExtension(element) {
                this.element = element;
                this.control = null;
                this.isInitialized = false;
                this._onInitializedListeners = new Array();
            }
            OrangeElementExtension.prototype.addOnInitializedListener = function (callback) {
                this._onInitializedListeners.push(callback);
            };
            OrangeElementExtension.prototype.getOnOnitializedListners = function () {
                return this._onInitializedListeners;
            };
            OrangeElementExtension.prototype.removeOnInitializedListener = function (callback) {
                var idx = this._onInitializedListeners.indexOf(callback);
                if (idx > -1)
                    this._onInitializedListeners.splice(idx, 1);
            };
            return OrangeElementExtension;
        }());
        Controls.GetOrInitializeOrangeElement = function (element) {
            var el = element;
            if (el.orange == null)
                el.orange = new OrangeElementExtension(element);
            return el.orange;
        };
        var ControlManager = (function () {
            function ControlManager(container) {
                var _this = this;
                this._observer = null;
                this._element = null;
                this.onMutation = function (mut, obs) {
                    mut.forEach(_this.handleMutation);
                };
                this.handleMutation = function (mutation) {
                    if (mutation.type !== "childList")
                        return;
                    var removedNodes = mutation.removedNodes;
                    for (var i = 0; i < removedNodes.length; i++) {
                        var node = removedNodes[i];
                        if (node.nodeType !== 1)
                            continue;
                        ControlManager.disposeDescendants(node);
                    }
                    var addedNodes = mutation.addedNodes;
                    for (var i = 0; i < addedNodes.length; i++) {
                        var node = addedNodes[i];
                        if (node.nodeType !== 1)
                            continue;
                        ControlManager.createControlsInElement(node, _this._container);
                    }
                };
                this._container = container;
            }
            Object.defineProperty(ControlManager.prototype, "containter", {
                get: function () { return this._container; },
                enumerable: true,
                configurable: true
            });
            ControlManager.disposeDescendants = function (root) {
                var attr = ControlManager.getControlAttribute(root);
                if (attr == null) {
                    if (typeof root.children !== "undefined") {
                        for (var i = 0; i < root.children.length; i++)
                            this.disposeDescendants(root.children[i]);
                    }
                }
                else {
                    var orangeEl = Controls.GetOrInitializeOrangeElement(root);
                    if (orangeEl.control != null)
                        orangeEl.control.dispose();
                }
            };
            ControlManager.disposeControl = function (control) {
                if (control == null)
                    return;
                var element = control.element;
                if (element != null)
                    element.orange = null;
                var disposables = control.disposables;
                for (var dIdx = disposables.length - 1; dIdx >= 0; dIdx--)
                    disposables[dIdx].dispose();
                if (typeof element.children !== "undefined") {
                    var children = element.children;
                    for (var cIdx = 0; cIdx < children.length; cIdx++)
                        ControlManager.disposeDescendants(children[cIdx]);
                }
            };
            ControlManager.prototype.manage = function (element) {
                if (this._observer != null)
                    this.dispose();
                this._element = element;
                this._observer = new MutationObserver(this.onMutation);
                this._observer.observe(element, ControlManager._mutationObserverConfig);
                ControlManager.createControlsInElement(this._element, this._container);
            };
            ControlManager.getChildren = function (element) {
                var result = new Array();
                if (typeof element.children != null) {
                    for (var i = 0; i < element.children.length; i++) {
                        result.push(element.children[i]);
                    }
                }
                return result;
            };
            ControlManager.getControlAttribute = function (element) {
                var attr = null;
                var anIdx = 0;
                while ((attr == null || attr == "") && anIdx < ControlManager._controlAttributeNames.length)
                    attr = element.getAttribute(ControlManager._controlAttributeNames[anIdx++]);
                if (attr == null || attr == "")
                    return null;
                return {
                    attributeType: ControlManager._controlAttributeNames[anIdx - 1],
                    value: attr
                };
            };
            ControlManager.createControlsInElement = function (element, container) {
                var attr = ControlManager.getControlAttribute(element);
                if (attr != null) {
                    ControlManager.createControlFromElement(element, container);
                }
                else {
                    var controls = element.querySelectorAll("[" + this._controlAttributeNames.join("], [") + "]");
                    for (var ceIdx = 0; ceIdx < controls.length; ++ceIdx) {
                        ControlManager.createControlFromElement((controls[ceIdx]), container);
                    }
                }
            };
            ControlManager.prototype.dispose = function () {
                this._observer.disconnect();
                this._observer = null;
            };
            ControlManager.createControlFromElement = function (controlElement, container) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, ControlManager.createControlInternal(controlElement, container)];
                    });
                });
            };
            ControlManager.createControlFromType = function (type, container) {
                return __awaiter(this, void 0, void 0, function () {
                    var element;
                    return __generator(this, function (_a) {
                        element = document.createElement("div");
                        element.setAttribute(ControlManager._controlAttributeNames[0], type);
                        return [2 /*return*/, ControlManager.createControlInternal(element, container)];
                    });
                });
            };
            ControlManager.createControlInternal = function (element, container) {
                return __awaiter(this, void 0, void 0, function () {
                    var type, orangeElement, control, finalize;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                type = ControlManager.getControlAttribute(element);
                                orangeElement = Controls.GetOrInitializeOrangeElement(element);
                                if (orangeElement.isInitialized)
                                    return [2 /*return*/, orangeElement.control];
                                return [4 /*yield*/, container.resolve(type.value)];
                            case 1:
                                control = _a.sent();
                                orangeElement.control = control;
                                control.id = Orange.Uuid.generate();
                                element.setAttribute('data-control-id', control.id.value);
                                control.element = element;
                                finalize = function () {
                                    ControlManager
                                        .getChildren(element)
                                        .forEach(function (child) {
                                        return ControlManager
                                            .createControlsInElement(child, container);
                                    });
                                    control.onControlCreated && control.onControlCreated();
                                    orangeElement.isInitialized = true;
                                    orangeElement
                                        .getOnOnitializedListners()
                                        .forEach(function (listener) { return listener(); });
                                };
                                if (control.applyTemplate == null)
                                    finalize();
                                else {
                                    control.applyTemplate(finalize);
                                }
                                return [2 /*return*/, control];
                        }
                    });
                });
            };
            return ControlManager;
        }());
        ControlManager.dependencies = function () { return [Orange.Modularity.Container]; };
        ControlManager._mutationObserverConfig = {
            childList: true,
            attributes: false,
            characterData: false,
            subtree: true,
            attributeOldValue: false,
            characterDataOldValue: false,
        };
        ControlManager._controlAttributeNames = ["data-control", "data-view"];
        Controls.ControlManager = ControlManager;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
var Orange;
(function (Orange) {
    var Routing;
    (function (Routing) {
        var PathHandler = (function () {
            function PathHandler(path, handler) {
                if (typeof path === 'string')
                    path = path.toLowerCase();
                this.path = path;
                this.handler = handler;
            }
            PathHandler.prototype.tryMatch = function (path) {
                var selfPath = this.path;
                if (selfPath === "*")
                    return {};
                if (selfPath instanceof RegExp) {
                    if (selfPath.test(path)) {
                        return selfPath.exec(path);
                    }
                }
                return selfPath === path ? {} : null;
            };
            return PathHandler;
        }());
        var Router = (function () {
            function Router() {
                var _this = this;
                this.paths = [];
                this.listeners = [];
                this.onpopstate = function (evnt) {
                    console.log("handle popstate: " + location.pathname);
                    _this.handleRoute(location.pathname);
                };
                this.onclick = function (e) {
                    var elem = (e.target || e.srcElement);
                    var getAnchor = function (element) {
                        if (element == null)
                            return null;
                        if (element.tagName == "A")
                            return element;
                        return getAnchor(element.parentElement);
                    };
                    var anchor = getAnchor(elem);
                    if (anchor != null &&
                        anchor.tagName === "A" &&
                        anchor.target === "" &&
                        (!anchor.hostname || anchor.hostname === location.hostname)) {
                        var wasHandled = _this.navigate(anchor.pathname, null);
                        if (wasHandled) {
                            e.preventDefault();
                        }
                    }
                };
            }
            Router.prototype.route = function (path, handler) {
                this.paths.push(new PathHandler(path, handler));
            };
            Router.prototype.listen = function (path, handler) {
                this.listeners.push(new PathHandler(path, handler));
            };
            Router.prototype.unroute = function (path) {
                this.paths = this.paths.filter(function (p) {
                    return p.path.toString() !== path.toString();
                });
            };
            Router.prototype.default = function (handler) {
                this.route("*", handler);
            };
            Router.prototype.run = function () {
                window.addEventListener("popstate", this.onpopstate);
                window.addEventListener("click", this.onclick);
                this.handleRoute(location.pathname);
            };
            Router.prototype.navigate = function (navigatePath, state) {
                if (state === void 0) { state = null; }
                var path = this.cleanPath(navigatePath);
                if (path === this.cleanPath(location.pathname))
                    return true;
                if (this.handleRoute(path)) {
                    history.pushState(state, null, path);
                    return true;
                }
                else {
                    return false;
                }
            };
            Router.prototype.dispose = function () {
                window.removeEventListener("popstate", this.onpopstate);
                window.removeEventListener("click", this.onclick);
            };
            Router.prototype.cleanPath = function (path) {
                path = path.toLowerCase();
                if (path.substr(-1) === '/') {
                    path = path.substr(0, path.length - 1);
                }
                return path;
            };
            Router.prototype.handleRoute = function (path) {
                for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
                    var l = _a[_i];
                    var match = l.tryMatch(path);
                    if (match) {
                        l.handler(match);
                    }
                }
                for (var _b = 0, _c = this.paths; _b < _c.length; _b++) {
                    var p = _c[_b];
                    var match = p.tryMatch(path);
                    if (match) {
                        p.handler(match);
                        return true;
                    }
                }
                return false;
            };
            return Router;
        }());
        Routing.Router = Router;
    })(Routing = Orange.Routing || (Orange.Routing = {}));
})(Orange || (Orange = {}));
var Orange;
(function (Orange) {
    var Controls;
    (function (Controls) {
        var KnockoutViewBase = (function (_super) {
            __extends(KnockoutViewBase, _super);
            function KnockoutViewBase(templateName, context) {
                return _super.call(this, templateName, context) || this;
            }
            KnockoutViewBase.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
                if (this.dataContext == null)
                    return;
                window.ko.applyBindingsToDescendants(this.dataContext, this.element);
            };
            return KnockoutViewBase;
        }(Controls.ViewBase));
        Controls.KnockoutViewBase = KnockoutViewBase;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
var Orange;
(function (Orange) {
    var Bindings;
    (function (Bindings) {
        var ko = window.ko;
        if (ko) {
            ko.bindingHandlers.stopBindings = {
                init: function () {
                    console.warn("DEPRECATED: The Orange knockout binding 'stopBindings' is deprecated and will be removed in a future release. Use 'o-stop-bindings' instead.");
                    return { controlsDescendantBindings: true };
                }
            };
            ko.virtualElements.allowedBindings.stopBindings = true;
            ko.bindingHandlers['o-stop-bindings'] = { init: function () { return ({ controlsDescendantBindings: true }); } };
            ko.virtualElements.allowedBindings['o-stop-bindings'] = true;
        }
        var BindingMode;
        (function (BindingMode) {
            BindingMode[BindingMode["TwoWay"] = 0] = "TwoWay";
            BindingMode[BindingMode["OneWay"] = 1] = "OneWay";
        })(BindingMode || (BindingMode = {}));
        var ViewModelToControlBinding = (function () {
            function ViewModelToControlBinding(vm, element, source, target, settings) {
                var _this = this;
                this.vm = vm;
                this.element = element;
                this.source = source;
                this.target = target;
                this.settings = settings;
                this.propDisposable = null;
                this.init = function () {
                    if (_this.vm == null)
                        _this.error("No context is pressent for the binding to use.");
                    if (_this.element.orange == null)
                        _this.error("Attempting to bind to a control on a non control element.");
                    if (_this.element.orange.control == null)
                        _this.error("Attempting to bind to a control that has not yet been fully initialized.");
                    var control = _this.element.orange.control;
                    if (false == _this.isValidTarget(control, _this.target) && false == _this.settings.allowDynamic)
                        _this.warn("The target property " + _this.target + " could not be found.");
                    if (typeof _this.source === 'string' ||
                        typeof _this.source === 'number' ||
                        typeof _this.source === 'boolean') {
                        control[_this.target] = _this.source;
                        return;
                    }
                    var sourceProp = _this.source;
                    if (sourceProp == null || sourceProp.subscribe == null) {
                        control[_this.target] = sourceProp;
                    }
                    else if (ko.isObservable(sourceProp)) {
                        control[_this.target] = sourceProp();
                    }
                    if (sourceProp && sourceProp.subscribe != null)
                        _this.propDisposable = sourceProp.subscribe(function (val) { return control[_this.target] = val; });
                    if (_this.settings.mode == BindingMode.TwoWay) {
                        if (sourceProp && sourceProp.subscribe == null)
                            _this.warn("Two way bingins are only possible with sources of type Rx.IObservable or knockout observables.");
                        else
                            control.addPropertyChangedListener(_this.onPropertyChanged);
                    }
                };
                this.onPropertyChanged = function (propertyName, propertyValue) {
                    if (propertyName != _this.target)
                        return;
                    var prop = _this.source;
                    if (prop.onNext)
                        prop.onNext(propertyValue);
                    else if (ko.isObservable(prop) || ko.isComputed(prop))
                        prop(propertyValue);
                    else
                        _this.vm[_this.source] = propertyValue;
                };
                var orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);
                if (orangeEl.isInitialized)
                    this.init();
                else
                    orangeEl.addOnInitializedListener(this.init);
            }
            ViewModelToControlBinding.prototype.getErrorMessage = function () {
                var binding = this.element
                    .getAttribute('data-bind')
                    .match(/(o-binding\s*:\s*\[(.|\s)*?\])|(o-binding\s*:\s*\{(.|\s)*?\})/)[0]
                    .replace(/\s+/g, ' ')
                    .trim();
                var target = this.target;
                var source = this.source;
                return { target: target, source: source, binding: binding, element: this.element };
            };
            ViewModelToControlBinding.prototype.error = function (message) {
                console.error(message, this.getErrorMessage());
                throw message + " Se console for mor information.";
            };
            ViewModelToControlBinding.prototype.warn = function (message) {
                console.warn(message, this.getErrorMessage());
            };
            ViewModelToControlBinding.prototype.isValidTarget = function (control, target) {
                var descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), target);
                if (descriptor != null)
                    return true;
                else if ('undefined' !== typeof control[this.target])
                    return true;
                return false;
            };
            ViewModelToControlBinding.prototype.dispose = function () {
                if (this.propDisposable != null && this.propDisposable.dispose != null)
                    this.propDisposable.dispose();
                if (this.element.orange != null) {
                    (this.element.orange).removeOnInitializedListener(this.init);
                    if (this.element.orange.control != null)
                        (this.element.orange).control.removePropertyChangedListener(this.onPropertyChanged);
                }
            };
            return ViewModelToControlBinding;
        }());
        if (ko) {
            ko.bindingHandlers['o-binding'] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var bindings = new Array();
                    var values = valueAccessor();
                    var bindingProperties = Array.isArray(values) ? values : [values];
                    var allSettingNames = ['mode', 'allow-dynamic'];
                    for (var _i = 0, bindingProperties_1 = bindingProperties; _i < bindingProperties_1.length; _i++) {
                        var bindingProperty = bindingProperties_1[_i];
                        var allProperties = Object.getOwnPropertyNames(bindingProperty);
                        var settingProperties = allProperties.filter(function (p) { return allSettingNames.indexOf(p) > -1; });
                        var properties = allProperties.filter(function (p) { return settingProperties.indexOf(p) < 0; });
                        if (properties.length < 1)
                            throw 'No binding property could be found.';
                        var settings = {
                            mode: BindingMode.OneWay,
                            allowDynamic: false
                        };
                        if (settingProperties.indexOf('mode') > -1) {
                            var modeStr = bindingProperty['mode'];
                            if (modeStr === 'two-way')
                                settings.mode = BindingMode.TwoWay;
                            else if (modeStr !== 'one-way')
                                throw "Binding mode has to be 'one-way' or 'two-way' (was '" + modeStr + "').";
                        }
                        if (settingProperties.indexOf('allow-dynamic') > -1) {
                            var str = bindingProperty['allow-dynamic'];
                            if (str === true)
                                settings.allowDynamic = true;
                            else if (str !== false)
                                throw "'allow-dynamic' has to be true or false (was '" + str + ", typeof(...): " + (typeof str) + "').";
                        }
                        for (var _a = 0, properties_1 = properties; _a < properties_1.length; _a++) {
                            var property = properties_1[_a];
                            var source = bindingProperty[property];
                            var target = property;
                            bindings.push(new ViewModelToControlBinding(bindingContext.$data, element, source, target, settings));
                        }
                    }
                }
            };
            ko.bindingHandlers.bindings = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    console.warn("DEPRECATED: The Orange knockout binding 'bindings' is deprecated and will be removed in a future release. Use 'o-binding' instead. Binding data: ", allBindingsAccessor());
                    var bindings = new Array();
                    var values = (valueAccessor());
                    if (Array.isArray(values) == false)
                        values = [values];
                    for (var vIdx = values.length - 1; vIdx >= 0; vIdx--) {
                        var value = values[vIdx];
                        var propertyNames = Object.getOwnPropertyNames(value);
                        if (propertyNames.length > 2)
                            throw "Faulty binding, should be {vmProp:ctrlProp [, mode: m]}, were m can be 'oneWay' or 'twoWay'.";
                        var settings = { mode: BindingMode.OneWay, allowDynamic: false };
                        if (propertyNames.length == 2) {
                            var mode = Object.getOwnPropertyDescriptor(value, "mode").value;
                            if (mode != 'oneWay' && mode != 'twoWay')
                                throw "Binding mode has to be 'oneWay' or 'twoWay'.";
                            if (mode === 'twoWay')
                                settings.mode == BindingMode.TwoWay;
                        }
                        var sourceProp = propertyNames.filter(function (v) { return v != "mode"; })[0];
                        var targetProp = Object.getOwnPropertyDescriptor(value, sourceProp).value;
                        bindings.push(new ViewModelToControlBinding(bindingContext.$data, element, sourceProp, targetProp, settings));
                    }
                    ko.utils
                        .domNodeDisposal
                        .addDisposeCallback(element, function () {
                        for (var bIdx = bindings.length - 1; bIdx >= 0; bIdx--) {
                            bindings[bIdx].dispose();
                        }
                    });
                }
            };
            ko.bindingHandlers.orangeView = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    console.warn("DEPRECATED: The Orange knockout binding 'orangeView' is deprecated and might be removed in a future version of orange ");
                    var value = valueAccessor();
                    var dataViweAttr = document.createAttribute("data-view");
                    dataViweAttr.value = value;
                    var orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);
                    element.setAttributeNode(dataViweAttr);
                    var onInitialized = function () {
                        if (orangeEl.control.dataContext != null)
                            return;
                        orangeEl.control.dataContext = bindingContext.$data;
                    };
                    if (orangeEl.isInitialized == true) {
                        onInitialized();
                    }
                    else {
                        orangeEl.addOnInitializedListener(onInitialized);
                        ko.utils
                            .domNodeDisposal
                            .addDisposeCallback(element, function () { return orangeEl.removeOnInitializedListener(onInitialized); });
                    }
                }
            };
            ko.bindingHandlers['orange-vm'] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    console.warn("DEPRECATED: The Orange knockout binding 'orange-vm' is deprecated and will be removed in a future version of orange. Use 'o-view-model' instead.");
                    return { controlsDescendantBindings: true };
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);
                    var value = ko.unwrap(valueAccessor());
                    var onInitialized = function () { return orangeEl.control.dataContext = value; };
                    if (orangeEl.isInitialized == true) {
                        onInitialized();
                    }
                    else {
                        orangeEl.addOnInitializedListener(onInitialized);
                        ko.utils
                            .domNodeDisposal
                            .addDisposeCallback(element, function () { orangeEl.removeOnInitializedListener(onInitialized); });
                    }
                }
            };
            ko.bindingHandlers['o-view-model'] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    return { controlsDescendantBindings: true };
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    var orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);
                    var value = ko.unwrap(valueAccessor());
                    var onInitialized = function () { return orangeEl.control.dataContext = value; };
                    if (orangeEl.isInitialized == true) {
                        onInitialized();
                    }
                    else {
                        orangeEl.addOnInitializedListener(onInitialized);
                        ko.utils
                            .domNodeDisposal
                            .addDisposeCallback(element, function () { orangeEl.removeOnInitializedListener(onInitialized); });
                    }
                }
            };
        }
    })(Bindings = Orange.Bindings || (Orange.Bindings = {}));
})(Orange || (Orange = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT3JhbmdlL011dGF0aW9uT2JzZXJ2ZXJQb2x5ZmlsbC50cyIsIk9yYW5nZS9VdWlkLnRzIiwiT3JhbmdlL0NvbnRhaW5lci50cyIsIk9yYW5nZS9SZWdpb25NYW5hZ2VyLnRzIiwiT3JhbmdlL1RlbXBsYXRlTG9hZGVyLnRzIiwiT3JhbmdlL0NvbnRyb2wudHMiLCJPcmFuZ2UvVGVtcGxhdGVkQ29udHJvbC50cyIsIk9yYW5nZS9WaWV3QmFzZS50cyIsIk9yYW5nZS9Db250cm9sTWFuYWdlci50cyIsIk9yYW5nZS9Sb3V0ZXIudHMiLCJPcmFuZ2UvS25vY2tvdXQvS25vY2tvdXRWaWV3QmFzZS50cyIsIk9yYW5nZS9Lbm9ja291dC9Lbm9ja291dEJpbmRpbmdzLnRzIiwiT3JhbmdlL19yZWZlcmVuY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFDQSxFQUFFLENBQUMsQ0FBQyxPQUFhLE1BQU8sQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNsRCxDQUFDO1FBQ0EsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUMzQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBRS9CLElBQUksT0FBTyxHQUFHO1lBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDdkUsQ0FBQyxDQUFDO1FBRUYsT0FBTyxDQUFDLFNBQVMsR0FBRztZQUNuQixHQUFHLEVBQUUsVUFBVSxHQUFRLEVBQUUsS0FBVTtnQkFDbEMsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFD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