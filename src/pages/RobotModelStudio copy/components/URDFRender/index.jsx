import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import URDFLoader from 'urdf-loader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { Space, Splitter } from 'antd';
import FileUpload from '../FileUpload';
import SceneController from '../SceneController';
import URDFList from '../URDFList';
import ModelController from '../ModelController';
import { message } from 'antd';
import readFile from '../../util';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { MessageHandler } from '@/utils/messageHandler';

/**
 * URDF渲染器组件
 * 用于加载和渲染URDF模型,提供3D视图和控制面板
 */
class URDFRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      urdfFiles: [], // 所有可用的URDF文件
      activeUrdfFiles: [], // 当前激活的URDF文件
      robotsData: {}, // { id: { robot, joints, position: {x,y,z}, rotation: {x,y,z} } }
      sceneConfig: {
        fov: 75,
        cameraDistance: 10,
        ambientIntensity: 0.5,
        directionalIntensity: 1,
        backgroundColor: '#cccccc',
        showGrid: true,
        shadows: true
      },
    };

    // 初始化THREE.js相关实例
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.mount = null;
    this.resizeObserver = null;
    this.animationFrameId = null;
    
    // 添加光源实例
    this.ambientLight = null;
    this.directionalLight = null;

    // 初始化加载器
    this.initLoader();

    // 修改 fileMap 的存储方式
    this.fileMap = new Map(); // robotId -> Map<filename, blob>
  }

  /**
   * 初始化URDF加载器
   */
  initLoader = () => {
    const manager = new THREE.LoadingManager();
    this.loader = new URDFLoader(manager);
    this.loader.loadMeshCb = this.handleMeshLoad;
  };

  /**
   * 处理3D网格模型加载
   */
  handleMeshLoad = (filePath, manager, onComplete) => {
    const filename = filePath.split('/').at(-1);
    const robotId = this.currentLoadingRobotId;
    const robotFiles = this.fileMap.get(robotId);
    const path = robotFiles?.get(filename) || filePath;
    const extension = filePath.split('.').pop().toLowerCase();

    // 根据文件扩展名选择加载器
    let loader;
    if (extension === 'stl') {
      loader = new STLLoader(manager);
      loader.load(
        path,
        geometry => {
          const material = new THREE.MeshPhongMaterial();
          const mesh = new THREE.Mesh(geometry, material);
          const scene = new THREE.Scene();
          scene.add(mesh);
          onComplete(scene);
        },
        undefined,
        err => {
          console.error('加载错误:', err);
          onComplete(null, err);
        }
      );
    } else {
      // 默认使用 ColladaLoader
      loader = new ColladaLoader(manager);
      loader.load(
        path,
        result => {
          onComplete(result.scene);
        },
        undefined,
        err => {
          console.error('加载错误:', err);
          onComplete(null, err);
        }
      );
    }
  };

  /**
   * 组件挂载时初始化3D场景
   */
  componentDidMount() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLights();
    this.initControls();
    this.initResizeObserver();
    this.animate();
    
    // 初始化消息处理器
    this.messageHandler = new MessageHandler(this);
  }

  // 监听相机变化
  handleCameraChange = () => {
    // 获取相机的位置和旋转
    // const cameraPosition = this.camera.position.clone();
    // const cameraRotation = this.camera.rotation.clone();

    // // 打印相机值（可选）
    // console.log('Camera Position:', cameraPosition);
    // console.log('Camera Rotation:', cameraRotation);
  };

  /**
   * 动画循环
   */
  animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  /**
   * 清理THREE.js资源
   */
  cleanupThreeJS = () => {
    // 停止动画循环
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // 清理ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // 清理渲染器
    if (this.renderer) {
      if (this.mount && this.renderer.domElement) {
        this.mount.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    // 清理控制器
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // 清理场景
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      this.scene = null;
    }

    // 清理相机
    if (this.camera) {
      this.camera = null;
    }

    // 清理加载的模型数据
    this.state.activeUrdfFiles.forEach(file => {
      const robotData = this.state.robotsData[file.id];
      if (robotData && robotData.robot) {
        robotData.robot.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    });

    // 清理光源
    if (this.ambientLight) {
      this.scene?.remove(this.ambientLight);
      this.ambientLight = null;
    }
    if (this.directionalLight) {
      this.scene?.remove(this.directionalLight);
      this.directionalLight = null;
    }

    // 清理网格
    if (this.grid) {
      this.scene?.remove(this.grid);
      this.grid.material.dispose();
      this.grid.geometry.dispose();
      this.grid = null;
    }
  };

  componentWillUnmount() {
    this.cleanupThreeJS();
    
    // 清理消息处理器
    this.messageHandler.destroy();
  }

  /**
   * 处理模型加载
   */
  handleModelLoad = async (urdfFiles, meshFiles) => {
    this.setState(prevState => {
      const newUrdfFiles = urdfFiles.map(file => ({
        ...file,
        id: file.id || `robot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        meshFiles
      }));

      const existingNames = new Set(prevState.urdfFiles.map(f => f.name));
      const uniqueNewFiles = newUrdfFiles.filter(file => !existingNames.has(file.name));

      return {
        urdfFiles: [...prevState.urdfFiles, ...uniqueNewFiles]
      };
    });
  };

  handleUrdfToggle = async (urdfFile, isActive) => {
    if (isActive) {
      try {
        this.currentLoadingRobotId = urdfFile.id;
        
        if (!this.fileMap.has(urdfFile.id)) {
          const robotFiles = new Map();
          
          if (urdfFile.meshFiles) {
            for (const [filename, file] of urdfFile.meshFiles) {
              const blobUrl = URL.createObjectURL(file);
              robotFiles.set(filename, blobUrl);
            }
          }
          
          this.fileMap.set(urdfFile.id, robotFiles);
        }

        const urdfContent = await readFile(urdfFile.file);
        const robot = this.loader.parse(urdfContent);
        const joints = this.initializeJoints(robot);
        
        // 设置初始位置和旋转
        robot.position.set(0, 0, 0);
        robot.rotation.set(0, 0, 0);
        
        this.scene.add(robot);
        
        this.setState(prevState => ({
          activeUrdfFiles: [...prevState.activeUrdfFiles, urdfFile],
          robotsData: {
            ...prevState.robotsData,
            [urdfFile.id]: {
              robot,
              joints,
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 }
            }
          }
        }));

        // 发送机器人加载成功的消息
        window.parent.postMessage({
          type: 'ROBOT_LOADED',
          data: {
            robotId: urdfFile.id,
            name: urdfFile.name,
            joints: Object.keys(joints)
          }
        }, '*');

      } catch (error) {
        console.error('Error in handleUrdfToggle:', error);
        message.error(`加载URDF文件 ${urdfFile.name} 失败`);
      } finally {
        this.currentLoadingRobotId = null;
      }
    } else {
      // 移除机器人时清除其文件映射和 Blob URLs
      const robotFiles = this.fileMap.get(urdfFile.id);
      if (robotFiles) {
        // 释放所有的 Blob URLs
        robotFiles.forEach(blobUrl => {
          if (typeof blobUrl === 'string' && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
          }
        });
      }
      this.fileMap.delete(urdfFile.id);
      
      const robotData = this.state.robotsData[urdfFile.id];
      if (robotData && robotData.robot) {
        this.scene.remove(robotData.robot);
      }
      
      this.setState(prevState => ({
        activeUrdfFiles: prevState.activeUrdfFiles.filter(f => f.id !== urdfFile.id),
        robotsData: {
          ...prevState.robotsData,
          [urdfFile.id]: undefined
        }
      }));
    }
  };

  handleJointChange = (robotId, jointName, angle) => {
    const robotData = this.state.robotsData[robotId];
    if (!robotData) {
      throw new Error(`Robot with id ${robotId} not found`);
    }

    const joint = robotData.joints[jointName];
    if (!joint) {
      throw new Error(`Joint ${jointName} not found`);
    }

    // 检查角度限制
    if (angle < joint.limits.lower || angle > joint.limits.upper) {
      throw new Error(`Angle ${angle} is out of limits [${joint.limits.lower}, ${joint.limits.upper}]`);
    }

    // 更新关节角度
    joint.angle = angle;
    robotData.robot.setJointValue(jointName, angle);

    // 更新状态
    this.setState(prevState => ({
      robotsData: {
        ...prevState.robotsData,
        [robotId]: robotData
      }
    }));
  };

  handlePositionChange = (robotId, axis, value) => {
    const robotData = this.state.robotsData[robotId];
    if (robotData && robotData.robot && value !== null && value !== undefined) {
      // 更新THREE.js对象的位置
      robotData.robot.position[axis] = value;
      
      // 更新状态
      this.setState(prevState => ({
        robotsData: {
          ...prevState.robotsData,
          [robotId]: {
            ...robotData,
            position: {
              ...robotData.position,
              [axis]: value
            }
          }
        }
      }));
    }
  };

  handleRotationChange = (robotId, axis, value) => {
    const robotData = this.state.robotsData[robotId];
    if (robotData && robotData.robot && value !== null && value !== undefined) {
      // 将角度转换为弧度
      const angleInRad = THREE.MathUtils.degToRad(value);
      
      // 更新THREE.js对象的旋转
      robotData.robot.rotation[axis] = angleInRad;
      
      // 更新状态
      this.setState(prevState => ({
        robotsData: {
          ...prevState.robotsData,
          [robotId]: {
            ...robotData,
            rotation: {
              ...robotData.rotation,
              [axis]: angleInRad
            }
          }
        }
      }));
    }
  };

  /**
   * 初始化场景
   */
  initScene = () => {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.state.sceneConfig.backgroundColor);

    // 添加网格 - 修改为10x10
    if (this.state.sceneConfig.showGrid) {
      this.grid = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
      this.grid.material.opacity = 0.5;
      this.grid.material.transparent = true;
      this.scene.add(this.grid);
    }
  };

  /**
   * 初始化相机
   */
  initCamera = () => {
    const { fov, cameraDistance } = this.state.sceneConfig;
    const aspect = this.mount.clientWidth / this.mount.clientHeight;
    
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
    // 降低相机高度
    this.camera.position.set(cameraDistance * 0.7, cameraDistance * 0.7, cameraDistance * 0.7);
    this.camera.lookAt(0, 0, 0);
  };

  /**
   * 初始化渲染器
   */
  initRenderer = () => {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    // 设置像素比
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // 设置尺寸但不更新样式
    this.renderer.setSize(this.mount.clientWidth, this.mount.clientHeight, false);
    
    // 启用阴影
    this.renderer.shadowMap.enabled = this.state.sceneConfig.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.mount.appendChild(this.renderer.domElement);
    
    // 设置canvas样式
    const canvas = this.renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
  };

  /**
   * 初始化光源
   */
  initLights = () => {
    // 环境光
    this.ambientLight = new THREE.AmbientLight(
      0xffffff, 
      this.state.sceneConfig.ambientIntensity
    );
    this.scene.add(this.ambientLight);

    // 平行光（模拟太阳光）
    this.directionalLight = new THREE.DirectionalLight(
      0xffffff,
      this.state.sceneConfig.directionalIntensity
    );
    this.directionalLight.position.set(5, 5, 5);
    this.directionalLight.castShadow = this.state.sceneConfig.shadows;
    
    // 设置阴影参数
    if (this.state.sceneConfig.shadows) {
      this.directionalLight.shadow.mapSize.width = 1024;
      this.directionalLight.shadow.mapSize.height = 1024;
      this.directionalLight.shadow.camera.near = 0.5;
      this.directionalLight.shadow.camera.far = 500;
    }
    
    this.scene.add(this.directionalLight);
  };

  /**
   * 初始化控制器
   */
  initControls = () => {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.addEventListener('change', this.handleCameraChange);
  };

  /**
   * 初始化大小变化观察器
   */
  initResizeObserver = () => {
    let resizeTimeout;
    
    this.resizeObserver = new ResizeObserver(() => {
      // 使用防抖来避免频繁更新
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        if (this.mount && this.camera && this.renderer) {
          const width = this.mount.clientWidth;
          const height = this.mount.clientHeight;
          
          // 更新相机
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          
          // 更新渲染器
          this.renderer.setPixelRatio(window.devicePixelRatio);
          this.renderer.setSize(width, height, false); // 添加 false 参数避免修改 canvas 样式
        }
      }, 100); // 100ms 的防抖延迟
    });

    if (this.mount) {
      this.resizeObserver.observe(this.mount);
    }
  };

  /**
   * 初始化关节数据
   */
  initializeJoints = (robot) => {
    const joints = {};
    Object.entries(robot.joints).forEach(([name, joint]) => {
      if (joint.type !== 'fixed') {
        joints[name] = {
          name,
          type: joint.type,
          angle: 0,
          limits: {
            lower: THREE.MathUtils.radToDeg(joint.limit?.lower ?? -Math.PI),
            upper: THREE.MathUtils.radToDeg(joint.limit?.upper ?? Math.PI)
          }
        };
      }
    });
    return joints;
  };

  handleConfigChange = (key, value) => {
    this.setState(prevState => ({
      sceneConfig: {
        ...prevState.sceneConfig,
        [key]: value
      }
    }), () => {
      this.updateSceneConfig();
    });
  };

  /**
   * 更新场景配置
   */
  updateSceneConfig = () => {
    const { sceneConfig } = this.state;

    // 更新相机
    this.camera.fov = sceneConfig.fov;
    this.camera.updateProjectionMatrix();

    // 更新光照
    if (this.ambientLight) {
      this.ambientLight.intensity = sceneConfig.ambientIntensity;
    }
    if (this.directionalLight) {
      this.directionalLight.intensity = sceneConfig.directionalIntensity;
    }

    // 更新背景色
    if (this.scene) {
      this.scene.background = new THREE.Color(sceneConfig.backgroundColor);
    }

    // 更新阴影
    if (this.renderer) {
      this.renderer.shadowMap.enabled = sceneConfig.shadows;
    }
    if (this.directionalLight) {
      this.directionalLight.castShadow = sceneConfig.shadows;
    }

    // 更新网格
    if (this.scene) {
      // 先移除旧的网格（如果存在）
      if (this.grid) {
        this.scene.remove(this.grid);
        this.grid.material.dispose();
        this.grid.geometry.dispose();
        this.grid = null;
      }

      // 如果需要显示网格，创建新的网格 - 修改为10x10
      if (sceneConfig.showGrid) {
        this.grid = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
        this.grid.material.opacity = 0.5;
        this.grid.material.transparent = true;
        this.scene.add(this.grid);
      }
    }
  };

  handleViewChange = (view) => {
    const { sceneConfig } = this.state;
    const distance = sceneConfig.cameraDistance;

    // 重置相机位置和旋转
    switch(view) {
      case '+x': 
        this.camera.position.set(distance, 0, 0);
        this.camera.up.set(0, 0, 1);
        break;
      case '-x':
        this.camera.position.set(-distance, 0, 0);
        this.camera.up.set(0, 0, 1);
        break;
      case '+y':
        this.camera.position.set(0, distance, 0);
        this.camera.up.set(0, 0, 1);
        break;
      case '-y':
        this.camera.position.set(0, -distance, 0);
        this.camera.up.set(0, 0, 1);
        break;
      case '+z':
        this.camera.position.set(0, 0, distance);
        this.camera.up.set(0, 1, 0);
        break;
      case '-z':
        this.camera.position.set(0, 0, -distance);
        this.camera.up.set(0, 1, 0);
        break;
      default:
        break;
    }

    // 让相机看向原点
    this.camera.lookAt(0, 0, 0);
    
    // 更新控制器
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  };

  // 添加获取关节信息的方法
  getJointsInfo = () => {
    const { robotsData } = this.state;
    return Object.values(robotsData).map(robot => ({
      joints: robot.joints,
      position: robot.position,
      rotation: robot.rotation
    }));
  }

  // 添加重置场景的方法
  resetScene = () => {
    // 实现重置逻辑
  }

  /**
   * 处理模型删除
   */
  handleUrdfDelete = (urdfFile) => {
    try {
      // 如果模型处于激活状态，先停用它
      if (this.state.activeUrdfFiles.find(f => f.id === urdfFile.id)) {
        this.handleUrdfToggle(urdfFile, false);
      }

      // 从文件列表中移除
      this.setState(prevState => ({
        urdfFiles: prevState.urdfFiles.filter(f => f.id !== urdfFile.id)
      }));

    } catch (error) {
      console.error('Error deleting URDF file:', error);
      message.error(`删除URDF文件 ${urdfFile.name} 失败`);
    }
  };

  render() {
    const { urdfFiles, activeUrdfFiles, robotsData, sceneConfig } = this.state;

    return (
      <div style={{ height: '100vh' }}>
        <Splitter>
          {/* 3D渲染区域 */}
          <Splitter.Panel defaultSize="70%" min="50%" max="100%">
            <div
              ref={(ref) => (this.mount = ref)}
              style={{ width: '100%', height: '100%', overflow: 'hidden' }}
            />
          </Splitter.Panel>

          {/* 控制面板 */}
          <Splitter.Panel collapsible>
            <div className="right-panel">
              <div style={{height:424,paddingTop:8}}>
                <FileUpload onChange={this.handleModelLoad} />
              </div>

              <Space direction="vertical" style={{ width: '100%' }}>   
                <URDFList
                  urdfFiles={urdfFiles}
                  activeUrdfFiles={activeUrdfFiles}
                  onUrdfToggle={this.handleUrdfToggle}
                  onUrdfDelete={this.handleUrdfDelete}
                  extra={
                    <SceneController 
                      config={sceneConfig}
                      onConfigChange={this.handleConfigChange}
                      onViewChange={this.handleViewChange}
                    />
                  }
                />
                {this.renderModelControllers()}
              </Space>
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    );
  }

  /**
   * 渲染模型控制器列表
   */
  renderModelControllers = () => {
    const { activeUrdfFiles, robotsData } = this.state;
    
    return activeUrdfFiles.map(urdfFile => {
      const robotData = robotsData[urdfFile.id] || {};
      return (
        <ModelController
          key={urdfFile.id}
          title={urdfFile.name}
          joints={robotData.joints || {}}
          position={robotData.position}
          rotation={robotData.rotation}
          onJointChange={(jointName, value) => {
            this.handleJointChange(urdfFile.id, jointName, value)
          }
          }
          onPositionChange={(axis, value) =>
            this.handlePositionChange(urdfFile.id, axis, value)
          }
          onRotationChange={(axis, value) =>
            this.handleRotationChange(urdfFile.id, axis, value)
          }
        />
      );
    });
  };
}

export default URDFRender;