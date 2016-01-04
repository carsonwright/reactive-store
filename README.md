# ReActiveStore
## Setup Store
    UserStore = new RemoteStore()
    UserStore.resources("/users")

## Use Store
#### All
    UserStore.all().then(function(data){
      console.log(data)
    })
    // will fetch all users and log them using your resource url "/users"

#### Find    
    UserStore.find({id: 10}).then(function(data){
      console.log(data.length)
    })

    // Will return 1 user with the id 10 and will use your member url 
    // which by default is your your resource url + "/:id"

#### Where
    UserStore.where({first_name: "john"}).then(function(user){
      console.log(user)
    })

#### Create
    UserStore.create({first_name: "John", last_name: "doe"}).then(function(){

    })

#### Destroy
    UserStore.destroy({id: 10}).then(function(user){
      console.log(user)
    })
    UserStore.delete({id: 10})
    // Will automatically trigger the findOne({id: 10}) callback and pass in undefined for the user
## Suggested React Use
    var UserList = React.createClass({
        getInitialState: function() {
          return {
            users: []
          };
        },
        params: {},
        componentDidMount: function() {
          component = this;
          // Reactive Store
          UserStore.on("create update destroy").then(function(){
            component.fetch()
          })
        },
        fetch: function(){
          var component = this;
          UserStore.where(this.params).then(function(users){
            component.setState({
              users: users
            });
          })
        },
        changeQuery: function(){
          this.params = {laste_name: "Doe"}
        },
        render: function() {
          return (
            <div>
              {this.state.users.map(function(user){
                (
                  <a href={user.id}>{user.first_name} {user.last_name}</a>
                )
              }
              <a href="#" onClick={this.changeQuery}>Last Name Doe</a>
            </div>
          );
        }
    });

## Url Params
Params are parsed into the url, so if you have a url that contains :organization_id and pass in {organization_id: 10}
the :organization_id will be replaced by your param.
    UserStore = new ReActiveStore("/organizations")
    UserStore.setRoute("/organizations/:organization_id/users")
    
    UserStore.find({organization_id: 10}).then(function(users){
        console.log(users
    })

## Urls
    UserStore.find({first_name: "john"})                        // GET      /users?first_name="john"
    UserStore.findOne({id: 10})                                 // GET      /users/10
    UserStore.create({{first_name: "John", last_name: "doe"}})  // POST     /users {first_name: "john", last_name: "doe"}
    UserStore.update({id: 10}, {first_name: "Jimmy"})           // PUT      /users/10
    UserStore.delete({id: 10})                                  // DELETE   /users/10
        
