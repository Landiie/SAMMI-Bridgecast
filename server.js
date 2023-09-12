const express = require("express")
const http = require("http")
const WebSocket = require("ws")

const server = http.createServer(express)
const wss = new WebSocket.Server({ server })

const configs = argsToObj()

if (!configs.port) configs.port = 6969

wss.on("connection", function connection(ws, req) {
  console.log(req.url)
  ws.on("message", function incoming(data) {
    console.log(JSON.parse(data.toString("utf8")))
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data.toString("utf8"))
      }
    })
  })
  ws.on("close", function closeConnection(ws, req) {
    console.log(`closed ${ws}`)
  })
})

server.listen(configs.port, function () {
  console.log(`Server is listening on ${configs.port}!`)
})

function argsToObj() {
  let configs = []
  let obj = {}
  const arguments = process.argv.slice(2)
  arguments.forEach((value) => {
    if (value.includes("=")) {
      let [k, v] = value.split("=")
      obj[k] = v
    }
  })
  return obj
}