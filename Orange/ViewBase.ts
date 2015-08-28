/// <reference path="_references.ts"/>

module Orange.Controls {

    export class ViewBase extends TemplatedControl {

        private _dataContext: any = null;
        public get dataContext(): any { return this._dataContext; }
        public set dataContext(context: any) {

            this._dataContext = context;
            this.onDataContextSet();
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

        protected onApplyTemplate(): void {
            super.onApplyTemplate();
            this.applyBindings();
        }

        private applyBindings(): void {

            if (false == this.isTemplateApplied) return;

            this.onApplyBindings();
        }

        protected onApplyBindings(): void { }
        protected onDataContextSet(): void { }
    }

    export class KnockoutViewBase extends ViewBase {

        constructor(templateName: string);
        constructor(templateName: string, context: any);
        constructor(templateName: string, context?: any) {

            super(templateName, context);
        }

        public dispose(): void {
            super.dispose();
            this.cleanChildBindings();
        }

        protected onApplyBindings(): void {
            super.onApplyBindings();

            if (this.dataContext == null)
                return;

            (<any>window).ko.applyBindingsToDescendants(this.dataContext, this.element);
        }

        protected onDataContextSet(): void {
            this.cleanChildBindings();
        }

        private cleanChildBindings() : void {

            let childNodes = this.element.childNodes;

            for (var cIdx = childNodes.length - 1; cIdx >= 0; cIdx--) {

                let childNode = childNodes[cIdx];

                // 1 == ELEMENT_NODE
                if (childNode.nodeType !== 1) continue;

                (<any>window).ko.cleanNode(<HTMLElement>childNode);
            }
        }
    }
}