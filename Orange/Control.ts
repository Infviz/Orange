/// <reference path="_references.ts"/>

module Orange.Controls {

	export class Control {

		private _element: HTMLElement = null;
		public get element(): HTMLElement { return this._element; }
		public set element(element: HTMLElement) {
			if (this._element != null) throw "The 'element' property can only ever be set once.";
			this._element = element;
			this.onElementSet();
		}

		private _id: Orange.Uuid = null;
		public get id(): Orange.Uuid {
			return this._id;
		}
		public set id(v: Orange.Uuid) {
			if (this._id != null) throw "The 'id' property can only ever be set once. "
			this._id = v;
		}

		private disposables = new Array<{ dispose(): void}>();
		public addDisposable(disposable: { dispose(): void }) {
			this.disposables.push(disposable);
		}

		public dispose() {
			ControlManager.disposeControl(this);
		}

		protected onElementSet(): void { }

		private _propertyChangedListeners = new Array<(propertyName: string, value: any) => void>();
		
		public addPropertyChangedListener(listener: (propertyName: string, value: any) => void) {
			this._propertyChangedListeners.push(listener);
		}

		public removePropertyChangedListener(listener: (propertyName: string, value: any) => void) {

			var idx = this._propertyChangedListeners.indexOf(listener);
			if (idx > -1)
				this._propertyChangedListeners.splice(idx, 1);
		}

		protected raisePropertyChanged(propertyName: string) {

			var propertyValue = (<any>this)[propertyName];

	        if (propertyValue == null || propertyValue == "undefined")
	        	throw "trying to access undefined property '" + propertyName + "'.";
	        
	        this.onPropertyChanged(propertyName, propertyValue);

	        for (var plIdx = this._propertyChangedListeners.length - 1; plIdx >= 0; plIdx--) {
	        	this._propertyChangedListeners[plIdx](propertyName, propertyValue);
	        }
		}

		protected onPropertyChanged(propertyName: string, value: any): void { }
	}
}