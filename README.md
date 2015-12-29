# ReActiveStore
## Setup Store
    UserStore = new ReActiveStore()
    UserStore.resources("/users")

## Use Store
    UserStore.find({}, function(data){
      console.log(data)
    })
    // will fetch all users and log them
    
    UserStore.find({}, function(data){
      console.log(data.length)
    })
    // Since find has already been run above this code will not fetch data but will get it from the store
    // All data is recorded under UserStore.data[UserStore.paramKey(url, params)]
    
    UserStore.find({first_name: "john"}, function(data){
      console.log(data)
    })
    // will fetch the data but not return anything unless there is already a user with the first name john
    
    UserStore.create({first_name: "John", last_name: "doe"})
    // will automatically trigger the find for first_name: "john", which will fetch the data and rerun the call back

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
            username: lastGist.owner.login,
            lastGistUrl: lastGist.html_url
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
