export default class UserWithoutPasswordDTO {
  constructor(user) {
    this._id = user._id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.cart = user.cart;
    this.role = user.role;
    this.documents = user.documents;
    this.last_connection = user.last_connection;
  }
}
