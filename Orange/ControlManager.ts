
/// <reference path="Reference.d.ts"/>

module Orange.Controls {

	export class ControlManager implements Rx.IDisposable {

		static dependencies = () => <any>[Orange.Modularity.Container];
		
		private _container: Orange.Modularity.Container;

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
			//attributeFilter: ["data-iv-control"]
		};

		public static disposeDescendants(root: HTMLElement) {

			var attr = root.getAttribute("data-iv-control");
			if (attr == null || attr == "") {
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

			// NOTE: compositeDisposable is private.. 
			(<any>control).compositeDisposable.dispose();

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
			while ((!attr || attr == "") && anIdx < ControlManager._controlAttributeNames.length)
				attr = element.getAttribute(ControlManager._controlAttributeNames[anIdx++]);

			if (!attr || attr == "")
				return null;
			else
				return {
					attributeType: ControlManager._controlAttributeNames[anIdx - 1], 
					value: attr
				};
		}

		public static createControlsInElement(element: HTMLElement);
		public static createControlsInElement(element: HTMLElement, container: Orange.Modularity.Container);
		public static createControlsInElement(element: HTMLElement, container?: Orange.Modularity.Container) {

			var attr = ControlManager.getControlAttribute(element);

			if (attr == null) {

				var children = ControlManager.getChildren(element);

				for (var i = 0; i < children.length; i++) {
					ControlManager.createControlsInElement(<HTMLElement>element.children[i], container);
				}
			}
			else {

				ControlManager.createControlFromElement(element, container);
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
			if (element["orange"] && element["orange"]["control"])
				return;

			var constructorFunction = <{ new () }>type.value.split(".").reduce((c, n) => c[n], window);
			var control = <Control>(!!container ? container.resolve(constructorFunction) : new constructorFunction());

			if (false == (control instanceof constructorFunction))
				throw "ControlManager.createControl: instance of constructed object is not of the correct type."

			if (!element["orange"])
				element["orange"] = { };

			var orange = element["orange"];

			orange["control"] = control;
			orange["getControl"] = () => element["orange"]["control"];

			// TODO: Improve this..
			var uid = "uid-" + (ControlManager._uniqueIdCounter++);
			element.setAttribute(type.attributeType + "-id", uid);

			// Set element
			control.element = element;

			// Apply template
			if (!!(<any>control).applyTemplate)
				(<any>control).applyTemplate();

			// Create child controls
			var children = ControlManager.getChildren(element);

			for (var i = 0; i < children.length; i++) {
				
				ControlManager.createControlsInElement(children[i], container);
			}

			if (!!(<any>control).onApplyTemplate)
				(<any>control).onApplyTemplate();

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
		}
	}
}