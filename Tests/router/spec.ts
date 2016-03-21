
/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../../orange.d.ts"/>
/// <reference path="../helpers/TestFunctions.ts" />

describe(
    "Orange.Routing.Router",
    () => {
        var startUrl:string = window.location.pathname;
        
        var router: Orange.Routing.Router; 
        var handledPath: string;
        
        beforeEach((done) => {
            
            router = new Orange.Routing.Router();
            handledPath = null;
            
            router.route("/never", () => { throw new Error("should not be called")  });
            router.route("/zero", () => { handledPath = "/zero" });
            router.route("/one", () => { handledPath = "/one" });
            router.route("/two", () => { handledPath = "/two" });
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
            assertEqual(handledPath, "/zero");
            assert(() => window.location.href.indexOf("/zero") != -1);
            
            router.navigate("/one", null);
            assertEqual(handledPath, "/one");
            assert(() => window.location.href.indexOf("/one") != -1);
            
            done();
        });
        
        it("should handle regex routes", (done) => {
            
            router.route(/\/a/, () => { handledPath = "/a" });
            router.route(/\/aa/, () => { handledPath = "/aa" });
            router.route(/\/aaa/, () => { handledPath = "/aaa" });
            
            router.route(/\/bbb/, () => { handledPath = "/bbb" });
            router.route(/\/bb/, () => { handledPath = "/bb" });
            router.route(/\/b/, () => { handledPath = "/b" });
            
            router.navigate("/a", null);
            assertEqual(handledPath, "/a");
            assert(() => window.location.href.indexOf("/a") != -1);
            
            // /a prefixes /aaa and is registered before, so we expect the /\/a/ route to match
            router.navigate("/aaa", null);
            assertEqual(handledPath, "/a");  
            assert(() => window.location.href.indexOf("/a") != -1);
            
            router.navigate("/b", null);
            assertEqual(handledPath, "/b");
            assert(() => window.location.href.indexOf("/b") != -1);
            
            router.navigate("/bbb", null);
            assertEqual(handledPath, "/bbb");
            assert(() => window.location.href.indexOf("/bbb") != -1);
            
            // avoids prefixing problem by matching end of string in regex
            
            router.route(/\/c$/, () => { handledPath = "/c" });
            router.route(/\/cc$/, () => { handledPath = "/cc" });
            router.route(/\/ccc$/, () => { handledPath = "/ccc" });
            
            router.navigate("/c", null);
            assertEqual(handledPath, "/c");
            assert(() => window.location.href.indexOf("/c") != -1);
            
            router.navigate("/ccc", null);
            assertEqual(handledPath, "/ccc");  
            assert(() => window.location.href.indexOf("/ccc") != -1);
            
            done();
        });
        
        it("should pass variables from regex match to handler", () => {
            
            var called = false;
            router.route(/\/vars\/(\d+)/, 
                (data: any) => { 
                    called = true;
                    assertEqual(data[1], "123"); 
                });
            router.navigate("/vars/123", null);
            assertEqual(true, called);
            
        });
        
        it("should handle <a href> clicks", (done) => {
            
            var a = document.createElement("a");
            a.href = "/two";
            document.body.appendChild(a);
            
            try {
                a.click();
                
                assertEqual(handledPath, "/two");
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
                
                assertEqual(handledPath, "/zero");
                assert(() => window.location.href.indexOf("/zero") != -1);
                
                done();
            }, 200);
            
        });
    });