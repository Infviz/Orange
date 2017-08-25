var System;
(function (System) {
    var modules = {};
    var registers = {};
    function register(name, deps, factory) {
        registers[name] = {
            deps: deps,
            isResolving: false,
            factory: factory
        };
    }
    System.register = register;
    function require(name) {
        if (name in modules)
            return modules[name];
        var result = create(name);
        return result;
    }
    System.require = require;
    System.import = function (name) {
        var result = require(name);
        return Promise.resolve(result);
    }
    window.require = require;
    function create(name) {
        if (!(name in registers))
            throw new Error("Cannot resolve '" + name + "'");
        var register = registers[name];
        if (register.isResolving)
            throw new Error("Circular resolve");
        register.isResolving = true;
        var result = {};
        modules[name] = result;
        function exportImpl(n, impl) {
            result[n] = impl;
        }
        var innerFactory = register.factory(exportImpl, { id: name, import: System.import });
        for (var index = 0; index < register.deps.length; index++) {
            var dependency = register.deps[index];
            innerFactory.setters[index](require(dependency));
        }
        innerFactory.execute();
        return result;
    }
})(System || (System = {}));
