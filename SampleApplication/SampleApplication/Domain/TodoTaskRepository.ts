
module Domain {
    export class TodoTaskRepository {

        getTodoTasks(): JQueryPromise<Array<Domain.Model.TodoTask>> {
            return $.getJSON("api/tasks.js");
        }

        todoTaskAdded: (task: Domain.Model.TodoTask) => void;

        store(todoTask: Domain.Model.TodoTask) {
            if (this.todoTaskAdded)
                this.todoTaskAdded(todoTask);
        }
    }
}
