declare module Orange {
    class Uuid {
        private static _counter;
        private _value;
        readonly value: string;
        private static _tStart;
        private static getTime;
        private static generateV4Uuid;
        constructor(uuid?: string);
        static generate(): Uuid;
        static isUuid(value: string): boolean;
        sameValueAs(uuid: Uuid): boolean;
        toString(): string;
    }
}
declare module Orange.Modularity {
    function inject(target: any): void;
    function dependency(target: any, key: string): void;
    type TryResolveResult<T> = {
        instance: T;
        success: boolean;
    };
    interface KeyValuePair {
        key: any;
        value: any;
    }
    class ResolveError extends Error {
        innerError?: Error;
        constructor(message: string, innerError?: Error);
    }
    interface Type<T> {
        new (...args: any[]): T;
    }
    class Container {
        private typeMap;
        private instances;
        private static _defaultContainer;
        static readonly defaultContainer: Container;
        constructor();
        registerInstance<T, TR extends T>(type: Type<T>, instance: TR): void;
        registerType<T, TR extends T>(type: Type<T>, mappedType: Type<TR>): void;
        tryResolve<T = any>(type: string): Promise<TryResolveResult<T>>;
        tryResolve<T = any>(type: string, register: boolean): Promise<TryResolveResult<T>>;
        tryResolve<T>(type: Type<T>): Promise<TryResolveResult<T>>;
        tryResolve<T>(type: Type<T>, register: boolean): Promise<TryResolveResult<T>>;
        resolve<T = any>(type: string): Promise<T>;
        resolve<T = any>(type: string, register: boolean): Promise<T>;
        resolve<T>(type: Type<T>): Promise<T>;
        resolve<T>(type: Type<T>, register: boolean): Promise<T>;
        resolveWithOverride<T = any>(type: string, overrides: Array<KeyValuePair>): Promise<T>;
        resolveWithOverride<T>(type: Type<T>, overrides: Array<KeyValuePair>): Promise<T>;
        private static getConstructorFromString;
        private lookup;
        private buildObject;
        private createInstance;
        private setProperties;
        private checkArity;
        private static isValidConstructor;
        private applyConstructor;
    }
}
declare module Orange.Modularity {
    class RegionManager {
        container: Orange.Modularity.Container;
        constructor(container: Orange.Modularity.Container);
        disposeRegions(root: HTMLElement): void;
        initializeRegions(root: HTMLElement): Promise<void>;
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
    abstract class Control {
        private _element;
        element: HTMLElement;
        private _id;
        id: Orange.Uuid;
        private disposables;
        addDisposable(disposable: {
            dispose(): void;
        }): void;
        dispose(): void;
        private _propertyChangedListeners;
        addPropertyChangedListener(listener: (propertyName: string, value: any) => void): void;
        removePropertyChangedListener(listener: (propertyName: string, value: any) => void): void;
        private static propertyRegex;
        private static getPropertyName;
        protected raisePropertyChanged(property: string): void;
        protected raisePropertyChanged<T>(property: () => T): void;
        protected onElementSet(): void;
        protected onPropertyChanged(propertyName: string, value: any): void;
        protected onControlCreated(): void;
    }
}
declare module Orange.Controls {
    interface ITemplatedControlTemplateProvider {
        applyTemplate(element: HTMLElement, onTemplateAppliedCallback: (success: boolean, error?: string) => void): void;
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
        applyTemplate(element: HTMLElement, onTemplateAppliedCallback: (success: boolean, error?: string) => void): void;
    }
    class TemplatedControl extends Control {
        private _templateProvider;
        private _isTemplateApplied;
        readonly isTemplateApplied: boolean;
        constructor(templateProvider: ITemplatedControlTemplateProvider);
        protected onApplyTemplate(): void;
        protected applyTemplate(doneCallback: () => void): void;
    }
}
declare module Orange.Controls {
    class ViewBase extends TemplatedControl {
        readonly templateName: string;
        private _dataContext;
        dataContext: any;
        constructor(templateName: string);
        constructor(templateName: string, context: any);
        getControl<T>(selector: string): T;
        protected applyTemplate(doneCallback: () => void): void;
        protected onApplyTemplate(): void;
        protected applyBindings(): void;
        protected onApplyBindings(): void;
    }
}
declare module Orange.Controls {
    interface IOrangeElementExtension {
        element: HTMLElement;
        control: Control;
        isInitialized: boolean;
        addOnInitializedListener(callback: () => void): void;
        getOnOnitializedListners(): Array<() => void>;
        removeOnInitializedListener(callback: () => void): void;
    }
    var GetOrInitializeOrangeElement: (element: HTMLElement) => IOrangeElementExtension;
    class ControlManager {
        static dependencies: () => any;
        private _container;
        readonly containter: Orange.Modularity.Container;
        constructor(container: Orange.Modularity.Container);
        private static _mutationObserverConfig;
        static disposeDescendants(root: HTMLElement): void;
        static disposeControl(control: Controls.Control): void;
        private static _controlAttributeNames;
        private _observer;
        private _element;
        manage(element: HTMLElement): void;
        private static getChildren;
        private static getControlAttribute;
        static createControlsInElement(element: HTMLElement, container: Orange.Modularity.Container): void;
        dispose(): void;
        private onMutation;
        static createControlFromElement(controlElement: HTMLElement, container: Orange.Modularity.Container): Promise<Controls.Control>;
        static createControlFromType(type: string, container: Orange.Modularity.Container): Promise<Controls.Control>;
        private static createControlInternal;
        private static createControlInternalImpl;
        private handleMutation;
    }
}
declare module Orange.Routing {
    class Router {
        private paths;
        private listeners;
        route(path: string | RegExp, handler: Function): void;
        listen(path: string | RegExp, handler: Function): void;
        unroute(path: string | RegExp): void;
        default(handler: Function): void;
        run(): void;
        navigate(navigatePath: string, state?: any): boolean;
        dispose(): void;
        private onpopstate;
        private onclick;
        private cleanPath;
        private handleRoute;
    }
}
declare module Orange.Controls {
    class KnockoutViewBase extends ViewBase {
        constructor(templateName: string);
        constructor(templateName: string, context: any);
        protected onApplyBindings(): void;
    }
}
declare module Orange.Bindings {
}
