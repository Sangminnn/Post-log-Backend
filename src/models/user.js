let mongoose = reuiqre('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
  email: String,
  username: String,
  password: String,
  passwordConfirm: String
})