export const loginCallback = (req, res) => {
  res.redirect('/');
};

export const getMe = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        username: req.user.username
      }
    });
  } else {
    res.json({ isAuthenticated: false });
  };
};

export const logout = (req, res) => {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
};