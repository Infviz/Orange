
## Views

The examples in the the *Views* example folder illustrates how views can be used in a nested fashion to 
achieve complex behaviors. Take a look at them for examples and working code.

View nest naturaly; using a view in side a view is as simple as: 

```html
<div>
    <span>This is in the template for a view!</span>
    <div data-view="MyNestedView"></div>
</div>
```

To assign view models dynamically to a nested view use the 'o-view-model' binding: 

```html
<div>
    <span>This is in the template for a view!</span>
    <div 
        data-view="MyNestedView"
        data-bind="o-view-model: aViewModelMadeAvailableViaTheParentViewModel">
    </div>
</div>
```

Loops work as well:

```html
<div>
    <span>This is in the template for a view!</span>
    
    <!-- ko foreach: viewModelItems -->
	<div 
        data-view="MyNestedView"
        data-bind="o-view-model: $data">
    </div>
	<!-- /ko -->
</div>
```


#### Where to go next?
[Controls](../Controls/controls.md)