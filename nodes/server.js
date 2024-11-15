const FloureonHelper = require('../resources/FloureonHelper.js')
const broadlink = require('node-broadlink')

const LISTEN_INTERVAL = 1000

module.exports = (RED) => {
  class ServerNode {
    constructor(config) {
      RED.nodes.createNode(this, config)
      this.config = config
      this.connection = false
      this.properties = undefined
      this.listeners = {
        'onData': []
      }
      this.on('close', () => this.onClose())

      this.device = undefined
      this.connect()
    }

    connect() {
      try {
        const macBytes = this.config.mac.split(':').reverse().map((b) => parseInt(b, 16))
        const address = this.config.host
        const port = this.config.port || 80
        this.device = broadlink.genDevice(0x4EAD, {address, port}, macBytes)

        const that = this

        this.device.auth().then(() => {
          that.connection = true
          that.log('Floureon Connected')
          that.launchCheck()
        })
      } catch (ex) {
        console.error("Cannot connect broalink", ex)
      }
    }

    getFullStatus(done) {
      if (!this.connection || !this.device) {
        return
      }
      try {
        this.device.getFullStatus().then((data) => {
          done(data)
        })
      } catch(ex) {
        console.error("Cannot get full status", ex)
        done(undefined)
      }
    }

    nodeSend(node, fullPayload) {
      clearTimeout(node.cleanTimer)
      let text = RED._("node-red-contrib-floureon/server:status.received")
      let payload = fullPayload

      if (node.config.property && node.config.property !== '') {
        if (fullPayload && node.config.property in fullPayload) {
          payload = text = fullPayload[node.config.property]
        } else {
          // Should not occurs
          return
        }
      }

      if ('firstMsg' in node && node.firstMsg) {
        node.firstMsg = false

        if ('outputAtStartup' in node.config && !node.config.outputAtStartup) {
          node.last_value = payload
          return
        }
      }

      if (node.config.filterChanges) {
        if (JSON.stringify(node.last_value) === JSON.stringify(payload)) {
          return
        }
      }

      node.send({ payload })
      node.last_value = payload
      
      let time = FloureonHelper.statusUpdatedAt()
      let status = {
          fill: "green",
          shape: 'dot',
          text: text
      }
      node.setSuccessfulStatus(status)

      node.cleanTimer = setTimeout(() => {
          status.text += ' ' + time
          status.shape = 'ring'
          node.setSuccessfulStatus(status)
      }, 3000)
    }

    on(event, callback) {
      if (!this.listeners[event]) {
        console.warn(`Event ${event} is not supported`)
        return
      }
      this.listeners[event].push(callback)
    }

    removeListener(event, callback) {
      if (!this.listeners[event]) {
        creturn
      }
      const index = this.listeners[event].indexOf(callback)
      if (index > -1) {
        this.listeners[event].splice(index, 1)
      }
    }

    notify(event, data) {
      for (let i = 0; i < this.listeners[event].length; ++i) {
        this.listeners[event][i](data)
      }
    }

    check(done) {
      if (!this.connection) {
        done()
        return
      }
      const that = this
      this.getFullStatus((data) => {
        that.properties = Object.keys(data)
        that.notify("onData", data)
        done()
      })
    }

    launchCheck() {
      const that = this
        this.check(() => {
          setTimeout(() => {
          that.launchCheck()
        }, LISTEN_INTERVAL)
      })      
    }

    onClose() {
      this.connection = false
      this.device = undefined
      this.emit('onClose')
      this.log('Floureon connection closed')
    }

    setTemperature(value) {
      if (!this.connection || !this.device) {
        return
      }
      try {
        this.device.setTemp(parseFloat(value))
      } catch(ex) {
        console.error("Cannot set temperature", ex)
      }
    }
  }

  RED.nodes.registerType('floureon-server', ServerNode, {})
}

