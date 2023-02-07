const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const admins = require("../config/admins.json");
const users = require("../config/users.json")

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://francojalil7:S8LJF1qoldSUDtWB@cluster0.dimkvew.mongodb.net/?retryWrites=true"
    );
    console.log("Connected to mongodb");
  } catch (error) {
    console.log(error);
  }
};

connectDB();

console.log("SEED STARTING");

(async () => {

  let saltRounds = 10;

  const adminPromises = admins.map(async (user) => {
    let hashedPassword = await bcrypt.hash(user.password, saltRounds);
    return {user, hashedPassword}
  });

  const userPromises = users.map(async (user) => {
    let hashedPassword = await bcrypt.hash(user.password, saltRounds);
    return {user, hashedPassword}
  })

  const adminResponse = await Promise.all(adminPromises)
  const userResponse = await Promise.all(userPromises)

  const hashedAdminData = adminResponse.map((user) => {
    return ({userName: user.user.userName, fullName: user.user.fullName, email: user.user.email, password: user.hashedPassword, isAdmin: user.user.isAdmin, status: user.user.status})
  })

  const hashedUserData = userResponse.map((user) => {
    return ({userName: user.user.userName, fullName: user.user.fullName, email: user.user.email, password: user.hashedPassword, isAdmin: user.user.isAdmin, status: user.user.status, role: user.user.role, registerForm: user.user.registerForm, country: user.user.country, profession: user.user.profession, language: user.user.language, skills: user.user.skills, age: user.user.age})
  })

  const totalUsers = hashedAdminData.concat(hashedUserData)

  const seedDatabase = async () => {
    try {
      await User.deleteMany({});
      await User.insertMany(totalUsers);
      console.log("Seeding successful");
    } catch (error) {
      console.log(error);
    }
  };

  seedDatabase().then(() => {
    mongoose.connection.close();
  });
})();
