class RosClient {
  constructor() {
    this.ws = null;
    this.onMessageReceive = null;
    this.onTopicsUpdate = null;
    this.connected = false;
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('Connected to ROSBridge');
          this.connected = true;
          
          // 获取所有 topics
          this.ws.send(JSON.stringify({
            op: 'call_service',
            service: '/rosapi/topics_and_raw_types',
            args: []
          }));

          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('Disconnected:', event.code, event.reason);
          this.connected = false;
          if (this.onTopicsUpdate) {
            this.onTopicsUpdate([]);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(new Error('连接失败'));
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  subscribe(topic) {
    if (!this.connected) return;

    // 获取消息类型
    this.ws.send(JSON.stringify({
      op: 'call_service',
      service: '/rosapi/topic_type',
      args: { topic }
    }));

    // 订阅消息
    this.ws.send(JSON.stringify({
      op: 'subscribe',
      topic: topic,
      type: 'sensor_msgs/msg/JointState'
    }));
  }

  unsubscribe(topic) {
    if (!this.connected) return;

    this.ws.send(JSON.stringify({
      op: 'unsubscribe',
      topic: topic
    }));
  }

  handleMessage(message) {
    switch (message.op) {
      case 'service_response':
        if (message.service === '/rosapi/topics_and_raw_types') {
          const allTopics = message.values.topics.map((name, index) => ({
            name,
            type: message.values.types[index]
          }));
          
          if (this.onTopicsUpdate) {
            this.onTopicsUpdate(allTopics);
          }
        }
        break;

      case 'publish':
        if (this.onMessageReceive) {
          // 格式化 JointState 消息
          const formattedMessage = {
            position: message.msg.position,
            velocity: message.msg.velocity,
            effort: message.msg.effort,
            name: message.msg.name,
            timestamp: new Date().toISOString()
          };
          this.onMessageReceive(message.topic, formattedMessage);
        }
        break;

      default:
        console.log('Unhandled message type:', message.op);
    }
  }

  requestTopics() {
    if (!this.connected) return;
    
    this.ws.send(JSON.stringify({
      op: 'call_service',
      service: '/rosapi/topics_and_raw_types',
      args: []
    }));
  }

  getTopics() {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('未连接到 ROS'));
        return;
      }

      // 设置一个临时的回调来处理响应
      const handleResponse = (topics) => {
        cleanup();
        resolve(topics);
      };

      // 设置一个超时
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('获取话题列表超时'));
      }, 5000);

      // 保存原来的回调
      const originalCallback = this.onTopicsUpdate;

      // 清理函数
      const cleanup = () => {
        clearTimeout(timeoutId);
        this.onTopicsUpdate = originalCallback;
      };

      // 设置临时回调
      this.onTopicsUpdate = handleResponse;

      // 请求话题列表
      this.ws.send(JSON.stringify({
        op: 'call_service',
        service: '/rosapi/topics_and_raw_types',
        args: []
      }));
    });
  }
}

// 创建并导出单例实例
const rosClient = new RosClient();
export default rosClient; 