export function patchFetch(): void {
    var _nativeFetch = window.fetch.bind(window);

    function _cleanFetch(url: RequestInfo | URL, opts?: RequestInit): Promise<Response> {
        if (opts && opts.headers) {
            if (opts.headers instanceof Headers) {
                opts.headers.delete('traceparent');
                opts.headers.delete('tracestate');
            } else if (typeof opts.headers === 'object' && !Array.isArray(opts.headers)) {
                delete opts.headers.traceparent;
                delete opts.headers.tracestate;
            }
        }
        return _nativeFetch(url, opts);
    }

    Object.defineProperty(window, 'fetch', {
        configurable: false,
        enumerable: true,
        get: function () { return _cleanFetch; },
        set: function () { /* ignore Datadog, ignore everyone */ }
    });
}