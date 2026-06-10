if (text.startsWith(".ban")) {
  const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!target) return;

  if (!db.banned.includes(target)) {
    db.banned.push(target);
    saveDB();
  }

  await sock.groupParticipantsUpdate(chat, [target], "remove");
  await sock.sendMessage(chat, { text: "🚫 User banned permanently." });
}

if (text.startsWith(".unban")) {
  const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!target) return;

  db.banned = db.banned.filter(u => u !== target);
  saveDB();

  await sock.sendMessage(chat, { text: "✅ User unbanned." });
}
