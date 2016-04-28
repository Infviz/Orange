
module Orange.Routing {

    class PathHandler {
        public path: string | RegExp;
        public handler: Function;

        constructor(path: string | RegExp, handler: Function) {
            if (typeof path === 'string')
                path = (<string>path).toLowerCase();
            
            this.path = path;
            this.handler = handler;
        }

        tryMatch(path: string) {
            
            var selfPath = this.path;
            
            if (selfPath === "*")
                return {};
            
            if (selfPath instanceof RegExp) {
                if (selfPath.test(path)) {
                    return selfPath.exec(path);
                }
            }
                
            return selfPath === path ? {} : null;
        }
    }

    export class Router {
        private paths: Array<PathHandler> = [];

        route(path: string | RegExp, handler: Function) {
            this.paths.push(new PathHandler(path, handler));
        }

        default(handler: Function) {
            this.route("*", handler);
        }

        run() {
            window.addEventListener("popstate", this.onpopstate);
            window.addEventListener("click", this.onclick);
            this.handleRoute(location.pathname);
        }

        navigate(navigatePath: string, state: any): boolean {
            let path = this.cleanPath(navigatePath);
            if (path === this.cleanPath(location.pathname))
                return;

            history.pushState(state, null, path);
            return this.handleRoute(path);
        }
        
        dispose() {
            window.removeEventListener("popstate", this.onpopstate);
            window.removeEventListener("click", this.onclick);
        }
        
        private onpopstate = (evnt: PopStateEvent) => {
            console.log("handle popstate: " + location.pathname);
            this.handleRoute(location.pathname);
        };
        
        private onclick = (e: MouseEvent) => {
            var elem = <HTMLAnchorElement>(e.target || e.srcElement);

            if (elem.tagName === "A" &&
                elem.target === "" &&
                elem.hostname === location.hostname) {

                let hasNavigated = this.navigate(elem.pathname, null);
                if (hasNavigated) {
                    e.preventDefault();
                }
            }
        };
        
        private cleanPath(path: string): string {
            
            // To lower case
            path = path.toLowerCase();
            
            // Remove trailing slash
            if (path.substr(-1) === '/') {
                path = path.substr(0, path.length - 1);
            }

            return path;
        }

        private handleRoute(path: string): boolean {
            for (var p of this.paths) {
                var match = p.tryMatch(path);
                if (match) {
                    p.handler(match);
                    return true;
                }
            }

            return false;
        }
    }

}
