declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidDocument(): R;
        }
    }
}
export {};
//# sourceMappingURL=setup.d.ts.map