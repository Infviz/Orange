##Controls

In Orange every content (html) generating class has to be a `Control`, `ViewBase` and `KnockooutViewBase` for 
example inherits from `Control`.

But controls can also be created to solve specific tasks. A date picker, a color picker or a validating input 
field are examples of GUI components that might be needed in many places and therefore work well as a task specific control. 

Here we will lock at creating basics controls. Some working examples can be found in the *Examples/Controls* folder.

#### A basic control

The most basic control inherrits from `Control` and does something on `onElementSet`:   
```typescript
class MyControl extends Orange.Controls.Control {
    
    protected onElementSet(): void {
        this.element.innerHTML = "<span>Hello world, from MyControl!</span>";
    }
}
```
This control will inject some simple text into elements that have the `data-control="MyControl"` attribute.
More information about how `onElementSet` works can be found on the `Control` page in the 
[reference](http://infviz.github.io/Orange/Reference/dist/classes/orange.controls.control.html).

For more in depth information look at the examples in the *Examples/Controls* folder. 

#### Where to go next?
[Injection](../Injection/injection.md)

