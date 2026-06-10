const text =
  m.message?.conversation ||
  m.message?.extendedTextMessage?.text;

const sender = m.key.participant || m.key.remoteJid;

// 🚫 BLOCK BANNED USERS
if (isBanned(sender)) return;

// 🔗 ANTI-LINK
if (text && text.includes("http")) {
  await sock.sendMessage(chat, {
    text: warnUser(sender)
  });

  if (db.banned.includes(sender)) {
    await sock.groupParticipantsUpdate(chat, [sender], "remove");
  }
}

// ⚠️ ANTI-SPAM (simple)
if (text && text.length > 300) {
  await sock.sendMessage(chat, {
    text: warnUser(sender)
  });
}
