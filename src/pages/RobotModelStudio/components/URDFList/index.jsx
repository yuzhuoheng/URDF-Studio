import React from 'react';
import { Card, Switch, Space, Button, Empty } from 'antd';
import { RobotOutlined, DeleteOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import './style.less';

const { Text } = Typography;

const URDFList = ({ urdfFiles, activeUrdfFiles, onUrdfToggle, onUrdfDelete, extra }) => {
  return (
    <Card 
      title="URDF模型列表" 
      size="small" 
      className="urdf-list-card"
      extra={extra}
    >
      {urdfFiles.length > 0 ? (
        urdfFiles.map(urdfFile => {
          const isActive = activeUrdfFiles.some(f => f.id === urdfFile.id);
          return (
            <div 
              key={urdfFile.id} 
              className={`urdf-list-item ${isActive ? 'active' : ''}`}
            >
              <div className="urdf-list-item-content">
                <RobotOutlined className={`robot-icon ${isActive ? 'active' : ''}`} />
                <Text style={{ flex: 1 }}>{urdfFile.name}</Text>
              </div>
              <Space>
                <Switch
                  size="small"
                  checked={isActive}
                  onChange={(checked) => onUrdfToggle(urdfFile, checked)}
                />
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onUrdfDelete(urdfFile)}
                />
              </Space>
            </div>
          );
        })
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" align="center" size={4}>
              <Text type="secondary">暂无模型</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                请先上传 URDF 模型文件
              </Text>
            </Space>
          }
          style={{ 
            margin: '20px 0',
            padding: '20px 0',
            backgroundColor: '#fafafa',
            borderRadius: '4px'
          }}
        />
      )}
    </Card>
  );
};

export default URDFList; 