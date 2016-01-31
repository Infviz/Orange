
/// <reference path="../../orange.d.ts" />

let container = new Orange.Modularity.Container();

class Foo { }

container.registerInstance(Foo, container.resolve(Foo));
container.registerInstance(Orange.Modularity.Container, container);

let myFoo = container.resolve(Foo);

class Bar {    
    constructor(container: Orange.Modularity.Container) {
        
    }
}

let bar = new Bar(container);
container.registerInstance(Bar, bar);

let myBar = container.resolve(Bar);