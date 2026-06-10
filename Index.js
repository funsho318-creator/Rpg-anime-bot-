const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

const bannedUsers = new Set();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text;

    const sender = m.key.participant || m.key.remoteJid;
    const chat = m.key.remoteJid;

    if (bannedUsers.has(sender)) return;

    if (!text) return;

    // COMMANDS
    if (text.startsWith(".ban")) {
      if (!m.key.participant) return;

      const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) return;

      await sock.groupParticipantsUpdate(chat, [target], "remove");
      bannedUsers.add(target);

      await sock.sendMessage(chat, { text: "🚫 User banned." });
    }

    if (text.startsWith(".unban")) {
      const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) return;

      bannedUsers.delete(target);
      await sock.sendMessage(chat, { text: "✅ User unbanned." });
    }

    if (text.startsWith(".kick")) {
      const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!target) return;

      await sock.groupParticipantsUpdate(chat, [target], "remove");
      await sock.sendMessage(chat, { text: "👢 User kicked." });
    }
  });
}

startBot();
