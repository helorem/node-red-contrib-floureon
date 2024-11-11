module.exports = function(RED) {
  class FloureonNodeGet {
    constructor(config) {
      RED.nodes.createNode(this, config)

      let node = this
      node.config = config
      node.cleanTimer = null
      node.last_successful_status = {}
      node.server = RED.nodes.getNode(node.config.server)
      node.status({})
      if (node.server) {
        node.on('input', (_msg) => {
          node.server.getFullStatus((data) => {
            node.server.nodeSend(node, data)
          })          
        })
      } else {
        node.status({
          fill: 'red',
          shape: 'dot',
          text: 'node-red-contrib-floureon/server:status.no_server',
        })
      }
    }

    setSuccessfulStatus(obj) {
      this.status(obj)
      this.last_successful_status = obj
    }
  }

  RED.nodes.registerType('floureon-get', FloureonNodeGet)
}




