

import _React from "react";
declare var React: typeof _React;

import ReactViewBase from "./ReactViewBase";

export default class MyReactView extends ReactViewBase<{ counter: number; }> {

    constructor() {
        super();
        this.state = {
            counter: 0
        };
    }

    render() {
        return <div>
            HELLO WORLD FROM ORANGE+REACT
            <p>{this.state.counter}</p>
            <button onClick={() => { this.setState({ counter: this.state.counter + 1 })}}>Clicker</button>
        </div>;
    }
}
