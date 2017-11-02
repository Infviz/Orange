/// <reference path="_references.ts"/>

module Orange.Modularity {
    /**
     * [[include:Inject-DecoratorDescription.md]]
     */
    export function inject(target: any) {
        if ((<any>window).Reflect == null)
            throw "An attempt to use Orange.Modularity.inject decorator was made without an available Reflect implementation."

        target.dependencies = () => {
            const deps = (<any>window).Reflect.getMetadata("design:paramtypes", target);
            return deps || [];
        };
    }

    /**
     * [[include:Dependency-DecoratorDescription.md]]
     */
    export function dependency(target: any, key: string) {
        if ((<any>window).Reflect == null)
            throw "An attempt to use Orange.Modularity.dependency decorator was made without an available Reflect implementation."

        target.constructor.propertyDependencies = {
            ... target.constructor.propertyDependencies,
            [key] : (<any>window).Reflect.getMetadata("design:type", target, key)
        }
    }

    export type TryResolveResult<T> = { instance: T, success: boolean };

    export interface KeyValuePair { key: any; value: any; }

    export class ResolveError extends Error {
        constructor(message: string, public innerError?: Error) {
            super();
            this.message = message;
            this.name = "ResolveError";
        }
    }

    export interface Type<T> {
        new (... args: any[]): T;
    }

    /** 
     * [[include:Container-ClassDescription.md]]
     */
    export class Container {
        private typeMap: Array<KeyValuePair> = [];
        private instances: Array<KeyValuePair> = [];

        private static _defaultContainer: Container = new Container();
        public static get defaultContainer(): Container { return Container._defaultContainer; }

        constructor() {
            this.registerInstance(Container, this);
        }

        registerInstance<T, TR extends T>(type: Type<T>, instance: TR): void {
            this.instances.push({ key: type, value: instance });
        }

        registerType<T, TR extends T>(type: Type<T>, mappedType: Type<TR>): void {
            this.typeMap.push({ key: type, value: mappedType });
        }

        async tryResolve<T = any>(type: string): Promise<TryResolveResult<T>>
        async tryResolve<T = any>(type: string, register: boolean): Promise<TryResolveResult<T>>
        async tryResolve<T>(type: Type<T>): Promise<TryResolveResult<T>>
        async tryResolve<T>(type: Type<T>, register: boolean): Promise<TryResolveResult<T>>
        async tryResolve(type: any | string, register: boolean = false): Promise<TryResolveResult<any>> {

            if (typeof type === "string") {
                try {
                    let ctr = await Container.getConstructorFromString(type);
                    if (ctr == null)
                        return { instance: null, success: false };
                    type = ctr;
                }
                catch (e) {
                    return { instance: null, success: false };
                }
            }

            let instance: any = this.lookup(this.instances, type);

            if (instance != null)
                return { instance, success: true };

            const resolvedType = this.lookup(this.typeMap, type) || type;

            if (false == Container.isValidConstructor(resolvedType))
                return { instance: null, success: false };

            if (false == this.checkArity(resolvedType))
                return { instance: null, success: false };

            instance = await this.buildObject(resolvedType);

            if (register === true)
                this.registerInstance(type, instance);

            return { instance, success: true };
        }

        async resolve<T = any>(type: string): Promise<T>
        async resolve<T = any>(type: string, register: boolean): Promise<T>
        async resolve<T>(type: Type<T>): Promise<T>
        async resolve<T>(type: Type<T>, register: boolean): Promise<T>
        async resolve(type: any | string, register: boolean = false) {

            let typeConstructor = type
            if (typeof type === "string") {
                try {
                    let ctr = await Container.getConstructorFromString(type);
                    typeConstructor = ctr;
                }
                catch (e) {
                    throw new ResolveError(`Failed to resolve type '${type}', see innerError for details`, e);
                }

                if (typeConstructor == null)
                    throw new ResolveError(`No constructor identified by "${type}" could be found`);
            }

            let instance: any = this.lookup(this.instances, typeConstructor);

            if (instance != null)
                return instance;

            const resolvedType = this.lookup(this.typeMap, typeConstructor) || typeConstructor;

            if (false == Container.isValidConstructor(resolvedType))
                throw new ResolveError(`Orange.Modularity.Container failed to resolve type "${type}"`);

            if (false == this.checkArity(resolvedType))
                throw new ResolveError(`Orange.Modularity.Container failed to resolve type "${type}"`);

            instance = await this.buildObject(resolvedType);

            if (register === true)
                this.registerInstance(typeConstructor, instance);

            return instance;
        }

        async resolveWithOverride<T = any>(type: string, overrides: Array<KeyValuePair>): Promise<T>
        async resolveWithOverride<T>(type: Type<T>, overrides: Array<KeyValuePair>): Promise<T>
        resolveWithOverride(type: any, overrides: Array<KeyValuePair>) {
            const sub = new Container();
            sub.typeMap = this.typeMap;
            sub.instances = overrides.concat(this.instances);
            return sub.resolve(type, false);
        }

        private static async getConstructorFromString(constructorName: string) {

            const path = constructorName.split(".");

            // Try to construct a valid constructorfunction based of window.
            let func: any = window;
            for (const fragment of path) {

                if (func[fragment] == null)
                    break;

                func = func[fragment];
            }

            if (Container.isValidConstructor(func))
                return func;

            func = null;

            // If the constructor was not found on window, try to require it.
            // NOTE: This is done to support browserify modules.
            if ((<any>window).require != null) {
                func = (<any>window).require(constructorName);
            }

            if (func == null) {
                if ((<any>window).SystemJS != null) {
                    let sjs = (<any>window).SystemJS;
                    try {
                        const module = await sjs.import(constructorName);
                        func = module;
                    }
                    catch (e) {
                        return null;
                    }
                }
            }

            if (func == null)
                return null

            if (Container.isValidConstructor(func))
                return func;

            // Require can return an object containing several exported classes, in that case 
            // we check for a default exported class and return it if it exists. 
            if (func.default != null && Container.isValidConstructor(func.default))
                return func.default;

            return null;
        }

        private lookup(dict: Array<KeyValuePair>, key: any) {
            for (const kvp of dict) {
                if (kvp.key === key)
                    return kvp.value;
            }
        }

        private async buildObject(resolvedType: any) {
            let instance: any;
            instance = await this.createInstance(resolvedType);
            await this.setProperties(resolvedType, instance);
            return instance;
        }

        private async createInstance(resolvedType: any) {
            let instance: any;
            let depCount = resolvedType.dependencies ? resolvedType.dependencies().length : 0;
            if (depCount == 0) {
                instance = new resolvedType();
            }
            else {
                var ctrArgs: Array<any> = [];
                var deps = resolvedType.dependencies();
                for (var dep of deps)
                    ctrArgs.push(await this.resolve(dep));
                instance = this.applyConstructor(resolvedType, ctrArgs);
            }
            return instance;
        }

        private async setProperties(resolvedType: any, instance: any) {
            let propertyDependencies = resolvedType.propertyDependencies;
            for (const prop in propertyDependencies) {
                const dep = propertyDependencies[prop];
                instance[prop] = await this.resolve(dep);
            }
        }

        private checkArity(type: any) {
            let depCount = type.dependencies ? type.dependencies().length : 0;
            let ctrCount = <number>(type.length || type.arity || 0);

            return depCount === ctrCount;
        }

        private static isValidConstructor(type: any): boolean {
            return type != null && (typeof (type) == "function");
        }

        private applyConstructor(ctor: any, args: Array<any>) {

            return new (Function.bind.apply(ctor, [null].concat(args)));
        }
    }
}
