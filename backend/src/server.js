import WebSocket from "ws"

const wss = new WebSocket.Server({port: 8080})
let ws = null

wss.on("connection", (ws_, req) => {
    ws = ws_
    ws.send("connected")
    const ip = req.connection.remoteAddress
    console.log(`WSS client connected: ${ip}`)
})

export const broadcastMessage = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message)
            console.log("Sent to client")
        }
    })
}
