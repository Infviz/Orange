
Takes an `HTMLElement` and either creates or returns a preexisting `IOrangeElementExtension` object. 

If used before an element is finalized by the `ControlManager` the returned `IOrangeElementExtension` makes it possible to listen to when the `Control` is finalized.

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