/**
 * Clustering Utility
 * Multi-core CPU utilization with Node.js cluster
 * @module utils/performance/clustering
 */

import cluster from 'cluster';
import os from 'os';

/**
 * Cluster configuration
 */
const CLUSTER_CONFIG = {
  workers: process.env.CLUSTER_WORKERS || os.cpus().length,
  restartDelay: 1000,
  maxRestarts: 5
};

/**
 * Worker restart tracking
 */
const workerRestarts = new Map();

/**
 * Setup cluster master
 */
export function setupCluster(startServer) {
  if (cluster.isPrimary) {
    console.log(`[Cluster] Master process ${process.pid} is running`);
    console.log(`[Cluster] Forking ${CLUSTER_CONFIG.workers} workers...`);

    // Fork workers
    for (let i = 0; i < CLUSTER_CONFIG.workers; i++) {
      cluster.fork();
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
      console.warn(`[Cluster] Worker ${worker.process.pid} died (${signal || code})`);
      
      const restartCount = workerRestarts.get(worker.id) || 0;
      
      if (restartCount < CLUSTER_CONFIG.maxRestarts) {
        console.log(`[Cluster] Restarting worker (attempt ${restartCount + 1}/${CLUSTER_CONFIG.maxRestarts})...`);
        
        setTimeout(() => {
          const newWorker = cluster.fork();
          workerRestarts.set(newWorker.id, restartCount + 1);
        }, CLUSTER_CONFIG.restartDelay);
      } else {
        console.error(`[Cluster] Worker ${worker.id} exceeded max restart attempts`);
      }
    });

    // Handle worker messages
    cluster.on('message', (worker, message) => {
      if (message.cmd === 'notifyRequest') {
        // Broadcast to all workers
        Object.values(cluster.workers).forEach(w => {
          if (w && w.id !== worker.id) {
            w.send(message);
          }
        });
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[Cluster] SIGTERM received, shutting down gracefully...');
      
      Object.values(cluster.workers).forEach(worker => {
        worker.kill('SIGTERM');
      });
      
      setTimeout(() => {
        console.log('[Cluster] Forcing shutdown...');
        process.exit(0);
      }, 10000);
    });

  } else {
    // Worker process - start server
    console.log(`[Cluster] Worker ${process.pid} started`);
    startServer();
    
    // Handle shutdown signals
    process.on('SIGTERM', () => {
      console.log(`[Cluster] Worker ${process.pid} shutting down...`);
      // Perform cleanup
      process.exit(0);
    });
  }
}

/**
 * Check if running in cluster mode
 */
export function isClusterMode() {
  return process.env.NODE_ENV === 'production' || process.env.ENABLE_CLUSTERING === 'true';
}

/**
 * Get worker ID
 */
export function getWorkerId() {
  return cluster.worker?.id || 'master';
}

/**
 * Broadcast message to all workers
 */
export function broadcastToWorkers(message) {
  if (cluster.isPrimary) {
    Object.values(cluster.workers).forEach(worker => {
      if (worker) {
        worker.send(message);
      }
    });
  } else {
    process.send({ ...message, workerId: cluster.worker.id });
  }
}

export default {
  setupCluster,
  isClusterMode,
  getWorkerId,
  broadcastToWorkers
};
