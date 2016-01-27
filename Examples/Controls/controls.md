##Controls

In Orange every content (html) generating class has to be a `Control`, `ViewBase` and `KnockooutViewBase` for 
example inherits from `Control`.

But controls can also be created to solve specific tasks. A date picker, a color picker or a validating input 
field are examples of GUI components that might be needed in many places and therefore work well as a task specific control. 

Here we will lock at creating basics controls, examples discussed here can be found in the *Examples/Controls* folder.

In the *Controls* example folder there are two controls; `ElementPositioner` and `SmartInput`. We will look at how both of 
them work.  


### ElementPositioner

The Element positioner takes its html content and positions it within the ElementPositioner element: 

```html
<div 
    data-control="Controls.ElementPositioner" 
    data-bind="o-binding: { x: vmX, y: vmY }">
    <div class="position_me">
        <span data-bind="text: name">Position me!</span>
    </div>
</div>
``` 

Here the `<div class="position_me">` element will be positioned given the `vmX` and `vmY` parameters, 
defined on the view model used where the control is created (in the case of the example this is the 
`MainContainerViewModel`). 

### Where to go next?
[Injection](../Injection/injection.md)

