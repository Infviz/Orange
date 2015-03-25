
/// <reference path="Reference.d.ts"/>

module Orange.Controls {

	export class Control {

		private _element: HTMLElement = null;
		public get element(): HTMLElement { return this._element; }
		public set element(element: HTMLElement) {

			if (this._element != null) 
				throw "'element' property can only be set once. ";

			this._element = element;

			this.onElementSet();
		}

		private disposables = new Array<{ dispose(): void}>();
		public addDisposable(disposable: { dispose(): void }) {
			this.disposables.push(disposable);
		}

		public dispose() {
			ControlManager.disposeControl(this);
		}

		protected onElementSet(): void { }
	}
}