Represents a `HTMLElement` that has (or will have) a `Control` attached to it.   

These objects are normally created by `Orange.Controls.ControlManager` while creating and initializing a `Control`. But if you know, before the fact, that an element will become a `Control` and need to know when it is finalized, the `Orange.Controls.GetOrInitializeOrangeElement` method can be used to let you know when everything is ready.    

For example: 

```typescript
// Where el is an HTMLElement that is or will be a Orange.Controls.Control of some type 
let orangeEl = Orange.Controls.GetOrInitializeOrangeElement(el);

let onInitialized = () => { 
    let myControl = el.control as SomeTypeThatInheritsFromControl;
    myControl.myMethod();
    myControll.foo = true;
}
if (orangeEl.isInitialized)
     onInitialized();
else 
    orangeEl.addOnInitializedListener(onInitialized);
``` 