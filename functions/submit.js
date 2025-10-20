export async function onRequestPost(context) {
  try {
    const data = await context.request.formData();
    const name = data.get("name");
    const surname = data.get("surname");
    const message = data.get("message");

    // Qui puoi fare quello che vuoi (es. salvare, inviare email, ecc.)

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