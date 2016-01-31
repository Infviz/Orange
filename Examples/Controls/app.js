/// <reference path="../../orange.d.ts" />
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
        container.registerInstance(Orange.Modularity.Container, container);
        container.registerInstance(Orange.Controls.ControlManager, controlManager);
        controlManager.manage(document.body);
    };
    return Application;
})();
/// <reference path="../../../orange.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// var templates: {
//         [src: string]: { [index: string]: any };
//     }
var Controls;
(function (Controls) {
    var ElementPositioner = (function (_super) {
        __extends(ElementPositioner, _super);
        function ElementPositioner() {
            _super.call(this, new Orange.Controls.StringTemplateProvider(ElementPositioner._template));
            this._x = 0;
            this._y = 0;
            this._container = null;
            this._positionedTemplate = null;
        }
        Object.defineProperty(ElementPositioner.prototype, "x", {
            get: function () { return this._x; },
            set: function (v) {
                if (this._x == v)
                    return;
                this._x = v;
                this.recreateGraphics();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElementPositioner.prototype, "y", {
            get: function () { return this._y; },
            set: function (v) {
                if (this._y == v)
                    return;
                this._y = v;
                this.recreateGraphics();
            },
            enumerable: true,
            configurable: true
        });
        ElementPositioner.prototype.recreateGraphics = function () {
            if (false == this.isTemplateApplied)
                return;
            var bcr = this._container.getBoundingClientRect();
            var pBcr = this.element.getBoundingClientRect();
            var style = this._container.style;
            style.left = (this.x * 100) + "%";
            style.top = (this.y * 100) + "%";
            var transform = "translateX(-" + (bcr.width * 0.5) + "px) translateY(-" + (bcr.height * 0.5) + "px)";
            style["-webkit-transform"] = transform;
            style.transform = transform;
        };
        ElementPositioner.prototype.onElementSet = function () {
            _super.prototype.onElementSet.call(this);
            this._positionedTemplate = this.element.removeChild(this.element.firstElementChild);
        };
        ElementPositioner.prototype.onApplyTemplate = function () {
            _super.prototype.onApplyTemplate.call(this);
            this._container = this.element.querySelector(".element_positioner_container");
            var style = this.element.style;
            style.display = "block";
            style.boxSizing = "border-box";
            style.position = "relative";
            style.width = "100%";
            style.height = "100%";
            this._container.appendChild(this._positionedTemplate);
            if (this._positionedTemplate.querySelectorAll("[data-bind]").length > 0 &&
                !ko.dataFor(this._positionedTemplate)) {
                ko.applyBindings(this._positionedTemplate);
            }
            this.recreateGraphics();
        };
        ElementPositioner._template = "<div style=\"display: inline-block; position: relative;\" class=\"element_positioner_container\"></div>";
        return ElementPositioner;
    })(Orange.Controls.TemplatedControl);
    Controls.ElementPositioner = ElementPositioner;
})(Controls || (Controls = {}));
/// <reference path="../../../orange.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />
var Controls;
(function (Controls) {
    var SmartInput = (function (_super) {
        __extends(SmartInput, _super);
        function SmartInput() {
            var _this = this;
            _super.call(this, new Orange.Controls.StringTemplateProvider('<input class="controls_smart_input_element" type="text" style="display: inline-block; position: relative;"/>'));
            this._text = "";
            this._input = null;
            this.onkeypress = function (ev) { return _this.text = _this._input.value; };
        }
        Object.defineProperty(SmartInput.prototype, "text", {
            get: function () { return this._text; },
            set: function (v) {
                var _this = this;
                if (this._text == v)
                    return;
                this._text = !v ? "" : v;
                if (this._input.value != this._text)
                    this._input.value = this._text;
                this.raisePropertyChanged(function () { return _this.text; });
            },
            enumerable: true,
            configurable: true
        });
        SmartInput.prototype.onApplyTemplate = function () {
            _super.prototype.onApplyTemplate.call(this);
            this._input = this.element.querySelector(".controls_smart_input_element");
            this._input.addEventListener("input", this.onkeypress);
        };
        SmartInput.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this._input.removeEventListener("input", this.onkeypress);
        };
        return SmartInput;
    })(Orange.Controls.TemplatedControl);
    Controls.SmartInput = SmartInput;
})(Controls || (Controls = {}));
/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../bower_components/rxjs/ts/rx.all.d.ts" />
var Views;
(function (Views) {
    var MainContainer;
    (function (MainContainer) {
        var MainContainerViewModel = (function () {
            function MainContainerViewModel() {
                this.vmX = ko.observable(0.5);
                this.vmY = new Rx.BehaviorSubject(0.5);
                this.name = ko.observable("I am possitioned!");
                this.init();
            }
            MainContainerViewModel.prototype.init = function () {
                var _this = this;
                Rx.Observable
                    .timer(100, 1000)
                    .timeInterval()
                    .subscribe(function (interval) {
                    _this.vmX(Math.random());
                    _this.vmY.onNext(Math.random());
                });
                this.name.subscribe(function (val) { return console.log(val); });
            };
            return MainContainerViewModel;
        })();
        MainContainer.MainContainerViewModel = MainContainerViewModel;
    })(MainContainer = Views.MainContainer || (Views.MainContainer = {}));
})(Views || (Views = {}));
/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="MainContainerViewModel" />
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
                _super.prototype.onApplyTemplate.call(this);
            };
            // onApplyBindings will be called when any bindings (e.g. knockout bindings when using
            // knockout) has been applied. 
            MainContainerView.prototype.onApplyBindings = function () {
                _super.prototype.onApplyBindings.call(this);
            };
            MainContainerView.prototype.dispose = function () {
                _super.prototype.dispose.call(this);
            };
            MainContainerView = __decorate([
                Orange.Modularity.inject, 
                __metadata('design:paramtypes', [MainContainer.MainContainerViewModel])
            ], MainContainerView);
            return MainContainerView;
        })(Orange.Controls.KnockoutViewBase);
        MainContainer.MainContainerView = MainContainerView;
    })(MainContainer = Views.MainContainer || (Views.MainContainer = {}));
})(Views || (Views = {}));
//# sourceMappingURL=app.js.map