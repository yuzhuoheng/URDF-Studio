import { openDB } from 'idb';

/**
 * URDF模型数据库服务
 * 用于管理模型数据的持久化存储
 */
class URDFDatabaseService {
  constructor() {
    this.dbPromise = null;
    this.DB_NAME = 'urdfStudioDB';
    this.DB_VERSION = 2;
    this.STORES = {
      FILES: 'files',
      STATE: 'state'
    };
  }

  /**
   * 初始化数据库
   * @returns {Promise<IDBDatabase>} 数据库实例
   */
  async init() {
    if (!this.dbPromise) {
      this.dbPromise = openDB(this.DB_NAME, this.DB_VERSION, {
        upgrade: (db, oldVersion, newVersion, transaction) => {
          // 删除旧的存储对象
          if (oldVersion > 0) {
            if (db.objectStoreNames.contains(this.STORES.FILES)) {
              db.deleteObjectStore(this.STORES.FILES);
            }
            if (db.objectStoreNames.contains(this.STORES.STATE)) {
              db.deleteObjectStore(this.STORES.STATE);
            }
          }
          
          // 创建新的存储对象
          if (!db.objectStoreNames.contains(this.STORES.FILES)) {
            db.createObjectStore(this.STORES.FILES, { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains(this.STORES.STATE)) {
            db.createObjectStore(this.STORES.STATE, { keyPath: 'id' });
          }
        }
      });
      
      console.log('数据库初始化完成');
    }
    
    return this.dbPromise;
  }

  /**
   * 获取数据库实例
   * @returns {Promise<IDBDatabase>} 数据库实例
   */
  async getDB() {
    if (!this.dbPromise) {
      await this.init();
    }
    return this.dbPromise;
  }

  /**
   * 保存URDF文件
   * @param {Object} urdfFile URDF文件对象
   * @returns {Promise<void>}
   */
  async saveURDFFile(urdfFile) {
    try {
      const db = await this.getDB();
      
      // 读取 URDF 文件内容
      const urdfContent = await urdfFile.file.arrayBuffer();
      
      // 读取 mesh 文件内容
      const meshContents = {};
      if (urdfFile.meshFiles) {
        for (const [fileName, file] of urdfFile.meshFiles) {
          meshContents[fileName] = await file.arrayBuffer();
        }
      }
      
      // 保存文件内容
      await db.put(this.STORES.FILES, {
        id: urdfFile.id,
        name: urdfFile.name,
        urdfContent,
        meshContents
      });
      
      console.log(`文件 ${urdfFile.id} 已保存到数据库`);
    } catch (error) {
      console.error(`保存文件 ${urdfFile.id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 删除URDF文件
   * @param {string} fileId 文件ID
   * @returns {Promise<void>}
   */
  async deleteURDFFile(fileId) {
    try {
      const db = await this.getDB();
      await db.delete(this.STORES.FILES, fileId);
      console.log(`文件 ${fileId} 已从数据库删除`);
    } catch (error) {
      console.error(`删除文件 ${fileId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 保存应用状态
   * @param {Object} state 应用状态
   * @returns {Promise<void>}
   */
  async saveState(state) {
    try {
      const db = await this.getDB();
      await db.put(this.STORES.STATE, {
        id: 'current',
        ...state
      });
      console.log('应用状态已保存到数据库');
    } catch (error) {
      console.error('保存应用状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取应用状态
   * @returns {Promise<Object>} 应用状态
   */
  async getState() {
    try {
      const db = await this.getDB();
      const state = await db.get(this.STORES.STATE, 'current');
      return state;
    } catch (error) {
      console.error('获取应用状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取URDF文件
   * @param {string} fileId 文件ID
   * @returns {Promise<Object>} URDF文件数据
   */
  async getURDFFile(fileId) {
    try {
      const db = await this.getDB();
      const fileData = await db.get(this.STORES.FILES, fileId);
      return fileData;
    } catch (error) {
      console.error(`获取文件 ${fileId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 还原URDF文件
   * @param {Object} fileInfo 文件信息
   * @returns {Promise<Object>} 还原后的文件对象
   */
  async restoreURDFFile(fileInfo) {
    try {
      const fileData = await this.getURDFFile(fileInfo.id);
      if (!fileData) return null;
      
      // 还原 URDF 文件
      const file = new File(
        [fileData.urdfContent],
        fileInfo.name,
        { type: 'application/xml' }
      );
      
      // 还原 mesh 文件
      const meshFiles = new Map();
      if (fileData.meshContents) {
        for (const [fileName, content] of Object.entries(fileData.meshContents)) {
          meshFiles.set(fileName, new File([content], fileName));
        }
      }
      
      return {
        id: fileInfo.id,
        name: fileInfo.name,
        file,
        meshFiles
      };
    } catch (error) {
      console.error(`还原文件 ${fileInfo.id} 失败:`, error);
      return null;
    }
  }

  /**
   * 清空数据库
   * @returns {Promise<void>}
   */
  async clearAll() {
    try {
      const db = await this.getDB();
      await db.clear(this.STORES.FILES);
      await db.clear(this.STORES.STATE);
      console.log('数据库已清空');
    } catch (error) {
      console.error('清空数据库失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const dbService = new URDFDatabaseService();

export default dbService; 