"use strict"
let connection = null

const MAX_SCALE = 6
const VERTICAL_CHANCE = 0.13
const MAX_LOCATION_RETRY = 10

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}

function connect() {
    const serverUrl = "ws://localhost:8080"
    connection = new WebSocket(serverUrl, "json")
    console.log("* Created WebSocket")

    connection.onopen = function() {
        console.log("* onOpen")
    }

    const COUNTS = {}

    const svgContainer = d3.select("svg")

    const getRandomXY = () => {
        const randomX = (0.5 + (Math.random() - 0.5) * 0.8) * window.innerWidth
        const randomY = (0.5 + (Math.random() - 0.5) * 0.8) * window.innerHeight
        return [randomX, randomY]
    }

    const getNewLocation = () => {
        const existingNodeBBoxes = svgContainer
            .selectAll(".node")
            .nodes()
            .map((node) => node.getBoundingClientRect())

        let [randomX, randomY] = getRandomXY()
        let i = 0
        while (i < MAX_LOCATION_RETRY) {
            let collided = false
            for (const bbox of existingNodeBBoxes) {
                if (
                    randomX > bbox.x - bbox.width &&
                    randomX < bbox.x + 2 * bbox.width &&
                    randomY > bbox.y - bbox.height &&
                    randomY < bbox.y + 2 * bbox.height
                ) {
                    ;[randomX, randomY] = getRandomXY()
                    collided = true
                    break
                }
            }
            if (!collided) {
                console.log(i)
                break
            }
            i++
        }
        return [randomX, randomY]
    }

    connection.onmessage = function(messageEvent) {
        console.log("* onMessage")
        if (messageEvent.data === "connected") {
            console.log("Connected.")
            return
        }
        const message = JSON.parse(messageEvent.data)
        console.log(message)
        const [randomX, randomY] = getNewLocation()
        let transform = `translate(${randomX},${randomY})`
        if (Math.random() < VERTICAL_CHANCE) {
            if (Math.random() < 0.5) {
                transform += `rotate(90)`
            } else {
                transform += `rotate(-90)`
            }
        }
        const text = message.text
        if (text) {
            if (text in COUNTS) {
                COUNTS[text]++
            } else {
                COUNTS[text] = 1
            }
            const scale = Math.pow(COUNTS[text], 0.8)

            const fontSize = 20 * clamp(scale, 1, MAX_SCALE)

            svgContainer
                .append("text")
                .attr("class", "node")
                .attr("font-family", "Comic Sans MS")
                .attr("font-size", `${Math.round(fontSize)}px`)
                .attr("fill", message.color)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "baseline")
                .attr("transform", transform)
                .text(text)
                .transition()
                .delay(500)
                .duration(2000)
                .style("opacity", 0)
                .on("end", () => COUNTS[text]--)
                .remove()
        } else {
            const baseImageLength = 28
            const images = message.imageUrls.length

            // Increment counts for each emote by a maximum of once per message.
            const uniqueImages = new Set(message.imageUrls)
            uniqueImages.forEach((imageUrl) => {
                if (imageUrl in COUNTS) {
                    COUNTS[imageUrl]++
                } else {
                    COUNTS[imageUrl] = 1
                }
            })

            message.imageUrls.forEach((imageUrl, i) => {
                const scale = Math.pow(COUNTS[imageUrl], 0.8)
                const imageLength = baseImageLength * clamp(scale, 1, MAX_SCALE)

                let x = -imageLength / 2
                const y = -imageLength

                x += (-(images - 1) / 2 + i) * imageLength

                const svgImage = svgContainer
                    .append("image")
                    .attr("class", "node")
                    .attr("href", imageUrl)
                    .attr("height", imageLength)
                    .attr("fill", message.color)
                    .attr("x", x)
                    .attr("y", y)
                    .attr("transform", transform)
                    .transition()
                    .delay(500)
                    .duration(2000)
                    .style("opacity", 0)

                if (uniqueImages.has(imageUrl)) {
                    svgImage.on("end", () => COUNTS[imageUrl]--)
                    uniqueImages.delete(imageUrl)
                }

                svgImage.remove()
            })
        }

        svgContainer
            .append("text")
            .attr("font-family", "Comic Sans MS")
            .attr("font-size", "12px")
            .attr("fill", message.color)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "hanging")
            .attr("transform", transform)
            .text(message.username)
            .transition()
            .delay(500)
            .duration(2000)
            .style("opacity", 0)
        // .remove()
    }
}

window.addEventListener("load", connect)
