
/// <reference path="../../orange.d.ts" />


class TestControl extends Orange.Controls.Control {
    
    
    private _title : string;
    public get title() : string {
        return this._title;
    }
    public set title(v : string) {
        if (this._title === v) return;
        this._title = v;
        this.raisePropertyChanged(() => this.title);
    }
    
    public numberField: number = null;
    public stringField: string = null;
    public booleanField: boolean = null;
    
    constructor() {
        super();    
    }
    
    // used to test raisePropertyChanged
    public changeTitle(newTitle: string) {
        this.title = newTitle;
    }
    
}