/**
 * Test: emoji injection logic for WhatsApp URL
 * Run: node test_emoji_url.js
 */

// ── Same logic as CartModal.tsx ──────────────────────────────────────────────
const EU = {
  _COFFEE_: "%E2%98%95",
  _PERSON_: "%F0%9F%91%A4",
  _PIN_:    "%F0%9F%93%8D",
  _PHONE_:  "%F0%9F%93%9E",
  _CARD_:   "%F0%9F%92%B3",
  _MEMO_:   "%F0%9F%93%9D",
  _MONEY_:  "%F0%9F%92%B0",
  _CLOCK_:  "%F0%9F%95%92",
};

function injectEmojis(encoded) {
  return Object.entries(EU).reduce((s, [token, pct]) => s.replaceAll(token, pct), encoded);
}

const DEFAULT_TEMPLATE =
  "_COFFEE_ NUEVO PEDIDO _COFFEE_\n\n" +
  "_PERSON_ *Nombre:* {nombre}\n" +
  "_PIN_ *Direcci\u00f3n:* {direccion}\n" +
  "_PHONE_ *N\u00famero de contacto:* {telefono}\n" +
  "_CARD_ *M\u00e9todo de pago:* {pago}\n\n" +
  "_MEMO_ *Pedido:*\n{items}\n\n" +
  "_MONEY_ *Total: {total}*\n\n" +
  "_CLOCK_ *Hora de entrega / recoger:* __________\n\n" +
  "_COFFEE_ \u00a1Gracias por pedir con nosotros!";

// ── Simulate a cart send ─────────────────────────────────────────────────────
const form   = { nombre: "Juan", direccion: "Cra 18 #13-58", telefono: "310 000 0000", pago: "Efectivo" };
const items  = "  - 2x Hamburguesa Espresso: $57.000\n  - 1x Mini Hamburguesa (x1): $15.000";
const total  = "$72.000";

const message = DEFAULT_TEMPLATE
  .replace("{nombre}", form.nombre)
  .replace("{direccion}", form.direccion)
  .replace("{telefono}", form.telefono)
  .replace("{pago}", form.pago)
  .replace("{items}", items)
  .replace("{total}", total);

const encoded  = injectEmojis(encodeURIComponent(message));
const finalUrl = "https://wa.me/573112696660?text=" + encoded;

// ── Assertions ────────────────────────────────────────────────────────────────
const PASS = "\x1b[32m✓ PASS\x1b[0m";
const FAIL = "\x1b[31m✗ FAIL\x1b[0m";

function assert(label, condition) {
  console.log(condition ? PASS : FAIL, label);
  if (!condition) process.exitCode = 1;
}

console.log("\n=== Emoji URL Injection Test ===\n");

// 1. No replacement chars (U+FFFD = %EF%BF%BD) in the URL
assert("No replacement chars (%EF%BF%BD) in URL", !encoded.includes("%EF%BF%BD"));

// 2. Coffee emoji present
assert("Coffee emoji encoded (%E2%98%95)", encoded.includes("%E2%98%95"));

// 3. Person emoji present
assert("Person emoji encoded (%F0%9F%91%A4)", encoded.includes("%F0%9F%91%A4"));

// 4. Pin emoji present
assert("Pin emoji encoded (%F0%9F%93%8D)", encoded.includes("%F0%9F%93%8D"));

// 5. Phone emoji present
assert("Phone emoji encoded (%F0%9F%93%9E)", encoded.includes("%F0%9F%93%9E"));

// 6. No raw token placeholders leaked into URL
assert("No _COFFEE_ token in URL",  !encoded.includes("_COFFEE_"));
assert("No _PERSON_ token in URL",  !encoded.includes("_PERSON_"));
assert("No _PIN_ token in URL",     !encoded.includes("_PIN_"));

// 7. User text is correctly encoded
assert("Nombre 'Juan' present",       encoded.includes("Juan"));
assert("Accented ó encoded (%C3%B3)", encoded.includes("%C3%B3"));  // Dirección
assert("Accented ú encoded (%C3%BA)", encoded.includes("%C3%BA"));  // Número
assert("Bold markers *Nombre:* in URL", encoded.includes("*Nombre%3A*"));

// 8. URL is valid (starts correctly)
assert("URL starts with wa.me",       finalUrl.startsWith("https://wa.me/573112696660?text="));

// ── Preview ───────────────────────────────────────────────────────────────────
console.log("\n--- Decoded message preview ---\n");
console.log(decodeURIComponent(encoded.replace(/%E2%98%95/g, "\u2615")
  .replace(/%F0%9F%91%A4/g, "\uD83D\uDC64")
  .replace(/%F0%9F%93%8D/g, "\uD83D\uDCCD")
  .replace(/%F0%9F%93%9E/g, "\uD83D\uDCDE")
  .replace(/%F0%9F%92%B3/g, "\uD83D\uDCB3")
  .replace(/%F0%9F%93%9D/g, "\uD83D\uDCDD")
  .replace(/%F0%9F%92%B0/g, "\uD83D\uDCB0")
  .replace(/%F0%9F%95%92/g, "\uD83D\uDD52")));
