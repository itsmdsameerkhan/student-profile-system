const crypto = require('crypto')
const { Schema, model, SchemaTypes } = require('mongoose')
require('mongoose-type-email')

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      min: 3,
      max: 30,
    },
    email: {
      type: SchemaTypes.Email,
      trim: true,
      required: true,
      lowercase: true,
      unique: true,
    },
    phone: {
      type: String,
      default: '',
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    resetPasswordLink: {
      type: 'String',
      default: '',
    },
    role: {
      type: String,
      role: ['superuser', 'pat', 'ssd', 'teacher'],
      default: 'teacher',
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

userSchema
  .virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })

userSchema.methods = {
  authenticate: function (plainPassword) {
    return this.encryptPassword(plainPassword) === this.hashed_password
  },
  encryptPassword: function (password) {
    if (!password) return ''
    try {
      return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
    } catch (error) {
      return ''
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + ''
  },
}

module.exports = model('User', userSchema)
