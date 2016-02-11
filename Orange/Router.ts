
module Orange.Routing {

    class PathHandler {
		public path: string;
		public handler: Function;

        constructor(path: string, handler: Function) {
			this.path = path.toLowerCase();
			this.handler = handler;
        }

        tryMatch(path: string) {
            if (this.path == "*")
                return {};
            return this.path == path ? {} : null;
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
                    elem.hostname === location.hostname) {

                    let hasNavigated = this.navigate(elem.pathname, null);
					if (hasNavigated) {
						e.preventDefault();
					}
                }
            });

            this.handleRoute(location.pathname);
        }

        navigate(navigatePath: string, state: any): boolean {
            let path = this.cleanPath(navigatePath);
			if (path === this.cleanPath(location.pathname))
                return true;

            history.pushState(state, null, path);
            return this.handleRoute(path);
        }

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
                    p.handler();
                    return true;
                }
            }

			return false;
        }
    }

}
