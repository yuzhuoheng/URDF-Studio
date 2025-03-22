import React, { useState } from 'react';
import { Slider, InputNumber, Row, Col, Typography, Card, Tabs, Button, Modal, Form, Input, Space } from 'antd';
import { RobotOutlined, EditOutlined } from '@ant-design/icons';
import * as THREE from 'three';

const { Text } = Typography;

const ModelController = ({ 
  title, 
  joints, 
  position = { x: 0, y: 0, z: 0 },
  rotation = { x: 0, y: 0, z: 0 },
  onJointChange,
  onPositionChange,
  onRotationChange,
  onJointMappingChange
}) => {
  const [jointMappings, setJointMappings] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingJoint, setEditingJoint] = useState(null);
  const [form] = Form.useForm();

  // 将弧度转换为角度的辅助函数
  const radToDeg = (rad) => THREE.MathUtils.radToDeg(rad || 0);

  // 更新映射并通知父组件
  const updateMappings = (newMappings) => {
    setJointMappings(newMappings);
    onJointMappingChange?.(newMappings);
  };

  // 处理添加映射
  const handleAddMapping = (values) => {
    const newMappings = {
      ...jointMappings,
      [editingJoint]: values.mappedName
    };
    updateMappings(newMappings);
    setIsModalVisible(false);
  };

  // 处理删除映射
  const handleDeleteMapping = () => {
    const newMappings = { ...jointMappings };
    delete newMappings[editingJoint];
    updateMappings(newMappings);
    setIsModalVisible(false);
  };

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
  const renderJointControls = () => {
    return Object.entries(joints).map(([name, joint]) => {
      const mappedName = jointMappings[name] || name;
      return (
        <div key={name} style={{ marginBottom: 16 }}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <Text style={{ width: 120 }} ellipsis={{ tooltip: name }}>
              {name}
            </Text>
            {mappedName !== name && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                → {mappedName}
              </Text>
            )}
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingJoint(name);
                form.setFieldsValue({ mappedName: jointMappings[name] || '' });
                setIsModalVisible(true);
              }}
            />
          </Space>
          <Row align="middle" gutter={[16, 8]}>
            <Col span={16}>
              <Slider
                min={joint.limits.lower}
                max={joint.limits.upper}
                value={joint.angle}
                onChange={(value) => onJointChange(name, value)}
              />
            </Col>
            <Col span={8}>
              <InputNumber
                size="small"
                style={{ width: '100%' }}
                min={joint.limits.lower}
                max={joint.limits.upper}
                value={joint.angle}
                onChange={(value) => onJointChange(name, value)}
              />
            </Col>
          </Row>
        </div>
      );
    });
  };

  const items = [
    {
      key: 'position',
      label: '位置',
      children: renderPositionControls()
    },
    {
      key: 'rotation',
      label: '旋转',
      children: renderRotationControls()
    },
    {
      key: 'joints',
      label: '关节',
      children: renderJointControls()
    },
  ];

  return (
    <>
      <Card 
        title={<><RobotOutlined />&ensp;{title}</>} 
        size="small"
      >
        <Tabs
          style={{ marginLeft: -16 }}
          size="small"
          defaultActiveKey="position"
          items={items}
          tabPosition="left"
        />
      </Card>

      <Modal
        title="编辑关节映射"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddMapping}>
          <Form.Item label="原始关节名">
            <Input disabled value={editingJoint} />
          </Form.Item>
          <Form.Item
            name="mappedName"
            label="映射关节名"
            rules={[{ required: true, message: '请输入映射关节名' }]}
          >
            <Input placeholder="例如: left_thumb_CMC" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              {jointMappings[editingJoint] && (
                <Button 
                  danger 
                  onClick={handleDeleteMapping}
                >
                  删除映射
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ModelController; 