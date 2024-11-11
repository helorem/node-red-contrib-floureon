class FloureonEditor {
  constructor(node, config = {}) {
    this.node = node
    this.config = Object.assign( {
      allow_empty:false
    }, config)
    this.properties = undefined

    this.property = node.property || null
    this.refresh = false
    return this
  }

  bind() {
    let that = this
    that.getRefreshBtn().off('click').on('click', () => {
      that.refresh = true
      that.build()
    })
    that.getServerInput().off('change').on('change', (e) => {
      that.property = null
      that.refresh = true
      that.build()
    })
  }

  async build() {
    this.buildPropertyInput()
    this.bind()
  }

  async getProperties() {
    if (!this.properties || this.refresh) {
      const response = await fetch('floureon/getProperties?' + new URLSearchParams({
        controllerID: this.getServerInput().val()
      }).toString(), {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.refresh = false
      this.properties = await response.json()
      return this.properties
    } else {
      const that = this
      return await new Promise((resolve) => {
        resolve(that.properties)
      })
    }
  }

  async buildPropertyInput() {
    let input = this.getPropertyInput()
    if (!input) {
      return
    }

    input.children().remove()
    input.html('<option value="">'+ RED._("node-red-contrib-floureon/get:editor.complete_payload")+'</option>')

    this.properties = await this.getProperties()

    $.each(this.properties, (_index, value) => {
      $('<option  value="' + value + '">' + value + '</option>').appendTo(input)
    })

    if (input.find('option[value=' + this.property + ']').length) {
      input.val(this.property)
    } else {
      input.val(input.find('option').eq(0).attr('value'))
    }
  }

  getPropertyInput() {
    let $elem = $('#node-input-property')
    return $elem.length ? $elem : null
  }

  getServerInput() {
    return $('#node-input-server')
  }

  getRefreshBtn() {
    return $('#force-refresh')
  }
}
