

module UI.TodoList {

    export class TodoListViewModel {
        static dependencies = () => [Domain.TodoTaskRepository];

        constructor(repository: Domain.TodoTaskRepository) {

            repository.getTodoTasks().done(taskItems => {

                this.taskItems(taskItems);

            });

            repository.todoTaskAdded = (todoTask) => {
                this.taskItems.push(todoTask);
            };
        }

        taskItems = ko.observableArray<Domain.Model.TodoTask>([]);
    }
}