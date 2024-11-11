'use strict'


class FloureonHelper {
  static statusUpdatedAt() {
    return ' [' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() + ']'
  }

  static isJson(str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }
}

module.exports = FloureonHelper
