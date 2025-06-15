// functions/[[path]].js (用于测试的极简代码)

export async function onRequest(context) {
  // 无论什么请求，都只返回一句话
  return new Response("Hello from Cloudflare Pages!", {
    headers: { 'Content-Type': 'text/plain' },
  });
}