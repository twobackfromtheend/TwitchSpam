import tmi from "tmi.js"
import {getOnMessage, getTwitchOpts, onConnected} from "./commandBot.js"
import {getChannelEmotes, getGlobalEmotes} from "./data/bttvApi.js"
import KEYWORDS from "./keywords.js"

const CHANNELS = ["callumtheshogun"]
//        "start": "node --experimental-modules backend/index.js",

async function main() {
    // Get BTTV emotes
    console.log("Getting BTTV emotes.")
    const globalEmotes = (await getGlobalEmotes()).emotes
    const channelEmotes = {}
    await Promise.all(
        CHANNELS.map((channel) =>
            getChannelEmotes(channel).then((emotes) => {
                channelEmotes[channel] = emotes.emotes
            })
        )
    )
    const bttvEmotes = {
        global: globalEmotes,
        channel: channelEmotes,
    }
    console.log("Received BTTV emotes")
    // console.log(channelEmotes)

    // Create a client with our options
    const twitchOpts = getTwitchOpts(CHANNELS)
    // noinspection JSPotentiallyInvalidConstructorUsage
    const client = new tmi.client(twitchOpts)

    const onMessage = getOnMessage(KEYWORDS, true, bttvEmotes)

    // Register our event handlers
    client.on("message", onMessage)
    client.on("connected", onConnected)

    // Connect to Twitch
    client.connect()
}

main()
