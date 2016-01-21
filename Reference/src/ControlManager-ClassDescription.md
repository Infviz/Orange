
The `ControlManager` is what makes the view/control engine in Orange tick. It 
listens to changes in the area of the DOM it is responsible for and reacts to 
`HTMLElements` with the attributes `data-view` and `data-control` being added or removed. 

### Usage
The control manager needs a container and information about which part of the DOM to manage. 
```
let container = new Orange.Modularity.Container();
let controlManager = new Orange.Controls.ControlManager(container);
controlManager.manage(document.body);
```
The call to `manage(element: HTMLElement)` will perform a one time sweep of the given area 
of the DOM to create any views/controls present at that given moment. After that the 
manager will listen to changes and react to them.   


### When a HTMLElement is added 
When an element is added the control manager attempts to create the view/control 
being requested and initialize it correctly.

For example, say we have the view defined by the class: 

```typescript
namespace MyViews {
    @Orange.Modularity.inject
    export class MyMainView extends Orange.Controls.KnockoutViewBase {
        constructor(vm: MyMainViewViewModel) {
            super('My-Template-Id', vm);
        }
    }
}
```  

and we add the element `<div data-view=MyViews.MyMainView"></div>` to the are of the DOM 
being managed by the control manager. The `ControlManager` will notice this and then proceed 
as follows:  

1. Call `Orange.Controls.GetOrInitializeOrangeElement` on `<div data-view=MyViews.MyMainView"></div>` to create/get an `IOrangeElementExtension` connecting the control/view to its associated `HTMLElement`.  

* Create an instance of `MyViews.MyMainView` 
  * Using `Orange.Modularity.Container` to resolve any classes needed by the class being instantiated (in the example above an instance of `MyMainViewModel` will be provided by the container)

* Set the `control` property on the `IOrangeElementExtension` from *1* to the instance created in *2*  
 
* Set the `element` property on the control/view inherited from `Orange.Controls.Control` to the `HTMLElement` causing the instantiation.
  * This will indirectly result in the `onElementSet()` method inherited from `Orange.Controls.Control` being called.

* Call `applyTemplate()` followed by  `onApplyTemplate()` if the view/control has those methods.

* Find any child views/controls and go through *this* procedure on them, starting at *1*.

* Set the `isInitialized` property on the `IOrangeElementExtension` from *1* to `true`.

* Call any `onInializedListeners` present on the `IOrangeElementExtension` from *1*.

* Call `onControlCreated()` inherited from `Orange.Controls.Control`. 

### When a HTMLElement is removed
When an element is removed from the managed part of the DOM the control manager will 
react by calling the `dispose` method (inherited from `Orange.Controls.Control`) on all 
controls/views that was connected to elements removed from the DOM.

Any disposables (conforms to interface `{ dispose(): void }`) added to the control with 
`addDisposable(disposable: { dispose(): void })` (inherited from `Orange.Controls.Control`) 
will also be disposed.      