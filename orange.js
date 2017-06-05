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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
                                if (!(typeof type === "string")) return [3, 4];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4, Container.getConstructorFromString(type)];
                            case 2:
                                ctr = _a.sent();
                                if (ctr == null)
                                    return [2, { instance: null, success: false }];
                                type = ctr;
                                return [3, 4];
                            case 3:
                                e_1 = _a.sent();
                                return [2, { instance: null, success: false }];
                            case 4:
                                instance = this.lookup(this.instances, type);
                                if (instance != null)
                                    return [2, { instance: instance, success: true }];
                                resolvedType = this.lookup(this.typeMap, type) || type;
                                if (false == Container.isValidConstructor(resolvedType))
                                    return [2, { instance: null, success: false }];
                                if (false == this.checkArity(resolvedType))
                                    return [2, { instance: null, success: false }];
                                return [4, this.createInstance(resolvedType)];
                            case 5:
                                instance = _a.sent();
                                if (register === true)
                                    this.registerInstance(type, instance);
                                return [2, { instance: instance, success: true }];
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
                                if (!(typeof type === "string")) return [3, 5];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4, Container.getConstructorFromString(type)];
                            case 2:
                                ctr = _a.sent();
                                typeConstructor = ctr;
                                return [3, 4];
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
                                    return [2, instance];
                                resolvedType = this.lookup(this.typeMap, typeConstructor) || typeConstructor;
                                if (false == Container.isValidConstructor(resolvedType))
                                    throw new ResolveError("Orange.Modularity.Container failed to resolve type \"" + type + "\"");
                                if (false == this.checkArity(resolvedType))
                                    throw new ResolveError("Orange.Modularity.Container failed to resolve type \"" + type + "\"");
                                return [4, this.createInstance(resolvedType)];
                            case 6:
                                instance = _a.sent();
                                if (register === true)
                                    this.registerInstance(typeConstructor, instance);
                                return [2, instance];
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
                                    return [2, func];
                                func = null;
                                if (window.require != null) {
                                    func = window.require(constructorName);
                                }
                                if (!(func == null)) return [3, 4];
                                if (!(window.SystemJS != null)) return [3, 4];
                                sjs = window.SystemJS;
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4, sjs.import(constructorName)];
                            case 2:
                                module = _a.sent();
                                func = module;
                                return [3, 4];
                            case 3:
                                e_3 = _a.sent();
                                return [2, null];
                            case 4:
                                if (func == null)
                                    return [2, null];
                                if (Container.isValidConstructor(func))
                                    return [2, func];
                                if (func.default != null && Container.isValidConstructor(func.default))
                                    return [2, func.default];
                                return [2, null];
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
                    var instance, depCount, ctrArgs, deps, _i, deps_1, dep, _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                depCount = resolvedType.dependencies ? resolvedType.dependencies().length : 0;
                                if (!(depCount == 0)) return [3, 1];
                                instance = new resolvedType();
                                return [3, 6];
                            case 1:
                                ctrArgs = [];
                                deps = resolvedType.dependencies();
                                _i = 0, deps_1 = deps;
                                _c.label = 2;
                            case 2:
                                if (!(_i < deps_1.length)) return [3, 5];
                                dep = deps_1[_i];
                                _b = (_a = ctrArgs).push;
                                return [4, this.resolve(dep)];
                            case 3:
                                _b.apply(_a, [_c.sent()]);
                                _c.label = 4;
                            case 4:
                                _i++;
                                return [3, 2];
                            case 5:
                                instance = this.applyConstructor(resolvedType, ctrArgs);
                                _c.label = 6;
                            case 6: return [2, instance];
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
                                if (!(attr == null || attr == "")) return [3, 1];
                                if (typeof root.children !== "undefined") {
                                    for (i = 0; i < root.children.length; i++)
                                        this.initializeRegions(root.children[i]);
                                }
                                return [3, 3];
                            case 1:
                                viewType = eval(attr);
                                return [4, this.container.resolve(viewType)];
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
                            case 3: return [2];
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
                        return [2, ControlManager.createControlInternal(controlElement, container)];
                    });
                });
            };
            ControlManager.createControlFromType = function (type, container) {
                return __awaiter(this, void 0, void 0, function () {
                    var element;
                    return __generator(this, function (_a) {
                        element = document.createElement("div");
                        element.setAttribute(ControlManager._controlAttributeNames[0], type);
                        return [2, ControlManager.createControlInternal(element, container)];
                    });
                });
            };
            ControlManager.createControlInternal = function (element, container) {
                return __awaiter(this, void 0, void 0, function () {
                    var orangeElement;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                orangeElement = Controls.GetOrInitializeOrangeElement(element);
                                if (orangeElement.promise == null) {
                                    orangeElement.promise = ControlManager.createControlInternalImpl(element, container, orangeElement);
                                }
                                return [4, orangeElement.promise];
                            case 1: return [2, _a.sent()];
                        }
                    });
                });
            };
            ControlManager.createControlInternalImpl = function (element, container, orangeElement) {
                return __awaiter(this, void 0, void 0, function () {
                    var type, control, finalize;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                type = ControlManager.getControlAttribute(element);
                                if (orangeElement.control)
                                    return [2, orangeElement.control];
                                return [4, container.resolve(type.value)];
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
                                return [2, control];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT3JhbmdlL011dGF0aW9uT2JzZXJ2ZXJQb2x5ZmlsbC50cyIsIk9yYW5nZS9VdWlkLnRzIiwiT3JhbmdlL0NvbnRhaW5lci50cyIsIk9yYW5nZS9SZWdpb25NYW5hZ2VyLnRzIiwiT3JhbmdlL1RlbXBsYXRlTG9hZGVyLnRzIiwiT3JhbmdlL0NvbnRyb2wudHMiLCJPcmFuZ2UvVGVtcGxhdGVkQ29udHJvbC50cyIsIk9yYW5nZS9WaWV3QmFzZS50cyIsIk9yYW5nZS9Db250cm9sTWFuYWdlci50cyIsIk9yYW5nZS9Sb3V0ZXIudHMiLCJPcmFuZ2UvS25vY2tvdXQvS25vY2tvdXRWaWV3QmFzZS50cyIsIk9yYW5nZS9Lbm9ja291dC9Lbm9ja291dEJpbmRpbmdzLnRzIiwiT3JhbmdlL19yZWZlcmVuY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFDQSxFQUFFLENBQUMsQ0FBQyxPQUFhLE1BQU8sQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztJQUMvQyxDQUFDO1FBQ0csSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUMzQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBRS9CLElBQUksT0FBTyxHQUFHO1lBQ1YsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDMUUsQ0FBQyxDQUFDO1FBRUYsT0FBTyxDQUFDLFNBQVMsR0FBRztZQUNoQixHQUFHLEVBQUUsVUFBVSxHQUFRLEVBQUUsS0FBVTtnQkFDL0IsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFD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