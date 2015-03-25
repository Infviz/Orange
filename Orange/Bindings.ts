/// <reference path="Reference.d.ts"/>

(function() {
	if (!(<any>window).ko){
		(<any>window).ko = <any>{ };
		(<any>window).ko.bindingHandlers = <any> { };
	}
}());

module Orange.Bindings {

	(<any>ko).bindingHandlers.stopBindings = {
	    init: () => { return { controlsDescendantBindings: true }; }  
	};
	(<any>ko).virtualElements.allowedBindings.stopBindings = true;

	export class ViewModelToControlBinding {

		private propDisposable: any = null;

		constructor(
			private vm: any, 
			private element: HTMLElement, 
			private property: string, 
			private target: string) {

			var orangeEl = Orange.Controls.GetOrangeElement(element);

			if (orangeEl.isInitialized)
				this.init();
			else
				orangeEl.addOnInitializedListener(this.init);
		}

		private init() : void {

			if (!(this.vm[this.property])) 
				throw "The property " + this.property + " could not be found." 

	        if (!((<any>this.element).orange) || !((<any>this.element).orange.control))
	        	throw "Attepmt to bind to control on a non controll element.";

	        var control = (<any>this.element).orange.control;

	        var pd = Object.getOwnPropertyDescriptor(control, this.target);

	        pd = !!pd ? pd : Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), this.target);

	        if (!pd && !(control[this.target])) 
				throw "The target property " + this.target + " could not be found."

	        if (!!(this.vm[this.property].subscribe))
	        	this.propDisposable = this.vm[this.property].subscribe((val) => control[this.target] = val);

	        if (typeof this.vm[this.property] === "function")
	        	control[this.target] = this.vm[this.property]();
	        else 
	        	control[this.target] = this.vm[this.property];
		}

		public dispose() {

			if (!!this.propDisposable && !!(this.propDisposable.dispose))
	            this.propDisposable.dispose();

	        if(!!((<any>this.element).orange))
	        	(<Orange.Controls.IOrangeElementExtension>((<any>this.element).orange)).removeOnInitializedListener(this.init);
		}
	}

	interface BindingInfo {
		property: string;
		target: string;
		mode?: string;
	}

	(<any>ko).bindingHandlers.bindings = {
	
		init: (element: HTMLElement, 
			valueAccessor: () => any, 
			allBindingsAccessor: any, 
			viewModel: any, // Deprecated, use bindingContext.$data or .rawData instead
			bindingContext: any) => {

			var bindings = new Array<ViewModelToControlBinding>();

			var value = valueAccessor();

			if (Array.isArray(value)) {
			
				var bindingInfos = <Array<BindingInfo>>value;
			
				for (var bIdx = bindingInfos.length - 1; bIdx >= 0; bIdx--) {

					var bi = <BindingInfo>bindingInfos[bIdx];

					bindings.push(
						new ViewModelToControlBinding(
							bindingContext.$data, 
							element, 
							bi.property, 
							bi.target));
				}
			}
			else {
				var bi = <BindingInfo>value;

				bindings.push(
					new ViewModelToControlBinding(
						bindingContext.$data, 
						element, 
						bi.property, 
						bi.target));
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

			var orangeEl = Orange.Controls.GetOrangeElement(element);

			element.setAttributeNode(dataViweAttr);

			var onInitialized = () => 
				{
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
	        		() => {
	        			orangeEl.removeOnInitializedListener(onInitialized);
	        		});
	    }
	};
}

