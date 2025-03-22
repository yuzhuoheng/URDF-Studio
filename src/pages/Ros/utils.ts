/**
 * 格式化消息内容
 */
export const formatMessage = (message: any): string => {
  if (!message) return 'No messages received';
  return JSON.stringify(message, null, 2);
};

/**
 * 检查是否为 JointState 类型
 */
export const isJointStateType = (type: string): boolean => {
  return type === 'sensor_msgs/msg/JointState';
};

/**
 * 格式化 JointState 消息用于表格显示
 */
export const formatJointStateMessage = (message: any) => {
  if (!message || !message.name) return [];
  
  return message.name.map((name: string, index: number) => ({
    key: name,
    name,
    position: message.position?.[index]?.toFixed(3) || 'N/A',
    velocity: message.velocity?.[index]?.toFixed(3) || 'N/A',
    effort: message.effort?.[index]?.toFixed(3) || 'N/A'
  }));
}; 