/// <reference path="../../orange.d.ts" />
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../bower_components/rxjs/ts/rx.all.d.ts" />
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
/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../bower_components/rxjs/ts/rx.all.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Views;
(function (Views) {
    var FeedbackLoop;
    (function (FeedbackLoop) {
        var FeedbackLoopView = (function (_super) {
            __extends(FeedbackLoopView, _super);
            function FeedbackLoopView() {
                // call Orange.Controls.ViewBase constructor with 
                // (namespace1-namespace2-viewClass [, viewmodel])
                _super.call(this, "Views-FeedbackLoop-FeedbackLoopView");
            }
            /*
             * The following protected methods will be called in the order they are defined in
             * this class.
             *
             * NOTE: None of the below methods have to be overridden, they are there to supply
             * hookcs in to the layout engine att given stepps in the layout process.
             */
            // onElementSet will be called directly after the view has been assigned a HTMLElement to 
            // this.Element. onElementSet is inherited from Orange.Controls.Control
            FeedbackLoopView.prototype.onElementSet = function () {
                _super.prototype.onElementSet.call(this);
            };
            // onApplyTemplate will be called when the template (i.e. the [viewname].tpl.html) has 
            // been applied (i.e. inserted in to the this.element HTMLElement).
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
                var dispose = { dispose: function () { return window.clearInterval(injectSelfInterval); } };
                this.addDisposable(dispose);
            };
            // onApplyBindings will be called when any bindings (e.g. knockout bindings when using
            // knockout) has been applied. 
            FeedbackLoopView.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
            };
            return FeedbackLoopView;
        })(Orange.Controls.ViewBase);
        FeedbackLoop.FeedbackLoopView = FeedbackLoopView;
    })(FeedbackLoop = Views.FeedbackLoop || (Views.FeedbackLoop = {}));
})(Views || (Views = {}));
/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../bower_components/rxjs/ts/rx.all.d.ts" />
var Views;
(function (Views) {
    var MainContainer;
    (function (MainContainer) {
        var MainContainerView = (function (_super) {
            __extends(MainContainerView, _super);
            function MainContainerView(viewModel) {
                // call Orange.Controls.ViewBase constructor with 
                // (namespace1-namespace2-viewClass [, viewmodel])
                _super.call(this, "Views-MainContainer-MainContainerView", viewModel);
            }
            /*
             * The following protected methods will be called in the order they are defined in
             * this class.
             *
             * NOTE: None of the below methods have to be overridden, they are there to supply
             * hookcs in to the layout engine att given stepps in the layout process.
             */
            // onElementSet will be called directly after the view has been assigned a HTMLElement to 
            // this.Element. onElementSet is inherited from Orange.Controls.Control
            MainContainerView.prototype.onElementSet = function () {
                _super.prototype.onElementSet.call(this);
            };
            // onApplyTemplate will be called when the template (i.e. the [viewname].tpl.html) has 
            // been applied (i.e. inserted in to the this.element HTMLElement).
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
            // onApplyBindings will be called when any bindings (e.g. knockout bindings when using
            // knockout) has been applied. 
            MainContainerView.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
            };
            MainContainerView.dependencies = function () { return [Views.MainContainer.MainContainerViewModel]; };
            return MainContainerView;
        })(Orange.Controls.KnockoutViewBase);
        MainContainer.MainContainerView = MainContainerView;
    })(MainContainer = Views.MainContainer || (Views.MainContainer = {}));
})(Views || (Views = {}));
/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../bower_components/rxjs/ts/rx.all.d.ts" />
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
                // asynchronous view / view model injection. 
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
/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../bower_components/rxjs/ts/rx.all.d.ts" />
var Views;
(function (Views) {
    var Nested;
    (function (Nested) {
        var NestedView = (function (_super) {
            __extends(NestedView, _super);
            function NestedView(viewModel) {
                // call Orange.Controls.ViewBase constructor with 
                // (namespace1-namespace2-viewClass [, viewmodel])
                _super.call(this, "Views-Nested-NestedView", viewModel);
            }
            /*
             * The following protected methods will be called in the order they are defined in
             * this class.
             *
             * NOTE: None of the below methods have to be overridden, they are there to supply
             * hookcs in to the layout engine att given stepps in the layout process.
             */
            // onElementSet will be called directly after the view has been assigned a HTMLElement to 
            // this.Element. onElementSet is inherited from Orange.Controls.Control
            NestedView.prototype.onElementSet = function () {
                _super.prototype.onElementSet.call(this);
            };
            // onApplyTemplate will be called when the template (i.e. the [viewname].tpl.html) has 
            // been applied (i.e. inserted in to the this.element HTMLElement).
            NestedView.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
            };
            // onApplyBindings will be called when any bindings (e.g. knockout bindings when using
            // knockout) has been applied. 
            NestedView.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
            };
            NestedView.dependencies = function () { return [Views.Nested.NestedViewModel]; };
            return NestedView;
        })(Orange.Controls.KnockoutViewBase);
        Nested.NestedView = NestedView;
    })(Nested = Views.Nested || (Views.Nested = {}));
})(Views || (Views = {}));
/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../bower_components/rxjs/ts/rx.all.d.ts" />
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
/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../bower_components/rxjs/ts/rx.all.d.ts" />
var Views;
(function (Views) {
    var NestedWithExternalViewModel;
    (function (NestedWithExternalViewModel) {
        var NestedWithExternalViewModelView = (function (_super) {
            __extends(NestedWithExternalViewModelView, _super);
            function NestedWithExternalViewModelView() {
                // call Orange.Controls.ViewBase constructor with 
                // (namespace1-namespace2-viewClass [, viewmodel])
                _super.call(this, "Views-NestedWithExternalViewModel-NestedWithExternalViewModelView");
            }
            /*
             * The following protected methods will be called in the order they are defined in
             * this class.
             *
             * NOTE: None of the below methods have to be overridden, they are there to supply
             * hookcs in to the layout engine att given stepps in the layout process.
             */
            // onElementSet will be called directly after the view has been assigned a HTMLElement to 
            // this.Element. onElementSet is inherited from Orange.Controls.Control
            NestedWithExternalViewModelView.prototype.onElementSet = function () {
                _super.prototype.onElementSet.call(this);
            };
            // onApplyTemplate will be called when the template (i.e. the [viewname].tpl.html) has 
            // been applied (i.e. inserted in to the this.element HTMLElement).
            NestedWithExternalViewModelView.prototype.onApplyTemplate = function () {
                _super.prototype.onApplyTemplate.call(this);
            };
            // onApplyBindings will be called when any bindings (e.g. knockout bindings when using
            // knockout) has been applied. 
            NestedWithExternalViewModelView.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
            };
            return NestedWithExternalViewModelView;
        })(Orange.Controls.KnockoutViewBase);
        NestedWithExternalViewModel.NestedWithExternalViewModelView = NestedWithExternalViewModelView;
    })(NestedWithExternalViewModel = Views.NestedWithExternalViewModel || (Views.NestedWithExternalViewModel = {}));
})(Views || (Views = {}));
//# sourceMappingURL=app.js.map