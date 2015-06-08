/// <reference path="_references.ts"/>
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
        // http://dom.spec.whatwg.org/#mutation-observers
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
/// <reference path="_references.ts"/>
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
        Uuid._counter = 0;
        Uuid._tStart = Date.now == null ? Date.now() : new Date().getTime();
        Uuid.getTime = (window.performance == null && window.performance.now == null) ?
            function () { return Math.round(performance.now() + Uuid._tStart); } :
            (Date.now == null ?
                function () { return Date.now(); } :
                function () { return (new Date()).getTime(); });
        return Uuid;
    })();
    Orange.Uuid = Uuid;
})(Orange || (Orange = {}));
/// <reference path="_references.ts"/>
var Orange;
(function (Orange) {
    var Modularity;
    (function (Modularity) {
        var Container = (function () {
            function Container() {
                this.typeMap = [];
                this.instances = [];
                this.registerInstance(Container, this);
            }
            Container.prototype.registerInstance = function (type, instance) {
                this.instances.push({ key: type, value: instance });
            };
            Container.prototype.registerType = function (type, instance) {
                this.typeMap.push({ key: type, value: instance });
            };
            Container.prototype.resolve = function (type, register) {
                if (register === void 0) { register = false; }
                var instance = this.lookup(this.instances, type);
                if (instance)
                    return instance;
                var resolvedType = this.lookup(this.typeMap, type) || type;
                this.checkArity(resolvedType);
                instance = this.createInstance(resolvedType);
                if (register === true) {
                    this.registerInstance(type, instance);
                }
                return instance;
            };
            Container.prototype.resolveWithOverride = function (type, overrides) {
                var sub = new Container();
                sub.typeMap = this.typeMap;
                sub.instances = overrides.concat(this.instances);
                return sub.resolve(type, false);
            };
            Container.prototype.lookup = function (dict, key) {
                for (var i = 0; i < dict.length; i++) {
                    var kvp = dict[i];
                    if (kvp.key === key)
                        return kvp.value;
                }
            };
            Container.prototype.createInstance = function (resolvedType) {
                var instance;
                var depCount = resolvedType.dependencies ? resolvedType.dependencies().length : 0;
                if (depCount == 0) {
                    instance = new resolvedType();
                }
                else {
                    var ctrArgs = [];
                    var deps = resolvedType.dependencies();
                    for (var d = 0; d < deps.length; d++) {
                        var dep = deps[d];
                        ctrArgs.push(this.resolve(dep));
                    }
                    instance = this.applyConstructor(resolvedType, ctrArgs);
                }
                return instance;
            };
            Container.prototype.checkArity = function (type) {
                var depCount = type.dependencies ? type.dependencies().length : 0;
                var ctrCount = (type.length || type.arity || 0);
                if (depCount != ctrCount)
                    throw new Error("failed to resolve type '" + type + "'");
            };
            Container.prototype.applyConstructor = function (ctor, args) {
                var a = [];
                for (var i = 0; i < args.length; i++)
                    a[i] = 'arguments[1][' + i + ']';
                return eval('new arguments[0](' + a.join() + ')');
            };
            return Container;
        })();
        Modularity.Container = Container;
    })(Modularity = Orange.Modularity || (Orange.Modularity = {}));
})(Orange || (Orange = {}));
/// <reference path="_references.ts"/>
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
                var attr = root.getAttribute("data-view");
                if (attr == null || attr == "") {
                    if (typeof root.children !== "undefined") {
                        for (var i = 0; i < root.children.length; i++)
                            this.initializeRegions(root.children[i]);
                    }
                }
                else {
                    var viewType = eval(attr);
                    var view = this.container.resolve(viewType);
                    if (typeof view.element !== "undefined")
                        view.element = root;
                    var idAttr = root.getAttribute("data-view-id");
                    if (idAttr != null && attr != "") {
                        if (view.setViewId !== "undefined") {
                            view.setViewId(idAttr);
                        }
                    }
                    root["instance"] = view;
                }
            };
            return RegionManager;
        })();
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
})();
/// <reference path="_references.ts"/>
var Orange;
(function (Orange) {
    var Controls;
    (function (Controls) {
        var Control = (function () {
            function Control() {
                this._element = null;
                this.disposables = new Array();
                this._propertyChangedListeners = new Array();
            }
            Object.defineProperty(Control.prototype, "element", {
                get: function () { return this._element; },
                set: function (element) {
                    if (this._element != null)
                        throw "'element' property can only be set once. ";
                    this._element = element;
                    this.onElementSet();
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
            Control.prototype.onElementSet = function () { };
            Control.prototype.addPropertyChangedListener = function (listener) {
                this._propertyChangedListeners.push(listener);
            };
            Control.prototype.removePropertyChangedListener = function (listener) {
                var idx = this._propertyChangedListeners.indexOf(listener);
                if (idx > -1)
                    this._propertyChangedListeners.splice(idx, 1);
            };
            Control.prototype.raisePropertyChanged = function (propertyName) {
                var propertyValue = this[propertyName];
                if (propertyValue == null || propertyValue == "undefined")
                    throw "trying to access undefined property '" + propertyName + "'.";
                this.onPropertyChanged(propertyName, propertyValue);
                for (var plIdx = this._propertyChangedListeners.length - 1; plIdx >= 0; plIdx--) {
                    this._propertyChangedListeners[plIdx](propertyName, propertyValue);
                }
            };
            Control.prototype.onPropertyChanged = function (propertyName, value) { };
            return Control;
        })();
        Controls.Control = Control;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
/// <reference path="_references.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
        })();
        Controls.StringTemplateProvider = StringTemplateProvider;
        var ScriptTemplateProvider = (function () {
            function ScriptTemplateProvider(templateName) {
                this._templateName = templateName;
            }
            ScriptTemplateProvider.prototype.applyTemplate = function (element, onTemplateAppliedCallback) {
                var template = document.body.querySelector("#" + this._templateName);
                if (template == null) {
                    onTemplateAppliedCallback(false);
                    return;
                }
                element.innerHTML = template.innerHTML;
                onTemplateAppliedCallback(true);
            };
            return ScriptTemplateProvider;
        })();
        Controls.ScriptTemplateProvider = ScriptTemplateProvider;
        var TemplatedControl = (function (_super) {
            __extends(TemplatedControl, _super);
            function TemplatedControl(templateProvider) {
                _super.call(this);
                this._templateProvider = null;
                this._isTemplateApplied = false;
                this._templateProvider = templateProvider;
            }
            Object.defineProperty(TemplatedControl.prototype, "isTemplateApplied", {
                get: function () { return this._isTemplateApplied; },
                enumerable: true,
                configurable: true
            });
            TemplatedControl.prototype.onApplyTemplate = function () { };
            TemplatedControl.prototype.applyTemplate = function () {
                var _this = this;
                this._templateProvider
                    .applyTemplate(this.element, function (success) {
                    if (success)
                        _this._isTemplateApplied = true;
                    else
                        throw "TemplatedControl.applyTemplate: A template provider failed to apply its template.";
                });
            };
            return TemplatedControl;
        })(Controls.Control);
        Controls.TemplatedControl = TemplatedControl;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
/// <reference path="_references.ts"/>
var Orange;
(function (Orange) {
    var Controls;
    (function (Controls) {
        var ViewBase = (function (_super) {
            __extends(ViewBase, _super);
            function ViewBase(templateName, context) {
                _super.call(this, new Controls.ScriptTemplateProvider(templateName));
                this._dataContext = null;
                if (!!context)
                    this._dataContext = context;
            }
            Object.defineProperty(ViewBase.prototype, "dataContext", {
                get: function () { return this._dataContext; },
                set: function (context) {
                    this._dataContext = context;
                    this.onDataContextSet();
                    this.applyBindings();
                },
                enumerable: true,
                configurable: true
            });
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
            ViewBase.prototype.onDataContextSet = function () { };
            return ViewBase;
        })(Controls.TemplatedControl);
        Controls.ViewBase = ViewBase;
        var KnockoutViewBase = (function (_super) {
            __extends(KnockoutViewBase, _super);
            function KnockoutViewBase(templateName, context) {
                _super.call(this, templateName, context);
            }
            KnockoutViewBase.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
                this.cleanChildBindings();
            };
            KnockoutViewBase.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
                if (!this.dataContext)
                    return;
                window.ko.applyBindingsToDescendants(this.dataContext, this.element);
            };
            KnockoutViewBase.prototype.onDataContextSet = function () {
                this.cleanChildBindings();
            };
            KnockoutViewBase.prototype.cleanChildBindings = function () {
                var childNodes = this.element.childNodes;
                for (var cIdx = childNodes.length - 1; cIdx >= 0; cIdx--) {
                    var childNode = childNodes[cIdx];
                    if (childNode.nodeType !== 1)
                        continue;
                    window.ko.cleanNode(childNode);
                }
            };
            return KnockoutViewBase;
        })(ViewBase);
        Controls.KnockoutViewBase = KnockoutViewBase;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
/// <reference path="_references.ts"/>
var Orange;
(function (Orange) {
    var Controls;
    (function (Controls) {
        var OrangeElementExtension = (function () {
            function OrangeElementExtension() {
                this.control = null;
                this.isInitialized = false;
                this._onInitializedListeners = new Array();
            }
            OrangeElementExtension.prototype.addOnInitializedListener = function (callback) {
                this._onInitializedListeners.push(callback);
            };
            OrangeElementExtension.prototype.removeOnInitializedListener = function (callback) {
                var idx = this._onInitializedListeners.indexOf(callback);
                if (idx > -1)
                    this._onInitializedListeners.splice(idx, 1);
            };
            return OrangeElementExtension;
        })();
        Controls.GetOrangeElement = function (element) {
            if (!(element.orange)) {
                var orangeEl = new OrangeElementExtension();
                ;
                element["orange"] = orangeEl;
                return orangeEl;
            }
            return element.orange;
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
                    var addedNodes = mutation.addedNodes;
                    for (var i = 0; i < addedNodes.length; i++) {
                        var node = addedNodes[i];
                        if (node.nodeType !== 1)
                            continue;
                        ControlManager.createControlsInElement(node, _this._container);
                    }
                    var removedNodes = mutation.removedNodes;
                    for (var i = 0; i < removedNodes.length; i++) {
                        var node = removedNodes[i];
                        if (node.nodeType !== 1)
                            continue;
                        ControlManager.disposeDescendants(node);
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
                    ControlManager.getControlFromElement(root).dispose();
                }
            };
            ControlManager.disposeControl = function (control) {
                if (!control)
                    return;
                if (!!(control.element))
                    control.element.orange = null;
                var disposables = control.disposables;
                for (var dIdx = disposables.length - 1; dIdx >= 0; dIdx--) {
                    disposables[dIdx].dispose();
                }
                if (typeof control.element.children !== "undefined") {
                    for (var i = 0; i < control.element.children.length; i++) {
                        ControlManager.disposeDescendants(control.element.children[i]);
                    }
                }
            };
            ControlManager.prototype.manage = function (element) {
                if (this._observer !== null)
                    this.dispose();
                this._element = element;
                this._observer = new MutationObserver(this.onMutation);
                this._observer.observe(element, ControlManager._mutationObserverConfig);
                ControlManager.createControlsInElement(this._element, this._container);
            };
            ControlManager.getChildren = function (element) {
                var result = new Array();
                if (typeof element.children !== "undefined") {
                    for (var i = 0; i < element.children.length; i++) {
                        result.push(element.children[i]);
                    }
                }
                return result;
            };
            ControlManager.getControlAttribute = function (element) {
                var attr = null;
                var anIdx = 0;
                while ((!attr || attr == "") && anIdx < ControlManager._controlAttributeNames.length) {
                    attr = element.getAttribute(ControlManager._controlAttributeNames[anIdx++]);
                }
                if (!attr || attr == "") {
                    return null;
                }
                else {
                    return {
                        attributeType: ControlManager._controlAttributeNames[anIdx - 1],
                        value: attr
                    };
                }
            };
            ControlManager.createControlsInElement = function (element, container) {
                var attr = ControlManager.getControlAttribute(element);
                if (attr != null) {
                    ControlManager.createControlFromElement(element, container);
                }
                else {
                    var controls = element.querySelectorAll("[" + this._controlAttributeNames.join("], [") + "]");
                    for (var ceIdx = 0; ceIdx < controls.length; ++ceIdx) {
                        var ce = (controls[ceIdx]);
                        ControlManager.createControlFromElement(ce, container);
                    }
                }
            };
            ControlManager.prototype.dispose = function () {
                this._observer.disconnect();
                this._observer = null;
            };
            ControlManager.getControlFromElement = function (element) {
                if (!element["orange"] || !(element["orange"]["control"]))
                    throw "ViewBase.getControlFromElement: the element has no control conected to it.";
                return (element["orange"]["control"]);
            };
            ControlManager.createControlFromElement = function (controlElement, container) {
                return ControlManager.createControlInternal(controlElement, container);
            };
            ControlManager.createControlFromType = function (type, container) {
                var element = document.createElement("div");
                element.setAttribute(ControlManager._controlAttributeNames[0], type);
                return ControlManager.createControlInternal(element, container);
            };
            ControlManager.isValidConstructorFunc = function (func) {
                return func != null && (typeof (func) == "function");
            };
            ControlManager.getConstructorFunction = function (constructorName) {
                var path = constructorName.split(".");
                var func = window;
                for (var _i = 0; _i < path.length; _i++) {
                    var fragment = path[_i];
                    if (func[fragment] == null)
                        break;
                    func = func[fragment];
                }
                if (ControlManager.isValidConstructorFunc(func))
                    return func;
                func = window.require(constructorName);
                if (ControlManager.isValidConstructorFunc(func))
                    return func;
                throw new ReferenceError('No constructor identified by "' + constructorName + '"" could be found');
            };
            ControlManager.createControlInternal = function (element, container) {
                var type = ControlManager.getControlAttribute(element);
                var orangeElement = Controls.GetOrangeElement(element);
                if (orangeElement.isInitialized)
                    return null;
                var constructorFunction = ControlManager.getConstructorFunction(type.value);
                var control = (!!container ? container.resolve(constructorFunction) : new constructorFunction());
                if (false == (control instanceof constructorFunction))
                    throw "ControlManager.createControl: instance of constructed object is not of the correct type.";
                orangeElement.control = control;
                element.setAttribute(type.attributeType + "-id", Orange.Uuid.generate().value);
                control.element = element;
                if (!!control.applyTemplate)
                    control.applyTemplate();
                if (!!control.onApplyTemplate)
                    control.onApplyTemplate();
                var children = ControlManager.getChildren(element);
                for (var i = 0; i < children.length; i++)
                    ControlManager.createControlsInElement(children[i], container);
                orangeElement.isInitialized = true;
                var listeners = orangeElement._onInitializedListeners;
                for (var listenerIdx = listeners.length - 1; listenerIdx >= 0; listenerIdx--) {
                    listeners[listenerIdx]();
                }
                return control;
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
        })();
        Controls.ControlManager = ControlManager;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
/// <reference path="_references.ts"/>
(function () {
    if (!window.ko) {
        window.ko = {};
        window.ko.bindingHandlers = {};
    }
}());
var Orange;
(function (Orange) {
    var Bindings;
    (function (Bindings) {
        var ko = window.ko;
        ko.bindingHandlers.stopBindings = {
            init: function () { return { controlsDescendantBindings: true }; }
        };
        ko.virtualElements.allowedBindings.stopBindings = true;
        var ViewModelToControlBinding = (function () {
            function ViewModelToControlBinding(vm, element, property, target, mode) {
                var _this = this;
                this.vm = vm;
                this.element = element;
                this.property = property;
                this.target = target;
                this.mode = mode;
                this.propDisposable = null;
                this.init = function () {
                    if (!(_this.vm))
                        throw "No context was pressent for binding to use.";
                    if (!(_this.vm[_this.property]))
                        throw "The property " + _this.property + " could not be found.";
                    if (!(_this.element.orange) || !(_this.element.orange.control))
                        throw "Attepmt to bind to control on a non controll element.";
                    var control = _this.element.orange.control;
                    var pd = Object.getOwnPropertyDescriptor(control, _this.target);
                    pd = !!pd ? pd : Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), _this.target);
                    if (!pd && control[_this.target] == "undefined")
                        throw "The target property " + _this.target + " could not be found.";
                    if (!!(_this.vm[_this.property].subscribe))
                        _this.propDisposable = _this.vm[_this.property].subscribe(function (val) { return control[_this.target] = val; });
                    if (typeof _this.vm[_this.property] === "function")
                        control[_this.target] = _this.vm[_this.property]();
                    else
                        control[_this.target] = _this.vm[_this.property];
                    if (_this.mode == "twoWay")
                        control.addPropertyChangedListener(_this.onPropertyChanged);
                };
                this.onPropertyChanged = function (propertyName, propertyValue) {
                    if (propertyName != _this.target)
                        return;
                    if (_this.vm[_this.property].onNext) {
                        _this.vm[_this.property].onNext(propertyValue);
                    }
                    else if (typeof _this.vm[_this.property] === "function") {
                        _this.vm[_this.property](propertyValue);
                    }
                    else {
                        _this.vm[_this.property] = propertyValue;
                    }
                };
                var orangeEl = Orange.Controls.GetOrangeElement(element);
                if (orangeEl.isInitialized)
                    this.init();
                else
                    orangeEl.addOnInitializedListener(this.init);
            }
            ViewModelToControlBinding.prototype.dispose = function () {
                if (!!this.propDisposable && !!(this.propDisposable.dispose))
                    this.propDisposable.dispose();
                if (!!(this.element.orange)) {
                    (this.element.orange).removeOnInitializedListener(this.init);
                    if (!!(this.element.orange).control)
                        (this.element.orange).control.removePropertyChangedListener(this.onPropertyChanged);
                }
            };
            return ViewModelToControlBinding;
        })();
        ko.bindingHandlers.bindings = {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var bindings = new Array();
                var values = (valueAccessor());
                if (Array.isArray(values) == false)
                    values = [values];
                for (var vIdx = values.length - 1; vIdx >= 0; vIdx--) {
                    var value = values[vIdx];
                    var propertyNames = Object.getOwnPropertyNames(value);
                    if (propertyNames.length > 2)
                        throw "Faulty binding, should be {vmProp:ctrlProp [, mode: m]}, were m can be 'oneWay' or 'twoWay'.";
                    var mode = 'oneWay';
                    if (propertyNames.length == 2) {
                        mode = Object.getOwnPropertyDescriptor(value, "mode").value;
                        if (mode != 'oneWay' && mode != 'twoWay')
                            throw "Binding mode has to be 'oneWay' or 'twoWay'.";
                    }
                    var sourceProp = propertyNames.filter(function (v) { return v != "mode"; })[0];
                    var targetProp = Object.getOwnPropertyDescriptor(value, sourceProp).value;
                    bindings.push(new ViewModelToControlBinding(bindingContext.$data, element, sourceProp, targetProp, mode));
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
                var value = valueAccessor();
                var dataViweAttr = document.createAttribute("data-view");
                dataViweAttr.value = value;
                var orangeEl = Orange.Controls.GetOrangeElement(element);
                element.setAttributeNode(dataViweAttr);
                var onInitialized = function () {
                    if (orangeEl.control.dataContext != null)
                        return;
                    orangeEl.control.dataContext = bindingContext.$data;
                };
                if (orangeEl.isInitialized == true)
                    onInitialized();
                else
                    orangeEl.addOnInitializedListener(onInitialized);
                ko.utils
                    .domNodeDisposal
                    .addDisposeCallback(element, function () { return orangeEl.removeOnInitializedListener(onInitialized); });
            }
        };
    })(Bindings = Orange.Bindings || (Orange.Bindings = {}));
})(Orange || (Orange = {}));
/// <reference path="MutationObserverPolyfill.ts"/>
/// <reference path="Uuid.ts" />
/// <reference path="Container.ts"/>
/// <reference path="RegionManager.ts"/>
/// <reference path="TemplateLoader.ts"/>
/// <reference path="Control.ts"/>
/// <reference path="TemplatedControl.ts"/>
/// <reference path="ViewBase.ts"/>
/// <reference path="ControlManager.ts"/>
/// <reference path="Bindings.ts" />
/// <reference path="../../_references.ts" />
var Views;
(function (Views) {
    var FeedbackLoop;
    (function (FeedbackLoop) {
        var FeedbackLoopView = (function (_super) {
            __extends(FeedbackLoopView, _super);
            function FeedbackLoopView() {
                _super.call(this, "Views-FeedbackLoop-FeedbackLoopView");
            }
            FeedbackLoopView.prototype.onElementSet = function () {
                _super.prototype.onElementSet.call(this);
            };
            FeedbackLoopView.prototype.onApplyTemplate = function () {
                var _this = this;
                _super.prototype.onApplyTemplate.call(this);
                var injectSelfInterval = window.setInterval(function () {
                    var container = _this.element.querySelector(".data_view_container");
                    var div = document.createElement("div");
                    var attr = document.createAttribute("data-view");
                    attr.value = "Views.FeedbackLoop.FeedbackLoopView";
                    div.setAttributeNode(attr);
                    container.appendChild(div);
                    window.clearInterval(injectSelfInterval);
                }, 1000);
                var dispose = {
                    dispose: function () {
                        window.clearInterval(injectSelfInterval);
                    }
                };
                this.addDisposable(dispose);
            };
            FeedbackLoopView.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
            };
            return FeedbackLoopView;
        })(Orange.Controls.ViewBase);
        FeedbackLoop.FeedbackLoopView = FeedbackLoopView;
    })(FeedbackLoop = Views.FeedbackLoop || (Views.FeedbackLoop = {}));
})(Views || (Views = {}));
/// <reference path="../../_references.ts" />
var Views;
(function (Views) {
    var MainContainer;
    (function (MainContainer) {
        var MainContainerView = (function (_super) {
            __extends(MainContainerView, _super);
            function MainContainerView(viewModel) {
                _super.call(this, "Views-MainContainer-MainContainerView", viewModel);
            }
            MainContainerView.prototype.onElementSet = function () {
                _super.prototype.onElementSet.call(this);
            };
            MainContainerView.prototype.onApplyTemplate = function () {
                var _this = this;
                _super.prototype.onApplyTemplate.call(this);
                var injectView = function () {
                    var container = _this.element.querySelector(".view_container");
                    if (container == null)
                        return;
                    var div = document.createElement("div");
                    var attr = document.createAttribute("data-view");
                    attr.value = "Views.FeedbackLoop.FeedbackLoopView";
                    div.setAttributeNode(attr);
                    container.appendChild(div);
                };
                var clearView = function () {
                    var container = _this.element.querySelector(".view_container");
                    if (container == null)
                        return;
                    container.innerHTML = "";
                    window.clearInterval(clearViewsInterval);
                };
                var clearViewsInterval = null;
                var injectViewInterval = window.setInterval(function () {
                    injectView();
                    clearViewsInterval = window.setInterval(clearView, 8000);
                }, 10000);
                injectView();
                clearViewsInterval = window.setInterval(clearView, 8000);
                var dispose = {
                    dispose: function () {
                        window.clearInterval(injectViewInterval);
                        window.clearInterval(clearViewsInterval);
                    }
                };
                this.addDisposable(dispose);
            };
            MainContainerView.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
            };
            MainContainerView.dependencies = function () { return [Views.MainContainer.MainContainerViewModel]; };
            return MainContainerView;
        })(Orange.Controls.KnockoutViewBase);
        MainContainer.MainContainerView = MainContainerView;
    })(MainContainer = Views.MainContainer || (Views.MainContainer = {}));
})(Views || (Views = {}));
/// <reference path="../../_references.ts" />
var Views;
(function (Views) {
    var MainContainer;
    (function (MainContainer) {
        var NestedWithExternalViewModelItem = (function () {
            function NestedWithExternalViewModelItem(label, color) {
                this.label = label;
                this.color = color;
            }
            return NestedWithExternalViewModelItem;
        })();
        MainContainer.NestedWithExternalViewModelItem = NestedWithExternalViewModelItem;
        var MainContainerViewModel = (function () {
            function MainContainerViewModel() {
                var _this = this;
                this.nestedWithExternalViewModelObservableItems = ko.observableArray();
                this.nestedWithExternalViewModelObservable = ko.observable();
                this._itemCounter = 0;
                this._itemCreationIntervalHandle = null;
                this.createViewItem = function () {
                    var randGray = function () { return Math.round(Math.random() * 255); };
                    var createColor = function () { return "rgb(" + randGray() + ", " + randGray() + ", " + randGray() + ")"; };
                    _this._itemCounter++;
                    var newView = new NestedWithExternalViewModelItem("Item #" + _this._itemCounter, createColor());
                    _this.nestedWithExternalViewModelObservableItems.unshift(newView);
                    var content = ["Fantascic!", "This is great!", "Dreamy!", "Yep!"];
                    _this.nestedWithExternalViewModelObservable(new NestedWithExternalViewModelItem(content[Math.round(Math.random() * (content.length - 1))], createColor()));
                };
                this.deleteItem = function () {
                    _this.nestedWithExternalViewModelObservableItems.pop();
                };
                this.init();
            }
            MainContainerViewModel.prototype.init = function () {
                var _this = this;
                this.nestedWithExternalViewModelItems = [
                    new NestedWithExternalViewModelItem("One", "rgb(240, 30, 30)"),
                    new NestedWithExternalViewModelItem("Two", "rgb(30, 30, 240)"),
                    new NestedWithExternalViewModelItem("Three", "rgb(30, 240, 30)")
                ];
                this.nestedWithExternalViewModel = new NestedWithExternalViewModelItem("Amazing!", "rgb(240, 70, 30)");
                this.nestedWithExternalViewModelObservable(new NestedWithExternalViewModelItem("Amazing!", "rgb(240, 70, 30)"));
                this.createViewItem();
                this._itemCreationIntervalHandle = window.setInterval(this.createViewItem, 2000);
                var _a = window.setInterval(function () {
                    window.setInterval(_this.deleteItem, 2000);
                    window.clearInterval(_a);
                }, 9000);
            };
            return MainContainerViewModel;
        })();
        MainContainer.MainContainerViewModel = MainContainerViewModel;
    })(MainContainer = Views.MainContainer || (Views.MainContainer = {}));
})(Views || (Views = {}));
/// <reference path="../../_references.ts" />
var Views;
(function (Views) {
    var Nested;
    (function (Nested) {
        var NestedView = (function (_super) {
            __extends(NestedView, _super);
            function NestedView(viewModel) {
                _super.call(this, "Views-Nested-NestedView", viewModel);
            }
            NestedView.prototype.onElementSet = function () {
                _super.prototype.onElementSet.call(this);
            };
            NestedView.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
            };
            NestedView.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
            };
            NestedView.dependencies = function () { return [Views.Nested.NestedViewModel]; };
            return NestedView;
        })(Orange.Controls.KnockoutViewBase);
        Nested.NestedView = NestedView;
    })(Nested = Views.Nested || (Views.Nested = {}));
})(Views || (Views = {}));
/// <reference path="../../_references.ts" />
var Views;
(function (Views) {
    var Nested;
    (function (Nested) {
        var NestedViewModel = (function () {
            function NestedViewModel() {
            }
            return NestedViewModel;
        })();
        Nested.NestedViewModel = NestedViewModel;
    })(Nested = Views.Nested || (Views.Nested = {}));
})(Views || (Views = {}));
/// <reference path="../../_references.ts" />
var Views;
(function (Views) {
    var NestedWithExternalViewModel;
    (function (NestedWithExternalViewModel) {
        var NestedWithExternalViewModelView = (function (_super) {
            __extends(NestedWithExternalViewModelView, _super);
            function NestedWithExternalViewModelView() {
                _super.call(this, "Views-NestedWithExternalViewModel-NestedWithExternalViewModelView");
            }
            NestedWithExternalViewModelView.prototype.onElementSet = function () {
                _super.prototype.onElementSet.call(this);
            };
            NestedWithExternalViewModelView.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
            };
            NestedWithExternalViewModelView.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
            };
            return NestedWithExternalViewModelView;
        })(Orange.Controls.KnockoutViewBase);
        NestedWithExternalViewModel.NestedWithExternalViewModelView = NestedWithExternalViewModelView;
    })(NestedWithExternalViewModel = Views.NestedWithExternalViewModel || (Views.NestedWithExternalViewModel = {}));
})(Views || (Views = {}));
/// <reference path="_references.ts" />
var startReq = { windowLoaded: false, templatesLoaded: false };
function tryStartup() {
    if (!startReq.windowLoaded || !startReq.templatesLoaded)
        return;
    var application = new Application();
    application.run();
}
window.onload = function () {
    startReq.windowLoaded = true;
    tryStartup();
};
TemplateLoader.onload = function () {
    startReq.templatesLoaded = true;
    tryStartup();
};
var Application = (function () {
    function Application() {
    }
    Application.prototype.run = function () {
        var container = new Orange.Modularity.Container();
        var controlManager = new Orange.Controls.ControlManager(container);
        container.registerInstance(Orange.Controls.ControlManager, controlManager);
        controlManager.manage(document.body);
    };
    return Application;
})();
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../../../Orange/_references.ts" />
/// <reference path="Views/FeedbackLoop/FeedbackLoopView.ts" />
/// <reference path="Views/MainContainer/MainContainerView.ts" />
/// <reference path="Views/MainContainer/MainContainerViewModel.ts" />
/// <reference path="Views/Nested/NestedView.ts" />
/// <reference path="Views/Nested/NestedViewModel.ts" />
/// <reference path="Views/NestedWithExternalViewModel/NestedWithExternalViewModelView.ts" />
/// <reference path="app.ts" />
//# sourceMappingURL=app.js.map