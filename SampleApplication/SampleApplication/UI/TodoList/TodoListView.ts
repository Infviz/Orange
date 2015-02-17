
module UI.TodoList {

    export class TodoListView extends ViewBase {

        static dependencies = () => [ TodoListViewModel ];

        constructor(viewModel: TodoListViewModel) {
            super("UI_TodoList_TodoListView", viewModel);
        }
    }
} 