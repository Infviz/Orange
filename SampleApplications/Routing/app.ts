
/// <reference path="../../orange.d.ts" />

// client side routing

var router = new Orange.Routing.Router();
router.route("/", () => {
    console.log("handle root");
});
router.route("/foo", () => {
    console.log("handle foo");
});
router.route("/bar", () => {
    console.log("handle bar");
});
router.default(() => console.log("no handler"));
router.run();
