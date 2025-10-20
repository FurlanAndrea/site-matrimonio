export async function onRequestPost(context) {
  try {
    const data = await context.request.formData();
    const name = data.get("name");
    const surname = data.get("surname");
    const message = data.get("message");

    // URL del Web App creato in Google Apps Script
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzT8haj8DThnnbTdSjlVEFulXotIqT1wyljcUp-bQ82Hoa93SUkmvrbcpTRWfgiOq_z0w/exec";

    // invio dati al Web App
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, surname, message }),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}

/* const SPREADSHEET_ID = "1l3PjNQD6w7C3A2gNurLu-5R8l02wEmOn__Uq6WvcSbc";
const SHEET_NAME = "list";

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

    const clientEmail = "append-worker@site-matrimonio.iam.gserviceaccount.com";
    const privateKey = "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDSgen1JF1J6BSm\\nYSJcbZxCpi2H8feKjFzG8+5YGZ7T7ZdzoT3LsNaYg0IzOjIrJKvCL1TAsNMs+1I8\\nbTbHlH7/t9VWIZbJv5Oa7iYpT6CJZDMDCaeBthmF0fhtd0iXPFX8yEQfaVyoorbB\\n/SaLCV13lKRQQI7Bqn91TrujG03fplmXRTMsA8rjpn7rMrGMewac5X+RWNCI+BMr\\nAyAcTAkFcghloSItxS1Wr+Mv66UZUe5RXxUc5RXB1ver1zVa8lFrsYOklYZRyMcu\\nrVxJ5EZWwZc4ebxPjhUu6AscVIRvyvYTcYHOdhQBS7Terwy0Li0fSFVtxa2q1ATG\\nzYQbycL5AgMBAAECggEAAillXqgV8SlZ9O9wa+SQQzrzor7AXQLd/QkKPItezyxU\\nbtKMEOhq+7v1VRNW6oyA2wijZSsrr/2QtaAlfN0whK29mhnUM5QtDt09NRVlP6Pw\\nxio2NyXIk1A5rd4Yt7zd4S+pS21Ij07Ec6+G0syw0gaLvWs8TA7VKj45vQ4Nuas1\\n4InHMbE9n1a9mDUfWIWv0BiQiTTo7FrRfce32Bjw4LGKpmgH4RKbmw3UpvhgTwjs\\nFzCdBhxDQkJpEH+Hbv87OPRd/jjlR2RlrG1X5t/CWOH69w6o/CCgUvGY8WNCd13M\\n2XkRD9s6/QQpJPJu8ajeCzLOB7ViP/GXYgRBNCNB9QKBgQDyv4iWhipFKbIapkur\\nPqQnKvyXjEHWW17IIIxQFTUKGDPodp3HtcZnMnPkWMEzebohOygX3Dp9jVaevyqJ\\nY9Tycr7PStoEgmTXDSlB4aDarJwBFJnvpfkW+FpPEuTyj5eM4DwIJQriPYLJzwWC\\n9XmRbjIAS98aKCR3+7G3H9dg1wKBgQDd/8745xxZwvIie2fD3yJxNy/MVrQHArak\\nNDoX/al0OYpzo3AJBtXQimRtm9CRCgNnGcA6ODBZn4QHLR1KxEU6Ynie0x43hnq8\\ndxi1ha6a+ABd1CK7PtdjjzarTjVtHtz7KhyL8xo7Ljx+nC95u7vyxnJMkZOq+Eka\\nENtuf8PwrwKBgEfgOIRBU5DJCMhlRvB8isRiMQp6aCAdS9I7+O/ZZ6wGgJArVwqE\\nIyv5P2F0ejhQqbEfP/7YoaT9TZGRjvnBSpNDMIZWZnmBVnRqnDW6phM5mrOjMvVH\\nkpqfjLXvJUVBCSGYX44V0cQtbGVu2/Xr00QhecKmtHedPTcdmoBbeD1fAoGAO9I+\\n95tvbFC35srSP1nVciSo4KtMf8cfaEgaj3RvQT5wLJESE5yf6T4hqdee8DZ+jD3I\\nKugRP1VYwoZJqmgRL5ZxYnsJXXUDhd2h7uhDEMdbce1EHqjkaZOh6697fhge/B9w\\n6dVscB4ZdxSnRmpsTxNioXdpD10wdbGtL62GI0kCgYB3tSbd1mldzSae6JXROg8v\\nqo4mAnz8+mBsfgIlB8Aagcc3ja6MeqoLurkI4QpykKv0sbwBdWGPFSbAvhKQF0Ls\\nIDtLxMhnc89P01LsTa+fbfrQw2CJtNOENGlTr/slQ1me7wL0ukyIprosYQi+rmP/\\nmfO9jsayQcrKgAmpEe4zDQ==";

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

    const resultAPICall = await fetch(
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
    resultAPICall = resultAPICall.json();

    return new Response(JSON.stringify({ success: true, resultAPICall}), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
} */