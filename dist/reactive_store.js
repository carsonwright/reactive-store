Observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {}

  /**
   * Private variables and methods
   */

  var callbacks = {},
    onEachEvent = function(e, fn) { e.replace(/\S+/g, fn) },
    defineProperty = function (key, value) {
      Object.defineProperty(el, key, {
        value: value,
        enumerable: false,
        writable: false,
        configurable: false
      })
    }

  /**
   * Listen to the given space separated list of `events` and execute the `callback` each time an event is triggered.
   * @param  { String } events - events ids
   * @param  { Function } fn - callback function
   * @returns { Object } el
   */

  defineProperty('on', function(events, fn) {
    if (typeof fn != 'function')  return el

    onEachEvent(events, function(name, pos) {
      (callbacks[name] = callbacks[name] || []).push(fn)
      fn.typed = pos > 0
    })

    return el
  })

  /**
   * Removes the given space separated list of `events` listeners
   * @param   { String } events - events ids
   * @param   { Function } fn - callback function
   * @returns { Object } el
   */

  defineProperty('off', function(events, fn) {
    if (events == '*') callbacks = {}
    else {
      onEachEvent(events, function(name) {
        if (fn) {
          var arr = callbacks[name]
          for (var i = 0, cb; cb = arr && arr[i]; ++i) {
            if (cb == fn) arr.splice(i--, 1)
          }
        } else delete callbacks[name]
      })
    }
    return el
  })

  /**
   * Listen to the given space separated list of `events` and execute the `callback` at most once
   * @param   { String } events - events ids
   * @param   { Function } fn - callback function
   * @returns { Object } el
   */

  defineProperty('one', function(events, fn) {
    function on() {
      el.off(events, on)
      fn.apply(el, arguments)
    }
    return el.on(events, on)
  })

  /**
   * Execute all callback functions that listen to the given space separated list of `events`
   * @param   { String } events - events ids
   * @returns { Object } el
   */

  defineProperty('trigger', function(events) {

    // getting the arguments
    // skipping the first one
    var arglen = arguments.length - 1,
      args = new Array(arglen)
    for (var i = 0; i < arglen; i++) {
      args[i] = arguments[i + 1]
    }

    onEachEvent(events, function(name) {

      var fns = (callbacks[name] || []).slice(0)

      for (var i = 0, fn; fn = fns[i]; ++i) {
        if (fn.busy) return
        fn.busy = 1

        try {
          fn.apply(el, fn.typed ? [name].concat(args) : args)
        } catch (e) { el.trigger('error', e) }
        if (fns[i] !== fn) { i-- }
        fn.busy = 0
      }

      if (callbacks.all && name != 'all')
        el.trigger.apply(el, ['all', name].concat(args))

    })

    return el
  })

  return el

}
function ReActiveStore(constructor){
  this.data = Object()
  this.paramKey = function(url, params){
    Object.keys(params).sort().map(function(key){
      return params[key]
    })
    return md5(JSON.stringify(params))
  }
  this.find = function(params, callback){
    key = this.paramKey(this.collectionUrl, params)
    if(this.requestQue[key] == null){
      this.request(key, "find", params)
    }else if(this.data[key]){
      callback(this.data[key])
    }
    this.on(key, callback)
    return this;
  }
  this.requestQue = Object()
  this.findOne = function(params, callback){
    key = this.paramKey(this.memberUrl, params)
    if(this.requestQue[key] == null){
      this.request(key, "findOne", params)
    }else if(this.data[key]){
      callback(this.data[key])
    }
    this.on(key, callback)
    return this;
  }

  this.resources = function(url){
    this.collectionUrl = url
    this.memberUrl = url + "/:id"
  }

  this.request = function(key, type, params){
    constructor = this
    this.requestQue[key] = {
      key: key,
      type: type,
      params: params,
      fetch: function(){
        constructor["fetch" + type.replace("find", "")](this.key, this.params) // Replace find with fetch i.e. findOne = fetchOne or find = fetch
      }
    }
    this.requestQue[key].fetch()
    return this;
  }
  this.create = function(params){
    params = this.params.create(params)
    this.ajax("post", this.collectionUrl, params)
    return this;
  }
  this.delete = function(params){
    constructor = this
    key = this.paramKey(this.memberUrl, params)
    this.ajax("delete", this.memberUrl, params, function(){
      constructor.trigger(key + " delete")
    })
    return this;
  }
  this.update = function(findParams, params){
    constructor = this
    key = this.paramKey(this.memberUrl, findParams)
    params = $.extend({}, findParams, params)
    this.ajax("put", this.memberUrl, params, function(response){
      constructor.trigger(key + " put", response)
    })
    return this;
  }
  this.ajax = function(method, url, params, callback){
    constructor = this;
    processedUrl = this.processUrl(url, params)
    console.log(processedUrl)
    $[method](processedUrl.url, processedUrl.params).then(function(response) {
      if(callback){
        callback(response)
      }else{
        constructor.trigger(method, response);
      }
    }).fail(function(response) {
      console.log("Error");
      console.log(response);
    });
  }
  this.processUrl = function(url, params){
    sendParams = Object()
    Object.keys(params).forEach(function(key){
      if(url.indexOf(":" + key) != -1){
        url = url.replace(":"+ key, params[key])
      }else{
        sendParams[key] = params[key]
      }
    })
    
    return {url: url, params: sendParams}
  }
  this.fetchOne = function(key, params){
    that = this
    this.ajax("get", this.memberUrl, params, function(response){
      that.data[key] = response
      that.trigger(key, response)
    })
  }
  this.fetch = function(key, params){
    that = this
    this.ajax("get", this.collectionUrl, params, function(response){
      that.data[key] = response
      that.trigger(key, response)
    })
  }

  var store = Observable(this)
  store.on("post put update delete", function(){
    Object.keys(this.requestQue).forEach(function(key){
      fetcher = store.requestQue[key]
      if(fetcher.type == "find"){
        fetcher.fetch()
      }
      
    })
  })
  return store;
}