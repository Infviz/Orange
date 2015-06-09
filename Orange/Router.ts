
module Orange.Routing {

    class PathHandler {
        constructor(
            public path: string,
            public handler: Function)
        {
        }

        tryMatch(path: string) {
            if (this.path == "*")
                return {};
            return this.path == path ? { } : null;
        }
    }

    export class Router {
        private paths: Array<PathHandler> = [];

        route(path: string, handler: Function) {
            this.paths.push(new PathHandler(path, handler));
        }

        default(handler: Function) {
            this.route("*", handler);
        }

        run() {
            window.addEventListener("popstate", (e) => {
                this.handleRoute(location.pathname);
            });

            window.addEventListener("click", (e) => {
                var elem = <HTMLAnchorElement>e.srcElement;

                if (elem.tagName === "A" &&
                    elem.target === "" &&
                    elem.hostname === location.hostname)
                {
                    e.preventDefault();
                    this.navigate(elem.pathname, null);
                }
            });

            this.handleRoute(location.pathname);
        }

        navigate(path: string, state: any) {
            if (path === location.pathname)
                return;

            history.pushState(state, null, path);
            this.handleRoute(path);
        }

        private handleRoute(path: string) {
            for (var p of this.paths) {
                var match = p.tryMatch(path);
                if (match) {
                    p.handler();
                    return;
                }
            }
        }
    }

}
