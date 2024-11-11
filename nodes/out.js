const FloureonHelper = require('../resources/FloureonHelper.js')

module.exports = function(RED) {
    class FloureonNodeOut {
        constructor(config) {
          RED.nodes.createNode(this, config)

          var node = this
          node.config = config
          node.cleanTimer = null
          node.server = RED.nodes.getNode(node.config.server)

          if (!node.server) {
            node.status({
              fill: "red",
              shape: "dot",
              text: "node-red-contrib-floureon/server:status.no_server"
            })
          }

          node.status({}) //clean

          let payload = undefined
          node.on('input', function(msg) {
            clearTimeout(node.cleanTimer)

            const command = node.config.command

            switch (node.config.payloadType) {
              case 'num':
                payload = parseInt(node.config.payload)
                break

              case 'json':
                if (FloureonHelper.isJson(node.config.payload)) {
                  payload = parseInt(JSON.parse(node.config.payload))
                } else {
                  node.warn('Incorrect payload. Waiting for valid JSON')
                  node.status({
                    fill: "red",
                    shape: "dot",
                    text: "node-red-contrib-zigbee2mqtt/out:status.no_payload"
                  })
                  node.cleanTimer = setTimeout(function(){
                    node.status({}) //clean
                  }, 3000)
                }
                break
              
              case 'msg':
                payload = parseInt(msg[node.config.payload])
                break
            }

            switch (command) {
              case 'setTemperature':
                node.server.setTemperature(payload)
                break
            }

            const text = command + ': ' + payload
            
            node.status({
              fill: 'green',
              shape: "dot",
              text
            })
            let time = FloureonHelper.statusUpdatedAt()
            node.cleanTimer = setTimeout(function(){
              node.status({
                fill: 'green',
                shape: "ring",
                text: text + ' ' + time
              })
            }, 3000)
          })
        }
    }


    RED.nodes.registerType('floureon-out', FloureonNodeOut)
}






