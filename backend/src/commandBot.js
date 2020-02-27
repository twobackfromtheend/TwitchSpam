import {getEmoteMessages, getKeywordMessages} from "./callbacks.js"
import {broadcastMessage} from "./server.js"

// Define configuration options
export function getTwitchOpts(channels) {
    return {
        identity: {
            username: "GruffuddTheShoBot",
            password: "oauth:PLACEHOLDER",
        },
        channels: channels,
        options: {
            clientId: "PLACEHOLDER",
        },
        connection: {
            reconnect: true,
            secure: true,
        },
    }
}

export function getOnMessage(
    keywords = null,
    twitchEmotes = false,
    bttvEmotes = null
) {
    return (channel_, userstate, message, self) => {
        if (self) {
            return
        } // Ignore messages from the bot

        // Remove whitespace from chat message
        const trimmedMessage = message.trim()
        const username = userstate.username
        const channel = channel_.substr(1) // Remove "#" prefix

        console.log(
            `* Received message by ${username} on ${channel}: ${trimmedMessage}`
        )
        let messages = []
        if (keywords) {
            const keywordMessages = getKeywordMessages(trimmedMessage, keywords)
            messages = messages.concat(keywordMessages)
        }
        if (twitchEmotes || bttvEmotes) {
            const emoteMessages = getEmoteMessages(
                channel,
                userstate,
                message,
                twitchEmotes,
                bttvEmotes
            )
            if (emoteMessages) {
                messages.push(emoteMessages)
            }
        }

        messages.forEach((message) => {
            if (message) {
                console.log(" * Sending message")
                console.log(message)
                broadcastMessage(
                    JSON.stringify({
                        ...message,
                        username: username,
                        color: userstate.color,
                    })
                )
                console.log("Sent")
            }
        })
    }
}

// Called every time the bot connects to Twitch chat
export function onConnected(addr, port) {
    console.log(`* Connected to ${addr}:${port}`)
}
