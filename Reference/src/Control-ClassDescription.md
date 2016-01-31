The `Control` class is the base class for all content generating classes. Everything 
that gets instantiated by the `ControlManager` has `Control` as its base.

`Control` is an abstract class that provides basic access in to the Orange render process via 
the `onElementSet()` and `onControlCreated()` methods. 

The `onElementSet()` is called when the `element` property gets assigned by the `ControlManager`; 
when the `onElementSet()` method gets called whe know that the control implementing it has been 
assigned an `HTMLElement` and it is safe to start interacting with the `element` property.      
 
The `onControlCreated()` method is called by the `ControlManager` when a control is finalized; all 
current child controls have been created (their `onControlCreated()` has been executed).

Se [ControlManager](orange.controls.controlmanager.html) for more information on the creation 
process of controls.

