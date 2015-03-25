var UI;
(function (UI) {
    var ViewBase = (function () {
        function ViewBase(templateName, viewModel) {
            //#region element
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
//# sourceMappingURL=ViewBase.js.map