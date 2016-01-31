
/// <reference path="../_references.ts"/>

module Orange.Controls {
    
    /**
     * [[include:KnockoutViewBase-ClassDescription.md]]
     */
    export class KnockoutViewBase extends ViewBase {

        constructor(templateName: string);
        constructor(templateName: string, context: any);
        constructor(templateName: string, context?: any) {
            super(templateName, context);
        }

        protected onApplyBindings(): void {
            super.onApplyBindings();
            
            if (this.dataContext == null)
                return;
            
            (<any>window).ko.applyBindingsToDescendants(this.dataContext, this.element);
        }
    }
}