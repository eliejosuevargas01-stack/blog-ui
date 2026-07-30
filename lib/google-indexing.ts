import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export async function notifyGoogleIndexing(url: string): Promise<{ success: boolean; message?: string }> {
  let clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  // Fallback: Read google-credentials.json from root if exists
  if (!clientEmail || !privateKey) {
    try {
      const credsPath = path.join(process.cwd(), "google-credentials.json");
      if (fs.existsSync(credsPath)) {
        const creds = JSON.parse(fs.readFileSync(credsPath, "utf-8"));
        clientEmail = creds.client_email;
        privateKey = creds.private_key;
      }
    } catch (e) {
      console.warn("Could not load google-credentials.json file", e);
    }
  }

  if (!clientEmail || !privateKey) {
    return { 
      success: false, 
      message: "Credenciais do Google Indexing API não configuradas. Crie o arquivo google-credentials.json na raiz do projeto." 
    };
  }

  try {
    // 1. Generate JWT assertion
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      {
        iss: clientEmail,
        scope: "https://www.googleapis.com/auth/indexing",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + 3600,
        iat: now,
      },
      privateKey.replace(/\\n/g, "\n"),
      { algorithm: "RS256" }
    );

    // 2. Get Access Token from Google OAuth2
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: token,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return { success: false, message: `Erro de OAuth2: ${errorText}` };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 3. Publish URL notification to Google Indexing API
    const indexingResponse = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url: url,
        type: "URL_UPDATED",
      }),
    });

    if (!indexingResponse.ok) {
      const errorText = await indexingResponse.text();
      return { success: false, message: `Erro ao enviar URL para indexação: ${errorText}` };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro na indexação automática:", error);
    return { success: false, message: error.message || "Erro desconhecido na indexação." };
  }
}
