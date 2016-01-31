##Injection

Injection via 'Orange.Modularity.Container' is a central concept in orange. The container 
can be used to automate creation of complex classes. 

###Basic example

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

#### Where to go next?
[Reference](http://infviz.github.io/Orange/Reference/dist/index.html)
