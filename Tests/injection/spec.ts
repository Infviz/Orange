
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../../orange.d.ts"/>
/// <reference path="InjectionTestClass.ts" />
/// <reference path="../helpers/TestFunctions.ts" />


describe(
    "Container Tests",
    () => {
        
        describe("registerInstance", () => {

            let testClassA = new Injection.TestClassA();
            
            before(
                done => {
                    
                    done();
                });
                
            after(
                done => {
                
                    done();
                });

            it("should register and resolve instance",
                done => {
                    
                    let container = new Orange.Modularity.Container();
                    
                    container.registerInstance(Injection.TestClassA, testClassA);
                    let instancea = container.resolve(Injection.TestClassA);
                    assertEqual(testClassA, instancea);
                    
                    let { instance, success } = container.tryResolve(Injection.TestClassA);
                    assertEqual(testClassA, instance);
                    assertEqual(success, true);
                    
                    done();
                });
            
            it("should resolve not registered instance",
                done => {
                    
                    let container = new Orange.Modularity.Container();
                    
                    let instancea = container.resolve(Injection.TestClassA);
                    assert(() => instancea instanceof Injection.TestClassA);
                    
                    
                    let { instance, success } = container.tryResolve(Injection.TestClassA);
                    
                    (instance as Injection.TestClassA).someFunction();
                    assert(() => instance instanceof Injection.TestClassA);
                    assertEqual(success, true);
                    
                    done();
                });
            
            it("should resolve class with dependencies via dependency array",
                done => {
                    
                    let container = new Orange.Modularity.Container();
                    
                    let instancec = container.resolve(Injection.TestClassC);
                    
                    assert(() => instancec instanceof Injection.TestClassC);
                    
                    container.registerInstance(Injection.TestClassC, instancec);
                    
                    let { instance, success } = container.tryResolve(Injection.TestClassC);
                    
                    assertEqual(success, true);
                    assertEqual(instance, instancec);
                    assertEqual(instance, container.resolve(Injection.TestClassC));
                    
                    done();
                });
                
            it("should resolve class with dependencies via inject decorator",
                done => {
                    
                    let container = new Orange.Modularity.Container();
                    
                    let instanced = container.resolve(Injection.TestClassD);
                    
                    assert(() => instanced instanceof Injection.TestClassD);
                    
                    container.registerInstance(Injection.TestClassD, instanced);
                    
                    let { instance, success } = container.tryResolve(Injection.TestClassD);
                    
                    assertEqual(success, true);
                    assertEqual(instance, instanced);
                    assertEqual(instance, container.resolve(Injection.TestClassD));
                    
                    done();
                });
        });
        
    });
