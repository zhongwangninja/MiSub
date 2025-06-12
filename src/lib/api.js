export async function fetchInitialData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            console.error("Session invalid or API error, status:", response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
        return null;
    }
}

export async function saveMisubs(misubs) {
    try {
        const response = await fetch('/api/misubs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ misubs })
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: '网络请求失败' };
    }
}

export async function fetchNodeCount(subUrl) {
    try {
        const response = await fetch('/api/node_count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: subUrl })
        });
        if (!response.ok) return { count: 'N/A' };
        return await response.json();
    } catch (error) {
        return { count: 'N/A' };
    }
}