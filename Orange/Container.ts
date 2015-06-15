/// <reference path="_references.ts"/>

module Orange.Modularity 
{
    export interface KeyValuePair { key: any; value: any; }

    export class Container {
        private typeMap: Array<KeyValuePair> = [];
        private instances: Array<KeyValuePair> = [];

        constructor () {
            this.registerInstance(Container, this);
        }

        registerInstance(type: any, instance: any): void {
            this.instances.push({ key: type, value: instance });
        }

        registerType(type: any, instance: any): void {
            this.typeMap.push({ key: type, value: instance });
        }

        resolve(type: any | string, register: boolean = false) {
            
            if (typeof type === "string") 
                type = Container.getConstructorFromString(type);

            var instance: any = this.lookup(this.instances, type);
            
            if (instance != null)
                return instance;

            var resolvedType = this.lookup(this.typeMap, type) || type;

            Container.validateConstructor(resolvedType);
            this.checkArity(resolvedType);

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

            // If the constructor was now found on window, try to require it.
            // NOTE: This is done to support browserify modules.
            func = (<any>window).require(constructorName);

            if (Container.isValidConstructor(func))
                return func;

            throw new ReferenceError(`No constructor identified by "${constructorName}" could be found`);
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

            if (depCount != ctrCount)
                throw new Error(`Orange.Modularity.Container failed to resolve type "${type}"`);
        }

        private static isValidConstructor(type: any) : boolean {
            return type != null && (typeof(type) == "function");
        }

        private static validateConstructor(type: any) {

            if (false == Container.isValidConstructor(type))
                throw new Error(`Orange.Modularity.Container failed to resolve type "${type}"`);
        }

        private applyConstructor(ctor: any, args: Array<any>) {
            
            return new (Function.bind.apply(ctor, [null].concat(args)));
        }
    }
}
