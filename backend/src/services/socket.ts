import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { eventBus, EVENTS } from '../events/eventBus';

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Roles can join their specific rooms
    socket.on('join_clinic', (clinicId: string) => {
      socket.join(`clinic_${clinicId}`);
      console.log(`[Socket.io] ${socket.id} joined clinic_${clinicId}`);
    });

    socket.on('join_hospital', (hospitalId: string) => {
      socket.join(`hospital_${hospitalId}`);
      console.log(`[Socket.io] ${socket.id} joined hospital_${hospitalId}`);
    });

    socket.on('join_ministry', () => {
      socket.join('ministry_dashboard');
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
