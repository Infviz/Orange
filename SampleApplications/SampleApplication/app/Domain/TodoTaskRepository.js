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
//# sourceMappingURL=TodoTaskRepository.js.map