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
//# sourceMappingURL=TodoItemFormViewModel.js.map