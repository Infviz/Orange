
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
        private listeners: Array<PathHandler> = [];

        route(path: string | RegExp, handler: Function) {
            this.paths.push(new PathHandler(path, handler));
        }

        listen(path: string | RegExp, handler: Function) {
            this.listeners.push(new PathHandler(path, handler));
        }

        unroute(path: string | RegExp) {
            // Keep paths not matching path parameter
            this.paths = this.paths.filter( p => {
                return p.path.toString() !== path.toString();
            });
        }
        
        default(handler: Function) {
            this.route("*", handler);
        }

        run() {
            window.addEventListener("popstate", this.onpopstate);
            window.addEventListener("click", this.onclick);
            this.handleRoute(location.pathname);
        }

        navigate(navigatePath: string, state: any = null): boolean {
            let path = this.cleanPath(navigatePath);
            if (path === this.cleanPath(location.pathname))
                return true;

            if (this.handleRoute(path)) {
                
                history.pushState(state, null, path);
                return true;
            }
            else {
                return false;
            }
        }
        
        dispose() {
            window.removeEventListener("popstate", this.onpopstate);
            window.removeEventListener("click", this.onclick);
        }
        
        private onpopstate = (evnt: PopStateEvent) => {
            this.handleRoute(location.pathname);
        };
        
        private onclick = (e: MouseEvent) => {
            let elem = <HTMLElement>(e.target || e.srcElement);
            
            let getAnchor: (element: HTMLElement) => HTMLAnchorElement = (element: HTMLElement) => {
                if (element == null)
                    return null;
                
                if (element.tagName == "A")
                    return <HTMLAnchorElement>element;
                
                return getAnchor(element.parentElement);
            } 
            
            let anchor = getAnchor(elem);
            
            if (anchor != null &&
                anchor.tagName === "A" &&
                anchor.target === "" &&
                (!anchor.hostname || anchor.hostname === location.hostname)) {

                let wasHandled = this.navigate(anchor.pathname, null);
                if (wasHandled) {
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

            for (let l of this.listeners) {
                var match = l.tryMatch(path);
                if (match) {
                    l.handler(match);
                }
            }

            for (let p of this.paths) {
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
