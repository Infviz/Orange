/// <reference path="_references.ts"/>

module Orange.Modularity 
{
    /**
     * [[include:Inject-DecoratorDescription.md]]
     */
    export function inject(target: any) {
        if ((<any>window).Reflect == null)
            throw "An attempt to use Orange.Modularity.inject decorator was made without an available Reflect implementation." 
        
        target.dependencies = () => (<any>window).Reflect.getMetadata("design:paramtypes", target);
    }
    
    export type TryResolveResult = { instance: any, success: boolean };
    
    export interface KeyValuePair { key: any; value: any; }
    
    export class ResolveError extends Error {
        constructor(message: string, public innerError?: Error) {
            super();
            this.message = message;
            this.name = "ResolveError";
        }
    }
    
    /** 
     * [[include:Container-ClassDescription.md]]
     */
    export class Container {
        private typeMap: Array<KeyValuePair> = [];
        private instances: Array<KeyValuePair> = [];

		private static _defaultContainer:Container = new Container();
		public static get defaultContainer(): Container { return Container._defaultContainer; }

        constructor () {
            this.registerInstance(Container, this);
        }

        registerInstance(type: any, instance: any): void {
            this.instances.push({ key: type, value: instance });
        }

        registerType(type: any, instance: any): void {
            this.typeMap.push({ key: type, value: instance });
        }
        
        tryResolve(type: any | string, register: boolean = false) : TryResolveResult {
            
            if (typeof type === "string") {
                try {
                    let ctr = Container.getConstructorFromString(type);
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

            let resolvedType = this.lookup(this.typeMap, type) || type;

            if (false == Container.isValidConstructor(resolvedType))
                return { instance: null, success: false };
            
            if (false == this.checkArity(resolvedType))
                return { instance: null, success: false };
            
            instance = this.createInstance(resolvedType);

            if (register === true)
                this.registerInstance(type, instance);

            return { instance, success: true };
        }
        
        resolve(type: any | string, register: boolean = false) {
            
            if (typeof type === "string") {
                try {
                    let ctr = Container.getConstructorFromString(type);
                    type = ctr;
                }
                catch (e) {
                    throw new ResolveError(`Failed to resolve type '${type}', see innerError for details`, e);
                }
                
                if (type == null)
                    throw new ResolveError(`No constructor identified by "${type}" could be found`); 
            }

            var instance: any = this.lookup(this.instances, type);
            
            if (instance != null)
                return instance;

            var resolvedType = this.lookup(this.typeMap, type) || type;

            if (false == Container.isValidConstructor(resolvedType))
                throw new ResolveError(`Orange.Modularity.Container failed to resolve type "${type}"`);
            
            if (false == this.checkArity(resolvedType))
                throw new ResolveError(`Orange.Modularity.Container failed to resolve type "${type}"`);

            instance = this.createInstance(resolvedType);

            if (register === true)
                this.registerInstance(type, instance);

            return instance;
        }

        resolveWithOverride(type: any, overrides: Array<KeyValuePair>) {
            var sub = new Container();
            sub.typeMap = this.typeMap;
            sub.instances = overrides.concat(this.instances);
            return sub.resolve(type, false);
        }

        private static getConstructorFromString(constructorName: string) : any {

            var path = constructorName.split(".");

            // Try to construct a valid constructorfunction based of window.
            var func: any = window;
            for (var fragment of path) {

                if (func[fragment] == null)
                    break;

                func = func[fragment];
            }

            if (Container.isValidConstructor(func))
                return func;

            // If the constructor was not found on window, try to require it.
            // NOTE: This is done to support browserify modules.
            if ((<any>window).require != null) {
                func = (<any>window).require(constructorName);
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
            for (var kvp of dict) {
                if (kvp.key === key)
                    return kvp.value;
            }
        }

        private createInstance(resolvedType: any) {
            var instance: any;
            var depCount = resolvedType.dependencies ? resolvedType.dependencies().length : 0;
            if (depCount == 0) {
                instance = new resolvedType();
            }
            else {
                var ctrArgs: Array<any> = [];

                var deps = resolvedType.dependencies();

                for (var dep of deps)
                    ctrArgs.push(this.resolve(dep));

                instance = this.applyConstructor(resolvedType, ctrArgs);
            }
            return instance;
        }

        private checkArity(type: any) {
            var depCount = type.dependencies ? type.dependencies().length : 0;
            var ctrCount = <number>(type.length || type.arity || 0);

            return depCount === ctrCount;
        }

        private static isValidConstructor(type: any) : boolean {
            return type != null && (typeof(type) == "function");
        }

        private applyConstructor(ctor: any, args: Array<any>) {
            
            return new (Function.bind.apply(ctor, [null].concat(args)));
        }
    }
}
