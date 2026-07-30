const SECRET = process.env.JWT_SECRET || "moto-na-pratica-segredo-super-secreto-2026";

// Função interna auxiliar para gerar assinatura HMAC-SHA256
async function generateSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );
  
  // Converter ArrayBuffer para hexadecimal
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export async function signToken(username: string): Promise<string> {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias
  const data = `${username}:${expiry}`;
  const signature = await generateSignature(data, SECRET);
  return `${data}:${signature}`;
}

export async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    if (!token) return null;
    const parts = token.split(":");
    if (parts.length !== 3) return null;
    
    const [username, expiryStr, signature] = parts;
    const expiry = parseInt(expiryStr, 10);
    
    // Verificar se expirou
    if (expiry < Date.now()) return null;
    
    const data = `${username}:${expiryStr}`;
    const expectedSignature = await generateSignature(data, SECRET);
    
    if (signature === expectedSignature) {
      return { username };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function checkCredentials(user: string, pass: string): boolean {
  const correctUser = process.env.ADMIN_USERNAME || "admin";
  const correctPass = process.env.ADMIN_PASSWORD || "sua_senha_segura";

  return user === correctUser && pass === correctPass;
}
