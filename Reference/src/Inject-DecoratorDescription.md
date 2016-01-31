A decorator used in conjunction with [Container](orange.modularity.container.html) to 
enable injection of class instances in constructor calls.


```typescript
class Foo { /* ... */ }
class Bar { /* ... */ }

@Orange.Modularity.inject
class MyClass {
    constructor(private a: Foo, private b: Bar) {}
}

let container = new Orange.Modularity.Container();

let myFooSingleton = new Foo();
container.registerInstance(Foo, myFooSingleton);

container.resolve(MyClass);
```