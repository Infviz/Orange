/// <reference path="../../_references.ts" />

module Views.MainContainer {

	export class MainContainerView extends Orange.Controls.KnockoutViewBase {
		
		static dependencies = () => [Views.MainContainer.MainContainerViewModel];

		constructor(viewModel: MainContainerViewModel) {

			// call Orange.Controls.ViewBase constructor with 
			// (namespace1-namespace2-viewClass [, viewmodel])
			super("Views-MainContainer-MainContainerView", viewModel);
		}

		/*
		 * The following protected methods will be called in the order they are defined in 
		 * this class. 
		 *
		 * NOTE: None of the below methods have to be overridden, they are there to supply
		 * hookcs in to the layout engine att given stepps in the layout process.
		 */

		// onElementSet will be called directly after the view has been assigned a HTMLElement to 
		// this.Element. onElementSet is inherited from Orange.Controls.Control
		protected onElementSet(): void {
			super.onElementSet();
		}

		// onApplyTemplate will be called when the template (i.e. the [viewname].tpl.html) has 
		// been applied (i.e. inserted in to the this.element HTMLElement).
		protected onApplyTemplate(): void {
			super.onApplyTemplate();

			var injectView = () => {
				var container = this.element.querySelector(".view_container");

				if (container == null)
					return;

				var div = document.createElement("div");
				var attr = document.createAttribute("data-view");
				attr.value = "Views.FeedbackLoop.FeedbackLoopView";
				div.setAttributeNode(attr);

				container.appendChild(div);
			};

			var clearView = 
				() => { 

					var container = <HTMLElement>this.element.querySelector(".view_container");
					if (container == null)
						return;

					container.innerHTML = "";
					window.clearInterval(clearViewsInterval);
				};

			var clearViewsInterval: any = null;
			var injectViewInterval = 
				window.setInterval(
					() => { 

						injectView();

						clearViewsInterval = window.setInterval(clearView, 8000);

					}, 10000);

			injectView();
			clearViewsInterval = window.setInterval(clearView, 8000);

			var dispose = {
					dispose: () => {
						window.clearInterval(injectViewInterval);
						window.clearInterval(clearViewsInterval);
					}
				};

			this.addDisposable(dispose);
		}

		// onApplyBindings will be called when any bindings (e.g. knockout bindings when using
		// knockout) has been applied. 
		protected onApplyBindings(): void {
			super.onApplyBindings();
		}
	}
}

