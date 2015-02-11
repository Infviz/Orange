
module Orange.Modularity
{
    export module Typing
    {
        export function ensurePrototype(type: any, instance: any) {
            for (var p in type.prototype) {
                if (type.prototype.hasOwnProperty(p) && !instance[p])
                    instance[p] = type.prototype[p];
            }
            return instance;
        } 
    }
}