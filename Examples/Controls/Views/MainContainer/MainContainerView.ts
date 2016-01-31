/// <reference path="../../../../orange.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="MainContainerViewModel" />

namespace Views.MainContainer {
    
    @Orange.Modularity.inject
	export class MainContainerView extends Orange.Controls.KnockoutViewBase {
		
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
		}

		// onApplyBindings will be called when any bindings (e.g. knockout bindings when using
		// knockout) has been applied. 
		protected onApplyBindings(): void {
			super.onApplyBindings();
		}
        
        public dispose(): void {
            super.dispose();
        }
	}
}

