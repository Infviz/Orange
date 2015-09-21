/// <reference path="../_references.ts"/>

module Orange.Bindings {

	let ko = (<any>window).ko;

	if (ko) {
		ko.bindingHandlers.stopBindings = { init: () => ({ controlsDescendantBindings: true }) };
		ko.virtualElements.allowedBindings.stopBindings = true;
	}

	class ViewModelToControlBinding {

		private propDisposable: any = null;

		constructor(
			private vm: any,
			private element: HTMLElement,
			private property: string,
			private target: string,
			private mode: string) {

			let orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);

			if (orangeEl.isInitialized)
				this.init();
			else
				orangeEl.addOnInitializedListener(this.init);
		}

		private init = () : void => {

			if (!(this.vm))
				throw "No context was pressent for binding to use.";

			if (!(this.vm[this.property]))
				throw "The property " + this.property + " could not be found."

	        if (!((<any>this.element).orange) || !((<any>this.element).orange.control))
	        	throw "Attepmt to bind to control on a non controll element.";

	        let control = <Orange.Controls.Control>(<any>this.element).orange.control;
	        let pd = Object.getOwnPropertyDescriptor(control, this.target);

	        pd = !!pd ? pd : Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), this.target);

	        if (!pd && (<any>control)[this.target] == "undefined")
				throw "The target property " + this.target + " could not be found."
				
			let prop = this.vm[this.property];
			
	        if (!!(prop.subscribe))
	        	this.propDisposable = prop.subscribe((val: any) => (<any>control)[this.target] = val);

	        if (ko.isObservable(prop) || ko.isComputed(prop))
	        	(<any>control)[this.target] = prop();
	        else 
	        	(<any>control)[this.target] = prop;
				
			if (this.mode == "twoWay")
				control.addPropertyChangedListener(this.onPropertyChanged);
		}

		private onPropertyChanged = (propertyName: string, propertyValue: any) => {

			if (propertyName != this.target)
				return;
				
			let prop = this.vm[this.property];
			
			// if Rx.Observable
			if (prop.onNext) {
				prop.onNext(propertyValue);
			}
			// if knockout observable
			else if (ko.isObservable(prop) || ko.isComputed(prop)) {
				prop(propertyValue);
			}
			// if field or property
			else {
				this.vm[this.property] = propertyValue;
			}
		}

		public dispose() {

			if (!!this.propDisposable && !!(this.propDisposable.dispose))
	            this.propDisposable.dispose();

	        if (!!((<any>this.element).orange)) {
	        	(<Orange.Controls.IOrangeElementExtension>((<any>this.element).orange)).removeOnInitializedListener(this.init);

	        	if (!!((<any>this.element).orange).control)
	        		(<Orange.Controls.Control>((<any>this.element).orange).control).removePropertyChangedListener(this.onPropertyChanged);
	        }
		}
	}

	interface BindingInfo {
		property: string;
		target: string;
		mode?: string;
	}

	if (ko) {
		ko.bindingHandlers.bindings = {

			init: (element: HTMLElement,
				valueAccessor: () => any,
				allBindingsAccessor: any,
				viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
				bindingContext: any) => {

				let bindings = new Array<ViewModelToControlBinding>();
				let values = <Array<any>>(valueAccessor());

				if (Array.isArray(values) == false)
					values = [values];

				for (let vIdx = values.length - 1; vIdx >= 0; vIdx--) {
					let value = values[vIdx];

					let propertyNames = Object.getOwnPropertyNames(value);

					if (propertyNames.length > 2)
						throw "Faulty binding, should be {vmProp:ctrlProp [, mode: m]}, were m can be 'oneWay' or 'twoWay'.";

					let mode = 'oneWay';
					if (propertyNames.length == 2) {
						mode = Object.getOwnPropertyDescriptor(value, "mode").value;

						if (mode != 'oneWay' && mode != 'twoWay')
							throw "Binding mode has to be 'oneWay' or 'twoWay'.";
					}

					let sourceProp = propertyNames.filter(v => v != "mode")[0];
					let targetProp = Object.getOwnPropertyDescriptor(value, sourceProp).value;

					bindings.push(
						new ViewModelToControlBinding(
							bindingContext.$data,
							element,
							sourceProp,
							targetProp,
							mode));
				}

		        ko.utils
		        	.domNodeDisposal
		        	.addDisposeCallback(element,
		        		() => {
							for (let bIdx = bindings.length - 1; bIdx >= 0; bIdx--) {
								bindings[bIdx].dispose();
		            	}
		        	});
		    }
		};

		ko.bindingHandlers.orangeView = {

			init: (element: HTMLElement,
				valueAccessor: () => any,
				allBindingsAccessor: any,
				viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
				bindingContext: any) => {

				let value = valueAccessor();

				let dataViweAttr = document.createAttribute("data-view");
				dataViweAttr.value = value;

				let orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);

				element.setAttributeNode(dataViweAttr);

				let onInitialized =
					() => {
						if((<any>orangeEl.control).dataContext != null)
							return;

						(<any>orangeEl.control).dataContext = bindingContext.$data;
					};

				if (orangeEl.isInitialized == true) {
					onInitialized();
				}
				else {
					orangeEl.addOnInitializedListener(onInitialized);

					ko.utils
		        		.domNodeDisposal
		        		.addDisposeCallback(element,
			        		() => orangeEl.removeOnInitializedListener(onInitialized));
		        }
		    }
		};
		
		ko.bindingHandlers['orange-vm'] = {
			
			init: (element: HTMLElement,
				valueAccessor: () => any,
				allBindingsAccessor: any,
				viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
				bindingContext: any) => {
					return { controlsDescendantBindings: true };
				},
				
			update: (element: HTMLElement,
				valueAccessor: () => any,
				allBindingsAccessor: any,
				viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
				bindingContext: any) => {
				
				let orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);
				let value = ko.unwrap(valueAccessor());
				let onInitialized =
					 () => (<any>orangeEl.control).dataContext = value;
		
				if (orangeEl.isInitialized == true){
					onInitialized();
				}
				else {
					orangeEl.addOnInitializedListener(onInitialized);
					
					ko.utils
						.domNodeDisposal
						.addDisposeCallback(element,
							function() { orangeEl.removeOnInitializedListener(onInitialized); } );
				}
			}
		};
	}
}
