

import _React from "react";
declare var React: typeof _React;

import ReactViewBase from "./ReactViewBase";
import SomethingService from "../Domain/SomethingService";

@Orange.Modularity.inject
export default class MyReactViewWithDep extends ReactViewBase {

    constructor(private somethingService: SomethingService) {
        super();
    }

    render() {
        return <div>{ this.somethingService.provideSomething() }</div>;
    }
}
