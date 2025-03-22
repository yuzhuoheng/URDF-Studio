# URDF Studio

URDF Studio 是一个基于 Web 的 URDF 机器人模型可视化工具，支持在线预览和 ROS 仿真调试。

## 功能特点

### 1. URDF 在线预览 (`/online`)
- 支持拖拽上传 URDF 文件及相关资源
- 3D 实时预览和操作
- 关节控制和调试
- 支持多机器人模型同时加载
- 支持模型位置和姿态调整
- 支持关节名称映射

### 2. ROS 仿真调试 (`/ros`)
- 连接 ROS Bridge 进行实时仿真
- 自动发现和订阅 joint_states Topic
- 实时预览机器人状态
- 支持关节名称映射
- 支持多 Topic 消息查看

## 快速开始

### 安装依赖
```bash
npm install
# 或
yarn
```

### 启动开发服务器
```bash
npm start
# 或
yarn start
```

### 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 使用指南

### URDF 在线预览
1. 访问 `/online` 路径
2. 点击上传按钮或拖拽文件到上传区域
3. 选择要上传的 URDF 文件和相关资源
4. 使用右侧控制面板调整关节角度和模型位置

### ROS 仿真调试
1. 确保 ROS 环境已启动 rosbridge_server：
```bash
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

2. 访问 `/ros` 路径
3. 输入 ROS Bridge WebSocket 地址（默认：`ws://localhost:9090`）
4. 连接成功后选择要订阅的 Topic
5. 实时查看关节状态和机器人模型

## 技术栈
- React
- Ant Design
- Three.js
- URDF Loaders
- WebSocket
- ROS Bridge

## 第三方库说明

### URDF Loaders
本项目使用了 [urdf-loaders](https://github.com/gkjohnson/urdf-loaders) 库来加载和渲染 URDF 模型：

- 支持加载 URDF 格式的机器人描述文件
- 支持 STL、DAE (Collada)、OBJ 等格式的 mesh 文件
- 提供关节控制和运动学计算
- 支持材质和纹理

```javascript
import { URDFLoader } from 'urdf-loaders';

// 创建加载器
const loader = new URDFLoader();
loader.load(
  urdfContent,
  robot => {
    // 机器人模型加载完成
    scene.add(robot);
  },
  { packages: meshFiles }  // mesh 文件映射
);
```

## 注意事项
- 确保上传的 URDF 文件格式正确
- 确保所有相关的 mesh 文件都已上传
- ROS Bridge 连接需要正确的网络配置
- 支持的 Topic 消息类型: sensor_msgs/JointState
- mesh 文件支持格式：.stl, .dae (Collada), .obj

## 部署说明

本项目直接提交 dist 目录用于部署。每次修改代码后：

1. 构建项目：

```bash
npm run build
```

2. 提交 dist 目录：

```bash
git add dist/
git commit -m "chore: update dist files"
```

3. 构建并运行 Docker 镜像：(构建镜像之前需要先npm run build )

```bash
docker build -t urdf-server:v1.0 .
docker run -d -p 34533:80 urdf-server:v1.0
```

## 集成说明

### iframe 集成方式

1. 创建 iframe:
```html
<iframe 
  src="http://your-domain/urdf" 
  style="width: 100%; height: 600px; border: none;"
></iframe>
```

2. 加载模型:
```javascript
const iframe = document.querySelector('iframe');

// 加载模型
iframe.contentWindow.postMessage({
  type: 'LOAD_MODEL',
  data: {
    urdfContent: '<?xml version="1.0"?>...',
    meshFiles: {...}  // 可选的网格文件
  },
  requestId: 'unique-id'
}, '*');

// 监听响应
window.addEventListener('message', (event) => {
  const { type, data, requestId } = event.data;
  if (type === 'LOAD_MODEL_RESPONSE') {
    console.log('Model loaded successfully');
  } else if (type === 'ERROR') {
    console.error('Error:', data.message);
  }
});
```

3. 控制关节:
```javascript
iframe.contentWindow.postMessage({
  type: 'UPDATE_JOINT',
  data: {
    jointName: 'joint1',
    angle: 1.57
  }
}, '*');
```

4. 设置视角:
```javascript
iframe.contentWindow.postMessage({
  type: 'SET_VIEW',
  data: {
    view: '+x'  // 可选值: +x, -x, +y, -y, +z, -z
  }
}, '*');
```

## 目录结构

```
src/
  ├── pages/
  │   ├── RobotModelStudio/      # URDF 机器人模型工作室
  │   │   ├── components/        # 组件
  │   │   │   ├── URDFRender/    # 3D 渲染器
  │   │   │   ├── URDFList/      # 模型列表
  │   │   │   ├── FileUpload/    # 文件上传
  │   │   │   ├── SceneController/ # 场景控制
  │   │   │   └── ModelController/ # 模型控制
  │   │   ├── index.jsx          # 主页面
  │   │   └── util.js            # 工具函数
```
