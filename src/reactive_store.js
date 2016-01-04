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
