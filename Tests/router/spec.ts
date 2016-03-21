
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../../orange.d.ts"/>
/// <reference path="../helpers/TestFunctions.ts" />

describe(
    "Orange.Routing.Router",
    () => {
        var startUrl:string = window.location.pathname;
        
        var router: Orange.Routing.Router; 
        var currentPath: string;
        
        beforeEach((done) => {
            
            router = new Orange.Routing.Router();
            currentPath = null;
            
            router.route("/never", () => { throw new Error("should not be called")  });
            router.route("/zero", () => { currentPath = "/zero" });
            router.route("/one", () => { currentPath = "/one" });
            router.route("/two", () => { currentPath = "/two" });
            router.run();
            
            done();
        });
        
        var reset = () => window.history.pushState(null, "tests", startUrl);;
        
        afterEach((done) => {
            router.dispose();
            router = null;
            reset();
            done();
        });
        
        after((done) => {
            reset();
            done();
        });
        
        it("should dispatch to correct route handler", (done) => {
            router.navigate("/zero", null);
            assertEqual(currentPath, "/zero");
            assert(() => window.location.href.indexOf("/zero") != -1);
            
            router.navigate("/one", null);
            assertEqual(currentPath, "/one");
            assert(() => window.location.href.indexOf("/one") != -1);
            
            done();
        });
        
        it("should handle <a href> clicks", (done) => {
            
            var a = document.createElement("a");
            a.href = "/two";
            document.body.appendChild(a);
            
            try {
                a.click();
                
                assertEqual(currentPath, "/two");
                assert(() => window.location.href.indexOf("/two") != -1);
            }
            finally {
                document.body.removeChild(a);
            }
            
            done();
        });
        
        it("should handle javascript triggered navigation", (done) => {
           
            router.navigate("/zero", null);
            router.navigate("/one", null);
            
            window.history.back();
            
            setTimeout(() => {
                
                assertEqual(currentPath, "/zero");
                assert(() => window.location.href.indexOf("/zero") != -1);
                
                done();
            }, 50);
            
        });
    });