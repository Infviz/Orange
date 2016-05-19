/// <reference path="../_references.ts"/>

/**
 * [[include:OrangeBindings-ModuleDescription.md]]
 */
module Orange.Bindings {

	let ko = (<any>window).ko;

	if (ko) {
		ko.bindingHandlers.stopBindings = { 
            init: () => {
                console.warn("DEPRECATED: The Orange knockout binding 'stopBindings' is deprecated and will be removed in a future release. Use 'o-stop-bindings' instead."); 
                return { controlsDescendantBindings: true };
            }
        };
        ko.virtualElements.allowedBindings.stopBindings = true;
        
        ko.bindingHandlers['o-stop-bindings'] = { init: () => ({ controlsDescendantBindings: true }) };
        ko.virtualElements.allowedBindings['o-stop-bindings'] = true;
	}
	
    enum BindingMode { TwoWay, OneWay }
	interface BindingSettings {
		mode: BindingMode;
        allowDynamic: boolean;
	}
	
	class ViewModelToControlBinding {
        
		private propDisposable: any = null;
        
		constructor(
			private vm: any,
			private element: HTMLElement,
			private source: string | number | any,
			private target: string,
			private settings: BindingSettings) {

			let orangeEl = Orange.Controls.GetOrInitializeOrangeElement(element);

			if (orangeEl.isInitialized)
				this.init();
			else
				orangeEl.addOnInitializedListener(this.init);
		}
        
        private getErrorMessage() {
            let binding = this.element
                .getAttribute('data-bind')
                .match(/(o-binding\s*:\s*\[(.|\s)*?\])|(o-binding\s*:\s*\{(.|\s)*?\})/)[0]
                .replace(/\s+/g, ' ')
                .trim();
            
            let target = this.target;
            let source = this.source;
            
            return { target, source, binding, element: this.element }
        }
        
        private error(message: string) {
            console.error(message, this.getErrorMessage());
            throw message + " Se console for mor information.";
        }
        
        private warn(message: string) {
            console.warn(message, this.getErrorMessage());
        }

        private isValidTarget(control: any, target: string) : boolean {
            
            let descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), target);
            
            if (descriptor != null)
                return true;
            else if ('undefined' !== typeof control[this.target])
                return true;
            
            return false;
        }
        
		private init = () : void => {

			if (this.vm == null)
				this.error(`No context is pressent for the binding to use.`);

	        if ((<any>this.element).orange == null)
	        	this.error(`Attempting to bind to a control on a non control element.`);
            if((<any>this.element).orange.control == null)
                this.error(`Attempting to bind to a control that has not yet been fully initialized.`);

	        let control: any = (<any>this.element).orange.control;
	       	
	        if (false == this.isValidTarget(control, this.target) && false == this.settings.allowDynamic)
				this.warn(`The target property ${this.target} could not be found.`); 
			
            // Binding fixed value directly from the html i.g:
            //   o-binding: { someTargetProp: 'Some string value' } 
            // or 
            //   o-binding: { someTargetProp: 10 }
            // or 
            //   o-binding: { someTargetProp: boolean }
            if (typeof this.source === 'string' || 
                typeof this.source === 'number' || 
                typeof this.source === 'boolean' ) {
                control[this.target] = this.source;
                return;
            }
            
            let sourceProp : any = this.source; 
			
	        if (sourceProp == null || sourceProp.subscribe == null) {
               // null, function, object, field, array..
               // ONTE TIME only, no two way possible
               control[this.target] = sourceProp;
            }
			else if (ko.isObservable(sourceProp) || ko.isComputed(sourceProp)) {
	        	control[this.target] = sourceProp();
            }
            
            // If Rx.IObservable/Rx.Observable or ko.observable/ko.observableArray 
            // save disposable to be able to clean up later
	        if (sourceProp && sourceProp.subscribe != null)
	        	this.propDisposable = sourceProp.subscribe((val: any) => control[this.target] = val);
            
			if (this.settings.mode == BindingMode.TwoWay) {
                if (sourceProp && sourceProp.subscribe == null)
				    this.warn("Two way bingins are only possible with sources of type Rx.IObservable or knockout observables.");
                else     
                    (<Orange.Controls.Control>control).addPropertyChangedListener(this.onPropertyChanged);
            }
		}

		private onPropertyChanged = (propertyName: string, propertyValue: any) => {

			if (propertyName != this.target)
				return;
	
			let prop = this.source;

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
				
				let allSettingNames = [ 'mode', 'allow-dynamic' ];
				
				for (let bindingProperty of bindingProperties) {
					
					let allProperties = Object.getOwnPropertyNames(bindingProperty);
					
					var settingProperties = allProperties.filter(p => allSettingNames.indexOf(p) > -1);
					let properties = allProperties.filter(p => settingProperties.indexOf(p) < 0);
					
					if (properties.length < 1)
						throw 'No binding property could be found.';
					
					let settings: BindingSettings = {
						mode: BindingMode.OneWay,
                        allowDynamic: false
					};
					
					if (settingProperties.indexOf('mode') > -1) {
						let modeStr = bindingProperty['mode'];
						if (modeStr === 'two-way')
							settings.mode = BindingMode.TwoWay
						else if (modeStr !== 'one-way')  
							throw "Binding mode has to be 'one-way' or 'two-way' (was '" + modeStr + "').";
					}
                    
                    if (settingProperties.indexOf('allow-dynamic') > -1) {
                        let str = bindingProperty['allow-dynamic'];
						if (str === true)
							settings.allowDynamic = true
						else if (str !== false)  
							throw "'allow-dynamic' has to be true or false (was '" + str + ", typeof(...): " + (typeof str) + "').";
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
				
				console.warn("DEPRECATED: The Orange knockout binding 'bindings' is deprecated and will be removed in a future release. Use 'o-binding' instead. Binding data: ", allBindingsAccessor());

				let bindings = new Array<ViewModelToControlBinding>();
				let values = <Array<any>>(valueAccessor());

				if (Array.isArray(values) == false)
					values = [values];

				for (let vIdx = values.length - 1; vIdx >= 0; vIdx--) {
					let value = values[vIdx];

					let propertyNames = Object.getOwnPropertyNames(value);

					if (propertyNames.length > 2)
						throw "Faulty binding, should be {vmProp:ctrlProp [, mode: m]}, were m can be 'oneWay' or 'twoWay'.";

					let settings: BindingSettings = { mode: BindingMode.OneWay, allowDynamic: false };
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
                    console.warn("DEPRECATED: The Orange knockout binding 'orange-vm' is deprecated and will be removed in a future version of orange. Use 'o-view-model' instead.");
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
        
        ko.bindingHandlers['o-view-model'] = {

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
