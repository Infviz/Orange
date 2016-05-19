
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../../orange.d.ts"/>
/// <reference path="TestControl.ts" />
/// <reference path="../helpers/TestFunctions.ts" />

describe(
    "Knockout Binding Tests",
    () => {
        describe("o-view-model", () => {
            var root: HTMLElement;
            var view: HTMLElement;

            var vm = {
                item: ko.observable({ prop: "xyz" })
            };

            before(
                done => {
                    $("#testingGround").html(`
                        <div id="orange-vm-test-root">
                            <div data-view="TestView" data-bind="o-view-model: item"></div>
                        </div>
                        `);
                    root = document.getElementById("orange-vm-test-root");
                    view = <HTMLElement>root.querySelector("[data-view='TestView']");

                    var element = Orange.Controls.GetOrInitializeOrangeElement(view);
                    
                    let isInitialized = () => {
                        ko.applyBindings(vm, root);
                        done();
                    }
                    
                    if (element.isInitialized)
                        isInitialized();
                    else
                        element.addOnInitializedListener(isInitialized);
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

        describe("o-binding", () => {
            let root: HTMLElement;
            let controlOneElement: HTMLElement;
            let controlTwoElement: HTMLElement;
            let controlThreeElement: HTMLElement;

            let elementOne: Orange.Controls.IOrangeElementExtension;
            let elementTwo: Orange.Controls.IOrangeElementExtension;
            let elementThree: Orange.Controls.IOrangeElementExtension;

            let controlOne: TestControl;
            let controlTwo: TestControl;
            let controlThree: TestControl;
            
            let staticStringValue = "Static string value!!!";
            let staticNumericValue = 10;
            let staticBooleanValue = true;

            let vm = {
                vmTitle: ko.observable('My Title'),
                vmContent: "My nice content",
                vmCallback: () => {  },
                vmObject: { someProp: "value", otherProp: 10},
                vmNull: <any>null
            };

            before(
                done => {
                    $("#testingGround").html(`
                        <div id="o-binding-test-root">
                        
                            <div 
                                data-control="TestControl"
                                class="control-one" 
                                data-bind="
                                    o-binding: { 
                                        title: vmTitle,
                                        content: vmContent,
                                        callback: vmCallback,
                                        someobject: vmObject,
                                        stringField: '${staticStringValue}',
                                        numberField: ${staticNumericValue},
                                        booleanField: ${staticBooleanValue},
                                        nullField: vmNull
                                    }">
                            </div>
                                
                            <div 
                                data-control="TestControl" 
                                class="control-two" 
                                data-bind="o-binding: { 
                                    title: vmTitle,
                                    mode: 'two-way'
                                }">
                            </div>
                            
                            <div 
                                data-control="TestControl" 
                                class="control-three" 
                                data-bind="
                                    o-binding: [
                                        { 
                                            title: vmTitle
                                        }, 
                                        { 
                                            dynamicProperty1: vmTitle,
                                            dynamicProperty2: '${staticStringValue}',
                                            dynamicProperty3: ${staticNumericValue},
                                            dynamicProperty4: ${staticBooleanValue},
                                            'allow-dynamic': true
                                        }
                                    ]">
                            </div>
                            
                        </div>
                        `);

                    root = document.getElementById("o-binding-test-root");

                    controlOneElement = <HTMLElement>root.querySelector(".control-one[data-control='TestControl']");
                    controlTwoElement = <HTMLElement>root.querySelector(".control-two[data-control='TestControl']");
                    controlThreeElement = <HTMLElement>root.querySelector(".control-three[data-control='TestControl']");

                    elementOne = Orange.Controls.GetOrInitializeOrangeElement(controlOneElement);
                    elementTwo = Orange.Controls.GetOrInitializeOrangeElement(controlTwoElement);
                    elementThree = Orange.Controls.GetOrInitializeOrangeElement(controlThreeElement);

                    let doneCb = () => {
                        if (elementOne.isInitialized && elementTwo.isInitialized && elementThree.isInitialized) {

                            controlOne = elementOne.control as TestControl;
                            controlTwo = elementTwo.control as TestControl;
                            controlThree = elementThree.control as TestControl;

                            done();
                        }
                    };

                    doneCb();
                    elementOne.addOnInitializedListener(doneCb);
                    elementTwo.addOnInitializedListener(doneCb);
                    elementThree.addOnInitializedListener(doneCb);

                    ko.applyBindings(vm, root);
                });

            after(
                done => {
                    ko.cleanNode(root);
                    $("#testingGround").html("");
                    done();
                });

            it("should set the property 'title' on all controls.",
                done => {
                    assertEqual(controlOne.title, vm.vmTitle());
                    
                    assertEqual(controlTwo.title, vm.vmTitle());
                    assertEqual(controlThree.title, vm.vmTitle());
                    done();
                });
                
            it("should handle different property types", 
                done => {
                    assertEqual(controlOne.content, vm.vmContent);
                    assertEqual(controlOne.someobject, vm.vmObject);
                    assertEqual(controlOne.callback, vm.vmCallback);
                    done();
                });

            it("should update the property 'title' on all controls.",
                done => {
                    vm.vmTitle("My new Title")
                    assertEqual(controlOne.title, vm.vmTitle());
                    assertEqual(controlTwo.title, vm.vmTitle());
                    assertEqual(controlThree.title, vm.vmTitle());
                    done();
                });

            it("should update the property 'vmTitle' on the viewModel",
                done => {
                    // title on controlOne is bound 'one-way' so changing its
                    // value should not update the vm or controlTwo in any way.
                    controlOne.changeTitle("Some other new title");
                    assert(() => controlOne.title !== vm.vmTitle());
                    
                    // title on controlTwo is bound 'two-way' so changing its
                    // value should update the vm property and therefore the 
                    // other control as well
                    controlTwo.changeTitle("Some other new title");
                    assertEqual(controlOne.title, vm.vmTitle());
                    assertEqual(controlTwo.title, vm.vmTitle());
                    
                    // reset title..
                    controlTwo.changeTitle(staticStringValue);
                    done();
                });

            it("should set a field on a control to a static value (and null)",
                done => {
                    assertEqual(controlOne.stringField, staticStringValue);
                    assertEqual(controlOne.numberField, staticNumericValue);
                    assertEqual(controlOne.booleanField, staticBooleanValue);
                    assertEqual(controlOne.nullField, null);
                    done();
                });
                
            it("should set dynamic (not 'visible') fields on a control with 'allow-dynamic' flag set to true",
                done => {
                    assertEqual((controlThree as any).dynamicProperty1, vm.vmTitle());
                    assertEqual((controlThree as any).dynamicProperty2, staticStringValue);
                    assertEqual((controlThree as any).dynamicProperty3, staticNumericValue);
                    assertEqual((controlThree as any).dynamicProperty4, staticBooleanValue);
                    done();
                });

        });

    });
