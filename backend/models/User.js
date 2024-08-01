// messagingapp/backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
      validate: {
        validator: function (password) {
          // Check for at least one uppercase letter
          if (!/[A-Z]/.test(password)) {
            throw new Error(
              "Password must contain at least one uppercase letter"
            );
          }
          // Check for at least one lowercase letter
          if (!/[a-z]/.test(password)) {
            throw new Error(
              "Password must contain at least one lowercase letter"
            );
          }
          // Check for at least one number
          if (!/\d/.test(password)) {
            throw new Error("Password must contain at least one number");
          }
          // Check for at least one symbol
          if (!/[$@#&!]/.test(password)) {
            throw new Error(
              "Password must contain at least one symbol ($@#&!)"
            );
          }
          return true;
        },
        message: (props) => props.reason,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const startTime = Date.now();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    logger.info(
      `Password hashed for user ${this._id} in ${Date.now() - startTime}ms`
    );
    next();
  } catch (error) {
    logger.error(`Error hashing password for user ${this._id}`, {
      error: error.message,
      duration: Date.now() - startTime,
    });
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const startTime = Date.now();
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    logger.info(
      `Password comparison for user ${this._id} completed in ${
        Date.now() - startTime
      }ms`
    );
    return isMatch;
  } catch (error) {
    logger.error(`Error comparing password for user ${this._id}`, {
      error: error.message,
      duration: Date.now() - startTime,
    });
    throw error;
  }
};

userSchema.statics.findByEmail = async function (email) {
  const startTime = Date.now();
  try {
    const user = await this.findOne({ email });
    logger.info(
      `User lookup by email completed in ${Date.now() - startTime}ms`,
      { found: !!user }
    );
    return user;
  } catch (error) {
    logger.error("Error finding user by email", {
      error: error.message,
      duration: Date.now() - startTime,
    });
    throw error;
  }
};

// Log when a new user is created
userSchema.post("save", function (doc, next) {
  if (this.isNew) {
    logger.info("New user created", {
      userId: doc._id,
      username: doc.username,
    });
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
