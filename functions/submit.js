const SPREADSHEET_ID = "1l3PjNQD6w7C3A2gNurLu-5R8l02wEmOn__Uq6WvcSbc";
const SHEET_NAME = "Foglio 1";

function base64urlEncode(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function signJWT(header, payload, privateKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(base64urlEncode(JSON.stringify(header)) + "." + base64urlEncode(JSON.stringify(payload)));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    str2ab(atob(privateKey.replace(/\\n/g, ""))),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, data);
  return base64urlEncode(ab2str(signature));
}

function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) bufView[i] = str.charCodeAt(i);
  return buf;
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.formData();
    const name = data.get("name");
    const surname = data.get("surname");
    const message = data.get("message");

    const clientEmail = context.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
    const privateKey = context.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const credentials = context.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const signature = await signJWT(header, payload, privateKey);
    const assertion = base64urlEncode(JSON.stringify(header)) + "." + base64urlEncode(JSON.stringify(payload)) + "." + signature;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
        SHEET_NAME
      )}!A:C:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [[name, surname, message]] }),
      }
    );

    return new Response(JSON.stringify({ success: true, name, surname, message }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: credentials }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}