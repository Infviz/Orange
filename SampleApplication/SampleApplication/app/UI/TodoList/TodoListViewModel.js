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
//# sourceMappingURL=TodoListViewModel.js.map