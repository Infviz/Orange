
/// <reference path="Reference.d.ts"/>

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

			var idx = this._onInitializedListeners.indexOf(callback);	
			
			if (idx > -1) 
				this._onInitializedListeners.splice(idx, 1);
		}
	}

	export var GetOrangeElement = 
		(element: HTMLElement) : IOrangeElementExtension => {

			if (!((<any>element).orange)) {
				
				var orangeEl = new OrangeElementExtension();;
				element["orange"] = orangeEl;
				return orangeEl;
			}

			return <IOrangeElementExtension>(<any>element).orange;
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
				ControlManager.getControlFromElement(root).dispose();
			}
		}

		public static disposeControl(control: Controls.Control) {

			if (!control) return;

			// Clear information stored on element.
			if (!!(control.element))
				(<any>control.element).orange = null;

			// NOTE: disposables is private..
			var disposables = <Array<{ dispose(): void; }>>(<any>control).disposables;
			for (var dIdx = disposables.length - 1; dIdx >= 0; dIdx--) {
				disposables[dIdx].dispose();
			}

			if (typeof control.element.children !== "undefined") {
				for (var i = 0; i < control.element.children.length; i++) {
					ControlManager.disposeDescendants(<HTMLElement>control.element.children[i]);
				}
			}
		}

		private static _controlAttributeNames: Array<string> = ["data-control", "data-view"];

		private _observer: MutationObserver = null;
		private _element: HTMLElement = null;

		public manage(element: HTMLElement) {

			if (this._observer !== null)
				this.dispose();

			this._element = element;
			this._observer = new (<any>MutationObserver)(this.onMutation);
			this._observer.observe(element, ControlManager._mutationObserverConfig);
			ControlManager.createControlsInElement(this._element, this._container);
		}

		private static getChildren(element: HTMLElement): Array<HTMLElement> {

			var result = new Array<HTMLElement>();

			if (typeof element.children !== "undefined") {
				for (var i = 0; i < element.children.length; i++) {
					result.push(<HTMLElement>element.children[i]);
				}
			}

			return result;
		}

		private static getControlAttribute(element: HTMLElement) : { attributeType: string; value: string; } {

			var attr = null;
			var anIdx = 0;
			while ((!attr || attr == "") && anIdx < ControlManager._controlAttributeNames.length) {
				attr = element.getAttribute(ControlManager._controlAttributeNames[anIdx++]);
			}

			if (!attr || attr == "") {
				return null;
			}
			else {
				return {
					attributeType: ControlManager._controlAttributeNames[anIdx - 1], 
					value: attr
				};
			}
		}

		public static createControlsInElement(element: HTMLElement);
		public static createControlsInElement(element: HTMLElement, container: Orange.Modularity.Container);
		public static createControlsInElement(element: HTMLElement, container?: Orange.Modularity.Container) {

			var attr = ControlManager.getControlAttribute(element);

			if (attr != null) {
				ControlManager.createControlFromElement(element, container);
			}
			else {
				var controls = element.querySelectorAll("[" + this._controlAttributeNames.join("], [") +  "]");

				for (var ceIdx = 0; ceIdx < controls.length; ++ceIdx) {
					var ce = <HTMLElement>(controls[ceIdx]);
					ControlManager.createControlFromElement(ce, container);
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

		public static getControlFromElement(element: HTMLElement): Control {

			if (!element["orange"] || !(element["orange"]["control"]))
				throw "ViewBase.getControlFromElement: the element has no control conected to it.";

			return <Control>(element["orange"]["control"]);
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

		// TODO: Replace with decent id generation later
		private static _uniqueIdCounter: number = 0;

		private static createControlInternal(element: HTMLElement, container: Orange.Modularity.Container): Controls.Control {

			var type = ControlManager.getControlAttribute(element);

			// The element already has a controll connected to it.
			var orangeElement = GetOrangeElement(element);
			if (orangeElement.isInitialized)
				return null;

			var constructorFunction = <{ new () }>type.value.split(".").reduce((c, n) => c[n], window);
			var control = <Control>(!!container ? container.resolve(constructorFunction) : new constructorFunction());

			if (false == (control instanceof constructorFunction))
				throw "ControlManager.createControl: instance of constructed object is not of the correct type."

			orangeElement.control = control;

			// TODO: Improve the id generation
			var uid = "o-uid-" + (ControlManager._uniqueIdCounter++);
			element.setAttribute(type.attributeType + "-id", uid);

			control.element = element;

			if (!!(<any>control).applyTemplate)
				(<any>control).applyTemplate();

			if (!!(<any>control).onApplyTemplate)
				(<any>control).onApplyTemplate();

			var children = ControlManager.getChildren(element);

			for (var i = 0; i < children.length; i++) 
				ControlManager.createControlsInElement(children[i], container);

			orangeElement.isInitialized = true;
			var listeners: Array<() => void> = <Array<() => void>>(<any>orangeElement)._onInitializedListeners;
			for (var listenerIdx = listeners.length - 1; listenerIdx >= 0; listenerIdx--) {
				listeners[listenerIdx]();
			}
			
			return control;
		}

		private handleMutation = (mutation: MutationRecord) => {

			if (mutation.type !== "childList")
				return;

			var addedNodes = mutation.addedNodes;
			for (var i = 0; i < addedNodes.length; i++) {

				var node = addedNodes[i];

				// 1 == ELEMENT_NODE
				if (node.nodeType !== 1) continue;

				ControlManager.createControlsInElement(<HTMLElement>node, this._container);
			}

			var removedNodes = mutation.removedNodes;
			for (var i = 0; i < removedNodes.length; i++) {

				var node = removedNodes[i];

				// 1 == ELEMENT_NODE
				if (node.nodeType !== 1) continue;

				ControlManager.disposeDescendants(<HTMLElement>node);
			}
		}
	}
}