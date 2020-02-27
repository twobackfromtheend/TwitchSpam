function getIndexFromString(indexString) {
    // Twitch emote locations are given as strings
    // E.g. '0-2', '4-6', '8-12'
    // This returns the first number (starting point of emote)
    // I.e. 0, 4, 8 respectively.
    const substring = indexString.substring(0, indexString.indexOf("-"))
    return parseInt(substring)
}

export function getTwitchEmotes(userstate) {
    const emotes = []
    const twitchMessageEmotes = userstate.emotes
    // console.log(twitchMessageEmotes)
    if (twitchMessageEmotes) {
        Object.entries(twitchMessageEmotes).forEach(([emoteId, locations]) => {
            locations.forEach((indexString) => {
                emotes.push({
                    type: "twitch",
                    index: getIndexFromString(indexString),
                    emoteId: emoteId,
                })
            })
        })
    }
    return emotes
}

export function getBttvEmotes(message, bttvEmotes) {
    const emotes = []
    bttvEmotes.forEach((emote) => {
        const emoteCode = emote.code
        const emoteIndex = message.indexOf(emoteCode)
        if (emoteIndex !== -1) {
            emotes.push({type: "bttv", index: emoteIndex, emoteId: emote.id})
        }
    })
    return emotes
}
