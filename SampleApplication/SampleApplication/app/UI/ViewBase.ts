
module UI {
    export class ViewBase {

        //#region element
        _element: HTMLElement = null;

        set element(value: HTMLElement) {
            this._element = value;

            value.setAttribute("data-bind", "template: '" + this.templateName + "'");
            ko.applyBindings(this.viewModel, value);
        }
        get element() { return this._element; }
        //#endregion

        templateName: string;
        viewModel: any;

        constructor(templateName: string, viewModel: any) {
            this.templateName = templateName;
            this.viewModel = viewModel;
        }
    }
}

 