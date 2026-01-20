const webhookUrl = process.env.COOLIFY_WEBHOOK_URL;

if (!webhookUrl) {
  console.error("Missing COOLIFY_WEBHOOK_URL env var.");
  process.exit(1);
}

const payload = {
  repository: process.env.GITHUB_REPOSITORY || "unknown-repo",
  ref: process.env.GITHUB_REF || "unknown-ref",
  sha: process.env.GITHUB_SHA || "unknown-commit",
  actor: process.env.GITHUB_ACTOR || "unknown-actor",
  event: process.env.GITHUB_EVENT_NAME || "unknown-event",
};

(async () => {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `webhook failed: ${response.status} ${response.statusText} - ${text}`,
      );
    }

    console.log("Coolify deploy triggered.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
