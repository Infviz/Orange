
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../../orange.d.ts"/>
/// <reference path="InjectionTestClass.ts" />
/// <reference path="../helpers/TestFunctions.ts" />


describe(
    "Container Tests",
    () => {
        
        describe("registerInstance", () => {

            let testClassA = new Injection.TestClassA();
            
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
        
        describe("resolve", 
            () => {
                let req: any;
                before(()=> { 
                    req = (<any>window).require;
                    (<any>window).require = (type: string) => {
                        if (type == "should/exist")
                            return class { id = "A" };
                        else
                            throw Error("Could not resolve module " + type);
                    } 
                });
                after(()=> { (<any>window).require = req; });
                
                it("should report errors from require",
                    done => {
                        let container = new Orange.Modularity.Container();
                        
                        assertEqual(container.resolve("should/exist").id, "A");
                        
                        try {
                            let result = container.resolve("should/not/exist");
                        }
                        catch (e) {
                            assert(() => e instanceof Orange.Modularity.ResolveError);
                            assert(() => e.innerError instanceof Error);
                            assertEqual(e.innerError.message, "Could not resolve module should/not/exist");
                            return done();
                        }
                        
                        done("failed");
                    })
            })
    });
