import User from '../models/user.model.js';

export const findOrCreateUser = async (profile) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = new User({
      username: profile.displayName,
      googleId: profile.id,
    });
    await user.save();
  };
  return user;
};