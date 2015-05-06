/// <reference path="../../_references.ts" />

module Views.Nested {

	export class NestedView extends Orange.Controls.KnockoutViewBase {
		
		static dependencies = () => [Views.Nested.NestedViewModel];

		constructor(viewModel: NestedViewModel) {

			// call Orange.Controls.ViewBase constructor with 
			// (namespace1-namespace2-viewClass [, viewmodel])
			super("Views-Nested-NestedView", viewModel);
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
		}

		// onApplyBindings will be called when any bindings (e.g. knockout bindings when using
		// knockout) has been applied. 
		protected onApplyBindings(): void {
			super.onApplyBindings();
		}
	}
}

