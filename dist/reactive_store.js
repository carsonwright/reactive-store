function ReactiveStore(constructor){
  this.data = Object()
  this.paramKey = function(url, params){
    return md5(JSON.stringify(params))
  }
  this.find = function(params, callback){
    params = this.params.find(params)
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
    params = this.params.findOne(params)
    key = this.paramKey(this.memberUrl, params)
    if(this.requestQue[key] == null){
      this.request(key, "findOne", params)
    }else if(this.data[key]){
      callback(this.data[key])
    }
    this.on(key, callback)
    return this;
  }
  this.params = {
    collection: function(params){
      return {};
    },
    member: function(params){
      return {id: params.id};
    }
  }
  this.params.find = this.params.collection
  this.params.findOne = this.params.member
  this.params.delete = this.params.member
  this.params.update = this.params.member

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
    params = this.params.delete(params)
    key = this.paramKey(this.memberUrl, params)
    this.ajax("delete", this.memberUrl, params, function(){
      constructor.trigger(key + " delete")
    })
    return this;
  }
  this.update = function(params){
    constructor = this
    params = this.params.update(params)
    key = this.paramKey(this.memberUrl, params)
    this.ajax("put", this.memberUrl, params, function(){
      constructor.trigger(key + " put")
    })
    return this;
  }
  this.ajax = function(method, url, params, callback){
    constructor = this;
    processedUrl = this.processUrl(url, params)
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