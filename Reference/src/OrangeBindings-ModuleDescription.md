Orange includes a few knockout bindings to make it easier to use knockout with views and controls:

* *o-binding*: for bindings between view models for a given view and controls used within that view

* *o-stop-binding*: to prevent knockout from binding deeper in the doom than a given node. 

* *o-view-model*: to bind a view model to a view

#### o-binding example

Say we have a control `Foo` with a property (getter and setter) `myControlProperty` and a view model
with a KnockoutObservable property `myViewModelProperty`. Then we can do something similar to this in 
the view template: 

```html
<div 
    data-control="Foo"
    data-bind="o-binding: { myControlProperty: myViewModelProperty }">
</div> 
```

The control `Foo` will have its property `myControlProperty` bound to the property `myViewModelProperty` 
on the view model, i.e. whenever `myViewModelProperty` changes `myControlProperty` will recieve the 
new value. 

Sometimes it is useful to have this work in both directions. That is, if the value on the property 
in the control changes, we get the change reflected in the view model. If that is the case we can use:   

```html
<div 
    data-control="Foo"
    data-bind="o-binding: { myControlProperty: myViewModelProperty, mode: 'two-way' }">
</div> 
```

This however requires that the control has implemented its getter and setter correctly, calling 
`raisePropertyChanged`:

```typescript
private myControlProperty: string = null;
get myControlProperty(): string { return this._mycontrolProperty; }
set myControlProperty(val: string) {
    if (this._mycontrolProperty == val) return;
    this._mycontrolProperty = val;
    this.raisePropertyChanged(() => this.myControlProperty);
}
```

the call to `raisePropertyChanged` here ensures that the property will work with two way bindings.

 To bind multiple properties you simply add them (static values in the form of string, number 
 and booleans are also suported):
 
 ```html
<div 
    data-control="Foo"
    data-bind="
        o-binding: { 
            myControlProperty: myViewModelProperty,
            myOtherControlProperty: myViewOtherModelProperty,
            myStringtitle: 'my title',
            isTrueThingy: true,
            someNumber: 10
        }">
</div> 
```

or in the case of `'two-way'` and single way bindings combined: 

 ```html
<div 
    data-control="Foo"
    data-bind="
        o-binding: [
        { 
            myControlProperty: myViewModelProperty,
            myOtherControlProperty: myViewOtherModelProperty 
            .
            .
        },
        { 
            myTwoWayBoundProperty: myViewModelTwoWayProperty,
            .
            . 
            mode: 'two-way'
        }]">
</div> 
``` 


#### o-stop-binding example

The `o-stop-binding`-binding is used to stop the propagation of knockout bindings. 

If we have the view template:

```html
<div>
    <span data-bind="text: title"></span>
    
    <div data-bind="o-stop-binding">
        <!-- Some content that should not be bound..  -->
    <div>
</div>
```

the outermost div will get a context applied via the view model, but the binding will not 
continue in to the div with the `data-bind="o-stop-binding"`-binding. 

#### o-view-model example

The `o-view-model`-binding is used to bind a view model to a view. 

So given the view template: 

```html
<div>
    <span data-bind="text: title"></span>
    
    <div 
        data-view="SomeView"  
        data-bind="o-view-model: myViewModel">
    <div>
</div>
```
the view `SomeView` will get its view model from the property `myViewModel` on the parent 
view model. 