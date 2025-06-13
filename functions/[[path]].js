// --- 全局常量 ---
const KV_KEY_MAIN = 'misub_data_v1';
const KV_KEY_SETTINGS = 'worker_settings_v1';
const COOKIE_NAME = 'auth_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000;

// --- 核心工具函数 ---
async function createSignedToken(key, data) {
    if (!key || !data) throw new Error("Key and data are required for signing.");
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const dataToSign = encoder.encode(data);
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);
    return `${data}.${Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

async function verifySignedToken(key, token) {
    if (!key || !token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data] = parts;
    const expectedToken = await createSignedToken(key, data);
    return token === expectedToken ? data : null;
}

async function getUrl(targetUrl, userAgentHeader) {
    const newHeaders = new Headers({ 'User-Agent': `MISUB-Client/${userAgentHeader}` });
    return fetch(new Request(targetUrl, { headers: newHeaders, redirect: "follow" }));
}

// --- API 中间件 ---
async function authMiddleware(request, env) {
    if (!env.COOKIE_SECRET) {
        console.error("FATAL: COOKIE_SECRET environment variable is not set!");
        return false;
    }
    const cookie = request.headers.get('Cookie');
    const sessionCookie = cookie?.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
    if (!sessionCookie) return false;
    const token = sessionCookie.split('=')[1];
    const verifiedData = await verifySignedToken(env.COOKIE_SECRET, token);
    return verifiedData && (Date.now() - parseInt(verifiedData, 10) < SESSION_DURATION);
}

// --- API 路由逻辑 ---
async function handleApiRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '');

    if (path !== '/login') {
        if (!await authMiddleware(request, env)) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
    }

    try {
        switch (path) {
            case '/login': {
                if (request.method !== 'POST') return new Response(null, { status: 405 });
                const { password } = await request.json();
                if (password === env.ADMIN_PASSWORD) {
                    const token = await createSignedToken(env.COOKIE_SECRET, String(Date.now()));
                    const headers = new Headers({ 'Content-Type': 'application/json' });
                    headers.append('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION / 1000}`);
                    return new Response(JSON.stringify({ success: true }), { headers });
                }
                return new Response(JSON.stringify({ error: '密码错误' }), { status: 401 });
            }
            case '/data': {
                const misubs = await env.MISUB_KV.get(KV_KEY_MAIN, 'json') || [];
                const settings = await env.MISUB_KV.get(KV_KEY_SETTINGS, 'json') || {};
                const config = { FileName: settings.FileName || 'MISUB', mytoken: settings.mytoken || 'auto' };
                return new Response(JSON.stringify({ misubs, config }), { headers: { 'Content-Type': 'application/json' } });
            }
            case '/misubs': {
                 if (request.method !== 'POST') return new Response(null, { status: 405 });
                 const { misubs } = await request.json();
                 if (typeof misubs === 'undefined') return new Response(JSON.stringify({ success: false, message: '请求体中缺少 misubs 字段' }), { status: 400 });
                 await env.MISUB_KV.put(KV_KEY_MAIN, JSON.stringify(misubs));
                 return new Response(JSON.stringify({ success: true, message: '订阅源已保存' }));
            }
            case '/node_count': {
                 const { url: subUrl } = await request.json();
                 const response = await getUrl(subUrl, request.headers.get('User-Agent'));
                 if (!response.ok) return new Response(JSON.stringify({ count: 'N/A' }));
                 let text = await response.text();
                 let nodes;
                 try { nodes = atob(text).split('\n'); } catch(e) { nodes = text.split('\n'); }
                 const count = nodes.filter(line => line.trim().includes('://')).length;
                 return new Response(JSON.stringify({ count }), { headers: { 'Content-Type': 'application/json' }});
            }
        }
    } catch (e) {
        console.error(`API Error in path ${path}:`, e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
    
    return new Response('API route not found', { status: 404 });
}

// --- Cloudflare Pages Functions 入口 ---
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // /api/* 的请求由我们自己处理
    if (url.pathname.startsWith('/api/')) {
        return handleApiRequest(request, env);
    }
    
    // /sub 和 /token 的请求也由我们处理 (这里省略了订阅生成的完整逻辑，请使用你已有的)
    // const mytoken_settings = await env.MISUB_KV.get(KV_KEY_SETTINGS, 'json') || {};
    // const mytoken = mytoken_settings.mytoken || env.TOKEN || 'auto';
    // if (url.pathname === '/sub' || url.pathname === `/${mytoken}`) {
    //      return handleMisubRequest(request, env);
    // }

    // 其他所有请求，都交给 SvelteKit 生成的 _worker.js 来处理静态资源
    return next();
}