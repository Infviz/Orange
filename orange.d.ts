declare module Orange {
    class Uuid {
        private static _counter;
        private _value;
        value: string;
        private static _tStart;
        private static getTime;
        private static generateV4Uuid();
        constructor(uuid?: string);
        static generate(): Uuid;
        static isUuid(value: string): boolean;
        sameValueAs(uuid: Uuid): boolean;
    }
}
declare module Orange.Modularity {
    interface KeyValuePair {
        key: any;
        value: any;
    }
    class Container {
        private typeMap;
        private instances;
        constructor();
        registerInstance(type: any, instance: any): void;
        registerType(type: any, instance: any): void;
        resolve(type: any, register?: boolean): any;
        resolveWithOverride(type: any, overrides: Array<KeyValuePair>): any;
        private lookup(dict, key);
        private createInstance(resolvedType);
        private checkArity(type);
        private applyConstructor(ctor, args);
    }
}
declare module Orange.Modularity {
    class RegionManager {
        container: Orange.Modularity.Container;
        constructor(container: Orange.Modularity.Container);
        disposeRegions(root: HTMLElement): void;
        initializeRegions(root: HTMLElement): void;
    }
}
interface TemplateInfo {
    id: string;
    path: string;
}
declare class TemplateLoader {
    static onload: () => void;
    static staticlyLoaded(): void;
    static load(templates: Array<TemplateInfo>): void;
}
declare module Orange.Controls {
    class Control {
        private _element;
        element: HTMLElement;
        private disposables;
        addDisposable(disposable: {
            dispose(): void;
        }): void;
        dispose(): void;
        protected onElementSet(): void;
        private _propertyChangedListeners;
        addPropertyChangedListener(listener: (propertyName: string, value: any) => void): void;
        removePropertyChangedListener(listener: (propertyName: string, value: any) => void): void;
        protected raisePropertyChanged(propertyName: string): void;
        protected onPropertyChanged(propertyName: string, value: any): void;
    }
}
declare module Orange.Controls {
    interface ITemplatedControlTemplateProvider {
        applyTemplate(element: HTMLElement, onTemplateAppliedCallback: (success: boolean) => void): void;
    }
    class StringTemplateProvider implements ITemplatedControlTemplateProvider {
        private _template;
        constructor(template: string);
        applyTemplate(element: HTMLElement, onTemplateAppliedCallback: (success: boolean) => void): void;
    }
    class ScriptTemplateProvider implements ITemplatedControlTemplateProvider {
        private _templateName;
        private _context;
        constructor(templateName: string);
        applyTemplate(element: HTMLElement, onTemplateAppliedCallback: (success: boolean) => void): void;
    }
    class TemplatedControl extends Control {
        private _templateProvider;
        private _isTemplateApplied;
        isTemplateApplied: boolean;
        constructor(templateProvider: ITemplatedControlTemplateProvider);
        protected onApplyTemplate(): void;
        private applyTemplate();
    }
}
declare module Orange.Controls {
    class ViewBase extends TemplatedControl {
        private _dataContext;
        dataContext: any;
        constructor(templateName: string);
        constructor(templateName: string, context: any);
        protected onApplyTemplate(): void;
        private applyBindings();
        protected onApplyBindings(): void;
        protected onDataContextSet(): void;
    }
    class KnockoutViewBase extends ViewBase {
        constructor(templateName: string);
        constructor(templateName: string, context: any);
        dispose(): void;
        protected onApplyBindings(): void;
        protected onDataContextSet(): void;
        private cleanChildBindings();
    }
}
declare module Orange.Controls {
    interface IOrangeElementExtension {
        control: Control;
        isInitialized: boolean;
        addOnInitializedListener(callback: () => void): void;
        removeOnInitializedListener(callback: () => void): void;
    }
    var GetOrangeElement: (element: HTMLElement) => IOrangeElementExtension;
    class ControlManager {
        static dependencies: () => any;
        private _container;
        containter: Orange.Modularity.Container;
        constructor(container: Orange.Modularity.Container);
        private static _mutationObserverConfig;
        static disposeDescendants(root: HTMLElement): void;
        static disposeControl(control: Controls.Control): void;
        private static _controlAttributeNames;
        private _observer;
        private _element;
        manage(element: HTMLElement): void;
        private static getChildren(element);
        private static getControlAttribute(element);
        static createControlsInElement(element: HTMLElement): void;
        static createControlsInElement(element: HTMLElement, container: Orange.Modularity.Container): void;
        dispose(): void;
        private onMutation;
        static getControlFromElement(element: HTMLElement): Control;
        static createControlFromElement(controlElement: HTMLElement): Controls.Control;
        static createControlFromElement(controlElement: HTMLElement, container: Orange.Modularity.Container): Controls.Control;
        static createControlFromType(type: string): Controls.Control;
        static createControlFromType(type: string, container: Orange.Modularity.Container): Controls.Control;
        private static isValidConstructorFunc(func);
        private static getConstructorFunction(constructorName);
        private static createControlInternal(element, container);
        private handleMutation;
    }
}
declare module Orange.Routing {
    class Router {
        private paths;
        route(path: string, handler: Function): void;
        default(handler: Function): void;
        run(): void;
        navigate(path: string, state: any): void;
        private handleRoute(path);
    }
}
declare module Orange.Bindings {
}
