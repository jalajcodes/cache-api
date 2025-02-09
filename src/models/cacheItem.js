import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const CacheItem = sequelize.define('CacheItem', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('value');
      return JSON.parse(rawValue);
    },
    set(value) {
      this.setDataValue('value', JSON.stringify(value));
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['timestamp']
    }
  ]
});

export default CacheItem;
