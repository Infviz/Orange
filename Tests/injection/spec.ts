
/// <reference path="../../orange.d.ts"/>
/// <reference path="InjectionTestClass.ts" />
/// <reference path="../helpers/TestFunctions.ts" />


describe(
    "Container Tests",
    () => {

        describe("registerInstance", () => {

            let testClassA = new Injection.TestClassA();

            it("should register and resolve instance",
                async done => {

                    let container = new Orange.Modularity.Container();

                    container.registerInstance(Injection.TestClassA, testClassA);
                    let instancea = await container.resolve(Injection.TestClassA);
                    assertEqual(testClassA, instancea);

                    let { instance, success } = await container.tryResolve(Injection.TestClassA);
                    assertEqual(testClassA, instance);
                    assertEqual(success, true);

                    done();
                });

            it("should resolve not registered instance",
                async done => {

                    let container = new Orange.Modularity.Container();

                    let instancea = await container.resolve(Injection.TestClassA);
                    assert(() => instancea instanceof Injection.TestClassA);


                    let { instance, success } = await container.tryResolve(Injection.TestClassA);

                    (instance as Injection.TestClassA).someFunction();
                    assert(() => instance instanceof Injection.TestClassA);
                    assertEqual(success, true);

                    done();
                });

            it("should resolve class with dependencies via dependency array",
                async done => {

                    let container = new Orange.Modularity.Container();

                    let instancec = await container.resolve(Injection.TestClassC);

                    assert(() => instancec instanceof Injection.TestClassC);

                    container.registerInstance(Injection.TestClassC, instancec);

                    let { instance, success } = await container.tryResolve(Injection.TestClassC);

                    assertEqual(success, true);
                    assertEqual(instance, instancec);
                    assertEqual(instance, await container.resolve(Injection.TestClassC));

                    done();
                });

            it("should resolve class with dependencies via inject decorator",
                async done => {

                    let container = new Orange.Modularity.Container();

                    let instanced = await container.resolve(Injection.TestClassD);

                    assert(() => instanced instanceof Injection.TestClassD);

                    container.registerInstance(Injection.TestClassD, instanced);

                    let { instance, success } = await container.tryResolve(Injection.TestClassD);

                    assertEqual(success, true);
                    assertEqual(instance, instanced);
                    assertEqual(instance, await container.resolve(Injection.TestClassD));

                    done();
                });

        });

        describe("resolve",
            () => {
                let req: any;
                before(() => {
                    req = (<any>window).require;
                    (<any>window).require = (type: string) => {
                        if (type == "should/exist")
                            return class { id = "A" };
                        else
                            throw Error("Could not resolve module " + type);
                    }
                });
                after(() => { (<any>window).require = req; });

                it("should report errors from require",
                    async done => {
                        let container = new Orange.Modularity.Container();

                        assertEqual((await container.resolve("should/exist")).id, "A");

                        try {
                            let result = await container.resolve("should/not/exist");
                        }
                        catch (e) {
                            assertEqual(e.name, "ResolveError");
                            assertEqual(e.message, "Failed to resolve type 'should/not/exist', see innerError for details");
                            // assert(() => e instanceof Orange.Modularity.ResolveError);
                            assert(() => e.innerError instanceof Error);
                            assertEqual(e.innerError.message, "Could not resolve module should/not/exist");
                            return done();
                        }

                        done("failed");
                    })
            });

        describe("property injection",
            () => {
                it("should support property injection",
                    async done => {

                        let container = new Orange.Modularity.Container();
                        let instance = await container.resolve(Injection.TestClassE);
                        assert(() => instance.propA instanceof Injection.TestClassA);

                        done();
                    });

                it("should support property injection in base classes",
                    async done => {

                        class X extends Injection.TestClassE {

                        }

                        let container = new Orange.Modularity.Container();
                        let instance = await container.resolve(X);
                        assert(() => instance.propA instanceof Injection.TestClassA);

                        done();
                    });

                it("should support multiple property injection",
                    async done => {

                        class A {}
                        class B {}
                        class C {
                            @Orange.Modularity.dependency
                            a: A;
                            @Orange.Modularity.dependency
                            b: B;
                        }

                        let container = new Orange.Modularity.Container();
                        let instance = await container.resolve(C);
                        assert(() => instance.a instanceof A);
                        assert(() => instance.b instanceof B);

                        done();
                    });
            });
    });
