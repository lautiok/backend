export default class UserDTO {
  constructor(user) {
    this.first_name = user.first_name.trim();
    this.last_name = user.last_name?.trim() || "";
    this.email = user.email.trim();
    this.age = user.age
      ? Number.isInteger(parseInt(user.age)) && parseInt(user.age) >= 0
        ? parseInt(user.age)
        : 0
      : 0;
    this.password = user.password || "";
    this.cart = user.cart;
    this.role = user.role || "user";
    this.documents = user.documents || [];
    this.last_connection = user.last_connection || new Date();
  }
}
