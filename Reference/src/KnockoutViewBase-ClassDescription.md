The `KnockoutViewBase` class is the base for all views that are 'knockout enabled'. They provide 
everything needed for a vie with a view (template and class) and a view model. 

```html
<script id="my-view-template-id">
    <div>
        <span data-bind="text: header"></span>
        <span data-bind="text: content"></span> 
    </div>
</script>
```

```typescript
class MyViewModel {
    
    header = 'My Header';
    content = ko.observable("Some content");
}

class MyView extends Orange.Controls.KnockoutViewBase {
    
    constructor(vm: MyViewModel) {
        super('my-view-template-id', vm)
    }
}
```

will result in the final HTML (where `<div data-view="MyView"></div>` is used): 

```html
<div data-view="MyView">
     <div>
        <span data-bind="text: header">My header</span>
        <span data-bind="text: content">Some content</span> 
    </div>
</div>
```

And if `content` on `MyViewModel` is updated the html will be updated as well.   



