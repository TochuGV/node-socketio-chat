// Maneja la respuesta exitosa de autenticación de Google
export const googleCallback = (req, res) => {
  // Successful authentication, redirect home.
  res.redirect('/');
};

/*
export const getMe = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Unauthorized' }); // PREGUNTAR EN BASE A 'isAuthenticated'
  }
};
*/

// Devuelve el estado de autenticación y la información del usuario al cliente
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

// Maneja el cierre de sesión
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