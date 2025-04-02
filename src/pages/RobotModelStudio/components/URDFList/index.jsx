import React from 'react';
import { Card, Switch, Space, Button, Empty, Popconfirm, Tooltip } from 'antd';
import { RobotOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import './style.less';

const { Text } = Typography;

/**
 * URDF模型列表组件
 * 显示所有可用的URDF模型，并提供切换、删除和清空功能
 * 
 * @param {Array} urdfFiles - 所有URDF文件列表
 * @param {Array} activeUrdfFiles - 当前激活的URDF文件列表
 * @param {Function} onUrdfToggle - 切换模型激活状态的回调
 * @param {Function} onUrdfDelete - 删除模型的回调
 * @param {Function} onClearAll - 清空所有模型的回调
 * @param {ReactNode} extra - 额外的头部内容
 */
const URDFList = ({ urdfFiles, activeUrdfFiles, onUrdfToggle, onUrdfDelete, onClearAll, extra }) => {
  return (
    <Card 
      title="URDF模型列表" 
      size="small" 
      className="urdf-list-card"
      extra={
        <Space>
          {extra}
          {urdfFiles.length > 0 && (
            <Popconfirm
              title="确定要清空所有模型吗？"
              description="此操作将删除所有已保存的模型文件"
              onConfirm={onClearAll}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="清空所有模型">
                <Button 
                  type="text" 
                  danger
                  icon={<ClearOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      }
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