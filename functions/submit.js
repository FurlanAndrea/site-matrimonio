import { google } from "googleapis";

// carica le credenziali come JSON
const CREDENTIALS = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
);

const sheets = google.sheets({ version: "v4", auth: new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
})});

const SPREADSHEET_ID = "1l3PjNQD6w7C3A2gNurLu-5R8l02wEmOn__Uq6WvcSbc";

export async function onRequestPost(context) {
  try {
    const data = await context.request.formData();
    const name = data.get("name");
    const surname = data.get("surname");
    const message = data.get("message");

    // append dei dati nel foglio
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:C", // colonne in cui salvare
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, surname, message]],
      },
    });

    return new Response(JSON.stringify({ success: true, name, surname, message }), {
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