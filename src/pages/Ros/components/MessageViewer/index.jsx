import React from 'react';
import { Card, Empty, Space, Table } from 'antd';
import { formatJointStateMessage } from '../../utils';

const MessageViewer = ({ messages, selectedTopics }) => {
  if (selectedTopics.length === 0) {
    return (
      <Empty 
        description="暂未选择任何话题" 
        image={Empty.PRESENTED_IMAGE_SIMPLE} 
      />
    );
  }

  const columns = [
    {
      title: '关节名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '位置',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '速度',
      dataIndex: 'velocity',
      key: 'velocity',
    },
    {
      title: '力矩',
      dataIndex: 'effort',
      key: 'effort',
    }
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {selectedTopics.map(topic => {
        const message = messages[topic];
        if (!message) return null;

        const data = formatJointStateMessage(message);
        
        return (
          <Card 
            key={topic} 
            title={<span className="topic-name">{topic}</span>}
            size="small"
            className="message-viewer"
            extra={<span>最后更新: {message.timestamp}</span>}
          >
            <Table
              columns={columns}
              dataSource={data}
              size="small"
              pagination={false}
            />
          </Card>
        );
      })}
    </Space>
  );
};

export default React.memo(MessageViewer); 