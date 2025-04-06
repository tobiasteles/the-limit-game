// public/js/utils.js
export function lightenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return `#${(1 << 24 | (R < 255 ? R < 1 ? 1 : R : 255) << 16 | (G < 255 ? G < 1 ? 1 : G : 255) << 8 | (B < 255 ? B < 1 ? 1 : B : 255)).toString(16).slice(1)}`;
}

export function darkenColor(hex, percent) {
    return lightenColor(hex, -percent);
}