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
                throw "An attempt to use Orange.Modularity.inject decorator was made without an available Reflect implementation.";
            target.dependencies = function () {
                var deps = window.Reflect.getMetadata("design:paramtypes", target);
                return deps || [];
            };
        }
        Modularity.inject = inject;
        function dependency(target, key) {
            if (window.Reflect == null)
                throw "An attempt to use Orange.Modularity.dependency decorator was made without an available Reflect implementation.";
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