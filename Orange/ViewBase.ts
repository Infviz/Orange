/// <reference path="_references.ts"/>

module Orange.Controls {

    export class ViewBase extends TemplatedControl {

        private _dataContext: any = null;
        public get dataContext(): any { return this._dataContext; }
        public set dataContext(context: any) {

            this._dataContext = context;
            this.applyBindings();
        }

        constructor(templateName: string);
        constructor(templateName: string, context: any);
        constructor(templateName: string, context?: any) {

            super(new ScriptTemplateProvider(templateName));

            this._dataContext = context == null ? null : context;
        }

        public getControl<T>(selector: string): T {
            let element = <HTMLElement>this.element.querySelector(selector);

            if (element == null || ((<any>element).orange) == null || ((<any>element).orange).control == null)
                return null;

            return <T>(((<any>element).orange).control);
        }
        
        protected applyTemplate(): void {
            
            if (null == this.element)
                return;
                
            this.element.innerHTML = "";
            
            super.applyTemplate();    
        }
        
        protected onApplyTemplate(): void {
            super.onApplyTemplate();
            this.applyBindings();
        }

        private applyBindings(): void {

            if (false == this.isTemplateApplied) return;

            this.onApplyBindings();
        }

        protected onApplyBindings(): void { }
    }
}