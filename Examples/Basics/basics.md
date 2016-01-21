
#Orange explained

In this document Orange will be explained through examples. The code for all examples discussed here can be found in the *Examples* folder in the root of the repository.

To run the examples run `bower install` in the *Examples* folder, then open a given example via its index.html file. Each example is contained within its own named folder within the *Examples* folder. 

##The Basics

The following example can be found in the *Basics* folder.

Orange uses the MVVM model to work with views and control them. Expressing a simple example of this in Orange will result in something like this:

A *View* in the form of a template...
```typescript
<script id="BasicExample-MainView" type="html/text">
    <div>
        <h1 data-bind="text: header"></h1>
        <span data-bind="text: content"></span>
    </div>
</script>
```
...and a class: 

```typescript
@Orange.Modularity.inject
export class MainView extends Orange.Controls.KnockoutViewBase {
    constructor(vm: MainViewModel) {
        super('BasicExample-MainView', vm);
    }
}
```

And a *ViewModel* in the form of a class
```typescript
export class MainViewModel {
    header: string = "My main view model";
    content: string = "Some nice content";
}
```

The *ViewModel* is where-everything-happens, or should happen. Here we define properties, fields, methods etc. that can be used in the *View*. In this example the view model contains the public string fields `header` and `content`. In the view model we also handle events, commands etc. that gets passed to the view model from the view. 

The role of the view is to present data and ways for the user to interact with the view (buttons, input fields, drag-drop, clicking etc). This is accomplished by defining HTML content in a template and some code in a .ts file to express things that can not be accomplished through HTML alone.

The view in the above example takes a ViewModel as an argument to the constructor, it does not have to be this way. A view model can be connected with a view in several ways  Further more the `@Orange.Modularity.inject` decorator applied to the class tells the orange engine that a view model should be injected when the view gets created. 

In most cases the views .ts file is close to empty, as the one in example above, and in other cases it might contain a lot of code to achieve some complex behavior. What it has to contain in every case is the id connecting it to a template. In our case the id is `BasicExample-MainView`, this is present in the `MainView` class as well as in its corresponding template. 

And finally, to make use of a view you simply place `<div data-view="MainView"></div>` were you want the view to appear within an HTML page. In the example this is done in the `index.html` file.   

This will not do anything on its own however. We also need to start the engine:

```
let container = new Orange.Modularity.Container();
let manager = new Orange.Controls.ControlManager(this.container);

manager.manage(document.body);
```

Exactly how this works will be discussed in other examples ([Injection](../Injection/injection.md), [ControlManager](../../Reference/Controls/ControlManager.md), [Container](../../Reference/Modularity/Container.md)). But what it does is to tell the `Orange` engine to manage anything that happens in the `<body>` tag of the html document. Note that `manager.manage(HTMLElement)` can only ever be called once (for a given manager). The engine will take care of everything that happens after that. 

Any new views (`<div data-view="myview"></div>`) being inserted in to the managed portion of the page will be automatically created by the ControlManager. If any view should happen to be removed from the HTML the ControlManager will notice this to and make sure to dispose of everything in a controlled manner. 

In the end this will result in a view being inserted in the `<div data-view="MainView"></div>` html element. With content inserted from the model.

###Where to go next?
[Views](../Views/Views.md)
