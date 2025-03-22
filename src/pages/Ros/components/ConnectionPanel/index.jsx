import React, { useState } from 'react';
import { Card, Form, Input, Button, Space, message } from 'antd';
import { LinkOutlined, DisconnectOutlined } from '@ant-design/icons';

const ConnectionPanel = ({ connected, onConnect, onDisconnect }) => {
  const [connecting, setConnecting] = useState(false);
  const [form] = Form.useForm();

  const handleConnect = async (values) => {
    setConnecting(true);
    try {
      await onConnect(values.url);
      message.success('连接成功');
    } catch (error) {
      console.error('Connection failed:', error);
      message.error('连接失败: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <Card title="ROS 连接设置" className="connection-card" size="small">
      <Form
        form={form}
        layout="inline"
        onFinish={handleConnect}
        initialValues={{
          url: 'ws://192.168.8.157:9001'
        }}
      >
        <Form.Item 
          name="url" 
          label="ROS bridge"
          rules={[{ required: true, message: '请输入 WebSocket 地址' }]}
        >
          <Input style={{ width: 240 }} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={connecting}
              disabled={connected}
              icon={<LinkOutlined />}
            >
              连接
            </Button>
            <Button 
              onClick={onDisconnect}
              disabled={!connected}
              icon={<DisconnectOutlined />}
            >
              断开连接
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ConnectionPanel; 