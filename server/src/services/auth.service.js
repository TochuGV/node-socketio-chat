import User from '../models/user.model.js';

export const findOrCreateUser = async (profile, provider) => {
  const idField = `${provider}Id`;
  let user = await User.findOne({ [idField]: profile.id });
  if (!user) {
    user = new User({
      username: profile.displayName || profile.username,
      [idField]: profile.id,
    });
    await user.save();
  };
  return user;
};