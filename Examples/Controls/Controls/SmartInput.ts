/// <reference path="../../../orange.d.ts" />
/// <reference path="../../typings/tsd.d.ts" />

namespace Controls {
	export class SmartInput extends Orange.Controls.TemplatedControl {

		private _text : string = "";
		public get text() : string { return this._text; }
		public set text(v : string) {
			if (this._text == v) return;

			this._text = !v ? "" : v;

			if (this._input.value != this._text)
				this._input.value = this._text;

			this.raisePropertyChanged(() => this.text);
		}

		private _input: HTMLInputElement = null;

		constructor() {
			super(new Orange.Controls.StringTemplateProvider(
				'<input class="controls_smart_input_element" type="text" style="display: inline-block; position: relative;"/>'));
		}

		protected onApplyTemplate(): void {
			super.onApplyTemplate();

			this._input = <HTMLInputElement>this.element.querySelector(".controls_smart_input_element");
			
			this._input.addEventListener("input", this.onkeypress);
		}

		public dispose(): void {

			super.dispose();
			this._input.removeEventListener("input", this.onkeypress);
		}

		private onkeypress = (ev: any) => this.text = this._input.value;
	}
}