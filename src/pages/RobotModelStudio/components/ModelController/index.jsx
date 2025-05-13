import { EditOutlined, RobotOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Slider,
  Space,
  Tabs,
  Typography,
} from 'antd';
import React, { useState } from 'react';
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
  onJointMappingChange,
  isStl,
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
      [editingJoint]: values.mappedName,
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
        {['x', 'y', 'z'].map((axis) => (
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
        {['x', 'y', 'z'].map((axis) => (
          <React.Fragment key={axis}>
            <Col span={2}>{axis.toUpperCase()}</Col>
            <Col span={14}>
              <Slider
                min={-180}
                max={180}
                step={1}
                value={rotation[axis]}
                onChange={(value) => onRotationChange(axis, value)}
              />
            </Col>
            <Col span={8}>
              <InputNumber
                min={-180}
                max={180}
                style={{ width: '100%' }}
                value={rotation[axis]}
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

  // 定义标签页项
  const items = [
    {
      key: 'position',
      label: '位置',
      children: renderPositionControls(),
    },
    {
      key: 'rotation',
      label: '旋转',
      children: renderRotationControls(),
    },
  ];

  // 如果不是 STL 文件且有关节，添加关节控制标签页
  if (!isStl && Object.keys(joints).length > 0) {
    items.push({
      key: 'joints',
      label: '关节',
      children: renderJointControls(),
    });
  }

  return (
    <Card
      title={
        <>
          <RobotOutlined />
          &ensp;{title}
        </>
      }
      size="small"
      style={{ marginBottom: 8 }}
    >
      <Tabs
        style={{ marginLeft: -16 }}
        size="small"
        defaultActiveKey="position"
        items={items}
        tabPosition="left"
      />

      {/* 映射编辑模态框 */}
      <Modal
        title="编辑关节映射"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} onFinish={handleAddMapping} layout="vertical">
          <Form.Item
            name="mappedName"
            label="映射名称"
            rules={[{ required: true, message: '请输入映射名称' }]}
          >
            <Input placeholder="请输入映射名称" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ModelController;
