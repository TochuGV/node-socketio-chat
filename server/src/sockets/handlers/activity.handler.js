export default (io, socket) => {
  const broadcastUserCount = () => {
    const visibleCount = Array.from(io.sockets.sockets.values()).filter(s => s.showOnline).length;
    io.emit('user count', visibleCount);
  };

  const handleTyping = () => {
    socket.broadcast.emit('typing', {
      userId: socket.userId || socket.id,
      username: socket.username
    });
  };

  const handleStopTyping = () => {
    socket.broadcast.emit('stop typing', {
      userId: socket.userId || socket.id
    });
  };

  const handleToggleOnlineVisibility = (showOnline) => {
    socket.showOnline = !!showOnline;
    broadcastUserCount();
  };

  socket.on('typing', handleTyping);
  socket.on('stop typing', handleStopTyping);
  socket.on('toggle online visibility', handleToggleOnlineVisibility);

  return { broadcastUserCount };
};