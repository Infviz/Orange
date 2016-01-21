/// <reference path="_references.ts"/>

module Orange.Controls {
	/**
     * [[include:Control-ClassDescription.md]] 
     */
	export abstract class Control {
		
		private _element: HTMLElement = null;
		public get element(): HTMLElement { return this._element; }
		public set element(element: HTMLElement) {
			if (this._element != null) throw "The 'element' property can only ever be set once.";
			this._element = element;
			this.onElementSet();
		}
		
		private _id: Orange.Uuid = null;
		public get id(): Orange.Uuid { return this._id; }
		public set id(v: Orange.Uuid) {
			if (this._id != null) throw "The 'id' property can only ever be set once."
			this._id = v;
		}

		private disposables = new Array<{ dispose(): void}>();
		public addDisposable(disposable: { dispose(): void }): void {
			this.disposables.push(disposable);
		}

		public dispose(): void {
			ControlManager.disposeControl(this);
		}
		
		private _propertyChangedListeners = new Array<(propertyName: string, value: any) => void>();
		public addPropertyChangedListener(listener: (propertyName: string, value: any) => void) {
			this._propertyChangedListeners.push(listener);
		}

		public removePropertyChangedListener(listener: (propertyName: string, value: any) => void): void {
			let idx = this._propertyChangedListeners.indexOf(listener);
			if (idx > -1) this._propertyChangedListeners.splice(idx, 1);
		}
		
		private static propertyRegex = /return _this.([a-zA-Z0-9]+);/;
		private static getPropertyName<T>(property: () => T) {
            return Control.propertyRegex.exec(String(property))[1];
        }

		protected raisePropertyChanged(property: string): void;
		protected raisePropertyChanged<T>(property: () => T): void;
		protected raisePropertyChanged(property: any): void {
			
			let propertyName: string = null;
			if (typeof property === "string") {
				propertyName = property;
			}
			else if (typeof property === "function"){
				propertyName = Control.getPropertyName(property);
			}
			else {
				throw "Invalid argument passed to raisePropertyChanged";
			}
			
			if (typeof ((<any>this)[propertyName]) === "undefined")
	        	throw "Attempt to access undefined property '" + propertyName + "' was made.";
			
			let value: any = (<any>this)[propertyName];

	        this.onPropertyChanged(propertyName, value);

	        for (let plIdx = this._propertyChangedListeners.length - 1; plIdx >= 0; plIdx--)
	        	this._propertyChangedListeners[plIdx](propertyName, value);
		}
		
		protected onElementSet(): void { }
		protected onPropertyChanged(propertyName: string, value: any): void { }
		protected onControlCreated() : void { }
	}
}