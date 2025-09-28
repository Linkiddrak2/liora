import {
    uploader,
    uploader2,
    uploader3,
    uploader4,
    uploader5,
    uploader6,
    uploader7,
    uploader8,
    uploader9,
    uploader10,
    uploader11
} from "../../lib/uploader.js";

const uploaders = {
    1: { name: "🍡 Catbox.moe", fn: uploader },
    2: { name: "🍪 Uguu.se", fn: uploader2 },
    3: { name: "🍰 Qu.ax", fn: uploader3 },
    4: { name: "🌸 Put.icu", fn: uploader4 },
    5: { name: "🍫 Tmpfiles", fn: uploader5 },
    6: { name: "🧋 Betabotz", fn: uploader6 },
    7: { name: "🍵 Yupra CDN", fn: uploader7 },
    8: { name: "🍧 Elrayy TODO..", fn: uploader8 },
    9: { name: "🍮 Abella TODO..", fn: uploader9 },
    10: { name: "🍩 YPNK TODO..", fn: uploader10 },
    11: { name: "🧁 CloudkuImages", fn: uploader11 },
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0] || isNaN(args[0]) || !uploaders[args[0]]) {
            let list = Object.entries(uploaders)
                .map(([num, { name }]) => `*${num}. ${name}*`)
                .join("\n")

            return m.reply(
`🍡 *Pilih server upload dengan angka:*
*${usedPrefix + command} <nomor>*

🍰 *Daftar server:*
${list}`
            )
        }

        let server = uploaders[args[0]]
        if (!server) return m.reply(`🍩 *Server tidak valid!*`)

        await global.loading(m, conn)

        let q = m.quoted ? m.quoted : m
        let msg = q.msg || q
        let mime = msg.mimetype || ""
        if (!mime) {
            await global.loading(m, conn, true)
            return m.reply(`🍡 *Balas pesan yang berisi file atau media ya sayang~*`)
        }

        let buffer = await q.download?.().catch(() => null)
        if (!buffer || !buffer.length) {
            await global.loading(m, conn, true)
            return m.reply(`🍩 *Gagal mengunduh media-nya yaa~*`)
        }

        let url = await server.fn(buffer).catch(() => null)
        if (!url) {
            await global.loading(m, conn, true)
            return m.reply(`🧁 *Gagal mengunggah file ke ${server.name}*`)
        }

        let resultText =
`*${server.name}*
━━━━━━━━━━━━━━━━━━━
📎 *URL: ${url}*
🍦 *Ukuran File: ${(buffer.length / 1024).toFixed(2)} KB*
━━━━━━━━━━━━━━━━━━━`

        await conn.sendMessage(
            m.chat,
            {
                text: resultText,
                footer: global.config.watermark,
                hasMediaAttachment: false,
            },
            { quoted: m }
        )
    } catch (e) {
        console.error(e)
        m.reply(`🍬 *Terjadi kesalahan!*\n🧁 ${e.message}`)
    } finally {
        await global.loading(m, conn, true)
    }
}

handler.help = ["upload"]
handler.tags = ["tools"]
handler.command = /^(tourl|url)$/i

export default handler