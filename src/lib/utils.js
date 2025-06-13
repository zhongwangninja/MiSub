//
// src/lib/utils.js
//
export function extractNodeName(url) {
    if (!url) return '';
    url = url.trim();
    try {
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1 && hashIndex < url.length - 1) {
            return decodeURIComponent(url.substring(hashIndex + 1)).trim();
        }
        const protocolIndex = url.indexOf('://');
        if (protocolIndex === -1) return '';
        const protocol = url.substring(0, protocolIndex);
        const mainPart = url.substring(protocolIndex + 3).split('#')[0];
        switch (protocol) {
            case 'vmess': return JSON.parse(atob(mainPart)).ps || '';
            case 'trojan':
            case 'vless': return mainPart.substring(mainPart.indexOf('@') + 1).split(':')[0] || '';
            case 'ss':
                const atIndexSS = mainPart.indexOf('@');
                if (atIndexSS !== -1) return mainPart.substring(atIndexSS + 1).split(':')[0] || '';
                const decodedSS = atob(mainPart);
                const ssDecodedAtIndex = decodedSS.indexOf('@');
                if (ssDecodedAtIndex !== -1) return decodedSS.substring(ssDecodedAtIndex + 1).split(':')[0] || '';
                return '';
            default:
                if(url.startsWith('http')) return new URL(url).hostname;
                return '';
        }
    } catch (e) { return url.substring(0, 50); }
}