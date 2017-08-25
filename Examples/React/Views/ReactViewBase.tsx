// import + declare is just some trickery to avoid <reference> hell
import _React from "react";
import _ReactDom from "react-dom";
declare const React: typeof _React;
declare const ReactDOM: typeof _ReactDom;

export default abstract class ReactViewBase<S = {}> extends Orange.Controls.Control {
    private _initialState: S;

    constructor() {
        super();
    }

    protected onElementSet(): void {
        let component = this.getComponent();
        let element = React.createElement(component);
        ReactDOM.render(element, this.element);
    }

    protected get state(): S {
        if (this.instance)
            return this.instance.state;
        else
            return this._initialState;
    }

    // must only be called from constructor
    protected set state(value: S) {
        this._initialState = value;
    }

    private instance = null;

    private getComponent() {
        let self = this;
        let initialState = this._initialState;
        this._initialState = null;

        return class extends React.Component<{}, S> {
            constructor() {
                super();
                this.state = initialState;
                self.instance = this;
            }

            render() {
                return self.render();
            }
        }
    }

    protected setState<K extends keyof S>(state: Pick<S, K>, callback?: () => any): void {
        let finalize = () => {
            if (callback) {
                callback();
            }
        };

        if (this.instance) {
            this.instance.setState(state, finalize);
        }
        else {
            this._initialState = this.instance.state;
            finalize();
        }
    }

    protected abstract render(): JSX.Element; 
}