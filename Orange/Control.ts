
/// <reference path="Reference.d.ts"/>

// class KnockoutBindingBase {

// 	protected init(
// 		element: HTMLElement, 
// 		valueAccessor: () => any, 
// 		allBindingsAccessor: () => any, 
// 		viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
// 		bindingContext: KnockoutBindingContext) {

// 		// This will be called when the element is removed by Knockout or
//         // if some other part of your code calls ko.removeNode(element)
//         var disposeCallback = 
//         	() => {
// 				this.dispose(element)
// 				ko.utils.domNodeDisposal.removeDisposeCallback(element, disposeCallback);
// 			};
// 		ko.utils.domNodeDisposal.addDisposeCallback(element, disposeCallback);
// 	}

// 	protected update(
// 		element: HTMLElement, 
// 		valueAccessor: () => any, 
// 		allBindingsAccessor: () => any, 
// 		viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
// 		bindingContext: KnockoutBindingContext) { } 

// 	protected dispose(element: HTMLElement) { }
// }

// class KockoutObservableToControllPropertyBinding extends KnockoutBindingBase {

// 	protected init(
// 		element: HTMLElement, 
// 		valueAccessor: () => any, 
// 		allBindingsAccessor: () => any, 
// 		viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
// 		bindingContext: KnockoutBindingContext) {

// 		super.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
// 	}

// 	protected update(
// 		element: HTMLElement, 
// 		valueAccessor: () => any, 
// 		allBindingsAccessor: () => any, 
// 		viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
// 		bindingContext: KnockoutBindingContext) { 
// 	} 

// 	protected dispose(element: HTMLElement) {
// 		super.dispose(element);

// 	}
// }


(<any>ko.bindingHandlers).mybinding = {
	
	init: (element: HTMLElement, 
		valueAccessor: () => any, 
		allBindingsAccessor: any, 
		viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
		bindingContext: KnockoutBindingContext) => {

        var options = ko.unwrap(valueAccessor());
        // $el = $(element);
        // $el.binding(options);
 
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            // This will be called when the element is removed by Knockout or
            // if some other part of your code calls ko.removeNode(element)
            // $el.myWidget("destroy");
        });
    }
    //,

    // update: (element: HTMLElement, 
			 // valueAccessor: () => any, 
			 // allBindingsAccessor: any, 
			 // viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
			 // bindingContext: KnockoutBindingContext) => {

    //     // First get the latest data that we're bound to
    //     var value = valueAccessor();
 
    //     // Next, whether or not the supplied model property is observable, get its current value
    //     var valueUnwrapped = ko.unwrap(value);
 		
    //     var mode = allBindingsAccessor.get('mode') || "oneWay";
 
    //     if (mode != "oneWay" && mode != "twoWay")
    //     	throw "'binding' mode must be oneWay or twoWay";

    //     // TODO: If mode is two way the target control must implement something similar to 
    //     // property changed that we can listen to.. 

    //     var targetProperty = allBindingsAccessor.get('target'); 

    //     if (!targetProperty || targetProperty == "")
    //     	throw "binding is missing target property";

    //     if (!((<any>element).orange) || !((<any>element).orange.getControl))
    //     	throw "Attepmt to bind to control on a non controll element";

    //     var control = (<any>element).orange.getControl();

    //     control[targetProperty] = valueUnwrapped;
    // }
};



(<any>ko.bindingHandlers).binding = {
	
	init: (element: HTMLElement, 
		valueAccessor: () => any, 
		allBindingsAccessor: any, 
		viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
		bindingContext: KnockoutBindingContext) => {

        var options = ko.unwrap(valueAccessor());
        // $el = $(element);
        // $el.binding(options);
 
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            // This will be called when the element is removed by Knockout or
            // if some other part of your code calls ko.removeNode(element)
            // $el.myWidget("destroy");
        });
    },

    update: (element: HTMLElement, 
			 valueAccessor: () => any, 
			 allBindingsAccessor: any, 
			 viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
			 bindingContext: KnockoutBindingContext) => {

        // First get the latest data that we're bound to
        var value = valueAccessor();
 
        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.unwrap(value);
 		
        var mode = allBindingsAccessor.get('mode') || "oneWay";
 
        if (mode != "oneWay" && mode != "twoWay")
        	throw "'binding' mode must be oneWay or twoWay";

        // TODO: If mode is two way the target control must implement something similar to 
        // property changed that we can listen to.. 

        var targetProperty = allBindingsAccessor.get('target'); 

        if (!targetProperty || targetProperty == "")
        	throw "binding is missing target property";

        if (!((<any>element).orange) || !((<any>element).orange.getControl))
        	throw "Attepmt to bind to control on a non controll element";

        var control = (<any>element).orange.getControl();

        control[targetProperty] = valueUnwrapped;
    }
};

module Orange.Controls {


	export class Control {

		private _element: HTMLElement = null;
		public get element(): HTMLElement { return this._element; }
		public set element(element: HTMLElement) {

			if (this._element != null) 
				throw "'element' property can only be set once. ";

			this._element = element;

			this.onElementSet();
		}

		private compositeDisposable = new Rx.CompositeDisposable();
		public addDisp(disposable: Rx.IDisposable) {
			this.compositeDisposable.add(disposable);
		}

		private _isDisposing: boolean = false;
		public dispose() {
			this._isDisposing = true;
			ControlManager.disposeControl(this);
		}

		protected onElementSet(): void { }
	}

	export interface ITemplatedControlTemplateProvider {
		applyTemplate(element: HTMLElement): Rx.Observable<boolean>;
	}

	export class StringTemplateProvider implements ITemplatedControlTemplateProvider {

		private _template: string;
		constructor(template: string) {
			this._template = template;
		}

		public applyTemplate(element: HTMLElement) : Rx.Observable<boolean> {

			element.innerHTML = this._template;

			return Rx.Observable.returnValue(true);
		}
	}

	export class ScriptTemplateProvider implements ITemplatedControlTemplateProvider {

		private _templateName: string;
		private _context: any;

		constructor(templateName: string) {
			this._templateName = templateName;
		}

		public applyTemplate(element: HTMLElement): Rx.Observable<boolean> {

			var template = <HTMLElement>document.body.querySelector("#" + this._templateName);
			element.innerHTML = template.innerHTML;
			return Rx.Observable.returnValue(true);
		}
	}

	export class TemplatedControl extends Control {

		private _templateProvider: ITemplatedControlTemplateProvider = null;
		
		private _isTemplateApplied: boolean = false;
		public get isTemplateApplied(): boolean { return this._isTemplateApplied; }

		constructor(templateProvider: ITemplatedControlTemplateProvider) {
			super();
			this._templateProvider = templateProvider;
		}

		protected onApplyTemplate(): void { }

		private applyTemplate(): void {

			this._templateProvider
			.applyTemplate(this.element)
			.subscribe(
				success => {
					if (success)
						this._isTemplateApplied = true;
					else
						throw "TemplatedControl.applyTemplate: A template provider failed to apply its template.";
				},
				exception => {
					throw "TemplatedControl.applyTemplate: A template provider failed to apply its template.";
				});
		}
	}

	export class ViewBase extends TemplatedControl {

		private _dataContext: any = null;
		public get dataContext(): any { return this._dataContext; }
		public set dataContext(context: any) {

			if (this.dataContext != null)
				throw "ViewBase.(set)dataContext: DataContext can only ever be set once. ";

			this._dataContext = context;
		}

		public viewModel: any = null;

		constructor(templateName: string);
		constructor(templateName: string, context: any);
		constructor(templateName: string, context?: any) {

			super(new ScriptTemplateProvider(templateName));

			this._dataContext = !context ? null : context;
		}

		protected onApplyTemplate(): void {
			super.onApplyTemplate();
			this.applyBindings();
		}

		public dispose(): void {
			super.dispose();
			ko.cleanNode(this.element);
		}

		private _isBindingsApplied = false;
		private applyBindings(): void {

			if (this._isBindingsApplied || false == this.isTemplateApplied) return;

			//if (!!this._dataContext)
				ko.applyBindings(this._dataContext, this.element);

			this.onApplyBindings();

			this._isBindingsApplied = true;
		}

		protected onApplyBindings(): void { }
	}
}