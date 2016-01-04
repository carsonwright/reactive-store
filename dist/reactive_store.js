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
function RemoteStore(resourceUrl){
  this.create = function(params){
    return this.ajax("create", params)
  }
  this.where = function(params){
    return this.ajax("where", params)
  }
  this.find = function(params){
    return this.ajax("find", {id: params})
  }
  this.update = function(id, params){
    params.id = id
    return this.ajax("update", params)
  }
  this.destroy = function(id){
    var params = {id: id}
    return this.ajax("destroy", params) 
  }
  this.all = function(){
    return this.where({})
  }
  this.processUrl = function(url, params){
    var sendParams = Object()
    Object.keys(params).forEach(function(key){
      if(url.indexOf(":" + key) != -1){
        url = url.replace(":"+ key, params[key])
      }else{
        sendParams[key] = params[key]
      }
    })
    
    return {url: url, params: sendParams}
  }
  this.routes = Object()
  this.resourceUrl = resourceUrl
  this.memberUrl = resourceUrl + "/:id"

  this.setRoute = function(key, method, url){
    this.routes[key] = {method: method.toUpperCase(), url: url}
  }
  this.setAction = function(key, method, url){
    this.setRoute(key, method, url)
    if(method.toLowerCase() == "put"){
      this[key] = function(target, params){
        var params = $.extend({}, params, target)
        return this.ajax(key, params)
      }
    }else{
      this[key] = function(params){
        return this.ajax(key, params)
      }
    }
  }

  this.setRoute("create", "POST", this.resourceUrl);
  this.setRoute("where", "GET", this.resourceUrl);
  this.setRoute("find", "GET", this.memberUrl);
  this.setRoute("destroy", "DELETE", this.memberUrl);
  this.setRoute("update", "PUT", this.memberUrl);

  this.ajax = function(routeName, opts){
    var route = this.routes[routeName]
    var urlAndParams = this.processUrl(route.url, opts)
    var promise = $.Deferred()
    var constructor = this
    $.ajax({
      method: route.method,
      url: urlAndParams.url,
      data: urlAndParams.params
    }).then(function(data){
      constructor.trigger(routeName + " " + route.method.toLowerCase())
      promise.resolve(data)
    })
    return promise
  }
  Observable(this)
  return this
}
