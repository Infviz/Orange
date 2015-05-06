/// <reference path="Reference.d.ts"/>
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by this BSD-style
 * license that can be found in the license below.
 *
 * Copyright (c) 2014 The Polymer Authors. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *    * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *    * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
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
    // We use setImmediate or postMessage for our future callback.
    var setImmediate = window.msSetImmediate;
    // Use post message to emulate setImmediate.
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
    // This is used to ensure that we never schedule 2 callas to setImmediate
    var isScheduled = false;
    // Keep track of observers that needs to be notified next time.
    var scheduledObservers = [];
    /**
     * Schedules |dispatchCallback| to be called in the future.
     * @param {MutationObserver} observer
     */
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
        // http://dom.spec.whatwg.org/#mutation-observers
        isScheduled = false; // Used to allow a new setImmediate call above.
        var observers = scheduledObservers;
        scheduledObservers = [];
        // Sort observers based on their creation UID (incremental).
        observers.sort(function (o1, o2) {
            return o1.uid_ - o2.uid_;
        });
        var anyNonEmpty = false;
        observers.forEach(function (observer) {
            // 2.1, 2.2
            var queue = observer.takeRecords();
            // 2.3. Remove all transient registered observers whose observer is mo.
            removeTransientObserversFor(observer);
            // 2.4
            if (queue.length) {
                observer.callback_(queue, observer);
                anyNonEmpty = true;
            }
        });
        // 3.
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
    /**
     * This function is used for the "For each registered observer observer (with
     * observer's options as options) in target's list of registered observers,
     * run these substeps:" and the "For each ancestor ancestor of target, and for
     * each registered observer observer (with options options) in ancestor's list
     * of registered observers, run these substeps:" part of the algorithms. The
     * |options.subtree| is checked to ensure that the callback is called
     * correctly.
     *
     * @param {Node} target
     * @param {function(MutationObserverInit):MutationRecord} callback
     */
    function forEachAncestorAndObserverEnqueueRecord(target, callback) {
        for (var node = target; node; node = node.parentNode) {
            var registrations = registrationsTable.get(node);
            if (registrations) {
                for (var j = 0; j < registrations.length; j++) {
                    var registration = registrations[j];
                    var options = registration.options;
                    // Only target ignores subtree.
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
    /**
     * The class that maps to the DOM MutationObserver interface.
     * @param {Function} callback.
     * @constructor
     */
    function JsMutationObserver(callback) {
        this.callback_ = callback;
        this.nodes_ = [];
        this.records_ = [];
        this.uid_ = ++uidCounter;
    }
    JsMutationObserver.prototype = {
        observe: function (target, options) {
            target = wrapIfNeeded(target);
            // 1.1
            if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
                throw new SyntaxError();
            }
            var registrations = registrationsTable.get(target);
            if (!registrations)
                registrationsTable.set(target, registrations = []);
            // 2
            // If target's list of registered observers already includes a registered
            // observer associated with the context object, replace that registered
            // observer's options with options.
            var registration;
            for (var i = 0; i < registrations.length; i++) {
                if (registrations[i].observer === this) {
                    registration = registrations[i];
                    registration.removeListeners();
                    registration.options = options;
                    break;
                }
            }
            // 3.
            // Otherwise, add a new registered observer to target's list of registered
            // observers with the context object as the observer and options as the
            // options, and add target to context object's list of nodes on which it
            // is registered.
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
    /**
     * @param {string} type
     * @param {Node} target
     * @constructor
     */
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
    // We keep track of the two (possibly one) records used in a single mutation.
    var currentRecord, recordWithOldValue;
    /**
     * Creates a record without |oldValue| and caches it as |currentRecord| for
     * later use.
     * @param {string} oldValue
     * @return {MutationRecord}
     */
    function getRecord(type, target) {
        return currentRecord = new MutationRecord(type, target);
    }
    /**
     * Gets or creates a record with |oldValue| based in the |currentRecord|
     * @param {string} oldValue
     * @return {MutationRecord}
     */
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
    /**
     * @param {MutationRecord} record
     * @return {boolean} Whether the record represents a record from the current
     * mutation event.
     */
    function recordRepresentsCurrentMutation(record) {
        return record === recordWithOldValue || record === currentRecord;
    }
    /**
     * Selects which record, if any, to replace the last record in the queue.
     * This returns |null| if no record should be replaced.
     *
     * @param {MutationRecord} lastRecord
     * @param {MutationRecord} newRecord
     * @param {MutationRecord}
     */
    function selectRecord(lastRecord, newRecord) {
        if (lastRecord === newRecord)
            return lastRecord;
        // Check if the the record we are adding represents the same record. If
        // so, we keep the one with the oldValue in it.
        if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord))
            return recordWithOldValue;
        return null;
    }
    /**
     * Class used to represent a registered observer.
     * @param {MutationObserver} observer
     * @param {Node} target
     * @param {MutationObserverInit} options
     * @constructor
     */
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
            // There are cases where we replace the last record with the new record.
            // For example if the record represents the same mutation we need to use
            // the one with the oldValue. If we get same record (this can happen as we
            // walk up the tree) we ignore the new record.
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
        /**
         * Adds a transient observer on node. The transient observer gets removed
         * next time we deliver the change records.
         * @param {Node} node
         */
        addTransientObserver: function (node) {
            // Don't add transient observers on the target itself. We already have all
            // the required listeners set up on the target.
            if (node === this.target)
                return;
            this.addListeners_(node);
            this.transientObservedNodes.push(node);
            var registrations = registrationsTable.get(node);
            if (!registrations)
                registrationsTable.set(node, registrations = []);
            // We know that registrations does not contain this because we already
            // checked if node === this.target.
            registrations.push(this);
        },
        removeTransientObservers: function () {
            var transientObservedNodes = this.transientObservedNodes;
            this.transientObservedNodes = [];
            transientObservedNodes.forEach(function (node) {
                // Transient observers are never added to the target.
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
            // Stop propagation since we are managing the propagation manually.
            // This means that other mutation events on the page will not work
            // correctly but that is by design.
            e.stopImmediatePropagation();
            switch (e.type) {
                case 'DOMAttrModified':
                    // http://dom.spec.whatwg.org/#concept-mo-queue-attributes
                    var name = e.attrName;
                    var namespace = e.relatedNode.namespaceURI;
                    var target = e.target;
                    // 1.
                    var record = new getRecord('attributes', target);
                    record.attributeName = name;
                    record.attributeNamespace = namespace;
                    // 2.
                    var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
                    forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                        // 3.1, 4.2
                        if (!options.attributes)
                            return;
                        // 3.2, 4.3
                        if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
                            return;
                        }
                        // 3.3, 4.4
                        if (options.attributeOldValue)
                            return getRecordWithOldValue(oldValue);
                        // 3.4, 4.5
                        return record;
                    });
                    break;
                case 'DOMCharacterDataModified':
                    // http://dom.spec.whatwg.org/#concept-mo-queue-characterdata
                    var target = e.target;
                    // 1.
                    var record = getRecord('characterData', target);
                    // 2.
                    var oldValue = e.prevValue;
                    forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                        // 3.1, 4.2
                        if (!options.characterData)
                            return;
                        // 3.2, 4.3
                        if (options.characterDataOldValue)
                            return getRecordWithOldValue(oldValue);
                        // 3.3, 4.4
                        return record;
                    });
                    break;
                case 'DOMNodeRemoved':
                    this.addTransientObserver(e.target);
                case 'DOMNodeInserted':
                    // http://dom.spec.whatwg.org/#concept-mo-queue-childlist
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
                    // 1.
                    var record = getRecord('childList', target);
                    record.addedNodes = addedNodes;
                    record.removedNodes = removedNodes;
                    record.previousSibling = previousSibling;
                    record.nextSibling = nextSibling;
                    forEachAncestorAndObserverEnqueueRecord(target, function (options) {
                        // 2.1, 3.2
                        if (!options.childList)
                            return;
                        // 2.2, 3.3
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
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/// <reference path="Reference.d.ts"/>
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
/// <reference path="Reference.d.ts"/>
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
                // $.get(
                //     tpl.path,
                //     tplCode => {
                //         var code = '<script type="text/html" id="' + id + '">' + tplCode + '</script>';
                //         $('body').append(code);
                //         loadedTemplates++;
                //         if (loadedTemplates == templates.length)
                //         {
                //             if (TemplateLoader.onload) TemplateLoader.onload();
                //         }
                //     });
            })();
        }
        ;
    };
    return TemplateLoader;
})();
/// <reference path="Reference.d.ts"/>
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
/// <reference path="Reference.d.ts"/>
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
/// <reference path="Reference.d.ts"/>
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
                get: function () {
                    return this._dataContext;
                },
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
            ViewBase.prototype.onApplyBindings = function () {
            };
            ViewBase.prototype.onDataContextSet = function () {
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
                    // 1 == ELEMENT_NODE
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
/// <reference path="Reference.d.ts"/>
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
                        // 1 == ELEMENT_NODE
                        if (node.nodeType !== 1)
                            continue;
                        ControlManager.createControlsInElement(node, _this._container);
                    }
                    var removedNodes = mutation.removedNodes;
                    for (var i = 0; i < removedNodes.length; i++) {
                        var node = removedNodes[i];
                        // 1 == ELEMENT_NODE
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
                // Clear information stored on element.
                if (!!(control.element))
                    control.element.orange = null;
                // NOTE: disposables is private..
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
            ControlManager.createControlInternal = function (element, container) {
                var type = ControlManager.getControlAttribute(element);
                // The element already has a controll connected to it.
                var orangeElement = Controls.GetOrangeElement(element);
                if (orangeElement.isInitialized)
                    return null;
                var constructorFunction = type.value.split(".").reduce(function (c, n) { return c[n]; }, window);
                var control = (!!container ? container.resolve(constructorFunction) : new constructorFunction());
                if (false == (control instanceof constructorFunction))
                    throw "ControlManager.createControl: instance of constructed object is not of the correct type.";
                orangeElement.control = control;
                // TODO: Improve the id generation
                var uid = "o-uid-" + (ControlManager._uniqueIdCounter++);
                element.setAttribute(type.attributeType + "-id", uid);
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
                // Set to true if additions and removals of the target node's child elements 
                // (including text nodes) are to be observed.
                childList: true,
                // Set to true if mutations to target's attributes are to be observed.
                attributes: false,
                // Set to true if mutations to target's data are to be observed.
                characterData: false,
                // Set to true if mutations to not just target, but also target's descendants 
                // are to be observed.
                subtree: true,
                // Set to true if attributes is set to true and target's attribute value 
                // before the mutation needs to be recorded.
                attributeOldValue: false,
                // Set to true if characterData is set to true and target's data before the 
                // mutation needs to be recorded.
                characterDataOldValue: false,
            };
            ControlManager._controlAttributeNames = ["data-control", "data-view"];
            // TODO: Replace with decent id generation later
            ControlManager._uniqueIdCounter = 0;
            return ControlManager;
        })();
        Controls.ControlManager = ControlManager;
    })(Controls = Orange.Controls || (Orange.Controls = {}));
})(Orange || (Orange = {}));
/// <reference path="Reference.d.ts"/>
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
                    // if Rx.Observable
                    if (_this.vm[_this.property].onNext) {
                        _this.vm[_this.property].onNext(propertyValue);
                    }
                    else if (typeof _this.vm[_this.property] === "function") {
                        //console.log("Binding two way to knockout observable. (" + property.value + ")");
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
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, // Deprecated, use bindingContext.$data or .rawData instead
                bindingContext) {
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
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, // Deprecated, use bindingContext.$data or .rawData instead
                bindingContext) {
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
//# sourceMappingURL=orange.js.map