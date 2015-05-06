/// <reference path="../_references.ts" />

module MyBasicView {

	export class View extends Orange.Controls.ViewBase {
		
		static dependencies = () => [MyBasicView.ViewModel];

		private viewModel: ViewModel = null;

		constructor(viewModel: ViewModel) {

			// call Orange.Controls.ViewBase constructor with 
			// (namespace1-namespace2-viewClass [, viewmodel])
			super("MyBasicView-View", viewModel);

			this.viewModel = viewModel;
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

			// this.element will have an asigned HTMLElement here
			var el = this.element;
		}

		// onApplyTemplate will be called when the template (i.e. the [viewname].tpl.html) has 
		// been applied (i.e. inserted in to the this.element HTMLElement).
		protected onApplyTemplate(): void {
			super.onApplyTemplate();

			// set the content of the element with the class "name_container" in the template
			// for this view to the value of property "name" on the viewmodel. 
			var nameContainer = this.element.querySelector(".name_container");
			nameContainer.appendChild(document.createTextNode(this.viewModel.name));
		}

		// onApplyBindings will be called when any bindings (e.g. knockout bindings when using
		// knockout) has been applied. 
		protected onApplyBindings(): void {
			super.onApplyBindings();

		}
	}
}

