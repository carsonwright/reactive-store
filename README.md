# ReActiveStore
## Setup Store
    UserStore = new ReActiveStore()
    UserStore.resources("/users")

## Use Store
#### Find
    UserStore.find({}, function(data){
      console.log(data)
    })
    // will fetch all users and log them using your resource url "/users"
    
    UserStore.find({}, function(data){
      console.log(data.length)
    })
    // Since find has already been run above this code will not fetch data but will get it from the store
    // All data is recorded under UserStore.data[UserStore.paramKey(url, params)]

#### FindOne
    UserStore.findOne({id: 10}, function(user){
      console.log(user)
    })
    // Will return 1 user with the id 10 and will use your member url 
    // which by default is your your resource url + "/:id"
#### Create
    UserStore.find({first_name: "john"}, function(data){
      console.log(data)
    })
    // will fetch the data but not return anything unless there is already a user with the first name john
    
    UserStore.create({first_name: "John", last_name: "doe"})
    // will automatically trigger the find for first_name: "john", which will fetch the data and rerun the call back
#### Delete
    UserStore.findOne({id: 10}, function(user){
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
    componentDidMount: function() {
      UserStore.find({}, function(users){
        if (this.isMounted()) {
          this.setState({
            users: users
          });
        }
      }.bind(this))
    },
  
    render: function() {
      return (
        <div>
          {this.state.users.map(function(user){
            (
              <a href={user.id}>{user.first_name} {user.last_name}</a>
            )
          }
        </div>
      );
    }
  });

## Url Params
Params are parsed into the url, so if you have a url that contains :organization_id and pass in {organization_id: 10}
the :organization_id will be replaced by your param.
    UserStore = new ReActiveStore()
    UserStore.resources("/organizations/:organization_id/users")
    
    UserStore.find({organization_id: 10}, function(users){
        console.log(users
    })
    
    UserStore.findOne({organization_id: 10, id:20}, function(user){
        console.log(user)
    })
        

## Urls
    UserStore.find({})                                          // GET      /users
    UserStore.findOne({id: 10})                                 // GET      /users/10
    UserStore.create({{first_name: "John", last_name: "doe"}})  // POST     /users params
    UserStore.update({id: 10}, {first_name: "Jimmy"})           // PUT      /users/10
    UserStore.delete({id: 10})                                  // DELETE   /users/10
        
