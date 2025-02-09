// src/services/cacheService.js
import { Op } from 'sequelize';
import CacheItem from '../models/cacheItem.js';

class CacheService {
  constructor() {
    this.maxSize = parseInt(process.env.MAX_CACHE_SIZE) || 10;
  }

  /**
   * Set a value in the cache
   * @param {string} key - The key to store
   * @param {any} value - The value to store
   * @returns {Promise<boolean>} - True if successful
   * @throws {Error} If cache is full or operation fails
   */
  async set(key, value) {
    try {
      // Input validation
      if (!key) throw new Error('Key is required');
      if (value === undefined) throw new Error('Value is required');

      // Check current cache size
      const [count, existingItem] = await Promise.all([
        CacheItem.count(),
        CacheItem.findByPk(key)
      ]);

      // Check size limit only if it's a new key
      if (count >= this.maxSize && !existingItem) {
        throw new Error('Cache is full');
      }

      // Update or create the item
      if (existingItem) {
        await existingItem.update({
          value,
          timestamp: new Date()
        });
      } else {
        await CacheItem.create({
          key,
          value,
          timestamp: new Date()
        });
      }

      return true;
    } catch (error) {
      // Rethrow cache full error, wrap others
      if (error.message === 'Cache is full') {
        throw error;
      }
      throw new Error(`Failed to set cache value: ${error.message}`);
    }
  }

  /**
   * Get a value from the cache
   * @param {string} key - The key to retrieve
   * @returns {Promise<any>} - The stored value or null if not found
   */
  async get(key) {
    try {
      if (!key) throw new Error('Key is required');

      const item = await CacheItem.findByPk(key);
      return item ? item.value : null;
    } catch (error) {
      throw new Error(`Failed to get cache value: ${error.message}`);
    }
  }

  /**
   * Delete a value from the cache
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async delete(key) {
    try {
      if (!key) throw new Error('Key is required');

      const deleted = await CacheItem.destroy({
        where: { key }
      });
      return deleted > 0;
    } catch (error) {
      throw new Error(`Failed to delete cache value: ${error.message}`);
    }
  }

  /**
   * Get the current size of the cache
   * @returns {Promise<number>} - Number of items in cache
   */
  async size() {
    try {
      return await CacheItem.count();
    } catch (error) {
      throw new Error(`Failed to get cache size: ${error.message}`);
    }
  }

  /**
   * Clear all items from the cache
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      await CacheItem.destroy({ where: {} });
    } catch (error) {
      throw new Error(`Failed to clear cache: ${error.message}`);
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getStats() {
    try {
      const [total, oldest, newest] = await Promise.all([
        CacheItem.count(),
        CacheItem.findOne({ order: [['timestamp', 'ASC']] }),
        CacheItem.findOne({ order: [['timestamp', 'DESC']] })
      ]);

      return {
        totalItems: total,
        oldestItemTimestamp: oldest?.timestamp || null,
        newestItemTimestamp: newest?.timestamp || null,
        maxSize: this.maxSize,
        remainingSpace: Math.max(0, this.maxSize - total)
      };
    } catch (error) {
      throw new Error(`Failed to get cache stats: ${error.message}`);
    }
  }

  /**
   * Clean up old cache entries
   * @param {number} maxAgeMinutes - Maximum age in minutes
   * @returns {Promise<number>} Number of entries cleaned
   */
  async cleanupOldEntries(maxAgeMinutes = 60) {
    try {
      if (maxAgeMinutes <= 0) throw new Error('Max age must be positive');

      const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60000);
      const deleted = await CacheItem.destroy({
        where: {
          timestamp: {
            [Op.lt]: cutoffTime
          }
        }
      });

      return deleted;
    } catch (error) {
      throw new Error(`Failed to cleanup old entries: ${error.message}`);
    }
  }

  /**
   * Check if a key exists in the cache
   * @param {string} key - The key to check
   * @returns {Promise<boolean>} - True if exists
   */
  async has(key) {
    try {
      if (!key) throw new Error('Key is required');
      
      const count = await CacheItem.count({
        where: { key }
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check key existence: ${error.message}`);
    }
  }
}

export default new CacheService();