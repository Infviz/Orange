A decorator used in conjunction with [Container](orange.modularity.container.html) to 
enable injection of dependencies as properties


```typescript
class Foo { /* ... */ }

class MyClass {
    @Orange.Modularity.dependency
    public a: Foo;

    constructor() {}
}

let container = new Orange.Modularity.Container();

let myFooSingleton = new Foo();
container.registerInstance(Foo, myFooSingleton);

const myObj = container.resolve(MyClass);
assert(myObj.a === myFooSingleton);
```