export function normalizeHost(h) {
    return (h || "").replace(/^www\./, "");
};

export function endsWithHost(host, d) {
    host = normalizeHost(host); return host === d || host.endsWith("." + d);
};

export function isBlocked(host, list) {
    host = normalizeHost(host);
    return (list || []).some(d => endsWithHost(host, d));
};
