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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/// <reference path="../../orange.d.ts" />
System.register("index", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            /// <reference path="../../orange.d.ts" />
            window.onload = function () {
                var container = new Orange.Modularity.Container();
                var controlManager = new Orange.Controls.ControlManager(container);
                container.registerInstance(Orange.Modularity.Container, container);
                container.registerInstance(Orange.Controls.ControlManager, controlManager);
                controlManager.manage(document.body);
            };
        }
    };
});
System.register("Domain/SomethingService", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var SomethingService;
    return {
        setters: [],
        execute: function () {
            SomethingService = (function () {
                function SomethingService() {
                }
                SomethingService.prototype.provideSomething = function () {
                    return "something";
                };
                return SomethingService;
            }());
            exports_2("default", SomethingService);
        }
    };
});
System.register("Views/ReactViewBase", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var ReactViewBase;
    return {
        setters: [],
        execute: function () {
            ReactViewBase = (function (_super) {
                __extends(ReactViewBase, _super);
                function ReactViewBase() {
                    var _this = _super.call(this) || this;
                    _this.instance = null;
                    return _this;
                }
                ReactViewBase.prototype.onElementSet = function () {
                    var component = this.getComponent();
                    var element = React.createElement(component);
                    ReactDOM.render(element, this.element);
                };
                Object.defineProperty(ReactViewBase.prototype, "state", {
                    get: function () {
                        if (this.instance)
                            return this.instance.state;
                        else
                            return this._initialState;
                    },
                    // must only be called from constructor
                    set: function (value) {
                        this._initialState = value;
                    },
                    enumerable: true,
                    configurable: true
                });
                ReactViewBase.prototype.getComponent = function () {
                    var self = this;
                    var initialState = this._initialState;
                    this._initialState = null;
                    return (function (_super) {
                        __extends(class_1, _super);
                        function class_1() {
                            var _this = _super.call(this) || this;
                            _this.state = initialState;
                            self.instance = _this;
                            return _this;
                        }
                        class_1.prototype.render = function () {
                            return self.render();
                        };
                        return class_1;
                    }(React.Component));
                };
                ReactViewBase.prototype.setState = function (state, callback) {
                    var finalize = function () {
                        if (callback) {
                            callback();
                        }
                    };
                    if (this.instance) {
                        this.instance.setState(state, finalize);
                    }
                    else {
                        this._initialState = this.instance.state;
                        finalize();
                    }
                };
                return ReactViewBase;
            }(Orange.Controls.Control));
            exports_3("default", ReactViewBase);
        }
    };
});
System.register("Views/MyReactView", ["Views/ReactViewBase"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var ReactViewBase_1, MyReactView;
    return {
        setters: [
            function (ReactViewBase_1_1) {
                ReactViewBase_1 = ReactViewBase_1_1;
            }
        ],
        execute: function () {
            MyReactView = (function (_super) {
                __extends(MyReactView, _super);
                function MyReactView() {
                    var _this = _super.call(this) || this;
                    _this.state = {
                        counter: 0
                    };
                    return _this;
                }
                MyReactView.prototype.render = function () {
                    var _this = this;
                    return React.createElement("div", null,
                        "HELLO WORLD FROM ORANGE+REACT",
                        React.createElement("p", null, this.state.counter),
                        React.createElement("button", { onClick: function () { _this.setState({ counter: _this.state.counter + 1 }); } }, "Clicker"));
                };
                return MyReactView;
            }(ReactViewBase_1.default));
            exports_4("default", MyReactView);
        }
    };
});
System.register("Views/MyReactViewWithDep", ["Views/ReactViewBase", "Domain/SomethingService"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var ReactViewBase_2, SomethingService_1, MyReactViewWithDep;
    return {
        setters: [
            function (ReactViewBase_2_1) {
                ReactViewBase_2 = ReactViewBase_2_1;
            },
            function (SomethingService_1_1) {
                SomethingService_1 = SomethingService_1_1;
            }
        ],
        execute: function () {
            MyReactViewWithDep = (function (_super) {
                __extends(MyReactViewWithDep, _super);
                function MyReactViewWithDep(somethingService) {
                    var _this = _super.call(this) || this;
                    _this.somethingService = somethingService;
                    return _this;
                }
                MyReactViewWithDep.prototype.render = function () {
                    return React.createElement("div", null, this.somethingService.provideSomething());
                };
                MyReactViewWithDep = __decorate([
                    Orange.Modularity.inject,
                    __metadata("design:paramtypes", [SomethingService_1.default])
                ], MyReactViewWithDep);
                return MyReactViewWithDep;
            }(ReactViewBase_2.default));
            exports_5("default", MyReactViewWithDep);
        }
    };
});
