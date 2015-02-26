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
                $.get(tpl.path, function (tplCode) {
                    var code = '<script type="text/html" id="' + id + '">' + tplCode + '</script>';
                    $('body').append(code);
                    loadedTemplates++;
                    if (loadedTemplates == templates.length) {
                        if (TemplateLoader.onload)
                            TemplateLoader.onload();
                    }
                });
            })();
        }
        ;
    };
    return TemplateLoader;
})();
var UI;
(function (UI) {
    var ViewBase = (function () {
        function ViewBase(templateName, viewModel) {
            this._element = null;
            this.templateName = templateName;
            this.viewModel = viewModel;
        }
        Object.defineProperty(ViewBase.prototype, "element", {
            get: function () {
                return this._element;
            },
            set: function (value) {
                this._element = value;
                value.setAttribute("data-bind", "template: '" + this.templateName + "'");
                ko.applyBindings(this.viewModel, value);
            },
            enumerable: true,
            configurable: true
        });
        return ViewBase;
    })();
    UI.ViewBase = ViewBase;
})(UI || (UI = {}));
var Domain;
(function (Domain) {
    var TodoTaskRepository = (function () {
        function TodoTaskRepository() {
        }
        TodoTaskRepository.prototype.getTodoTasks = function () {
            return $.getJSON("api/tasks.js");
        };
        TodoTaskRepository.prototype.store = function (todoTask) {
            if (this.todoTaskAdded)
                this.todoTaskAdded(todoTask);
        };
        return TodoTaskRepository;
    })();
    Domain.TodoTaskRepository = TodoTaskRepository;
})(Domain || (Domain = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UI;
(function (UI) {
    var TodoItemForm;
    (function (TodoItemForm) {
        var TodoItemFormView = (function (_super) {
            __extends(TodoItemFormView, _super);
            function TodoItemFormView(viewModel) {
                _super.call(this, "UI_TodoItemForm_TodoItemFormView", viewModel);
            }
            TodoItemFormView.dependencies = function () { return [TodoItemForm.TodoItemFormViewModel]; };
            return TodoItemFormView;
        })(UI.ViewBase);
        TodoItemForm.TodoItemFormView = TodoItemFormView;
    })(TodoItemForm = UI.TodoItemForm || (UI.TodoItemForm = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var TodoItemForm;
    (function (TodoItemForm) {
        var TodoItemFormViewModel = (function () {
            function TodoItemFormViewModel(repository) {
                var _this = this;
                this.repository = repository;
                this.isVisible = ko.observable(true);
                this.description = ko.observable("");
                this.validationMessage = ko.observable("");
                this.submit = function () {
                    _this.repository.store({ description: _this.description(), isDone: false });
                };
                this.canSubmit = ko.observable(true);
            }
            TodoItemFormViewModel.dependencies = function () { return [Domain.TodoTaskRepository]; };
            return TodoItemFormViewModel;
        })();
        TodoItemForm.TodoItemFormViewModel = TodoItemFormViewModel;
    })(TodoItemForm = UI.TodoItemForm || (UI.TodoItemForm = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var TodoList;
    (function (TodoList) {
        var TodoListView = (function (_super) {
            __extends(TodoListView, _super);
            function TodoListView(viewModel) {
                _super.call(this, "UI_TodoList_TodoListView", viewModel);
            }
            TodoListView.dependencies = function () { return [TodoList.TodoListViewModel]; };
            return TodoListView;
        })(UI.ViewBase);
        TodoList.TodoListView = TodoListView;
    })(TodoList = UI.TodoList || (UI.TodoList = {}));
})(UI || (UI = {}));
var UI;
(function (UI) {
    var TodoList;
    (function (TodoList) {
        var TodoListViewModel = (function () {
            function TodoListViewModel(repository) {
                var _this = this;
                this.taskItems = ko.observableArray([]);
                repository.getTodoTasks().done(function (taskItems) {
                    _this.taskItems(taskItems);
                });
                repository.todoTaskAdded = function (todoTask) {
                    _this.taskItems.push(todoTask);
                };
            }
            TodoListViewModel.dependencies = function () { return [Domain.TodoTaskRepository]; };
            return TodoListViewModel;
        })();
        TodoList.TodoListViewModel = TodoListViewModel;
    })(TodoList = UI.TodoList || (UI.TodoList = {}));
})(UI || (UI = {}));
var templates = [
    { id: "UI_TodoItemForm_TodoItemFormView", path: "UI/TodoItemForm/TodoItemFormView.tpl.html" },
    { id: "UI_TodoList_TodoListView", path: "UI/TodoList/TodoListView.tpl.html" }
];
function prepareContainer(container) {
    container.registerInstance(Domain.TodoTaskRepository, new Domain.TodoTaskRepository());
}
window.onload = function () {
    var container = new Orange.Modularity.Container();
    var regionManager = new Orange.Modularity.RegionManager(container);
    container.registerInstance(Orange.Modularity.RegionManager, regionManager);
    prepareContainer(container);
    TemplateLoader.onload = function () {
        regionManager.initializeRegions(document.body);
    };
    TemplateLoader.load(templates);
};
//# sourceMappingURL=app.js.map