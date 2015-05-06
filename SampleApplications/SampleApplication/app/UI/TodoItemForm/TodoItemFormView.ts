
module UI.TodoItemForm {

    export class TodoItemFormView extends ViewBase {

        static dependencies = () => [ TodoItemFormViewModel ];

        constructor(viewModel: TodoItemFormViewModel) {
            super("UI_TodoItemForm_TodoItemFormView", viewModel);
        }
    }
}

