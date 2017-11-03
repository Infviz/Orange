function assert(f: () => boolean) {
    if (f()) return;
    throw new Error(String(f) + " failed");
}

function assertEqual<T>(actual: T, expected: T) {
    if (actual !== expected) {
        throw new Error("Got: " + JSON.stringify(actual) + ", Expected: " + JSON.stringify(expected));
    }
}