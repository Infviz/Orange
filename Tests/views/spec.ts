
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../../orange.d.ts"/>
/// <reference path="../helpers/TestFunctions.ts" />


describe(
    "Knockout Views Tests",
    () => {

        describe("KnockoutViewBase", () => {
            var root: HTMLElement;
            var view: HTMLElement;
            var orangeElement: Orange.Controls.IOrangeElementExtension;

            let testViewTemplate =
                `<script id="Basic-Knockout-View-Model" type="text/html">
                    <div data-test-id="Basic-Knockout-View-Content"></div>
                </script>`;

            (<any>window)["KnockoutViewTests_TestViewViewModel"] = class {
                testId: string = 'Basic-Knockout-View-Model';
            };

            let wasDisposed = ko.observable<boolean>(false);

            (<any>window)["KnockoutViewTests_TestView"] =
                class extends Orange.Controls.KnockoutViewBase {

                    private static dependencies = () => [(<any>window)["KnockoutViewTests_TestViewViewModel"]];
                    constructor(vm: any) { super('Basic-Knockout-View-Model', vm); }

                    public onElementSetCalled = false;
                    public onApplyTemplateCalled = false;
                    public onApplyBindingsCalled = false;
                    public onControlCreatedCalled = false;
                    public disposeCalled = false;

                    protected onElementSet(): void {
                        super.onElementSet();
                        this.onElementSetCalled = true;
                    }

                    protected onApplyTemplate(): void {
                        super.onApplyTemplate();
                        this.onApplyTemplateCalled = true;
                    }

                    protected onApplyBindings(): void {
                        super.onApplyBindings();
                        this.onApplyBindingsCalled = true;
                    }

                    protected onControlCreated(): void {
                        super.onControlCreated();
                        this.onControlCreatedCalled = true;
                    }

                    public dispose(): void {
                        super.dispose();
                        this.disposeCalled = true;
                        wasDisposed(true);
                    }
                };

            before(
                done => {
                    $("#testingGround").html(`
                        ${testViewTemplate}
                        <div id="orange-knockout-view-base-test-root">
                            <div data-view="KnockoutViewTests_TestView">
                            </div>
                        </div>
                        `);
                    root = document.getElementById("orange-knockout-view-base-test-root");
                    view = <HTMLElement>root.querySelector("[data-view='KnockoutViewTests_TestView']");

                    orangeElement = Orange.Controls.GetOrInitializeOrangeElement(view);
                    if (orangeElement.isInitialized)
                        done();
                    else {
                        orangeElement.addOnInitializedListener(() => done());
                    }
                });
            after(
                done => {
                    ko.cleanNode(root);
                    $("#testingGround").html("");

                    (<any>window)["KnockoutViewTests_TestViewViewModel"] = null;
                    (<any>window)["KnockoutViewTests_TestView"] = null;

                    done();
                });

            it("should inject view template",
                done => {

                    let element = orangeElement.element.firstElementChild as HTMLElement;
                    assertEqual(element.getAttribute('data-test-id'), 'Basic-Knockout-View-Content');

                    done();
                })
            it("should inject context",
                done => {
                    let kovb = (orangeElement.control as Orange.Controls.KnockoutViewBase);

                    assertEqual(kovb.dataContext.testId, 'Basic-Knockout-View-Model');

                    done();
                });
            it("should call onElementSet, onApplyTemplate, onApplyBindings and onControlCreated",
                done => {
                    let c = <any>orangeElement.control;

                    assertEqual(c.onElementSetCalled, true);
                    assertEqual(c.onApplyTemplateCalled, true);
                    assertEqual(c.onApplyBindingsCalled, true);
                    assertEqual(c.onControlCreatedCalled, true);

                    done();
                });
            it("should call dispose",
                done => {
                    let c = <any>orangeElement.control;

                    assertEqual(c.disposeCalled, false);

                    view.remove();

                    wasDisposed
                        .subscribe(isDisposed => {
                            assertEqual(c.disposeCalled, true);
                            done();
                        });

                });
        });

        describe("Nested KnockoutViewBase", () => {
            let root: HTMLElement;
            let parentView: HTMLElement;
            let childView: HTMLElement;
            let parentOrangeElement: Orange.Controls.IOrangeElementExtension;
            let childOrangeElement: Orange.Controls.IOrangeElementExtension;

            let testViewParentTemplate =
                `<script id="Nested-Parent-Knockout-View" type="text/html">
                    <div data-test-id="Nested-Parent-Knockout-View-Content"></div>
                    <div data-view="NestedKnockoutViewTests.ChildTestView"></div>
                </script>`;

            let testViewChildTemplate =
                `<script id="Nested-Child-Knockout-View" type="text/html">
                    <div data-test-id="Nested-Child-Knockout-View-Content"></div>
                </script>`;

            (<any>window)['NestedKnockoutViewTests'] = {};
            let namespace = (<any>window)["NestedKnockoutViewTests"];

            namespace['TestViewParentViewModel'] = class {
                testId: string = 'Nested-Parent-Knockout-View-Model';
            };

            namespace['TestViewChildViewModel'] = class {
                testId: string = 'Nested-Child-Knockout-View-Model';
            };

            let parentWasDisposed = ko.observable<boolean>(false);
            let childWasDisposed = ko.observable<boolean>(false);

            namespace['ParentTestView'] =
                class extends Orange.Controls.KnockoutViewBase {

                    private static NestedParentKnockoutViewId = 'Nested-Parent-Knockout-View-Id';

                    private static dependencies = () => [namespace["TestViewParentViewModel"]];
                    constructor(vm: any) { super('Nested-Parent-Knockout-View', vm); }

                    public onElementSetCalled = false;
                    public onApplyTemplateCalled = false;
                    public onApplyBindingsCalled = false;
                    public onControlCreatedCalled = false;
                    public disposeCalled = false;

                    protected onElementSet(): void {
                        super.onElementSet();
                        this.onElementSetCalled = true;
                    }

                    protected onApplyTemplate(): void {
                        super.onApplyTemplate();
                        this.onApplyTemplateCalled = true;
                    }

                    protected onApplyBindings(): void {
                        super.onApplyBindings();
                        this.onApplyBindingsCalled = true;
                    }

                    protected onControlCreated(): void {
                        super.onControlCreated();
                        this.onControlCreatedCalled = true;
                    }

                    public dispose(): void {
                        super.dispose();
                        this.disposeCalled = true;
                        parentWasDisposed(true);
                    }
                };

            namespace['ChildTestView'] =
                class extends Orange.Controls.KnockoutViewBase {

                    private static NestedChildKnockoutViewId = 'Nested-Child-Knockout-View-Id';

                    private static dependencies = () => [namespace['TestViewChildViewModel']];
                    constructor(vm: any) { super('Nested-Child-Knockout-View', vm); }

                    public onElementSetCalled = false;
                    public onApplyTemplateCalled = false;
                    public onApplyBindingsCalled = false;
                    public onControlCreatedCalled = false;
                    public disposeCalled = false;

                    protected onElementSet(): void {
                        super.onElementSet();
                        this.onElementSetCalled = true;
                    }

                    protected onApplyTemplate(): void {
                        super.onApplyTemplate();
                        this.onApplyTemplateCalled = true;
                    }

                    protected onApplyBindings(): void {
                        super.onApplyBindings();
                        this.onApplyBindingsCalled = true;
                    }

                    protected onControlCreated(): void {
                        super.onControlCreated();
                        this.onControlCreatedCalled = true;
                    }

                    public dispose(): void {
                        super.dispose();
                        this.disposeCalled = true;
                        childWasDisposed(true);
                    }
                };

            before(
                done => {
                    $('#testingGround').html(`
                        ${testViewParentTemplate} 
                        ${testViewChildTemplate}
                        <div id="orange-nested-knockout-view-test-root">
                            <div data-view="NestedKnockoutViewTests.ParentTestView"></div>
                        </div>
                        `);

                    root = document.getElementById('orange-nested-knockout-view-test-root');

                    parentView = <HTMLElement>root.querySelector(`[data-view="NestedKnockoutViewTests.ParentTestView"]`);

                    let parentDoneCb = () => {
                        childView = <HTMLElement>root.querySelector(`[data-view="NestedKnockoutViewTests.ChildTestView"]`);
                        childOrangeElement = Orange.Controls.GetOrInitializeOrangeElement(childView);
                        if (childOrangeElement.isInitialized)
                            done();
                        else
                            childOrangeElement.addOnInitializedListener(() => done());
                    }

                    parentOrangeElement = Orange.Controls.GetOrInitializeOrangeElement(parentView);
                    if (parentOrangeElement.isInitialized)
                        parentDoneCb();
                    else
                        parentOrangeElement.addOnInitializedListener(() => parentDoneCb());
                });

            after(
                done => {
                    ko.cleanNode(root);
                    $('#testingGround').html('');
                    (<any>window)['NestedKnockoutViewTests'] = null;
                    done();
                });

            it("should inject parent and child view templates",
                done => {

                    let parentElement = parentOrangeElement.element.firstElementChild as HTMLElement;
                    assertEqual(parentElement.getAttribute('data-test-id'), 'Nested-Parent-Knockout-View-Content');

                    let childElement = childOrangeElement.element.firstElementChild as HTMLElement;
                    assertEqual(childElement.getAttribute('data-test-id'), 'Nested-Child-Knockout-View-Content');

                    done();
                })
            it("should inject context on parent and child",
                done => {
                    let pkovb = (parentOrangeElement.control as Orange.Controls.KnockoutViewBase);
                    assertEqual(pkovb.dataContext.testId, 'Nested-Parent-Knockout-View-Model');

                    let ckovb = (childOrangeElement.control as Orange.Controls.KnockoutViewBase);
                    assertEqual(ckovb.dataContext.testId, 'Nested-Child-Knockout-View-Model');

                    done();
                });
            it("should call onElementSet, onApplyTemplate and onApplyBindings on parent and child view",
                done => {
                    let c = <any>parentOrangeElement.control;

                    assertEqual(c.onElementSetCalled, true);
                    assertEqual(c.onApplyTemplateCalled, true);
                    assertEqual(c.onApplyBindingsCalled, true);

                    done();
                });
            it("should call dispose on parent and child wiev",
                done => {
                    let pc = <any>parentOrangeElement.control;
                    let cc = <any>childOrangeElement.control;

                    parentView.remove();

                    let checkBothDisposed = () => {

                        if (status.childCb === true && status.parentCb === true) {
                            assertEqual(pc.disposeCalled, true);
                            assertEqual(cc.disposeCalled, true);
                            done();
                        }
                    }

                    let status = { parentCb: false, childCb: false };

                    parentWasDisposed
                        .subscribe(isDisposed => {
                            status.parentCb = true;
                            checkBothDisposed();
                        });

                    childWasDisposed
                        .subscribe(isDisposed => {
                            status.childCb = true;
                            checkBothDisposed();
                        });

                });
        });

        describe("Nested KnockoutViewBase and Control", () => {
            let root: HTMLElement;
            let parentView: HTMLElement;
            let childView: HTMLElement;
            let parentOrangeElement: Orange.Controls.IOrangeElementExtension;
            let childOrangeElement: Orange.Controls.IOrangeElementExtension;

            let testViewParentTemplate =
                `<script id="Nested-Parent-Knockout-View" type="text/html">
                    <div data-test-id="Nested-Parent-Knockout-View-Content"></div>
                    <div data-view="NestedKnockoutViewTestsAndControl.ChildTestView" data-bind="o-view-model: childVm"></div>
                </script>`;

            let controlTemplate =
                `<div>
                    <span class="my-template-header" data-bind="text: header"></span>
                    <span class="my-template-content" data-bind="text: content"></span>
                </div>`;

            let testViewChildTemplate =
                `<script id="Nested-Child-Knockout-View" type="text/html">
                    <div data-test-id="Nested-Child-Knockout-View-Content"></div>
                    <div data-control="NestedKnockoutViewTestsAndControl.BasicControl">
                        <div data-control-template="content-template" data-bind="o-stop-bindings">
                            ${controlTemplate}
                        </div>
                    </div>
                </script>`;

            (<any>window)['NestedKnockoutViewTestsAndControl'] = {};
            let namespace = (<any>window)["NestedKnockoutViewTestsAndControl"];
            
            let controlWasDisposed = ko.observable<boolean>(false);
            
            let basicControl = class extends Orange.Controls.Control {

                public template: string = null;

                public disposeCalled = false;
                
                constructor() {
                    super();
                }

                protected onElementSet(): void {
                    super.onElementSet();

                    let tplContainer = this.element.querySelector(`[data-control-template="content-template"]`) as HTMLElement;
                    this.template = tplContainer.innerHTML;

                    assert(() => this.template.indexOf(`<span class="my-template-header" data-bind="text: header"></span>`) > -1);
                    assert(() => this.template.indexOf(`<span class="my-template-content" data-bind="text: content"></span>`) > -1);

                    this.element.innerHTML = "";
                }

                protected onControlCreated(): void {
                    super.onControlCreated();

                    this.element.innerHTML = this.template;

                    ko.applyBindingsToDescendants(ko.contextFor(this.element), this.element);
                }

                public dispose(): void {
                    super.dispose();
                    this.disposeCalled = true;
                    controlWasDisposed(true);
                }
            }

            namespace['BasicControl'] = basicControl;


            namespace['TestViewParentViewModel'] = class {
                testId: string = 'Nested-Parent-Knockout-View-Model';
                childVm = ko.observable({
                    testId: 'Nested-Child-Knockout-View-Model',
                    content: "my content",
                    header: ko.observable<string>("my header")
                });
            };

            namespace['TestViewChildViewModel'] = class {
                testId: string = 'Nested-Child-Knockout-View-Model';
                content: string = "my content";
                header: KnockoutObservable<string> = ko.observable<string>("my header");
            };

            let parentWasDisposed = ko.observable<boolean>(false);
            let childWasDisposed = ko.observable<boolean>(false);

            namespace['ParentTestView'] =
                class extends Orange.Controls.KnockoutViewBase {

                    private static NestedParentKnockoutViewId = 'Nested-Parent-Knockout-View-Id';

                    private static dependencies = () => [namespace["TestViewParentViewModel"]];
                    constructor(vm: any) { super('Nested-Parent-Knockout-View', vm); }

                    public onElementSetCalled = false;
                    public onApplyTemplateCalled = false;
                    public onApplyBindingsCalled = false;
                    public onControlCreatedCalled = false;
                    public disposeCalled = false;

                    protected onElementSet(): void {
                        super.onElementSet();
                        this.onElementSetCalled = true;
                    }

                    protected onApplyTemplate(): void {
                        super.onApplyTemplate();
                        this.onApplyTemplateCalled = true;
                    }

                    protected onApplyBindings(): void {
                        super.onApplyBindings();
                        this.onApplyBindingsCalled = true;
                    }

                    protected onControlCreated(): void {
                        super.onControlCreated();
                        this.onControlCreatedCalled = true;
                    }

                    public dispose(): void {
                        super.dispose();
                        this.disposeCalled = true;
                        parentWasDisposed(true);
                    }
                };

            namespace['ChildTestView'] =
                class extends Orange.Controls.KnockoutViewBase {

                    private static NestedChildKnockoutViewId = 'Nested-Child-Knockout-View-Id';

                    //private static dependencies = () => [namespace['TestViewChildViewModel']];
                    constructor(/*vm: any*/) { super('Nested-Child-Knockout-View'/*, vm*/); }

                    public onElementSetCalled = false;
                    public onApplyTemplateCalled = false;
                    public onApplyBindingsCalled = false;
                    public onControlCreatedCalled = false;
                    public disposeCalled = false;

                    protected onElementSet(): void {
                        super.onElementSet();
                        this.onElementSetCalled = true;
                    }

                    protected onApplyTemplate(): void {
                        super.onApplyTemplate();
                        this.onApplyTemplateCalled = true;
                    }

                    protected onApplyBindings(): void {
                        super.onApplyBindings();
                        this.onApplyBindingsCalled = true;
                    }

                    protected onControlCreated(): void {
                        super.onControlCreated();
                        this.onControlCreatedCalled = true;
                    }

                    public dispose(): void {
                        super.dispose();
                        this.disposeCalled = true;
                        childWasDisposed(true);
                    }
                };


            before(
                done => {
                    $('#testingGround').html(`
                        ${testViewParentTemplate} 
                        ${testViewChildTemplate}
                        <div id="orange-vms-and-control-test-root">
                            <div data-view="NestedKnockoutViewTestsAndControl.ParentTestView"></div>
                        </div>
                        `);

                    root = document.getElementById('orange-vms-and-control-test-root');

                    parentView = <HTMLElement>root.querySelector(`[data-view="NestedKnockoutViewTestsAndControl.ParentTestView"]`);

                    let parentDoneCb = () => {
                        childView = <HTMLElement>root.querySelector(`[data-view="NestedKnockoutViewTestsAndControl.ChildTestView"]`);
                        childOrangeElement = Orange.Controls.GetOrInitializeOrangeElement(childView);
                        if (childOrangeElement.isInitialized)
                            done();
                        else
                            childOrangeElement.addOnInitializedListener(() => done());
                    }

                    parentOrangeElement = Orange.Controls.GetOrInitializeOrangeElement(parentView);
                    if (parentOrangeElement.isInitialized)
                        parentDoneCb();
                    else
                        parentOrangeElement.addOnInitializedListener(() => parentDoneCb());
                });

            after(
                done => {
                    ko.cleanNode(root);
                    $('#testingGround').html('');
                    (<any>window)['NestedKnockoutViewTestsAndControl'] = null;
                    done();
                });

            it("should inject parent and child view templates",
                done => {

                    let parentElement = parentOrangeElement.element.firstElementChild as HTMLElement;
                    assertEqual(parentElement.getAttribute('data-test-id'), 'Nested-Parent-Knockout-View-Content');

                    let childElement = childOrangeElement.element.firstElementChild as HTMLElement;
                    assertEqual(childElement.getAttribute('data-test-id'), 'Nested-Child-Knockout-View-Content');

                    done();
                })
            it("should retrieve and apply control content template",
                done => {
                    let ctrlElement = childOrangeElement.element.querySelector(`[data-control="NestedKnockoutViewTestsAndControl.BasicControl"]`) as HTMLElement;
                    let ctrlOrangeElement = Orange.Controls.GetOrInitializeOrangeElement(ctrlElement);

                    assert(() => ctrlOrangeElement.isInitialized);

                    let ctrl = ctrlOrangeElement.control;

                    let headerElement = ctrl.element.querySelector('[class="my-template-header"]') as HTMLElement;
                    let contentElement = ctrl.element.querySelector('[class="my-template-content"]') as HTMLElement;

                    assertEqual(headerElement.innerHTML, 'my header');
                    assertEqual(contentElement.innerHTML, 'my content');

                    done();
                })
            it("should inject context on parent and child",
                done => {
                    let pkovb = (parentOrangeElement.control as Orange.Controls.KnockoutViewBase);
                    assertEqual(pkovb.dataContext.testId, 'Nested-Parent-Knockout-View-Model');

                    let ckovb = (childOrangeElement.control as Orange.Controls.KnockoutViewBase);
                    assertEqual(ckovb.dataContext.testId, 'Nested-Child-Knockout-View-Model');

                    done();
                });
            it("should recreate children when dataContext is updated on root view model",
                done => {

                    let childPreRecreateId = childOrangeElement.control.id;

                    let view = parentOrangeElement.control as Orange.Controls.KnockoutViewBase;
                    view.dataContext = {
                        testId: 'Nested-Parent-Knockout-View-Model-2',
                        childVm: {
                            testId: 'Nested-Child-Knockout-View-Model-2',
                            content: "my content 2",
                            header: ko.observable<string>("my header 2")
                        }
                    };

                    childWasDisposed
                        .subscribe(isDisposed => {
                            assertEqual((<any>childOrangeElement.control).disposeCalled, true);
                            childWasDisposed(false); // reset..
                            controlWasDisposed(false); // reset..
                            
                            checksWhenRootDataContextChanged();
                        });

                    let checksWhenRootDataContextChanged =
                        () => {
                            let pkovb = (parentOrangeElement.control as Orange.Controls.KnockoutViewBase);
                            assertEqual(pkovb.dataContext.testId, 'Nested-Parent-Knockout-View-Model-2');

                            let afterRecreationChecks =
                                () => {

                                    let childElement = childOrangeElement.element.firstElementChild as HTMLElement;
                                    assertEqual(childElement.getAttribute('data-test-id'), 'Nested-Child-Knockout-View-Content');

                                    let ckovb = (childOrangeElement.control as Orange.Controls.KnockoutViewBase);
                                    assertEqual(ckovb.dataContext.testId, 'Nested-Child-Knockout-View-Model-2');

                                    assert(() => childOrangeElement.control.id != childPreRecreateId);

                                    let ctrlOrangeElement = Orange.Controls.GetOrInitializeOrangeElement(
                                        childOrangeElement.element.querySelector(`[data-control="NestedKnockoutViewTestsAndControl.BasicControl"]`) as HTMLElement);

                                    let afterControlInitialized =
                                        () => {
                                            assert(() => ctrlOrangeElement.isInitialized);

                                            let ctrl = ctrlOrangeElement.control;

                                            let headerElement = ctrl.element.querySelector('[class="my-template-header"]') as HTMLElement;
                                            let contentElement = ctrl.element.querySelector('[class="my-template-content"]') as HTMLElement;

                                            assertEqual(headerElement.innerHTML, 'my header 2');
                                            assertEqual(contentElement.innerHTML, 'my content 2');
                                            
                                            done();
                                        }

                                    if (ctrlOrangeElement.isInitialized)
                                        afterControlInitialized();
                                    else
                                        ctrlOrangeElement.addOnInitializedListener(() => afterControlInitialized());
                                };

                            childView = <HTMLElement>root.querySelector(`[data-view="NestedKnockoutViewTestsAndControl.ChildTestView"]`);
                            childOrangeElement = Orange.Controls.GetOrInitializeOrangeElement(childView);
                            if (childOrangeElement.isInitialized)
                                afterRecreationChecks();
                            else
                                childOrangeElement.addOnInitializedListener(() => afterRecreationChecks());
                        };
                })
            it("should call dispose on control",
                done => {

                    let ctrlOrangeElement = Orange.Controls.GetOrInitializeOrangeElement(
                        childOrangeElement.element.querySelector(`[data-control="NestedKnockoutViewTestsAndControl.BasicControl"]`) as HTMLElement);
                        
                    controlWasDisposed
                        .subscribe(isDisposed => {
                            
                            assertEqual((<any>ctrlOrangeElement.control).disposeCalled, true);
                        });
                        
                    done();
                });
        });
    });
