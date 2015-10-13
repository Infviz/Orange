/// <reference path="../_references.ts"/>

module Orange.Bindings {

	let ko = (<any>window).ko;

	if (ko) {
		ko.bindingHandlers.stopBindings = { init: () => ({ controlsDescendantBindings: true }) };
		ko.virtualElements.allowedBindings.stopBindings = true;
	}
	
	enum BindingMode { TwoWay, OneWay }
	interface BindingSettings {
		mode: BindingMode;
	}
	
	class ViewModelToControlBinding {

		private propDisposable: any = null;

		constructor(
			private vm: any,
			private element: HTMLElement,
			private source: any,
			private target: string,
			private settings: BindingSettings) {

			let orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);

			if (orangeEl.isInitialized)
				this.init();
			else
				orangeEl.addOnInitializedListener(this.init);
		}
		
		private getSourceProperty = () => ((typeof this.source === "string") ? this.vm[this.source] : this.source);

		private init = () : void => {

			if (this.vm == null)
				throw "No context was pressent for binding to use.";

			if (typeof this.source === "string" && this.vm[this.source] == null)
				throw "The property " + this.source + " could not be found."

	        if ((<any>this.element).orange == null || (<any>this.element).orange.control == null)
	        	throw "Attepmt to bind to control on a non controll element.";

	        let control: any = (<any>this.element).orange.control;
	       	
	        if (control[this.target] === 'undefined')
				throw "The target property " + this.target + " could not be found."
				
			let prop = this.getSourceProperty();
			
	        if (prop.subscribe != null)
	        	this.propDisposable = prop.subscribe((val: any) => control[this.target] = val);

	        if (ko.isObservable(prop) || ko.isComputed(prop))
	        	control[this.target] = prop();
			else if (prop.subscribe != null)
	        	control[this.target] = prop;
				
			if (this.settings.mode == BindingMode.TwoWay)
				(<Orange.Controls.Control>control).addPropertyChangedListener(this.onPropertyChanged);
		}

		private onPropertyChanged = (propertyName: string, propertyValue: any) => {

			if (propertyName != this.target)
				return;
	
			let prop = this.getSourceProperty();

			// if Rx.Observable
			if (prop.onNext)
				prop.onNext(propertyValue);
				
			// if knockout observable
			else if (ko.isObservable(prop) || ko.isComputed(prop))
				prop(propertyValue);
				
			// if field or property
			else 
				this.vm[this.source] = propertyValue;
		}

		public dispose() {

			if (this.propDisposable != null && this.propDisposable.dispose != null)
	            this.propDisposable.dispose();

	        if ((<any>this.element).orange != null) {
	        	(<Orange.Controls.IOrangeElementExtension>((<any>this.element).orange)).removeOnInitializedListener(this.init);

	        	if ((<any>this.element).orange.control != null)
	        		(<Orange.Controls.Control>((<any>this.element).orange).control).removePropertyChangedListener(this.onPropertyChanged);
	        }
		}
	}

	
	if (ko) {
		
		ko.bindingHandlers['o-binding'] = {

			init: (element: HTMLElement,
				valueAccessor: () => any,
				allBindingsAccessor: any,
				viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
				bindingContext: any) => {
					
				let bindings = new Array<ViewModelToControlBinding>();
				let values =  valueAccessor();
				let bindingProperties = Array.isArray(values) ? values : [values];
				
				let allSettingNames = ['mode'];
				
				for (let bindingProperty of bindingProperties) {
					
					let allProperties = Object.getOwnPropertyNames(bindingProperty);
					
					var settingProperties = allProperties.filter(p => allSettingNames.indexOf(p) > -1);
					let properties = allProperties.filter(p => settingProperties.indexOf(p) < 0);
					
					if (properties.length < 1)
						throw 'No binding property could be found.';
					
					let settings: BindingSettings = {
						mode: BindingMode.OneWay
					};
					
					if (settingProperties.indexOf('mode') > -1) {
						let modeStr = bindingProperty['mode'];
						if (modeStr === 'two-way')
							settings.mode = BindingMode.TwoWay
						else if (modeStr !== 'one-way')  
							throw "Binding mode has to be 'one-way' or 'two-way' (was '" + modeStr + "').";
					}
					
					for (let property of properties) {
						let source = bindingProperty[property];
						let target = property;
						
						bindings.push(
							new ViewModelToControlBinding(
								bindingContext.$data,
								element,
								source,
								target,
								settings));
					}
				}
		    }
		};
		
		ko.bindingHandlers.bindings = {
			init: (element: HTMLElement,
				valueAccessor: () => any,
				allBindingsAccessor: any,
				viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
				bindingContext: any) => {
				
				console.warn("DEPRECATED: The Orange knockout binding 'bindings' is deprecated, use 'o-binding' instead. Binding data: ", allBindingsAccessor());

				let bindings = new Array<ViewModelToControlBinding>();
				let values = <Array<any>>(valueAccessor());

				if (Array.isArray(values) == false)
					values = [values];

				for (let vIdx = values.length - 1; vIdx >= 0; vIdx--) {
					let value = values[vIdx];

					let propertyNames = Object.getOwnPropertyNames(value);

					if (propertyNames.length > 2)
						throw "Faulty binding, should be {vmProp:ctrlProp [, mode: m]}, were m can be 'oneWay' or 'twoWay'.";

					let settings: BindingSettings = { mode: BindingMode.OneWay };
					if (propertyNames.length == 2) {
						let mode = Object.getOwnPropertyDescriptor(value, "mode").value;

						if (mode != 'oneWay' && mode != 'twoWay')
							throw "Binding mode has to be 'oneWay' or 'twoWay'.";
						
						if (mode === 'twoWay')
							settings.mode == BindingMode.TwoWay;
					}

					let sourceProp = propertyNames.filter(v => v != "mode")[0];
					let targetProp = Object.getOwnPropertyDescriptor(value, sourceProp).value;

					bindings.push(
						new ViewModelToControlBinding(
							bindingContext.$data,
							element,
							sourceProp,
							targetProp,
							settings));
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
					
				console.warn("DEPRECATED: The Orange knockout binding 'orangeView' is deprecated and might be removed in a future version of orange ");

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
