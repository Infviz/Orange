if (typeof WeakMap === 'undefined') {
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
                return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
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
    var registrationsTable = new WeakMap();
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
        return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
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
            if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
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
                        if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
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
                xmlhttp.onreadystatechange = function () {
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
                get: function () {
                    return this._element;
                },
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
            Control.prototype.onElementSet = function () {
            };
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
            Control.prototype.onPropertyChanged = function (propertyName, value) {
            };
            return Control;
        })();
        Controls.Control = Control;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
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
                get: function () {
                    return this._isTemplateApplied;
                },
                enumerable: true,
                configurable: true
            });
            TemplatedControl.prototype.onApplyTemplate = function () {
            };
            TemplatedControl.prototype.applyTemplate = function () {
                var _this = this;
                this._templateProvider.applyTemplate(this.element, function (success) {
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
var Orange;
(function (Orange) {
    var Controls;
    (function (Controls) {
        var ViewBase = (function (_super) {
            __extends(ViewBase, _super);
            function ViewBase(templateName, context) {
                _super.call(this, new Controls.ScriptTemplateProvider(templateName));
                this._dataContext = null;
                this._dataContext = !context ? null : context;
            }
            Object.defineProperty(ViewBase.prototype, "dataContext", {
                get: function () {
                    return this._dataContext;
                },
                set: function (context) {
                    if (this._dataContext !== null)
                        return;
                    this._dataContext = context;
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
            ViewBase.prototype.onApplyBindings = function () {
            };
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
                ko.cleanNode(this.element);
            };
            KnockoutViewBase.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
                if (!this.dataContext)
                    return;
                ko.cleanNode(this.element);
                ko.applyBindings(this.dataContext, this.element);
            };
            return KnockoutViewBase;
        })(ViewBase);
        Controls.KnockoutViewBase = KnockoutViewBase;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
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
                get: function () {
                    return this._container;
                },
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
                if (attr == null) {
                    var children = ControlManager.getChildren(element);
                    for (var i = 0; i < children.length; i++) {
                        ControlManager.createControlsInElement(element.children[i], container);
                    }
                }
                else {
                    ControlManager.createControlFromElement(element, container);
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
            ControlManager.createControlInternal = function (element, container) {
                var type = ControlManager.getControlAttribute(element);
                var orangeElement = Controls.GetOrangeElement(element);
                if (orangeElement.isInitialized)
                    return null;
                var constructorFunction = type.value.split(".").reduce(function (c, n) { return c[n]; }, window);
                var control = (!!container ? container.resolve(constructorFunction) : new constructorFunction());
                if (false == (control instanceof constructorFunction))
                    throw "ControlManager.createControl: instance of constructed object is not of the correct type.";
                orangeElement.control = control;
                var uid = "o-uid-" + (ControlManager._uniqueIdCounter++);
                element.setAttribute(type.attributeType + "-id", uid);
                control.element = element;
                if (!!control.applyTemplate)
                    control.applyTemplate();
                var children = ControlManager.getChildren(element);
                for (var i = 0; i < children.length; i++) {
                    ControlManager.createControlsInElement(children[i], container);
                }
                if (!!control.onApplyTemplate)
                    control.onApplyTemplate();
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
            ControlManager._uniqueIdCounter = 0;
            return ControlManager;
        })();
        Controls.ControlManager = ControlManager;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
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
        ko.bindingHandlers.stopBindings = {
            init: function () {
                return { controlsDescendantBindings: true };
            }
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
            ViewModelToControlBinding.prototype.init = function () {
                var _this = this;
                if (!(this.vm[this.property]))
                    throw "The property " + this.property + " could not be found.";
                if (!(this.element.orange) || !(this.element.orange.control))
                    throw "Attepmt to bind to control on a non controll element.";
                var control = this.element.orange.control;
                var pd = Object.getOwnPropertyDescriptor(control, this.target);
                pd = !!pd ? pd : Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), this.target);
                if (!pd && !(control[this.target]))
                    throw "The target property " + this.target + " could not be found.";
                if (!!(this.vm[this.property].subscribe))
                    this.propDisposable = this.vm[this.property].subscribe(function (val) { return control[_this.target] = val; });
                if (typeof this.vm[this.property] === "function")
                    control[this.target] = this.vm[this.property]();
                else
                    control[this.target] = this.vm[this.property];
                if (this.mode == "twoWay")
                    control.addPropertyChangedListener(this.onPropertyChanged);
            };
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
        Bindings.ViewModelToControlBinding = ViewModelToControlBinding;
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
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
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
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () { return orangeEl.removeOnInitializedListener(onInitialized); });
            }
        };
    })(Bindings = Orange.Bindings || (Orange.Bindings = {}));
})(Orange || (Orange = {}));
var Controls;
(function (Controls) {
    var TextColumnDefinition = (function () {
        function TextColumnDefinition(valueProperty, header, sortProperty, width) {
            this._valueProperty = "";
            this._valueProperty = valueProperty;
            this._header = header;
            this._width = (width == "undefined") ? null : width;
            this._sortProperty = sortProperty ? sortProperty : valueProperty;
        }
        Object.defineProperty(TextColumnDefinition.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (v) {
                this._width = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextColumnDefinition.prototype, "header", {
            get: function () {
                return this._header;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextColumnDefinition.prototype, "sortProperty", {
            get: function () {
                return this._sortProperty;
            },
            enumerable: true,
            configurable: true
        });
        TextColumnDefinition.prototype.createCellElement = function (row, rowContext) {
            var cellEl = document.createElement('div');
            cellEl.className = 'dg_cell';
            cellEl.innerHTML = '<span>' + rowContext[this._valueProperty] + '</span>';
            cellEl.style.width = this._width + "px";
            row.appendChild(cellEl);
        };
        TextColumnDefinition.prototype.createHeaderElement = function (row, rowContext) {
            var cellEl = document.createElement('div');
            cellEl.className = 'dg_cell';
            cellEl.innerHTML = '<span>' + this._header + '</span>';
            cellEl.style.width = this._width + "px";
            row.appendChild(cellEl);
        };
        return TextColumnDefinition;
    })();
    Controls.TextColumnDefinition = TextColumnDefinition;
    var TemplatedKnockoutColumnDefinition = (function () {
        function TemplatedKnockoutColumnDefinition(cellTemplate, headerTemplate, sortProperty, width) {
            this._cellTemplate = "";
            this._cellTemplate = cellTemplate;
            this._headerTemplate = headerTemplate;
            this._sortProperty = sortProperty;
            this._width = (width == "undefined") ? null : width;
        }
        Object.defineProperty(TemplatedKnockoutColumnDefinition.prototype, "sortProperty", {
            get: function () {
                return this._sortProperty;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplatedKnockoutColumnDefinition.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (v) {
                this._width = v;
            },
            enumerable: true,
            configurable: true
        });
        TemplatedKnockoutColumnDefinition.prototype.createCellElement = function (row, rowContext) {
            var cellEl = document.createElement('div');
            cellEl.className = 'dg_cell';
            cellEl.innerHTML = this._cellTemplate;
            cellEl.style.width = this._width + "px";
            ko.applyBindings(rowContext, cellEl);
            row.appendChild(cellEl);
        };
        TemplatedKnockoutColumnDefinition.prototype.createHeaderElement = function (row, rowContext) {
            var el = document.createElement('div');
            el.className = 'dg_cell';
            el.innerHTML = this._headerTemplate;
            el.style.width = this._width + "px";
            row.appendChild(el);
        };
        return TemplatedKnockoutColumnDefinition;
    })();
    Controls.TemplatedKnockoutColumnDefinition = TemplatedKnockoutColumnDefinition;
    var RenderFrame = (function () {
        function RenderFrame() {
        }
        RenderFrame.getObservable = function () {
            if (RenderFrame._observable == null) {
                var s = Rx.Observable.generate(0, function (x) { return true; }, function (x) { return x + 1; }, function (x) { return x; }, (Rx.Scheduler.requestAnimationFrame)).publish();
                RenderFrame._observable = s;
                s.connect();
            }
            return RenderFrame._observable;
        };
        return RenderFrame;
    })();
    Controls.RenderFrame = RenderFrame;
    var DataGridRow = (function () {
        function DataGridRow(context, id, columnDefinitions) {
            var _this = this;
            this._hammer = null;
            this._element = null;
            this._columnDefinitions = null;
            this._isRendered = false;
            this._context = null;
            this.onClick = function (event) {
                console.log("Row " + _this._element.getAttribute("data-dg-row-id") + " was clicked.");
                console.log(event);
            };
            this.onDoubleClick = function (event) {
                console.log("Row " + _this._element.getAttribute("data-dg-row-id") + " was double clicked.");
                console.log(event);
            };
            this._context = context;
            this._id = id;
            this._columnDefinitions = columnDefinitions;
        }
        Object.defineProperty(DataGridRow.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridRow.prototype, "context", {
            get: function () {
                return this._context;
            },
            enumerable: true,
            configurable: true
        });
        DataGridRow.prototype.getElement = function () {
            if (!this._element)
                this.init();
            return this._element;
        };
        DataGridRow.prototype.dispose = function () {
            this._hammer.destroy();
        };
        DataGridRow.prototype.init = function () {
            var row = document.createElement("div");
            row.className = "dg_row";
            row.setAttribute("data-dg-row-id", this.id);
            for (var cIdx = 0; cIdx < this._columnDefinitions.length; ++cIdx) {
                var columnDefinition = this._columnDefinitions[cIdx];
                columnDefinition.createCellElement(row, this._context);
            }
            this._element = row;
            this._hammer = new Hammer.Manager(row, {});
            var singleTap = new Hammer.Tap({ event: 'singletap' });
            var doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2 });
            this._hammer.add([doubleTap, singleTap]);
            doubleTap.recognizeWith(singleTap);
            singleTap.requireFailure(doubleTap);
            this._hammer.on("singletap", this.onClick);
            this._hammer.on("doubletap", this.onDoubleClick);
        };
        return DataGridRow;
    })();
    Controls.DataGridRow = DataGridRow;
    var DataGridHeader = (function () {
        function DataGridHeader(context, columnDefinitions, dataGridElement) {
            this._hammer = null;
            this._element = null;
            this._columnDefinitions = null;
            this._context = null;
            this._dgContainer = null;
            this._context = context;
            this._columnDefinitions = columnDefinitions;
            this._dgContainer = dataGridElement;
        }
        Object.defineProperty(DataGridHeader.prototype, "context", {
            get: function () {
                return this._context;
            },
            enumerable: true,
            configurable: true
        });
        DataGridHeader.prototype.updateHeader = function () {
            var bodyHeader = this._dgContainer.querySelector("div.data_grid .dg_body_container .dg_rows.dg_header");
            var frozenHeader = this._dgContainer.querySelector("div.data_grid .dg_header_container:not(.dg_frozen)");
            var frozenHeaderColumns = this._dgContainer.querySelector("div.data_grid .dg_header_container.dg_frozen");
            bodyHeader.innerHTML = "";
            frozenHeader.innerHTML = "";
            frozenHeaderColumns.innerHTML = "";
            if (!this._columnDefinitions)
                return;
            var headerEl = document.createElement("div");
            headerEl.className = "dg_rows dg_header";
            var rowEl = document.createElement("div");
            rowEl.className = "dg_row";
            headerEl.appendChild(rowEl);
            for (var cIdx = 0; cIdx < this._columnDefinitions.length; ++cIdx) {
                var colItem = this._columnDefinitions[cIdx];
                colItem.createHeaderElement(rowEl, this._context);
            }
            bodyHeader.appendChild(headerEl);
            frozenHeader.innerHTML = bodyHeader.innerHTML;
        };
        DataGridHeader.prototype.dispose = function () {
            var bodyHeader = this._dgContainer.querySelector("div.data_grid .dg_body_container .dg_rows.dg_header");
            var frozenHeader = this._dgContainer.querySelector("div.data_grid .dg_header_container:not(.dg_frozen)");
            var frozenHeaderColumns = this._dgContainer.querySelector("div.data_grid .dg_header_container.dg_frozen");
            bodyHeader.innerHTML = "";
            frozenHeader.innerHTML = "";
            frozenHeaderColumns.innerHTML = "";
        };
        return DataGridHeader;
    })();
    Controls.DataGridHeader = DataGridHeader;
    var DataGrid = (function (_super) {
        __extends(DataGrid, _super);
        function DataGrid() {
            var _this = this;
            _super.call(this, new Orange.Controls.StringTemplateProvider(DataGrid._template));
            this._itemsSourceDisposable = null;
            this._itemsSource = null;
            this._columnDefinitions = null;
            this._frozenColumnCount = 0;
            this._body = null;
            this._frozenColumns = null;
            this._frozenHeader = null;
            this._hammer = null;
            this._renderFrameDisposable = null;
            this._rowIdToElementDictionary = {};
            this._header = null;
            this._uIdCounter = 0;
            this._isUpdatePositionsRequested = false;
            this._isDisposing = false;
            this.onScroll = function (args) {
                _this._isUpdatePositionsRequested = true;
            };
            this.itemsSourceChanged = function (changes) {
                _this.recreateTable();
            };
        }
        Object.defineProperty(DataGrid.prototype, "itemsSource", {
            get: function () {
                return this._itemsSource;
            },
            set: function (v) {
                if (v == this._itemsSource)
                    return;
                if (this._itemsSourceDisposable != null) {
                    this._itemsSourceDisposable.dispose();
                    this._itemsSourceDisposable = null;
                }
                this._itemsSource = v;
                this._itemsSourceDisposable = this._itemsSource.subscribe(this.itemsSourceChanged, null, "arrayChange");
                this.recreateTable();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "columnDefinitions", {
            get: function () {
                return this._columnDefinitions;
            },
            set: function (v) {
                this._columnDefinitions = v;
                this.recreateTable();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "frozenColumnCount", {
            get: function () {
                return this._frozenColumnCount;
            },
            set: function (v) {
                this._frozenColumnCount = v ? v : 0;
                this.recreateTable();
            },
            enumerable: true,
            configurable: true
        });
        DataGrid.prototype.createUId = function () {
            return "o-dg-id-" + this._uIdCounter++;
        };
        DataGrid.prototype.onElementSet = function () {
            _super.prototype.onElementSet.call(this);
            this._hammer = new Hammer(this.element);
            this.initScrollEventListeners();
        };
        DataGrid.prototype.onApplyTemplate = function () {
            var _this = this;
            _super.prototype.onApplyTemplate.call(this);
            var el = this.element;
            this._body = el.querySelector("div.data_grid .dg_body_container .dg_body:not(.dg_frozen)");
            this._frozenColumns = el.querySelector("div.data_grid .dg_body.dg_frozen");
            this._frozenHeader = el.querySelector("div.data_grid .dg_header_container:not(.dg_frozen)");
            this._renderFrameDisposable = RenderFrame.getObservable().subscribe(function (ts) { return _this.onRenderFrame(ts); });
        };
        DataGrid.prototype.onApplyBindings = function () {
        };
        DataGrid.prototype.onRenderFrame = function (ts) {
            if (this._isDisposing)
                return;
            if (this._isUpdatePositionsRequested) {
                this._isUpdatePositionsRequested = false;
                this.updatePositions();
            }
        };
        DataGrid.prototype.initScrollEventListeners = function () {
            window.addEventListener("scroll", this.onScroll, true);
            this._hammer.destroy();
        };
        DataGrid.prototype.dispose = function () {
            this._isDisposing = true;
            _super.prototype.dispose.call(this);
            window.removeEventListener("scroll", this.onScroll, true);
            if (this._itemsSourceDisposable != null) {
                this._itemsSourceDisposable.dispose();
                this._itemsSourceDisposable = null;
            }
            this._renderFrameDisposable.dispose();
        };
        DataGrid.prototype.updatePositions = function () {
            this._isUpdatePositionsRequested = false;
            var elbb = this.element.getBoundingClientRect();
            var brbb = this._body.getBoundingClientRect();
            var fhbb = this._frozenHeader.getBoundingClientRect();
            var fcbb = this._frozenColumns.getBoundingClientRect();
            var diff = elbb.left + fhbb.left - brbb.left;
            this._frozenHeader.style.left = fhbb.left - diff + "px";
            this._frozenColumns.style.left = elbb.left - brbb.left + "px";
        };
        DataGrid.prototype.addRow = function (context, index) {
            var row = new DataGridRow(context, this.createUId(), this._columnDefinitions);
            this._rowIdToElementDictionary[row.id] = row;
            var rows = this._body.firstElementChild;
            if (index == "undefined" || index == null) {
                rows.appendChild(row.getElement());
            }
            else {
                rows.insertBefore(row.getElement(), rows.children[index]);
            }
        };
        DataGrid.prototype.recreateHeader = function () {
            if (this._header != null) {
                this._header.dispose();
                this._header = null;
            }
            var context = {};
            this._header = new DataGridHeader(context, this._columnDefinitions, this.element);
            this._header.updateHeader();
        };
        DataGrid.prototype.disposeIdToElementDictionary = function () {
            for (var key in this._rowIdToElementDictionary) {
                this._rowIdToElementDictionary[key].dispose();
            }
            this._rowIdToElementDictionary = {};
        };
        DataGrid.prototype.recreateTable = function () {
            this._body.innerHTML = "";
            this._frozenColumns.innerHTML = "";
            this.recreateHeader();
            if (!this._columnDefinitions || !this._itemsSource)
                return;
            var rows = document.createElement("div");
            rows.className = "dg_rows";
            this._body.appendChild(rows);
            var items = this._itemsSource();
            if (this.frozenColumnCount > 0) {
                var frozenRows = document.createElement("div");
                frozenRows.className = "dg_rows dg_frozen";
                this._frozenColumns.appendChild(frozenRows);
                for (var rIdx = 0; rIdx < items.length; ++rIdx) {
                    this.addRow(items[rIdx]);
                }
            }
            else {
                for (var rIdx = 0; rIdx < items.length; ++rIdx) {
                    this.addRow(items[rIdx]);
                }
            }
        };
        DataGrid._template = '<div class="data_grid" data-bind="stopBindings: true">' + '	<div class="dg_body_container">' + '		<div class="dg_rows dg_header">' + '		</div>' + '		<div class="dg_body dg_frozen">' + '		</div>' + '		<div class="dg_body">' + '		</div>' + '	</div>' + '	<div class="dg_header_container">' + '	</div>' + '	<div class="dg_header_container dg_frozen">' + '	</div>' + '</div>';
        return DataGrid;
    })(Orange.Controls.TemplatedControl);
    Controls.DataGrid = DataGrid;
})(Controls || (Controls = {}));
var startReq = { windowLoaded: false, templatesLoaded: true };
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
var TemplatedCol3 = (function () {
    function TemplatedCol3(name) {
        this.name = null;
        this.name = ko.observable(name);
    }
    return TemplatedCol3;
})();
var RowItem = (function () {
    function RowItem() {
    }
    return RowItem;
})();
var Application = (function () {
    function Application() {
    }
    Application.prototype.run = function () {
        var container = new Orange.Modularity.Container();
        var controlManager = new Orange.Controls.ControlManager(container);
        container.registerInstance(Orange.Controls.ControlManager, controlManager);
        var dgControl = Orange.Controls.GetOrangeElement(document.getElementById("my_dg"));
        var alphabet = new Array('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z');
        var dgReady = function () {
            var cols = new Array(new Controls.TextColumnDefinition("col1", "Column one", "col1", 20), new Controls.TextColumnDefinition("col2", "Column two", "col2", 50), new Controls.TemplatedKnockoutColumnDefinition('<div>' + '   <span class="glyphicon glyphicon-heart" aria-hidden="true"></span>' + '   <span data-bind="text: col3.name">' + '   </span>' + '   <div class="btn-group" style="float: right;">' + '       <button type="button" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' + '           Action <span class="caret"></span>' + '       </button>' + '       <ul class="dropdown-menu" role="menu">' + '           <li><a href="#">Action</a></li>' + '           <li><a href="#">Another action</a></li> ' + '           <li><a href="#">Something else here</a></li> ' + '           <li class="divider"></li> ' + '           <li><a href="#">Separated link</a></li>' + '       </ul>' + '   </div>' + '</div>', '<span>ko header</span>', "col3.name", 200), new Controls.TextColumnDefinition("col4", "Column four", "col4", 100), new Controls.TextColumnDefinition("col5", "Column five", "col5", 100), new Controls.TextColumnDefinition("col6", "Column six", "col6", 100), new Controls.TextColumnDefinition("col7", "Column seven", "col7", 100), new Controls.TextColumnDefinition("col8", "Column eight", "col8", 100), new Controls.TextColumnDefinition("col9", "Column nine", "col9", 100));
            var data = Ix.Enumerable.range(0, 1).select(function (rIdx) {
                var rowItem = new RowItem();
                rowItem.col1 = '' + rIdx + ' 1';
                rowItem.col2 = alphabet[rIdx % alphabet.length];
                rowItem.col3 = new TemplatedCol3(alphabet[rIdx % alphabet.length] + alphabet[rIdx % alphabet.length] + alphabet[rIdx % alphabet.length]);
                rowItem.col4 = '' + rIdx + ' 4';
                rowItem.col5 = '' + rIdx + ' 5';
                rowItem.col6 = '' + rIdx + ' 6';
                rowItem.col7 = '' + rIdx + ' 7';
                rowItem.col8 = '' + rIdx + ' 8';
                rowItem.col9 = '' + rIdx + ' 9';
                return rowItem;
            }).toArray();
            var dg = dgControl.control;
            dg.frozenColumnCount = 2;
            dg.columnDefinitions = cols;
            var items = ko.observableArray(data);
            dg.itemsSource = items;
            var counter = 1;
            Rx.Observable.interval(50).take(20).subscribe(function (_) {
                var newItem = new RowItem();
                newItem.col1 = '' + counter++;
                newItem.col2 = alphabet[Math.floor(Math.random() * alphabet.length)];
                newItem.col3 = new TemplatedCol3(alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)]);
                newItem.col4 = 'inserted 4';
                newItem.col5 = 'inserted 5';
                newItem.col6 = 'inserted 6';
                newItem.col7 = 'inserted 7';
                newItem.col8 = 'inserted 8';
                newItem.col9 = 'inserted 9';
                items.splice(Math.floor(Math.random() * items().length), 0, newItem);
            });
            Rx.Observable.interval(5000).take(20).subscribe(function (_) {
                items.sort(function (left, right) {
                    return left.col2 == right.col2 ? 0 : (left.col2 < right.col2 ? -1 : 1);
                });
            });
        };
        dgControl.addOnInitializedListener(dgReady);
        controlManager.manage(document.body);
    };
    return Application;
})();
//# sourceMappingURL=app.js.map