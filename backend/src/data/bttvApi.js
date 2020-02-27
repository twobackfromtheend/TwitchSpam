import got from "got"

export async function getGlobalEmotes() {
    const globalEmotes = await got("https://api.betterttv.net/2/emotes").json()
    console.log("Got BTTV global emotes")
    // console.log(Object.keys(globalEmotes))
    return globalEmotes
}

export async function getChannelEmotes(channelName) {
    try {
        const channelEmotes = await got(
            `https://api.betterttv.net/2/channels/${channelName}`
        ).json()
        console.log(`Got BTTV channel emotes: ${channelName}`)
        console.log(Object.keys(channelEmotes))
        return channelEmotes
    } catch (e) {
        console.log(`Error getting BTTV channel emotes: ${channelName}`)
        console.log(e)
        return {emotes: []}
    }
}
