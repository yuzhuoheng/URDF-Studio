import React, { useMemo } from 'react';
import { Table, Tag, Button, Tooltip, Checkbox, Card } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { isJointStateType } from '../../utils';

const TopicList = ({ topics, selectedTopics, onTopicSelect, onRefresh }) => {
  const columns = useMemo(() => [
    {
      title: 'Topic',
      dataIndex: 'name',
      key: 'name',
      width: "30%",
      ellipsis: true,
      render: (name) => (
        <Tooltip title={name}>
          <span className="topic-name">{name}</span>
        </Tooltip>
      ),
    },
    {
      title: '消息类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={isJointStateType(type) ? 'blue' : 'default'}>
          {type}
        </Tag>
      ),
      filters: [
        {
          text: '关节状态',
          value: 'sensor_msgs/msg/JointState',
        }
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '订阅',
      key: 'subscribe',
      width: 80,
      render: (_, record) => {
        const isSelected = selectedTopics.includes(record.name);
        const canSubscribe = isJointStateType(record.type);
        
        return (
          <Checkbox
            checked={isSelected}
            disabled={!canSubscribe}
            onChange={(e) => {
              if (e.target.checked) {
                onTopicSelect([...selectedTopics, record.name]);
              } else {
                onTopicSelect(selectedTopics.filter(t => t !== record.name));
              }
            }}
          >
            订阅
          </Checkbox>
        );
      },
    }
  ], [selectedTopics, onTopicSelect]);

  return (
    <Card 
      size='small'
      className='topic-list'
    >
      
      <Button 
        color="primary" 
        variant="filled"
        size='small'
        style={{float:'right',marginBottom:'4px'}}
        icon={<ReloadOutlined />}
        onClick={onRefresh}
      >
        刷新
      </Button>
      <Table
        columns={columns}
        dataSource={topics}
        rowKey="name"
        size="small"
        pagination={{
          pageSize: 10,
          size:'small',
          showSizeChanger: false,
          showQuickJumper: false,
        }}
      />
    </Card>
  );
};

export default React.memo(TopicList); 