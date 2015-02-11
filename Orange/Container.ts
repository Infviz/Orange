
/// <reference path="Reference.d.ts"/>

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

        resolve(type: any, register: boolean = false) {

            var instance = this.lookup(this.instances, type);
            if (instance)
                return instance;

            var resolvedType = this.lookup(this.typeMap, type) || type;

            this.checkArity(resolvedType);

            instance = this.createInstance(resolvedType);

            if (register === true)
            {
                this.registerInstance(type, instance);
            }

            return instance;
        }

        resolveWithOverride(type: any, overrides: Array<KeyValuePair>) {
            var sub = new Container();
            sub.typeMap = this.typeMap;
            sub.instances = overrides.concat(this.instances);
            return sub.resolve(type, false);
        }

        private lookup(dict: Array<KeyValuePair>, key: any) {
            for (var i = 0; i < dict.length; i++) {
                var kvp = dict[i];
                if (kvp.key === key)
                    return kvp.value;
            }
        }

        private createInstance(resolvedType) {
            var instance;
            var depCount = resolvedType.dependencies ? resolvedType.dependencies().length : 0;
            if (depCount == 0) {
                instance = new resolvedType();
            }
            else {
                var ctrArgs = [];

                var deps = resolvedType.dependencies();


                for (var d = 0; d < deps.length; d++) {
                    var dep = deps[d];
                    ctrArgs.push(this.resolve(dep));
                }

                instance = this.applyConstructor(resolvedType, ctrArgs);
            }
            return instance;
        }

        private checkArity(type) {
            var depCount = type.dependencies ? type.dependencies().length : 0;
            var ctrCount = <number>(type.length || type.arity || 0);

            if (depCount != ctrCount)
                throw new Error("failed to resolve type '" + type + "'");
        }

        private applyConstructor(ctor, args) {
            var a = [];
            for (var i = 0; i < args.length; i++)
                a[i] = 'arguments[1][' + i + ']';
            return eval('new arguments[0](' + a.join() + ')');
        }
    }
}
