/**
 * URDF模型数据库服务
 * 使用原生 IndexedDB API 而不是 idb 库
 */
class URDFDatabaseService {
  constructor() {
    this.db = null;
    this.DB_NAME = 'urdfStudioDB';
    this.DB_VERSION = 2;
    this.STORES = {
      FILES: 'files',
      STATE: 'state',
    };
  }

  /**
   * 初始化数据库
   * @returns {Promise<IDBDatabase>} 数据库实例
   */
  init() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        console.error('数据库打开失败:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('数据库初始化完成');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 删除旧的存储对象
        if (event.oldVersion > 0) {
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
      };
    });
  }

  /**
   * 获取数据库实例
   * @returns {Promise<IDBDatabase>} 数据库实例
   */
  async getDB() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  /**
   * 保存URDF文件
   * @param {Object} urdfFile URDF文件对象
   * @returns {Promise<void>}
   */
  async saveURDFFile(urdfFile) {
    try {
      const db = await this.getDB();

      if (urdfFile.type === 'stl') {
        // 保存 STL 文件
        const content = await urdfFile.file.arrayBuffer();

        return new Promise((resolve, reject) => {
          const transaction = db.transaction([this.STORES.FILES], 'readwrite');
          const store = transaction.objectStore(this.STORES.FILES);

          const request = store.put({
            id: urdfFile.id,
            name: urdfFile.name,
            type: 'stl',
            content,
            timestamp: Date.now(),
          });

          request.onsuccess = () => resolve();
          request.onerror = (event) => reject(event.target.error);
        });
      } else {
        // 保存 URDF 文件
        const urdfContent = await urdfFile.file.arrayBuffer();
        const meshContents = {};

        if (urdfFile.meshFiles) {
          for (const [fileName, file] of urdfFile.meshFiles) {
            meshContents[fileName] = await file.arrayBuffer();
          }
        }

        return new Promise((resolve, reject) => {
          const transaction = db.transaction([this.STORES.FILES], 'readwrite');
          const store = transaction.objectStore(this.STORES.FILES);

          const request = store.put({
            id: urdfFile.id,
            name: urdfFile.name,
            type: 'urdf',
            urdfContent,
            meshContents,
            timestamp: Date.now(),
          });

          request.onsuccess = () => resolve();
          request.onerror = (event) => reject(event.target.error);
        });
      }
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

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORES.FILES], 'readwrite');
        const store = transaction.objectStore(this.STORES.FILES);

        const request = store.delete(fileId);

        request.onsuccess = () => {
          console.log(`文件 ${fileId} 已从数据库删除`);
          resolve();
        };

        request.onerror = (event) => {
          console.error(`删除文件 ${fileId} 失败:`, event.target.error);
          reject(event.target.error);
        };
      });
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

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORES.STATE], 'readwrite');
        const store = transaction.objectStore(this.STORES.STATE);

        const request = store.put({
          id: 'current',
          ...state,
        });

        request.onsuccess = () => {
          console.log('应用状态已保存到数据库');
          resolve();
        };

        request.onerror = (event) => {
          console.error('保存应用状态失败:', event.target.error);
          reject(event.target.error);
        };
      });
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

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORES.STATE], 'readonly');
        const store = transaction.objectStore(this.STORES.STATE);

        const request = store.get('current');

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error('获取应用状态失败:', event.target.error);
          reject(event.target.error);
        };
      });
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

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORES.FILES], 'readonly');
        const store = transaction.objectStore(this.STORES.FILES);

        const request = store.get(fileId);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          console.error(`获取文件 ${fileId} 失败:`, event.target.error);
          reject(event.target.error);
        };
      });
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
      let file;
      if (fileData.type === 'stl') {
        // 处理 STL 文件
        file = new File([fileData.content], fileInfo.name, {
          type: 'model/stl',
        });

        return {
          id: fileInfo.id,
          name: fileInfo.name,
          file,
          type: 'stl',
        };
      } else {
        // 处理 URDF 文件
        file = new File([fileData.urdfContent], fileInfo.name, {
          type: 'application/xml',
        });

        // 还原 mesh 文件
        const meshFiles = new Map();
        if (fileData.meshContents) {
          for (const [fileName, content] of Object.entries(fileData.meshContents)) {
            const meshFile = new File([content], fileName, {
              type: fileName.toLowerCase().endsWith('.stl') ? 'model/stl' : 'model/collada',
            });
            meshFiles.set(fileName, meshFile);
          }
        }

        return {
          id: fileInfo.id,
          name: fileInfo.name,
          file,
          type: 'urdf',
          meshFiles,
        };
      }
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

      const clearStore = (storeName) => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);

          const request = store.clear();

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = (event) => {
            console.error(`清空 ${storeName} 失败:`, event.target.error);
            reject(event.target.error);
          };
        });
      };

      await clearStore(this.STORES.FILES);
      await clearStore(this.STORES.STATE);

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
