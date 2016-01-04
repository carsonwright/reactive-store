QUnit.test("Store.all", function( assert ) {
  done = assert.async()
  UserStore =  new RemoteStore("/users")
  $.mockjax({
    method: "get",
    url: "/users",
    params: "",
    responseText: {
      status: "success",
      users: [
        {first_name: "john", last_name: "doe"}
      ]
    }
  });
  UserStore.all().then(function(response){
      assert.ok(response.users[0].first_name == "john")
      done()
  })
});

QUnit.test( "Store.find", function( assert ) {
  done = assert.async()
  UserStore =  new RemoteStore("/users")
  $.mockjax({
    method: "get",
    url: "/users/10",
    params: "",
    responseText: {
      status: "success",
      first_name: "john", 
      last_name: "doe"
    }
  });
  UserStore.find({id: 10}).then(function(response){
      assert.ok(response.first_name == "john")
      done()
  })
});

QUnit.test( "Store.where", function( assert ) {
  done = assert.async()
  UserStore =  new RemoteStore("/users")
  $.mockjax({
    method: "get",
    url: "/users",
    params: {first_name: "John"},
    responseText: {
      status: "success",
      users: [
        {first_name: "john", last_name: "doe"}
      ]
    }
  });
  UserStore.where({first_name: "John"}).then(function(response){
      assert.ok(response.users[0].first_name == "john")
      done()
  })
});

QUnit.test( "Store.destroy", function( assert ) {
  done = assert.async()
  UserStore =  new RemoteStore("/users")
  $.mockjax({
    method: "delete",
    url: "/users/10",
    params: {first_name: "John"},
    responseText: {
      status: "success",
      users: [
        {first_name: "john", last_name: "doe"}
      ]
    }
  });
  UserStore.destroy({id: 10}).then(function(response){
      assert.ok(response.status == "success")
      done()
  })
});

QUnit.test( "Store.update", function( assert ) {
  done = assert.async()
  UserStore =  new RemoteStore("/users")
  $.mockjax({
    method: "put",
    url: "/users/10",
    params: {first_name: "John", last_name: "Wright"},
    responseText: {
      status: "success",
      users: [
        {first_name: "john", last_name: "doe"}
      ]
    }
  });
  UserStore.update({id: 10}, {first_name: "Carson", last_name: "Wright"}).then(function(response){
      assert.ok(response.status == "success")
      done()
  })
});

QUnit.test( "Store.create", function( assert ) {
  done = assert.async()
  UserStore =  new RemoteStore("/users")
  $.mockjax({
    method: "post",
    url: "/users",
    params: {first_name: "John"},
    responseText: {
      status: "success",
      users: [
        {first_name: "john", last_name: "doe"}
      ]
    }
  });
  UserStore.create({first_name: "Carson", last_name: "Wright"}).then(function(response){
      assert.ok(response.status == "success")
      done()
  })
});