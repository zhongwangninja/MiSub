// --- 全局常量 ---
const KV_KEY_MAIN = 'misub_data_v1';
const KV_KEY_SETTINGS = 'worker_settings_v1';
const COOKIE_NAME = 'auth_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000;

// --- 核心工具函数 (确保这些函数是完整的) ---
async function createSignedToken(key, data) {
    if (!key || !data) {
        console.error("[FATAL] createSignedToken: Key or data is missing.");
        throw new Error("Key and data are required for signing.");
    }
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

// ... 此处省略其他所有无需日志的辅助函数，如 MD5MD5, getSUB 等 ...

// --- API 中间件 (添加了日志) ---
async function authMiddleware(request, env) {
    console.log("[Auth] Running auth middleware...");
    if (!env.COOKIE_SECRET) {
        console.error("[Auth] FATAL: COOKIE_SECRET environment variable is not set!");
        return false;
    }
    const cookie = request.headers.get('Cookie');
    if (!cookie) {
        console.log("[Auth] Failed: No cookie header found.");
        return false;
    }
    const sessionCookie = cookie.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
    if (!sessionCookie) {
        console.log("[Auth] Failed: auth_session cookie not found in header.");
        return false;
    }
    const token = sessionCookie.split('=')[1];
    console.log("[Auth] Found token, verifying...");
    try {
        const verifiedData = await verifySignedToken(env.COOKIE_SECRET, token);
        const isValid = verifiedData && (Date.now() - parseInt(verifiedData, 10) < SESSION_DURATION);
        if(isValid) {
            console.log("[Auth] Success: Token is valid.");
            return true;
        } else {
            console.log("[Auth] Failed: Token verification failed or session expired.");
            return false;
        }
    } catch (e) {
        console.error("[Auth] CRITICAL ERROR during token verification:", e);
        return false;
    }
}

// --- API 路由逻辑 (添加了日志) ---
async function handleApiRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '');
    console.log(`[API] Path: ${path}, Method: ${request.method}`);

    if (path !== '/login') {
        if (!await authMiddleware(request, env)) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
    }

    try {
        switch (path) {
            case '/login': {
                console.log("[API] Executing /login...");
                if (request.method !== 'POST') return new Response(null, { status: 405 });
                const { password } = await request.json();
                if (password === env.ADMIN_PASSWORD) {
                    const token = await createSignedToken(env.COOKIE_SECRET, String(Date.now()));
                    const headers = new Headers({ 'Content-Type': 'application/json' });
                    headers.append('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION / 1000}`);
                    console.log("[API] /login successful.");
                    return new Response(JSON.stringify({ success: true }), { headers });
                }
                console.log("[API] /login failed: Invalid password.");
                return new Response(JSON.stringify({ error: '密码错误' }), { status: 401 });
            }
            case '/data': {
                console.log("[API] Executing /data...");
                if (!env.MISUB_KV) {
                    console.error("[API /data] FATAL: MISUB_KV binding not found in env.");
                    return new Response(JSON.stringify({ error: 'Server configuration error: KV binding missing' }), { status: 500 });
                }
                console.log("[API /data] Reading settings from KV...");
                const settings = await env.MISUB_KV.get(KV_KEY_SETTINGS, 'json') || {};
                console.log("[API /data] Reading misubs from KV...");
                const misubs = await env.MISUB_KV.get(KV_KEY_MAIN, 'json') || [];
                console.log(`[API /data] Found ${misubs.length} misubs.`);
                const config = { FileName: settings.FileName || 'MISUB', mytoken: settings.mytoken || 'auto' };
                const responsePayload = JSON.stringify({ misubs, config });
                console.log("[API /data] Returning successful response.");
                return new Response(responsePayload, { headers: { 'Content-Type': 'application/json' } });
            }
            // ... 其他 case ...
        }
    } catch (e) {
        console.error(`[API] CRITICAL ERROR in path ${path}:`, e.message, e.stack);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
    return new Response('API route not found', { status: 404 });
}

// --- Cloudflare Pages Functions 入口 (添加了日志) ---
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    console.log(`[onRequest] Entry for path: ${url.pathname}`);

    try {
        if (url.pathname.startsWith('/api/')) {
            console.log(`[onRequest] Routing to handleApiRequest...`);
            return handleApiRequest(request, env);
        }
        
        // 此处省略 /sub 路由逻辑以简化调试
        
        console.log(`[onRequest] Passing to static assets handler...`);
        return next();
    } catch (e) {
        console.error("[onRequest] Unhandled exception in entry point:", e);
        return new Response("Catastrophic Server Error", { status: 500 });
    }
}