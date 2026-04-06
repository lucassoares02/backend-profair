const https = require("https");
const http = require("http");
const { URL } = require("url");

async function mirrorRequest(body, mirrorUrl) {
  const url = new URL(mirrorUrl);
  const payload = JSON.stringify(body);

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      "x-mirror-request": "true", // <-- flag anti-loop
    },
  };

  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;

    const mirrorReq = transport.request(options, (mirrorRes) => {
      let data = "";
      mirrorRes.on("data", (chunk) => (data += chunk));
      mirrorRes.on("end", () => {
        logger.info(`Mirror response: ${mirrorRes.statusCode}`);
        resolve(data);
      });
    });

    mirrorReq.on("error", reject);

    mirrorReq.setTimeout(5000, () => {
      mirrorReq.destroy();
      reject(new Error("Mirror request timed out"));
    });

    mirrorReq.write(payload);
    mirrorReq.end();
  });
}
