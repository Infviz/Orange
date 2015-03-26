
/// <reference path="Reference.d.ts"/>

module Orange.Controls {

	export class ViewBase extends TemplatedControl {

		private _dataContext: any = null;
		public get dataContext(): any { return this._dataContext; }
		public set dataContext(context: any) {

			if (this._dataContext !== null)
				return;

			this._dataContext = context;
			this.applyBindings();
		}

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

		private applyBindings(): void {

			if (false == this.isTemplateApplied) return;

			this.onApplyBindings();
		}

		protected onApplyBindings(): void { }
	}

	export class KnockoutViewBase extends ViewBase {

		constructor(templateName: string);
		constructor(templateName: string, context: any);
		constructor(templateName: string, context?: any) {

			super(templateName, context);
		}

		public dispose(): void {
			super.dispose();
			ko.cleanNode(this.element);
		}

		protected onApplyBindings(): void {
			super.onApplyBindings();

			if (!this.dataContext)
				return;

			ko.cleanNode(this.element);
			ko.applyBindings(this.dataContext, this.element);
		}
	}
}