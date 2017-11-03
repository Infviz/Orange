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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
        Uuid._counter = 0;
        Uuid._tStart = Date.now == null ? Date.now() : new Date().getTime();
        Uuid.getTime = (window.performance == null && window.performance.now == null) ?
            function () { return Math.round(performance.now() + Uuid._tStart); } :
            (Date.now == null ?
                function () { return Date.now(); } :
                function () { return (new Date()).getTime(); });
        return Uuid;
    }());
    Orange.Uuid = Uuid;
})(Orange || (Orange = {}));
var Orange;
(function (Orange) {
    var Modularity;
    (function (Modularity) {
        function inject(target) {
            if (window.Reflect == null)
                throw new Error("An attempt to use Orange.Modularity.inject decorator was made without an available Reflect implementation.");
            target.dependencies = function () {
                var deps = window.Reflect.getMetadata("design:paramtypes", target);
                return deps || [];
            };
        }
        Modularity.inject = inject;
        function dependency(target, key) {
            if (window.Reflect == null)
                throw new Error("An attempt to use Orange.Modularity.dependency decorator was made without an available Reflect implementation.");
            target.constructor.propertyDependencies = __assign({}, target.constructor.propertyDependencies, (_a = {}, _a[key] = window.Reflect.getMetadata("design:type", target, key), _a));
            var _a;
        }
        Modularity.dependency = dependency;
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
            Container.prototype.registerType = function (type, mappedType) {
                this.typeMap.push({ key: type, value: mappedType });
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
                                return [4, this.buildObject(resolvedType)];
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
                                return [4, this.buildObject(resolvedType)];
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
            Container.prototype.buildObject = function (resolvedType) {
                return __awaiter(this, void 0, void 0, function () {
                    var instance;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, this.createInstance(resolvedType)];
                            case 1:
                                instance = _a.sent();
                                return [4, this.setProperties(resolvedType, instance)];
                            case 2:
                                _a.sent();
                                return [2, instance];
                        }
                    });
                });
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
            Container.prototype.setProperties = function (resolvedType, instance) {
                return __awaiter(this, void 0, void 0, function () {
                    var propertyDependencies, _a, _b, _i, prop, dep, _c, _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                propertyDependencies = resolvedType.propertyDependencies;
                                _a = [];
                                for (_b in propertyDependencies)
                                    _a.push(_b);
                                _i = 0;
                                _e.label = 1;
                            case 1:
                                if (!(_i < _a.length)) return [3, 4];
                                prop = _a[_i];
                                dep = propertyDependencies[prop];
                                _c = instance;
                                _d = prop;
                                return [4, this.resolve(dep)];
                            case 2:
                                _c[_d] = _e.sent();
                                _e.label = 3;
                            case 3:
                                _i++;
                                return [3, 1];
                            case 4: return [2];
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
            Container._defaultContainer = new Container();
            return Container;
        }());
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
            Control.propertyRegex = /return ([_a-zA-Z0-9]+)(\.([_a-zA-Z0-9]+))*;?/;
            return Control;
        }());
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
                _this.templateName = templateName;
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
            return ControlManager;
        }());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT3JhbmdlL011dGF0aW9uT2JzZXJ2ZXJQb2x5ZmlsbC50cyIsIk9yYW5nZS9VdWlkLnRzIiwiT3JhbmdlL0NvbnRhaW5lci50cyIsIk9yYW5nZS9SZWdpb25NYW5hZ2VyLnRzIiwiT3JhbmdlL1RlbXBsYXRlTG9hZGVyLnRzIiwiT3JhbmdlL0NvbnRyb2wudHMiLCJPcmFuZ2UvVGVtcGxhdGVkQ29udHJvbC50cyIsIk9yYW5nZS9WaWV3QmFzZS50cyIsIk9yYW5nZS9Db250cm9sTWFuYWdlci50cyIsIk9yYW5nZS9Sb3V0ZXIudHMiLCJPcmFuZ2UvS25vY2tvdXQvS25vY2tvdXRWaWV3QmFzZS50cyIsIk9yYW5nZS9Lbm9ja291dC9Lbm9ja291dEJpbmRpbmdzLnRzIiwiT3JhbmdlL19yZWZlcmVuY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUNBLEVBQUUsQ0FBQyxDQUFDLE9BQWEsTUFBTyxDQUFDLE9BQU8sS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7UUFDRyxJQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO1FBQzNDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFFL0IsSUFBSSxPQUFPLEdBQUc7WUFDVixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMxRSxDQUFDLENBQUM7UUFFRixPQUFPLENBQUMsU0FBUyxHQUFHO1lBQ2hCLEdBQUcsRUFBRSxVQUFVLEdBQVEsRUFBRSxLQUFVO2dCQUMvQixJQUFJLEtBQUssR0FBRyxH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