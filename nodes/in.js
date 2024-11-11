module.exports = function(RED) {
    class FloureonNodeIn {
        constructor(config) {
            RED.nodes.createNode(this, config)

            this.config = config
            this.firstMsg = true
            this.cleanTimer = null
            this.server = RED.nodes.getNode(config.server)
            this.last_value = null
            this.last_successful_status = {}
            this.status({})

            const node = this
            if (node.server) {
              this.listener_onData = (data) => this.server.nodeSend(node, data)
              node.server.on('onData', this.listener_onData)
            } else {
              node.status({
                fill: "red",
                shape: "dot",
                text: "node-red-contrib-floureon/server:status.no_server"
              })
            }
        }

        onConnectError() {
            this.status({
              fill: "red",
              shape: "dot",
              text: "node-red-contrib-floureon/server:status.no_connection"
            })
        }

        onClose() {
          if (this.listener_onData) {
            this.server.removeListener("onData", this.listener_onData)
          }

          this.onConnectError()
        }

        setSuccessfulStatus(obj) {
          this.status(obj)
          this.last_successful_status = obj
        }

    }
    RED.nodes.registerType('floureon-in', FloureonNodeIn)
}



