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
//# sourceMappingURL=TodoItemFormView.js.map