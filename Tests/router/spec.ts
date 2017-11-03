
/// <reference path="../../orange.d.ts"/>
/// <reference path="../helpers/TestFunctions.ts" />

describe(
    "Orange.Routing.Router",
    () => {
        var startUrl:string = window.location.pathname;
        
        var router: Orange.Routing.Router; 
        var lastHandledPath: string;
        
        beforeEach((done) => {
            
            router = new Orange.Routing.Router();
            lastHandledPath = null;
            
            router.route("/never", () => { throw new Error("should not be called")  });
            router.route("/zero", () => { lastHandledPath = "/zero" });
            router.route("/one", () => { lastHandledPath = "/one" });
            router.route("/two", () => { lastHandledPath = "/two" });
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
            let result = router.navigate("/zero", null);
            assertEqual(result, true);
            assertEqual(lastHandledPath, "/zero");
            assert(() => window.location.href.indexOf("/zero") != -1);
            
            result = router.navigate("/one", null);
            assertEqual(result, true);
            assertEqual(lastHandledPath, "/one");
            assert(() => window.location.href.indexOf("/one") != -1);
            
            result = router.navigate("/one", null);
            assertEqual(result, true);
            
            result = router.navigate("/nonExisting", null);
            assertEqual(result, false);
            
            done();
        });
        
        it("should handle redirects", (done) => {
            router.route("/redirect", () => { router.navigate('/one', null); });
            router.navigate("/one", null);
            assertEqual(lastHandledPath, "/one");
            assert(() => window.location.href.indexOf("/one") != -1);
            
            done();
        });
        
        it("should handle regex routes", (done) => {
            
            router.route(/\/a/, () => { lastHandledPath = "/a" });
            router.route(/\/aa/, () => { lastHandledPath = "/aa" });
            router.route(/\/aaa/, () => { lastHandledPath = "/aaa" });
            
            router.route(/\/bbb/, () => { lastHandledPath = "/bbb" });
            router.route(/\/bb/, () => { lastHandledPath = "/bb" });
            router.route(/\/b/, () => { lastHandledPath = "/b" });
            
            router.navigate("/a", null);
            assertEqual(lastHandledPath, "/a");
            assert(() => window.location.href.indexOf("/a") != -1);
            
            // /a prefixes /aaa and is registered before, so we expect the /\/a/ route to match
            router.navigate("/aaa", null);
            assertEqual(lastHandledPath, "/a");  
            assert(() => window.location.href.indexOf("/a") != -1);
            
            router.navigate("/b", null);
            assertEqual(lastHandledPath, "/b");
            assert(() => window.location.href.indexOf("/b") != -1);
            
            router.navigate("/bbb", null);
            assertEqual(lastHandledPath, "/bbb");
            assert(() => window.location.href.indexOf("/bbb") != -1);
            
            // avoids prefixing problem by matching end of string in regex
            
            router.route(/\/c$/, () => { lastHandledPath = "/c" });
            router.route(/\/cc$/, () => { lastHandledPath = "/cc" });
            router.route(/\/ccc$/, () => { lastHandledPath = "/ccc" });
            
            router.navigate("/c", null);
            assertEqual(lastHandledPath, "/c");
            assert(() => window.location.href.indexOf("/c") != -1);
            
            router.navigate("/ccc", null);
            assertEqual(lastHandledPath, "/ccc");  
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
                
                assertEqual(lastHandledPath, "/two");
                assert(() => window.location.href.indexOf("/two") != -1);
            }
            finally {
                document.body.removeChild(a);
            }
            
            done();
        });
        
        it("should handle clicks on <a href> with other content in", (done) => {
            
            var a = document.createElement("a");
            a.href = "/two";
            var b = document.createElement("span");
            a.appendChild(b);
            document.body.appendChild(a);
            
            try {
                b.click();
                
                assertEqual(lastHandledPath, "/two");
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
                
                assertEqual(lastHandledPath, "/zero");
                assert(() => window.location.href.indexOf("/zero") != -1);
                
                done();
            }, 400);
            
        });
        
        it("should not navigate if a route is removed", (done) => {
            router.navigate("/zero", null);
            router.unroute("/one");
            router.navigate("/one", null);
            assertEqual(lastHandledPath, "/zero");
            done();            
        })
        
        it("should fire events for any navigation", (done) => {
            
            let catchAll = new Array<string>();
            let oneHasFired = false;
            
            router.listen(new RegExp(".*"), (args: RegExpMatchArray) => {
                catchAll.push(args[0]);
            });
            
            router.listen("/one", () => {
                if (oneHasFired)
                    done("/one has already fired")
                oneHasFired = true;
            });
            
            router.navigate("/zero", null);
            router.navigate("/one", null);
            
            assertEqual(catchAll.length, 2);
            assertEqual(catchAll[0], "/zero");
            assertEqual(catchAll[1], "/one");
            
            assertEqual(oneHasFired, true);
            
            done();
        })
    });