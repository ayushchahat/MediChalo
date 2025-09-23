import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import AuthContext from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000'); // Your backend URL
      newSocket.emit('join_room', user.id);

      newSocket.on('new_order', (order) => {
        toast.info(`You have a new order: ${order._id}`);
      });

      newSocket.on('order_update', (order) => {
        toast.success(`Your order ${order._id} has been updated to ${order.status}`);
      });
      
      newSocket.on('new_assignment', (order) => {
        toast.info(`You have been assigned a new delivery: ${order._id}`);
      });


      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;