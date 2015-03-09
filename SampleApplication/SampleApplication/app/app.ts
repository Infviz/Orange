
var templates = [
    { id: "UI_TodoItemForm_TodoItemFormView", path: "UI/TodoItemForm/TodoItemFormView.tpl.html" },
    { id: "UI_TodoList_TodoListView", path: "UI/TodoList/TodoListView.tpl.html" }
];

function prepareContainer(container: Orange.Modularity.Container) {

    container.registerInstance(Domain.TodoTaskRepository, new Domain.TodoTaskRepository());

}

window.onload = () => {
    console.log("hej hej sdfsdf sdf ");
    var container = new Orange.Modularity.Container();

    var regionManager = new Orange.Modularity.RegionManager(container);
    container.registerInstance(Orange.Modularity.RegionManager, regionManager);

    prepareContainer(container);

    TemplateLoader.onload = () => {
        regionManager.initializeRegions(document.body);
    };

    TemplateLoader.load(templates);
};
