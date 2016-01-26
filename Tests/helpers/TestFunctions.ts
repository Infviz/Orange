function assert(f: () => boolean) {
    if (f()) return;
    throw new Error(String(f) + " failed");
}

function assertEqual(actual: any, expected: any) {
    if (actual !== expected) {
        throw new Error("Got: " + JSON.stringify(actual) + ", Expected: " + JSON.stringify(expected));
    }
}