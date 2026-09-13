import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { eventBus, EVENTS } from '../events/eventBus';

import jwt from 'jsonwebtoken';

let io: SocketIOServer;

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'lc_access_dev';

export const initSocket = (server: HttpServer) => {
  const isProd = process.env.NODE_ENV === 'production';
  io = new SocketIOServer(server, {
    cors: {
      origin: isProd
        ? ['https://lankacare.me', 'https://www.lankacare.me', process.env.FRONTEND_URL].filter(Boolean) as string[]
        : [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) return next(new Error('Authentication error'));
      
      const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
      const token = cookies.accessToken;
      
      if (!token) return next(new Error('Authentication error'));
      
      const decoded = jwt.verify(token, ACCESS_SECRET) as any;
      socket.data.user = decoded; // Contains { sub, role, hospitalId, districtId, provinceId }
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id} (User: ${socket.data.user?.sub})`);

    // Roles can join their specific rooms securely
    socket.on('join_clinic', (clinicId: string) => {
      const user = socket.data.user;
      if (user && (user.role === 'MINISTRY_ADMIN' || user.role === 'SUPER_ADMIN' || user.hospitalId)) {
        socket.join(`clinic_${clinicId}`);
        console.log(`[Socket.io] ${socket.id} joined clinic_${clinicId}`);
      }
    });

    socket.on('join_hospital', (hospitalId: string) => {
      const user = socket.data.user;
      if (user && (user.role === 'MINISTRY_ADMIN' || user.role === 'SUPER_ADMIN' || user.hospitalId === hospitalId)) {
        socket.join(`hospital_${hospitalId}`);
        console.log(`[Socket.io] ${socket.id} joined hospital_${hospitalId}`);
      }
    });

    socket.on('join_ministry', () => {
      const user = socket.data.user;
      if (user && (user.role === 'MINISTRY_ADMIN' || user.role === 'SUPER_ADMIN')) {
        socket.join('ministry_dashboard');
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  // Listen to internal event bus and broadcast to connected clients
  eventBus.on(EVENTS.PATIENT_CHECKED_IN, (data) => {
    // Broadcast to the specific clinic queue
    if (data.clinicId) {
      io.to(`clinic_${data.clinicId}`).emit('queue_updated', data);
    }
    // Broadcast to hospital dashboard
    if (data.hospitalId) {
      io.to(`hospital_${data.hospitalId}`).emit('hospital_operations_updated', data);
    }
    // Broadcast to Ministry Command Center
    io.to('ministry_dashboard').emit('ministry_metrics_updated', { type: 'PATIENT_CHECKED_IN', data });
  });

  eventBus.on(EVENTS.CONSULTATION_COMPLETED, (data) => {
    if (data.clinicId) {
      io.to(`clinic_${data.clinicId}`).emit('queue_updated', data);
    }
    if (data.hospitalId) {
      io.to(`hospital_${data.hospitalId}`).emit('hospital_operations_updated', data);
    }
    // Broadcast to Ministry Command Center
    io.to('ministry_dashboard').emit('ministry_metrics_updated', { type: 'CONSULTATION_COMPLETED', data });
  });

  eventBus.on(EVENTS.PRESCRIPTION_CREATED, (data) => {
    if (data.hospitalId) {
      io.to(`hospital_${data.hospitalId}`).emit('pharmacy_queue_updated', data);
    }
    io.to('ministry_dashboard').emit('ministry_metrics_updated', { type: 'PRESCRIPTION_CREATED', data });
  });

  eventBus.on(EVENTS.PRESCRIPTION_DISPENSED, (data) => {
    if (data.hospitalId) {
      io.to(`hospital_${data.hospitalId}`).emit('pharmacy_queue_updated', data);
    }
    io.to('ministry_dashboard').emit('ministry_metrics_updated', { type: 'PRESCRIPTION_DISPENSED', data });
  });

  eventBus.on(EVENTS.LAB_TEST_REQUESTED, (data) => {
    if (data.hospitalId) {
      io.to(`hospital_${data.hospitalId}`).emit('lab_queue_updated', data);
    }
    io.to('ministry_dashboard').emit('ministry_metrics_updated', { type: 'LAB_TEST_REQUESTED', data });
  });

  eventBus.on(EVENTS.LAB_RESULT_COMPLETED, (data) => {
    if (data.hospitalId) {
      io.to(`hospital_${data.hospitalId}`).emit('lab_queue_updated', data);
    }
    io.to('ministry_dashboard').emit('ministry_metrics_updated', { type: 'LAB_RESULT_COMPLETED', data });
  });

  console.log('[Socket.io] Service initialized.');
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
