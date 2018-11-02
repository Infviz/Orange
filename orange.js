var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
            var _a;
            if (window.Reflect == null)
                throw new Error("An attempt to use Orange.Modularity.dependency decorator was made without an available Reflect implementation.");
            target.constructor.propertyDependencies = __assign({}, target.constructor.propertyDependencies, (_a = {}, _a[key] = window.Reflect.getMetadata("design:type", target, key), _a));
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
                                console.error('Container.getConstructorFromString', e_3);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JhbmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT3JhbmdlL011dGF0aW9uT2JzZXJ2ZXJQb2x5ZmlsbC50cyIsIk9yYW5nZS9VdWlkLnRzIiwiT3JhbmdlL0NvbnRhaW5lci50cyIsIk9yYW5nZS9SZWdpb25NYW5hZ2VyLnRzIiwiT3JhbmdlL1RlbXBsYXRlTG9hZGVyLnRzIiwiT3JhbmdlL0NvbnRyb2wudHMiLCJPcmFuZ2UvVGVtcGxhdGVkQ29udHJvbC50cyIsIk9yYW5nZS9WaWV3QmFzZS50cyIsIk9yYW5nZS9Db250cm9sTWFuYWdlci50cyIsIk9yYW5nZS9Sb3V0ZXIudHMiLCJPcmFuZ2UvS25vY2tvdXQvS25vY2tvdXRWaWV3QmFzZS50cyIsIk9yYW5nZS9Lbm9ja291dC9Lbm9ja291dEJpbmRpbmdzLnRzIiwiT3JhbmdlL19yZWZlcmVuY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUNBLElBQUksT0FBYSxNQUFPLENBQUMsT0FBTyxLQUFLLFdBQVcsRUFBRTtJQUM5QyxDQUFDO1FBQ0csSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUMzQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBRS9CLElBQUksT0FBTyxHQUFHO1lBQ1YsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDMUUsQ0FBQyxDQUFDO1FBRUYsT0FBTyxDQUFDLFNBQVMsR0FBRztZQUNoQixHQUFHLEVBQUUsVUFBVSxHQUFRLEVBQUUsS0FBVTtnQkFDL0IsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUks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