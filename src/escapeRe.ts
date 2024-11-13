export function globalEscapedRe(re: string) {
    return new RegExp(escapeRe(re), 'g');
}

export function escapeRe(re: string) {
    return re.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}