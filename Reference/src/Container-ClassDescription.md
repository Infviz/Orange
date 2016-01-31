Injection via 'Orange.Modularity.Container' is a central concept in orange. The container 
can be used to automate creation of complex classes. 

**Basic example**

In this example we create an instance of `Foo` and register it in the container. 
Whenever we resolve the type `Foo` from the container we will get the registered instance. 

```
class Foo { /* ... */ }

let container = new Orange.Modularity.Container();

let fooInstance = new Foo();
container.registerInstance(Foo, fooInstance);


// wherever we resolve Foo we will get the same instance (i.e. fooInstance) 
let myFoo = container.resolve(Foo);

```

`Container` can automatically resolve any type that has an empty constructor. To resolve 
more complex types some more information has to be provided, as illustrated in the 
*Nested resolving* example below.  

**Nested resolving**

In this example we provide information about how to resolve `Bar` with the 
`@Orange.Modularity.inject` decorator on the `Bar` class. Because of this the container has
all information it needs to directly resolve instances of `Bar`. 

```
class Foo { /* ... */ }

@Orange.Modularity.inject
class Bar { 
    constructor(private myFoo: Foo) { }
 }

let container = new Orange.Modularity.Container();

let myBar = container.resolve(Bar);

```

In the example above resolving `Bar` will always result in a new instance of `Bar`, this 
is not always what we want. The following example illustrates how to make bar 'singleton'. 

```
class Foo { /* ... */ }

@Orange.Modularity.inject
class Bar { 
    constructor(private myFoo: Foo) { }
}

let container = new Orange.Modularity.Container();

container.registerInstance(Bar, container.resolve(Bar));

let myBar = container.resolve(Bar);

```

In this case we will always get the same instance of bar.