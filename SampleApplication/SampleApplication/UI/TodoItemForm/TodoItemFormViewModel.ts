
module UI.TodoItemForm {

    export class TodoItemFormViewModel {

        isVisible = ko.observable(true);

        description = ko.observable("");

        validationMessage = ko.observable("");

        submit = () => {
            this.repository.store({ description: this.description(), isDone: false });
        }

        canSubmit = ko.observable(true);

        static dependencies = () => [Domain.TodoTaskRepository];

        constructor(private repository: Domain.TodoTaskRepository) {

        }
    }
}

 