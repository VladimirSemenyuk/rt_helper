export function bind(target: any, key: string, descriptor: any) {
    return {
        configurable: true,
        get() {
            const value = descriptor.value.bind(this);

            Object.defineProperty(this, key, {
                configurable: true,
                value,
                writable: true,
            });

            return value;
        },
    };
}
