/**
 * Compression Utility
 * Response compression for better performance
 * @module utils/performance/compression
 */

import compression from 'compression';
import { createGzip, createBrotliCompress } from 'zlib';

/**
 * Compression configuration
 */
const COMPRESSION_CONFIG = {
  // Minimum response size to compress (1KB)
  threshold: 1024,
  // Compression level (1-9, higher = better compression but slower)
  level: 6,
  // Memory level (1-9)
  memLevel: 8,
  // Brotli quality (0-11, higher = better compression but slower)
  brotliQuality: 4
};

/**
 * Should compress response
 */
function shouldCompress(req, res) {
  // Don't compress if client doesn't accept encoding
  if (!req.headers['accept-encoding']) {
    return false;
  }

  // Don't compress images, videos, or already compressed files
  const contentType = res.getHeader('Content-Type');
  if (contentType) {
    const type = contentType.toString();
    if (
      type.includes('image/') ||
      type.includes('video/') ||
      type.includes('audio/') ||
      type.includes('application/zip') ||
      type.includes('application/gzip')
    ) {
      return false;
    }
  }

  // Compress text-based responses
  return compression.filter(req, res);
}

/**
 * Get compression middleware
 */
export function getCompressionMiddleware() {
  return compression({
    filter: shouldCompress,
    threshold: COMPRESSION_CONFIG.threshold,
    level: COMPRESSION_CONFIG.level,
    memLevel: COMPRESSION_CONFIG.memLevel
  });
}

/**
 * Manually compress data using gzip
 */
export function compressGzip(data) {
  return new Promise((resolve, reject) => {
    const gzip = createGzip({ level: COMPRESSION_CONFIG.level });
    const chunks = [];

    gzip.on('data', chunk => chunks.push(chunk));
    gzip.on('end', () => resolve(Buffer.concat(chunks)));
    gzip.on('error', reject);

    gzip.write(data);
    gzip.end();
  });
}

/**
 * Manually compress data using Brotli
 */
export function compressBrotli(data) {
  return new Promise((resolve, reject) => {
    const brotli = createBrotliCompress({
      params: {
        [require('zlib').constants.BROTLI_PARAM_QUALITY]: COMPRESSION_CONFIG.brotliQuality
      }
    });
    const chunks = [];

    brotli.on('data', chunk => chunks.push(chunk));
    brotli.on('end', () => resolve(Buffer.concat(chunks)));
    brotli.on('error', reject);

    brotli.write(data);
    brotli.end();
  });
}

/**
 * Get compression stats
 */
export function getCompressionStats(original, compressed) {
  const ratio = ((1 - (compressed.length / original.length)) * 100).toFixed(2);
  const saved = original.length - compressed.length;
  
  return {
    originalSize: `${(original.length / 1024).toFixed(2)} KB`,
    compressedSize: `${(compressed.length / 1024).toFixed(2)} KB`,
    compressionRatio: `${ratio}%`,
    bytesSaved: saved,
    bytesSavedFormatted: `${(saved / 1024).toFixed(2)} KB`
  };
}

export default {
  getCompressionMiddleware,
  compressGzip,
  compressBrotli,
  getCompressionStats
};
