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

async function MD5MD5(text) {
    const encoder = new TextEncoder();
    const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
    const firstHex = Array.from(new Uint8Array(firstPass)).map(b => b.toString(16).padStart(2, '0')).join('');
    const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
    return Array.from(new Uint8Array(secondPass)).map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
}

function isValidBase64(str) { try { return btoa(atob(str)) == str; } catch (err) { return false; } }

async function getUrl(targetUrl, userAgentHeader) {
    const newHeaders = new Headers({ 'User-Agent': `MISUB-Client/${userAgentHeader}` });
    return fetch(new Request(targetUrl, { headers: newHeaders, redirect: "follow" }));
}

async function getSUB(apiUrls, userAgentHeader) {
    let content = "";
    const responses = await Promise.allSettled(apiUrls.map(apiUrl => getUrl(apiUrl, userAgentHeader).then(res => res.ok ? res.text() : Promise.reject(new Error(`Fetch failed: ${res.status}`)))));
    for (const response of responses) {
        if (response.status === 'fulfilled') {
            const text = response.value;
            if (text.includes('://')) { content += text + '\n'; }
            else if (isValidBase64(text.replace(/\s/g, ''))) { try { content += atob(text) + '\n'; } catch (e) {} }
        }
    }
    return content;
}

async function sendMessage(botToken, chatId, type, ip, add_data = "") {
    if (!botToken || !chatId) return;
    let msg = `${type}\nIP: ${ip || 'N/A'}\n${add_data}`;
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
        if (response.ok) {
            const ipInfo = await response.json();
            msg = `${type}\nIP: ${ip}\n地址: ${ipInfo.country}, ${ipInfo.city}\n组织: ${ipInfo.org}\n${add_data}`;
        }
    } catch (e) {}
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&parse_mode=HTML&text=${encodeURIComponent(msg)}`);
}

async function authMiddleware(request, env) {
    if (!env.COOKIE_SECRET) { console.error("FATAL: COOKIE_SECRET is not set!"); return false; }
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
            case '/logout': {
                const headers = new Headers({ 'Content-Type': 'application/json' });
                // 通过设置一个立刻过期的同名Cookie来清除浏览器中的Cookie
                headers.append('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
                return new Response(JSON.stringify({ success: true }), { headers });
            }
            case '/settings': {
                if (request.method === 'GET') {
                    const settings = await env.MISUB_KV.get(KV_KEY_SETTINGS, 'json') || {};
                    return new Response(JSON.stringify(settings), { headers: { 'Content-Type': 'application/json' } });
                }
                
                if (request.method === 'POST') {
                    const newSettings = await request.json();
                    const oldSettings = await env.MISUB_KV.get(KV_KEY_SETTINGS, 'json') || {};
                    
                    // 合并新旧设置，只更新本次提交的字段
                    const updatedSettings = { ...oldSettings, ...newSettings };

                    await env.MISUB_KV.put(KV_KEY_SETTINGS, JSON.stringify(updatedSettings));
                    return new Response(JSON.stringify({ success: true, message: '设置已保存' }));
                }

                return new Response('Method Not Allowed', { status: 405 });
            }
        }
    } catch (e) {
        console.error(`API Error in path ${path}:`, e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
    
    return new Response('API route not found', { status: 404 });
}            
// --- 订阅生成路由 ---
async function handleMisubRequest(request, env) {
    const url = new URL(request.url);
    const userAgentHeader = request.headers.get('User-Agent') || "Unknown";
    
    const kv_settings = await env.MISUB_KV.get(KV_KEY_SETTINGS, 'json') || {};
    const config = {
        mytoken: kv_settings.mytoken || env.TOKEN || 'auto',
        subConverter: kv_settings.subConverter || env.SUBAPI || 'api.v1.mk',
        subConfig: kv_settings.subConfig || env.SUBCONFIG || 'https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini',
        FileName: kv_settings.FileName || env.SUBNAME || 'MISUB',
        SUBUpdateTime: kv_settings.SUBUpdateTime || env.SUBUPDATETIME || 6,
        BotToken: kv_settings.BotToken || env.TGTOKEN || '',
        ChatID: kv_settings.ChatID || env.TGID || '',
    };

    const timeTemp = Math.ceil(Date.now() / (1000 * 60 * 60));
    const fakeToken = await MD5MD5(`${config.mytoken}${timeTemp}`);
    
    let token = url.searchParams.get('token');
    if (url.pathname === `/${config.mytoken}`) token = config.mytoken;

    if (!token || ![config.mytoken, fakeToken].includes(token)) return new Response('Invalid token', { status: 403 });

    const misubs = await env.MISUB_KV.get(KV_KEY_MAIN, 'json') || [];
    const enabledMisubs = misubs.filter(sub => sub.enabled);
    let urls = [], manualNodes = '';
    for (const sub of enabledMisubs) {
        if (sub.url.toLowerCase().startsWith('http')) urls.push(sub.url);
        else manualNodes += sub.url + '\n';
    }
    
    const subContent = await getSUB(urls, userAgentHeader);
    const combinedContent = (manualNodes + subContent).split('\n').filter(line => line.trim()).join('\n');
    const base64Data = btoa(unescape(encodeURIComponent(combinedContent)));
    
    if (token === fakeToken) return new Response(base64Data);
    
    if (config.BotToken && config.ChatID) {
        await sendMessage(config.BotToken, config.ChatID, `#获取订阅 ${config.FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}`);
    }

    let targetFormat = 'base64';
	const ua = userAgentHeader.toLowerCase();
	if (ua.includes('clash')) targetFormat = 'clash';
	else if (ua.includes('sing-box') || ua.includes('singbox')) targetFormat = 'singbox';
	else if (ua.includes('surge')) targetFormat = 'surge';
	
    for (const [key] of url.searchParams.entries()) {
        if (['clash', 'singbox', 'sb', 'surge', 'quanx', 'loon', 'base64'].includes(key)) {
            targetFormat = key === 'sb' ? 'singbox' : key;
            break;
        }
    }

    if (targetFormat === 'base64') return new Response(base64Data, { headers: { "content-type": "text/plain; charset=utf-8", "Profile-Update-Interval": `${config.SUBUpdateTime}` } });
    
    const callbackUrl = `${url.protocol}//${url.hostname}/sub?token=${fakeToken}`;
    const subConverterUrl = `https://${config.subConverter}/sub?target=${targetFormat}&url=${encodeURIComponent(callbackUrl)}&insert=false&config=${encodeURIComponent(config.subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
    
    try {
        const subConverterResponse = await fetch(subConverterUrl);
        if (!subConverterResponse.ok) return new Response("订阅转换失败", { status: 502 });
        const subConverterContent = await subConverterResponse.text();
        return new Response(subConverterContent, { headers: { "Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(config.FileName)}`, "content-type": "text/plain; charset=utf-8", "Profile-Update-Interval": `${config.SUBUpdateTime}` } });
    } catch (error) {
        return new Response("订阅转换服务器连接失败", { status: 502 });
    }
}

// --- Cloudflare Pages Functions 入口 ---
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    try {
        // API 路由
        if (url.pathname.startsWith('/api/')) {
            return handleApiRequest(request, env);
        }
    
        // 订阅链接路由
        const kv_settings = await env.MISUB_KV.get(KV_KEY_SETTINGS, 'json') || {};
        const mytoken = kv_settings.mytoken || env.TOKEN || 'auto';
        
        if (url.pathname === '/sub' || url.pathname === `/${mytoken}`) {
             return handleMisubRequest(request, env);
        }
    
        // 其他所有请求，都交给 Pages 静态资源处理器
        return next();
    } catch (e) {
        console.error("Critical error in onRequest:", e);
        return new Response("Internal Server Error", { status: 500 });
    }
}