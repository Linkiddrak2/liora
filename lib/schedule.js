/* global conn */
import fs from "fs";
import path from "path";
import os from "os";
import * as cheerio from 'cheerio'

let fdoc = {
    key: {
        remoteJid: "status@broadcast",
        participant: "0@s.whatsapp.net",
    },
    message: {
        documentMessage: {
            title: "𝐃 𝐀 𝐓 𝐀 𝐁 𝐀 𝐒 𝐄",
        },
    },
};

const otakudesu = {
search: async title => {
let res = await fetch(`https://otakudesu.cloud/?s=${title}&post_type=anime`, {
headers: {
"user-agent": "Mozilla/5.0 (Linux Android 10 RMX2020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36"
}
})
let data = await res.text()
const $ = cheerio.load(data)
const searchResults = []
$('.chivsrc li').each((index, element) => {
const title = $(element).find('h2 > a').text()
const link = $(element).find('h2 > a').attr('href')
const image = $(element).find('img').attr('src')
const genres = []
$(element).find('.set:contains("Genres") a').each((i, el) => {
genres.push($(el).text())
})
const status = $(element).find('.set:contains("Status")').text().split(':')[1].trim()
const rating = $(element).find('.set:contains("Rating")').text().split(':')[1]?.trim() || 'N/A'
searchResults.push({ title, link, image, genres, status, rating })
})
return searchResults
},
detail: async url => {
let res = await fetch(url, {
headers: {
"user-agent": "Mozilla/5.0 (Linux Android 10 RMX2020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36"
}
})
let data = await res.text()
let $ = cheerio.load(data)
let link_eps = []
$('#venkonten > div.venser > div.episodelist > ul > li').each((a, b) => {
link_eps.push({
episode: $(b).find('span > a').text(), upload_at: $(b).find('span.zeebr').text(), link: $(b).find('span > a').attr('href')
})
})
let hasil = {
title: {
indonesia: $('#venkonten > div.venser > div.jdlrx > h1').text(),
anonym: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(1) > span').text().replace('Judul: ', ''),
japanese: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(2) > span').text().replace('Japanese: ', '')
},
thumbnail: $('.fotoanime > img').attr("src"),
score: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(3) > span').text().replace('Skor: ', ''),
producer: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(4) > span').text().replace('Produser: ', ''),
type: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(5) > span').text().replace('Tipe: ', ''),
status: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(6) > span').text().replace('Status: ', ''),
total_eps: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(7) > span').text().replace('Total Episode: ', ''),
duration: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(8) > span').text().replace('Durasi: ', ''),
release: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(9) > span').text().replace('Tanggal Rilis: ', ''),
studio: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(10) > span').text().replace('Studio: ', ''),
genre: $('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(11) > span').text().replace('Genre: ', ''),
synopsis: $('#venkonten > div.venser > div.fotoanime > div.sinopc > p').text(),
link_eps: link_eps
}
return hasil
},
ongoing: async () => {
let res = await fetch('https://otakudesu.cloud/ongoing-anime/', {
headers: {
"user-agent": "Mozilla/5.0 (Linux Android 10 RMX2020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Mobile Safari/537.36"
}
})
let data = await res.text()
const $ = cheerio.load(data)
const ongoingList = []
$('.venz ul li').each((index, element) => {
const episode = $(element).find('.epz').text().trim()
const day = $(element).find('.epztipe').text().trim()
const date = $(element).find('.newnime').text().trim()
const title = $(element).find('.jdlflm').text().trim()
const link = $(element).find('.thumb a').attr('href')
const image = $(element).find('.thumbz img').attr('src')
ongoingList.push({ episode, day, date, title, link, image })
})
return ongoingList
}
}

async function resetCommand() {
    let user = global.db.data.users;
    for (let id in user) {
        if (typeof user[id] === "object") {
            user[id].command = 0;
            user[id].commandLimit = 1000;
            user[id].cmdLimitMsg = 0;
        }
    }
}

async function resetChat() {
    let users = global.db.data.users;
    for (let id in users) {
        if (typeof users[id].chat !== "undefined") {
            users[id].chat = 0;
        }
    }
    let chat = global.db.data.chats;
    let arr = Object.entries(chat)
        .filter(([_, data]) => typeof data === "object" && "member" in data) // eslint-disable-line no-unused-vars
        .map(([id]) => id);
    for (let id of arr) {
        chat[id].member = {};
    }
}

async function Backup() {
    let setting = global.db.data.settings[conn.user.jid];
    if (setting?.backup) {
        let d = new Date();
        let date = d.toLocaleDateString("id", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        let database = fs.readFileSync("./database.db");
        for (let [jid] of global.config.owner.filter(
            ([number, developer]) => number && developer
        )) {
            await conn.reply(jid + "@s.whatsapp.net", `*🗓️ Database: ${date}*`, null);
            await conn.sendMessage(
                jid + "@s.whatsapp.net",
                {
                    document: database,
                    mimetype: "application/x-sqlite3",
                    fileName: "database.db",
                },
                { quoted: fdoc }
            );
        }
    }
}

async function OtakuNews() {
    let chat = global.db.data.chats;
    let bot = global.db.data.bots;
    let data = await otakudesu("ongoing");
    if (!Array.isArray(data)) return;
    if (data.length === 0) return;
    if (data[0].title !== bot.otakuNow) {
        bot.otakuNow = data[0].title;
        let groups = Object.entries(conn.chats)
            .filter(
                ([jid, chat]) =>
                    jid.endsWith("@g.us") &&
                    chat.isChats &&
                    !chat.metadata?.read_only &&
                    !chat.metadata?.announce &&
                    !chat.isCommunity &&
                    !chat.isCommunityAnnounce &&
                    !chat?.metadata?.isCommunity &&
                    !chat?.metadata?.isCommunityAnnounce
            )
            .map((v) => v[0]);
        let detail = await otakudesu("detail", data[0].link);
        let { status, total_eps, duration, studio, genre, synopsis } = detail;
        for (let v of groups) {
            if (!chat[v].otakuNews) continue;
            chat[v].otakuNow = data[0].title;
            let caption = `
🍣 *OtakuDesu Terbaru!*
━━━━━━━━━━━━━━━━━━━
🍜 *Judul : ${data[0].title} ${data[0].episode}*
🥠 *Status : ${status}*
🍱 *Total Episode : ${total_eps}*
🍡 *Durasi : ${duration}*
🥟 *Studio : ${studio}*
🍤 *Genre : ${genre}*
━━━━━━━━━━━━━━━━━━━
🍩 *Sinopsis:* 
${synopsis ? synopsis : "Belum tersedia. Nikmati langsung episodenya!"}
━━━━━━━━━━━━━━━━━━━
🌐 *Tonton sekarang hanya di OtakuDesu!*
`.trim();
            await conn.sendFile(v, data[0].image, null, caption, null);
        }
    }
}

async function checkGempa() {
    let chat = global.db.data.chats;
    let bot = global.db.data.bots;
    let res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json");
    let json = await res.json();
    let gempa = json.Infogempa.gempa;
    if (gempa.DateTime !== bot.gempaDateTime) {
        bot.gempaDateTime = gempa.DateTime;
        let groups = Object.entries(conn.chats)
            .filter(
                ([jid, chat]) =>
                    jid.endsWith("@g.us") &&
                    chat.isChats &&
                    !chat.metadata?.read_only &&
                    !chat.metadata?.announce &&
                    !chat.isCommunity &&
                    !chat.isCommunityAnnounce &&
                    !chat?.metadata?.isCommunity &&
                    !chat?.metadata?.isCommunityAnnounce
            )
            .map((v) => v[0]);
        for (let number of groups) {
            if (chat[number].notifgempa && gempa.DateTime !== chat[number].gempaDateTime) {
                chat[number].gempaDateTime = gempa.DateTime;
                let mmiInfo = gempa.Dirasakan
                    ? `📍 *Wilayah yang Merasakan : ${gempa.Dirasakan} Skala MMI*`
                    : `📍 *Wilayah yang Merasakan : Tidak ada data*`;
                let caption = `
🍥 *Informasi Gempa Terkini - BMKG* 🍥
━━━━━━━━━━━━━━━━━━━
📅 *Tanggal : ${gempa.Tanggal}*
🕒 *Waktu : ${gempa.Jam} WIB*
🕒 *Waktu : ${gempa.DateTime} UTC*
📍 *Lokasi : ${gempa.Wilayah}*
🌐 *Koordinat : ${gempa.Coordinates} Latitude, Longitude*
💪 *Magnitudo : ${gempa.Magnitude}*
📏 *Kedalaman : ${gempa.Kedalaman}*
⚠️ *Potensi : ${gempa.Potensi}*
━━━━━━━━━━━━━━━━━━━
${mmiInfo}
🗺️ *Peta Guncangan Shakemap : Terlampir di atas.*
━━━━━━━━━━━━━━━━━━━
📢 *Sumber Data :*
*_Data ini berasal dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)_*
`.trim();
                await conn.sendFile(
                    number,
                    "https://data.bmkg.go.id/DataMKG/TEWS/" + gempa.Shakemap,
                    "shakemap.jpg",
                    caption,
                    false
                );
            }
        }
    }
}

async function checkPremium() {
    let user = global.db.data.users;
    let data = Object.keys(user).filter(
        (v) => user[v].premiumTime > 0 && new Date() * 1 - user[v].premiumTime > 0
    );
    for (let number of data) {
        let userName = user[number].registered ? user[number].name : conn.getName(number);
        await conn.reply(
            number,
            `🍓 *Hai ${userName}~* 🍓\n\n` +
                `🍮 *Masa premium kamu sudah habis, loh!* 😿\n` +
                `🍬 *Kalau kamu mau lanjut jadi pengguna premium, tinggal hubungi owner di bawah ini ya~* ✨\n\n` +
                `🧁 *Terima kasih sudah jadi bagian spesial dari pengguna premium-ku. Semoga kita bisa bertemu lagi~!*`,
            null
        );
        await conn.sendContact(number, global.config.owner, null);
        user[number].premiumTime = 0;
        user[number].premium = false;
    }
}

function clearTmp() {
    let __dirname = global.__dirname(import.meta.url);
    let tmp = [os.tmpdir(), path.join(__dirname, "../tmp")];
    tmp.forEach((dirname) => {
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
        }
    });
    let filenames = [];
    tmp.forEach((dirname) => {
        try {
            fs.readdirSync(dirname).forEach((file) => filenames.push(path.join(dirname, file)));
        } catch {
            // ignore
        }
    });
    filenames.forEach((file) => {
        try {
            let stats = fs.statSync(file);
            if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 5) {
                fs.unlinkSync(file);
            }
        } catch {
            // ignore
        }
    });
}

export { resetChat, resetCommand, Backup, OtakuNews, checkGempa, checkPremium, clearTmp };
