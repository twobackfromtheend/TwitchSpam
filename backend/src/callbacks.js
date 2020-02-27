import {getBttvEmotes, getTwitchEmotes} from "./emotes.js"

export function getKeywordMessages(message, keywords) {
    return keywords.map((keyword) => {
        if (message.startsWith(keyword)) {
            return {
                text: keyword,
            }
        }
        return false
    })
}

export function getEmoteMessages(
    channel,
    userstate,
    message,
    twitchEmotes,
    bttvEmotes
) {
    let emotes = []
    if (twitchEmotes) {
        const detectedTwitchEmotes = getTwitchEmotes(userstate)
        emotes = emotes.concat(detectedTwitchEmotes)
    }
    if (bttvEmotes) {
        const channelEmotes = bttvEmotes.channel[channel]
        let relevantBttvEmotes = [...bttvEmotes.global]
        if (channelEmotes) {
            relevantBttvEmotes = relevantBttvEmotes.concat(channelEmotes)
        } else {
            console.log(`Channel ${channel} has no fetched BTTV emotes.`)
        }
        const detectedBttvEmotes = getBttvEmotes(message, relevantBttvEmotes)
        emotes = emotes.concat(detectedBttvEmotes)
    }
    emotes.sort((a, b) => a.index - b.index)
    if (emotes.length > 0) {
        return {
            imageUrls: emotes.map((emote) => {
                switch (emote.type) {
                    case "twitch":
                        return `https://static-cdn.jtvnw.net/emoticons/v1/${emote.emoteId}/3.0`
                    case "bttv":
                        return `https://cdn.betterttv.net/emote/${emote.emoteId}/3x`
                    default:
                        throw Error(`Unknown emote type: ${emote.type}`)
                }
            }),
        }
    }
}
