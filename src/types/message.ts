// 定义消息类型
export type MessageType = 
  | 'LOAD_MODEL'      // 加载模型
  | 'UPDATE_JOINT'    // 更新关节角度
  | 'UPDATE_JOINT_RESPONSE'  // 更新关节角度的响应
  | 'SET_VIEW'        // 设置视角
  | 'RESET_SCENE'     // 重置场景
  | 'GET_JOINTS'      // 获取关节信息
  | 'MODEL_LOADED'    // 模型加载完成的回调
  | 'ERROR';          // 错误信息

// 定义消息结构
export interface ViewerMessage {
  type: MessageType;
  data?: any;
  requestId?: string;  // 用于关联请求和响应
}

// 定义各种消息的数据结构
export interface LoadModelData {
  urdfContent: string;
  meshFiles?: { [key: string]: File };  // 可选的网格文件
}

export interface UpdateJointData {
  robotId: string;    // 机器人ID
  jointName: string;  // 关节名称
  angle: number;      // 角度值
}

export interface UpdateJointResponse {
  success: boolean;
  jointName: string;
  angle: number;
}

export interface ViewData {
  view: '+x' | '-x' | '+y' | '-y' | '+z' | '-z';
}

export interface JointInfo {
  name: string;
  type: string;
  angle: number;
  limits: {
    lower: number;
    upper: number;
  };
} 