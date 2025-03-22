import React from 'react';
import { Slider, InputNumber, Row, Col, Typography, Collapse, Tabs } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import * as THREE from 'three';

const { Text } = Typography;

const ModelController = ({ 
  title, 
  joints, 
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
  onJointChange,
  onPositionChange,
  onRotationChange
}) => {
  // 将弧度转换为角度的辅助函数
  const radToDeg = (rad) => THREE.MathUtils.radToDeg(rad || 0);

  // 渲染位置控制
  const renderPositionControls = () => (
    <div className="controller-section">
      <Row align="middle" gutter={[16, 8]}>
        {['x', 'y', 'z'].map(axis => (
          <React.Fragment key={axis}>
            <Col span={2}>{axis.toUpperCase()}</Col>
            <Col span={14}>
              <Slider
                min={-10}
                max={10}
                step={0.1}
                value={position[axis]}
                onChange={(value) => onPositionChange(axis, value)}
              />
            </Col>
            <Col span={8}>
              <InputNumber
                min={-10}
                max={10}
                style={{ width: '100%' }}
                value={position[axis]}
                onChange={(value) => onPositionChange(axis, value)}
              />
            </Col>
          </React.Fragment>
        ))}
      </Row>
    </div>
  );

  // 渲染旋转控制
  const renderRotationControls = () => (
    <div className="controller-section">
      <Row align="middle" gutter={[16, 8]}>
        {['x', 'y', 'z'].map(axis => (
          <React.Fragment key={axis}>
            <Col span={2}>{axis.toUpperCase()}</Col>
            <Col span={14}>
              <Slider
                min={-180}
                max={180}
                step={1}
                value={radToDeg(rotation[axis])}
                onChange={(value) => onRotationChange(axis, value)}
              />
            </Col>
            <Col span={8}>
              <InputNumber
                min={-180}
                max={180}
                style={{ width: '100%' }}
                value={radToDeg(rotation[axis])}
                onChange={(value) => onRotationChange(axis, value)}
              />
            </Col>
          </React.Fragment>
        ))}
      </Row>
    </div>
  );

  // 渲染关节控制
  const renderJointControls = () => (
    <div className="controller-section">
      {Object.entries(joints).map(([jointName, joint]) => (
        <div key={jointName} style={{ marginBottom: 16 }}>
          <Text>{jointName}</Text>
          <Row align="middle" gutter={[16, 8]}>
            <Col span={16}>
              <Slider
                min={joint.limits.lower}
                max={joint.limits.upper}
                value={joint.angle}
                onChange={(value) => onJointChange(jointName, value)}
              />
            </Col>
            <Col span={8}>
              <InputNumber
                size="small"
                style={{width: '100%'}}
                value={joint.angle}
                min={joint.limits.lower}
                max={joint.limits.upper}
                onChange={(value) => onJointChange(jointName, value)}
              />
            </Col>
          </Row>
        </div>
      ))}
    </div>
  );

  const items = [
    {
      key: 'position',
      label: '位置',
      // icon: <AimOutlined />,
      children: renderPositionControls()
    },
    {
      key: 'rotation',
      label: '旋转',
      // icon: <RotationOutlined />,
      children: renderRotationControls()
    },
    {
      key: 'joints',
      label: '关节',
      // icon: <RobotOutlined />,
      children: renderJointControls()
    }
  ];

  return (
    <Collapse>
      <Collapse.Panel 
        header={<><RobotOutlined />&ensp;{title}</>}
        key={title}
      >
        <Tabs
          style={{marginLeft: -16}}
          size="small"
          defaultActiveKey="position"
          items={items}
          tabPosition="left"
        />
      </Collapse.Panel>
    </Collapse>
  );
};

export default ModelController; 