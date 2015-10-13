
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../../orange.d.ts"/>

function assert(f: () => boolean) {
    if (f()) return;
    throw new Error(String(f) + " failed");
}

function assertEqual(actual: any, expected: any) {
    if (actual !== expected) {
        throw new Error("Got: " + JSON.stringify(actual) + ", Expected: " + JSON.stringify(expected));
    }
}

describe(
    "Knockout Binding Tests",
    () => {
        describe("orange-vm", () => {
            var root: HTMLElement;
            var view: HTMLElement;

            var vm = {
                item: ko.observable({ prop: "xyz" })
            };

            before(
                done => {
                    $("#testingGround").html(`
                        <div id="orange-vm-test-root">
                            <div data-view="TestView" data-bind="orange-vm: item">
                            </div>
                        </div>
                        `);
                    root = document.getElementById("orange-vm-test-root");
                    view = <HTMLElement>root.querySelector("[data-view='TestView']");

                    var element = Orange.Controls.GetOrInitializeOrangeElement(view);
                    if (element.isInitialized)
                        done();
                    else {
                        element.addOnInitializedListener(() => done());
                    }

                    ko.applyBindings(vm, root);
                });
            after(
                done => {
                    ko.cleanNode(root);
                    $("#testingGround").html("");
                    done();
                });

            it("should set the knockout binding context of a ViewBase",
                done => {
                    var rootCtx = ko.contextFor(root).$data;
                    assertEqual(rootCtx, vm);

                    var viewCtx = ko.contextFor(view.querySelector(".content-wrapper")).$data;
                    assertEqual(viewCtx, vm.item());

                    done();
                })
            it("should set the dataContext property of a ViewBase",
                done => {
                    var orangeView = Orange.Controls.GetOrInitializeOrangeElement(view);
                    var dataContext = (<Orange.Controls.ViewBase>orangeView.control).dataContext;
                    assertEqual(dataContext, vm.item());
                    assertEqual(dataContext.prop, "xyz");
                    done();
                });
            it("should update dataContext and binding context based on knockout observable value",
                done => {
                    vm.item({ prop: "123" });
                    var orangeView = Orange.Controls.GetOrInitializeOrangeElement(view);
                    var dataContext = (<Orange.Controls.ViewBase>orangeView.control).dataContext;
                    assertEqual(dataContext, vm.item());
                    assertEqual(dataContext.prop, "123");
                    done();
                });
        });

        describe("orangeView", () => {
            
        });
    });
