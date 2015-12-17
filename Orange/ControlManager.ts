/// <reference path="_references.ts"/>

module Orange.Controls {

	export interface IOrangeElementExtension {

		control: Control; 
		isInitialized: boolean;
		addOnInitializedListener(callback: () => void) : void;
		removeOnInitializedListener(callback: () => void) : void;
	}

	class OrangeElementExtension implements IOrangeElementExtension {

		control: Control = null;
		isInitialized: boolean = false;

		private _onInitializedListeners = new Array<() => void>();

		public addOnInitializedListener(callback: () => void) {
			this._onInitializedListeners.push(callback);
		}

		public removeOnInitializedListener(callback: () => void) : void {

			let idx = this._onInitializedListeners.indexOf(callback);	
			
			if (idx > -1) 
				this._onInitializedListeners.splice(idx, 1);
		}
	}

	export var GetOrInitializeOrangeElement = 
		(element: HTMLElement) : IOrangeElementExtension => {
			
			let el = element as any;
			if (el.orange == null)
				el.orange = new OrangeElementExtension();

			return el.orange as IOrangeElementExtension;
		};

	export class ControlManager {

		static dependencies = () => <any>[Orange.Modularity.Container];
		
		private _container: Orange.Modularity.Container;
		public get containter() : Orange.Modularity.Container { return this._container; }

		constructor(container: Orange.Modularity.Container) { 
			this._container = container;
		}

		private static _mutationObserverConfig: MutationObserverInit = {
			// Set to true if additions and removals of the target node's child elements 
			// (including text nodes) are to be observed.
			childList: true,

			// Set to true if mutations to target's attributes are to be observed.
			attributes: false,

			// Set to true if mutations to target's data are to be observed.
			characterData: false,

			// Set to true if mutations to not just target, but also target's descendants 
			// are to be observed.
			subtree: true,

			// Set to true if attributes is set to true and target's attribute value 
			// before the mutation needs to be recorded.
			attributeOldValue: false,

			// Set to true if characterData is set to true and target's data before the 
			// mutation needs to be recorded.
			characterDataOldValue: false,

			// Set to an array of attribute local names (without namespace) if not all 
			// attribute mutations need to be observed.
			//attributeFilter: ["data-control", "data-view"]
		};

		public static disposeDescendants(root: HTMLElement) {

			var attr = ControlManager.getControlAttribute(root);

			if (attr == null) {
				if (typeof root.children !== "undefined") {
					for (var i = 0; i < root.children.length; i++)
						this.disposeDescendants(<HTMLElement>root.children[i]);
				}
			}
			else {
				var orangeEl = GetOrInitializeOrangeElement(root);
				if (orangeEl.control != null) 
					orangeEl.control.dispose();
			}
		}

		public static disposeControl(control: Controls.Control) {

			if (control == null) return;

			let element = control.element;
			// Clear information stored on element.
			if (element != null)
				(<any>element).orange = null;

			// NOTE: disposables is private..
			var disposables = <Array<{ dispose(): void; }>>(<any>control).disposables;
			for (var dIdx = disposables.length - 1; dIdx >= 0; dIdx--) {
				disposables[dIdx].dispose();
			}

			if (typeof element.children !== "undefined") {
				let children = element.children;
				for (var cIdx = 0; cIdx < children.length; cIdx++) {
					ControlManager.disposeDescendants(<HTMLElement>children[cIdx]);
				}
			}
		}

		private static _controlAttributeNames: Array<string> = ["data-control", "data-view"];

		private _observer: MutationObserver = null;
		private _element: HTMLElement = null;

		public manage(element: HTMLElement) {

			if (this._observer != null)
				this.dispose();

			this._element = element;
			this._observer = new (<any>MutationObserver)(this.onMutation);
			this._observer.observe(element, ControlManager._mutationObserverConfig);
			ControlManager.createControlsInElement(this._element, this._container);
		}

		private static getChildren(element: HTMLElement): Array<HTMLElement> {

			var result = new Array<HTMLElement>();

			if (typeof element.children != null) {
				for (var i = 0; i < element.children.length; i++) {
					result.push(<HTMLElement>element.children[i]);
				}
			}

			return result;
		}

		private static getControlAttribute(element: HTMLElement) : { attributeType: string; value: string; } {

			var attr: string = null;
			var anIdx = 0;
			while ((attr == null || attr == "") && anIdx < ControlManager._controlAttributeNames.length)
				attr = element.getAttribute(ControlManager._controlAttributeNames[anIdx++]);

			if (attr == null || attr == "")
				return null;
			
			return {
				attributeType: ControlManager._controlAttributeNames[anIdx - 1], 
				value: attr
			};
		}

		public static createControlsInElement(element: HTMLElement): void;
		public static createControlsInElement(element: HTMLElement, container: Orange.Modularity.Container): void;
		public static createControlsInElement(element: HTMLElement, container?: Orange.Modularity.Container): void {

			let attr = ControlManager.getControlAttribute(element);

			if (attr != null) {
				ControlManager.createControlFromElement(element, container);
			}
			else {
				let controls = element.querySelectorAll("[" + this._controlAttributeNames.join("], [") +  "]");
				
				for (let ceIdx = 0; ceIdx < controls.length; ++ceIdx) {
					ControlManager.createControlFromElement(<HTMLElement>(controls[ceIdx]), container);
				}
			}
		}

		public dispose() {
			this._observer.disconnect();
			this._observer = null;
		}

		private onMutation: MutationCallback = (mut: MutationRecord[], obs: MutationObserver): void => {
			mut.forEach(this.handleMutation);
		}

		public static createControlFromElement(controlElement: HTMLElement): Controls.Control;
		public static createControlFromElement(controlElement: HTMLElement, container: Orange.Modularity.Container): Controls.Control;
		public static createControlFromElement(controlElement: HTMLElement, container?: Orange.Modularity.Container): Controls.Control {
			return ControlManager.createControlInternal(controlElement, container);
		}

		public static createControlFromType(type: string): Controls.Control;
		public static createControlFromType(type: string, container: Orange.Modularity.Container): Controls.Control;
		public static createControlFromType(type: string, container?: Orange.Modularity.Container): Controls.Control {

			var element = document.createElement("div");
			element.setAttribute(ControlManager._controlAttributeNames[0], type);

			return ControlManager.createControlInternal(element, container);
		}

		private static createControlInternal(element: HTMLElement, container: Orange.Modularity.Container): Controls.Control {

			let type = ControlManager.getControlAttribute(element);

			// The element already has a control connected to it.
			let orangeElement = GetOrInitializeOrangeElement(element);
			if (orangeElement.isInitialized)
				return null;

			let control = container.resolve(type.value);

			orangeElement.control = control;

			let controlId = Orange.Uuid.generate();
			element.setAttribute('data-control-id', controlId.value);

			control.id = controlId;
			control.element = element;

			if (!!control.applyTemplate)
				control.applyTemplate();

			if (!!control.onApplyTemplate)
				control.onApplyTemplate();

			let children = ControlManager.getChildren(element);

			for (let child of children) 
				ControlManager.createControlsInElement(child, container);

			orangeElement.isInitialized = true;
			
			for (let listener of <Array<() => void>>(<any>orangeElement)._onInitializedListeners)
				listener();
			
			if (!!control.onControlCreated)
				control.onControlCreated();
				
			return control;
		}

		private handleMutation = (mutation: MutationRecord) => {

			if (mutation.type !== "childList")
				return;

			let addedNodes = mutation.addedNodes;
			for (let i = 0; i < addedNodes.length; i++) {

				let node = addedNodes[i];

				// 1 == ELEMENT_NODE
				if (node.nodeType !== 1) continue;

				ControlManager.createControlsInElement(<HTMLElement>node, this._container);
			}

			let removedNodes = mutation.removedNodes;
			for (let i = 0; i < removedNodes.length; i++) {

				let node = removedNodes[i];

				// 1 == ELEMENT_NODE
				if (node.nodeType !== 1) continue;

				ControlManager.disposeDescendants(<HTMLElement>node);
			}
		}
	}
}