// Lokální test: node netlify/functions/trial-email.test.js
const assert = require("assert");
process.env.RESEND_API_KEY = "re_test";
delete process.env.RESEND_FROM;
delete process.env.RUKON_NOTIFY_TO;

const { handler, buildAjanlatEmail } = require("./trial-email.js");

const calls = [];
global.fetch = async (url, opts) => {
  calls.push({ url: String(url), opts });
  if (String(url).includes("api.resend.com")) {
    return { ok: true, status: 200, json: async () => ({ id: "mock-id" }), text: async () => "" };
  }
  return { ok: true, status: 200, text: async () => "<html><title>T</title>Hi {NAME}</html>" };
};
const post = (body) => handler({ httpMethod: "POST", body: JSON.stringify(body) });
const resendCalls = () => calls.filter((c) => c.url.includes("api.resend.com"));

(async () => {
  // 1) ajanlatkeres-hu → 1× Resend
  let r = await post({
    id: "sub123", form_name: "ajanlatkeres-hu", created_at: "2026-11-03T10:00:00Z",
    data: { name: "Kovács <b>János</b>", company: "Kovács Kft.", email: "janos@kovacs.hu",
      phone: "+36 1 234", vehicles: "12", termek: "EUTracker PLUS", message: "Kérek\najánlatot & árat",
      source_url: "https://tagra.app/hu/eutracker-plus/", "bot-field": "" },
  });
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(resendCalls().length, 1);
  const body = JSON.parse(resendCalls()[0].opts.body);
  assert.deepStrictEqual(body.to, ["rukon@rukon.hu"]);
  assert.strictEqual(body.reply_to, "janos@kovacs.hu");
  assert.strictEqual(body.subject, "Új ajánlatkérés – EUTracker PLUS – Kovács Kft.");
  assert.ok(body.html.includes("Kovács &lt;b&gt;János&lt;/b&gt;") && !body.html.includes("<b>János"));
  assert.ok(body.text.includes("Járművek száma: 12"));
  assert.ok(body.text.includes("Válaszoljon közvetlenül erre az e-mailre."));
  assert.strictEqual(resendCalls()[0].opts.headers["Idempotency-Key"], "ajanlat-sub123");

  // 2) honeypot → nic
  calls.length = 0;
  await post({ id: "s2", form_name: "ajanlatkeres-hu", data: { name: "Bot", email: "a@b.hu", "bot-field": "x" } });
  assert.strictEqual(resendCalls().length, 0);

  // 3) spam flag → nic
  await post({ id: "s3", form_name: "ajanlatkeres-hu", spam: true, data: { name: "Spam", email: "a@b.hu" } });
  assert.strictEqual(resendCalls().length, 0);

  // 4) nevalidní e-mail → bez reply_to; prázdné hodnoty ve předmětu vynechány
  await post({ id: "s4", form_name: "ajanlatkeres-hu", data: { name: "Nagy Éva", email: "neplatny" } });
  const b4 = JSON.parse(resendCalls()[0].opts.body);
  assert.ok(!("reply_to" in b4));
  assert.strictEqual(b4.subject, "Új ajánlatkérés – Nagy Éva");

  // 4b) bez submission id → žádný Idempotency-Key
  calls.length = 0;
  await post({ form_name: "ajanlatkeres-hu", data: { name: "Bez Id", email: "x@y.hu" } });
  assert.ok(!("Idempotency-Key" in resendCalls()[0].opts.headers));

  // 5) tagra-trial se chová jako dřív: uvítací mail zákazníkovi, reply_to sales@tagra.app
  calls.length = 0;
  r = await post({ form_name: "tagra-trial", data: { name: "John Smith", email: "john@acme.com", audience: "fleet", language: "en" } });
  assert.strictEqual(r.statusCode, 200);
  const rc = resendCalls();
  assert.ok(rc.length >= 1);
  const t1 = JSON.parse(rc[0].opts.body);
  assert.deepStrictEqual(t1.to, ["john@acme.com"]);
  assert.strictEqual(t1.reply_to, "sales@tagra.app");
  assert.ok(rc.every((c) => !JSON.parse(c.opts.body).to.includes("rukon@rukon.hu")));

  // 6) jiný formulář → ignorován
  calls.length = 0;
  r = await post({ form_name: "other", data: {} });
  assert.strictEqual(r.body, "Ignored: not tagra-trial");
  assert.strictEqual(calls.length, 0);

  console.log("OK — všechny testy prošly\n");
  const ex = buildAjanlatEmail({ name: "Kovács János", company: "Kovács Kft.", email: "janos@kovacs.hu",
    phone: "+36 1 234", vehicles: "12", termek: "EUTracker PLUS", message: "Kérek ajánlatot.",
    source_url: "https://tagra.app/hu/eutracker-plus/" }, "2026-11-03T10:00:00Z");
  console.log("Předmět: " + ex.subject + "\n\n" + ex.text);
})().catch((e) => { console.error(e); process.exit(1); });
