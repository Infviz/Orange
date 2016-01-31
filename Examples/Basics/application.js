/// <reference path="../../orange.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BasicExample;
(function (BasicExample) {
    var MainViewModel = (function () {
        function MainViewModel() {
            this.header = "My main view model";
            this.content = "Some nice content";
        }
        return MainViewModel;
    })();
    BasicExample.MainViewModel = MainViewModel;
    var MainView = (function (_super) {
        __extends(MainView, _super);
        function MainView(vm) {
            _super.call(this, 'BasicExample-MainView', vm);
        }
        MainView = __decorate([
            Orange.Modularity.inject, 
            __metadata('design:paramtypes', [MainViewModel])
        ], MainView);
        return MainView;
    })(Orange.Controls.KnockoutViewBase);
    BasicExample.MainView = MainView;
    var Application = (function () {
        function Application() {
            this.container = null;
            this.manager = null;
            this.container = new Orange.Modularity.Container();
            this.manager = new Orange.Controls.ControlManager(this.container);
            this.manager.manage(document.body);
        }
        return Application;
    })();
    BasicExample.Application = Application;
})(BasicExample || (BasicExample = {}));
//# sourceMappingURL=application.js.map