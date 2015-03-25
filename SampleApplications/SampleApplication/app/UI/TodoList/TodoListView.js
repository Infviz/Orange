var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
//# sourceMappingURL=TodoListView.js.map