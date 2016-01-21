
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

The role of the view is to present data and ways for the user to interact with the view (buttons, input fields, drag-drop, clicking etc). 

  


To make use of all this you simply place `<div data-view="MainView"></div>` where you want this view to be displayed in your html page. This will not do anything on its own however. We also need to start the engine, so to speak:

```
let container = new Orange.Modularity.Container();
let manager = new Orange.Controls.ControlManager(this.container);

manager.manage(document.body);
```

This will result in a view beind inserted in the `<div data-view="MainView"></div>` html element. With content inserted from the model.

###So how does it all work?
Lets start from the bottom and explain the `Container` and the `ControlManager`. 

#####Orange.Modularity.Container
The container is a class that takes care of *injection*, it helps us create instances of classes when we need them. 



