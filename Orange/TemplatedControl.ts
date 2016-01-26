/// <reference path="_references.ts"/>

module Orange.Controls {

	export interface ITemplatedControlTemplateProvider {
		applyTemplate(element: HTMLElement, onTemplateAppliedCallback: (success: boolean, error?: string) => void): void;
	}

	export class StringTemplateProvider implements ITemplatedControlTemplateProvider {

		private _template: string;
		constructor(template: string) {
			this._template = template;
		}

		public applyTemplate(element: HTMLElement, onTemplateAppliedCallback: (success: boolean) => void) : void {

			element.innerHTML = this._template;

			onTemplateAppliedCallback(true);
		}
	}

	export class ScriptTemplateProvider implements ITemplatedControlTemplateProvider {

		private _templateName: string;
		private _context: any;

		constructor(templateName: string) {
			this._templateName = templateName;
		}

		public applyTemplate(element: HTMLElement, onTemplateAppliedCallback: (success: boolean, error?: string) => void): void {

			var template = <HTMLElement>document.body.querySelector("#" + this._templateName);

			if (template == null) {
				onTemplateAppliedCallback(false, `No script tag with id='${this._templateName}' found`);
				return;
			}

			element.innerHTML = template.innerHTML;

			onTemplateAppliedCallback(true);
		}
	}
    
    /** 
     * [[include:TemplatedControl-ClassDescription.md]]
     */
	export class TemplatedControl extends Control {

		private _templateProvider: ITemplatedControlTemplateProvider = null;

		private _isTemplateApplied: boolean = false;
		public get isTemplateApplied(): boolean { return this._isTemplateApplied; }

		constructor(templateProvider: ITemplatedControlTemplateProvider) {
			super();
			this._templateProvider = templateProvider;
		}

		protected onApplyTemplate(): void { }

		protected applyTemplate(): void {

			this._templateProvider
			.applyTemplate(
				this.element,
				(success, error) => {
					if (success)
						this._isTemplateApplied = true;
					else
						throw ("TemplatedControl.applyTemplate: A template provider failed to apply its template: " + (error || "").toString());
				});
		}
	}
}
