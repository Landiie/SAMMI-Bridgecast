const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const fs = require('fs')

const server = http.createServer(express)
const wss = new WebSocket.Server({ server })

const configs = argsToObj()

if (!configs.port) configs.port = 6969

wss.on("connection", function connection(ws, req) {
  console.log(req.url)
  ws.sammi_identifier = req.url;
  ws.on("message", function incoming(data) {
    const dataParsed = JSON.parse(data)
    if (req.url !== '/sammi-bridge-boi') return; //cancel if not sent from bridge
    console.log('checking clients...')
    // console.log(JSON.parse(data.toString("utf8")))
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN && client.sammi_identifier === `/${dataParsed.client_id}`) {
        client.send(JSON.stringify(dataParsed.data))
        console.log(`sending to sammi client: ${client.sammi_identifier}`)
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

function stringify(obj) {
  let cache = [];
  let str = JSON.stringify(obj, function(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // reset the cache
  return str;
}

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