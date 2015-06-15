/// <reference path="_references.ts"/>


module Orange.Bindings {

	var ko = (<any>window).ko;

	if (ko) {
		ko.bindingHandlers.stopBindings = {
		    init: () => { return { controlsDescendantBindings: true }; }
		};
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

			var orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);

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

	        var control = <Orange.Controls.Control>(<any>this.element).orange.control;

	        var pd = Object.getOwnPropertyDescriptor(control, this.target);

	        pd = !!pd ? pd : Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), this.target);

	        if (!pd && (<any>control)[this.target] == "undefined")
				throw "The target property " + this.target + " could not be found."

	        if (!!(this.vm[this.property].subscribe))
	        	this.propDisposable = this.vm[this.property].subscribe((val: any) => (<any>control)[this.target] = val);

	        if (typeof this.vm[this.property] === "function")
	        	(<any>control)[this.target] = this.vm[this.property]();
	        else
	        	(<any>control)[this.target] = this.vm[this.property];

	        if (this.mode == "twoWay")
	        	control.addPropertyChangedListener(this.onPropertyChanged);
		}

		private onPropertyChanged = (propertyName: string, propertyValue: any) => {

			if (propertyName != this.target)
				return;

			// if Rx.Observable
			if (this.vm[this.property].onNext)
			{
				this.vm[this.property].onNext(propertyValue);
			}
			// might have a knockout observable..
			// TODO: Is there a better way to check this?
			else if (typeof this.vm[this.property] === "function")
			{
				//console.log("Binding two way to knockout observable. (" + property.value + ")");
				this.vm[this.property](propertyValue);
			}
			else
			{
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
		(<any>ko).bindingHandlers.bindings = {

			init: (element: HTMLElement,
				valueAccessor: () => any,
				allBindingsAccessor: any,
				viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
				bindingContext: any) => {

				var bindings = new Array<ViewModelToControlBinding>();

				var values = <Array<any>>(valueAccessor());

				if (Array.isArray(values) == false)
					values = [values];

				for (var vIdx = values.length - 1; vIdx >= 0; vIdx--) {
					var value = values[vIdx];

					var propertyNames = Object.getOwnPropertyNames(value);

					if (propertyNames.length > 2)
						throw "Faulty binding, should be {vmProp:ctrlProp [, mode: m]}, were m can be 'oneWay' or 'twoWay'.";

					var mode = 'oneWay';
					if (propertyNames.length == 2) {
						mode = Object.getOwnPropertyDescriptor(value, "mode").value;

						if (mode != 'oneWay' && mode != 'twoWay')
							throw "Binding mode has to be 'oneWay' or 'twoWay'.";
					}

					var sourceProp = propertyNames.filter(v => v != "mode")[0];
					var targetProp = Object.getOwnPropertyDescriptor(value, sourceProp).value;

					bindings.push(
						new ViewModelToControlBinding(
							bindingContext.$data,
							element,
							sourceProp,
							targetProp,
							mode));
				}

		        (<any>ko).utils
		        	.domNodeDisposal
		        	.addDisposeCallback(element,
		        		() => {

		            	for (var bIdx = bindings.length - 1; bIdx >= 0; bIdx--) {
		            		bindings[bIdx].dispose();
		            	}
		        	});
		    }
		};

		(<any>ko).bindingHandlers.orangeView = {

			init: (element: HTMLElement,
				valueAccessor: () => any,
				allBindingsAccessor: any,
				viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
				bindingContext: any) => {

				var value = valueAccessor();

				var dataViweAttr = document.createAttribute("data-view");
				dataViweAttr.value = value;

				var orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);

				element.setAttributeNode(dataViweAttr);

				var onInitialized =
					() => {

						if((<any>orangeEl.control).dataContext != null)
							return;

						(<any>orangeEl.control).dataContext = bindingContext.$data;
					};

				if (orangeEl.isInitialized == true)
					onInitialized();
				else
					orangeEl.addOnInitializedListener(onInitialized);

				 ko.utils
		        	.domNodeDisposal
		        	.addDisposeCallback(element,
			        		() => orangeEl.removeOnInitializedListener(onInitialized));
		    }
		};
	}
}
