var NODE_PATH = '/floureon/'

module.exports = function(RED) {
  RED.httpAdmin.get(NODE_PATH + 'getProperties', function (req, res) {
    var config = req.query
    var controller = RED.nodes.getNode(config.controllerID)

    if (controller && controller.constructor.name === "ServerNode") {
      const properties = controller.properties || []
      res.json(properties)
    } else {
      res.json([])
    }
  })
}
