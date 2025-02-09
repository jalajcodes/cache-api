// src/routes/cache.js
import express from 'express';
import cacheService from '../services/cacheService.js';

const router = express.Router();

/**
 * @swagger
 * /cache:
 *   post:
 *     summary: Store a key-value pair in cache
 *     tags: [Cache]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 description: The key to store
 *               value:
 *                 type: string
 *                 description: The value to store
 *     responses:
 *       201:
 *         description: Successfully stored
 *       400:
 *         description: Invalid input
 *       507:
 *         description: Cache is full
 */
router.post('/', async (req, res, next) => {
  try {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Key and value are required'
      });
    }

    await cacheService.set(key, value);
    res.status(201).json({ 
      status: 'success',
      message: 'Stored successfully',
      data: { key }
    });
  } catch (error) {
    if (error.message === 'Cache is full') {
      return res.status(507).json({ 
        error: 'Storage Error',
        message: 'Cache is full'
      });
    }
    next(error);
  }
});

/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await cacheService.getStats();
    res.json({ 
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/cleanup:
 *   post:
 *     summary: Clean up old cache entries
 *     tags: [Cache]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxAgeMinutes:
 *                 type: number
 *                 description: Maximum age in minutes
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 */
router.post('/cleanup', async (req, res, next) => {
  try {
    const { maxAgeMinutes = 60 } = req.body;
    const deletedCount = await cacheService.cleanupOldEntries(maxAgeMinutes);
    res.json({ 
      status: 'success',
      message: 'Cleanup completed',
      data: { deletedCount }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/{key}:
 *   get:
 *     summary: Retrieve a value by key
 *     tags: [Cache]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The key to retrieve
 *     responses:
 *       200:
 *         description: Value retrieved successfully
 *       404:
 *         description: Key not found
 */
router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Key is required'
      });
    }

    const value = await cacheService.get(key);
    if (value === null) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Key not found'
      });
    }

    res.json({ 
      status: 'success',
      data: { key, value }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/{key}:
 *   delete:
 *     summary: Delete a key-value pair
 *     tags: [Cache]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The key to delete
 *     responses:
 *       200:
 *         description: Successfully deleted
 *       404:
 *         description: Key not found
 */
router.delete('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Key is required'
      });
    }

    const deleted = await cacheService.delete(key);
    if (!deleted) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Key not found'
      });
    }

    res.json({ 
      status: 'success',
      message: 'Deleted successfully',
      data: { key }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache:
 *   delete:
 *     summary: Clear all cache entries
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 */
router.delete('/', async (req, res, next) => {
  try {
    await cacheService.clear();
    res.json({ 
      status: 'success',
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;