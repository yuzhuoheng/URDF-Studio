import React, { useState, useEffect, useCallback } from 'react';
import { Card, Space, Row, Col, Empty, Alert, Button, Splitter } from 'antd';
import { RobotOutlined, LinkOutlined } from '@ant-design/icons';
import { history } from 'umi';
import rosClient from './services/RosClient';  // 导入单例实例
import ConnectionPanel from './components/ConnectionPanel';
import TopicList from './components/TopicList';
import MessageViewer from './components/MessageViewer';
import URDFViewer from './components/URDFViewer';
import './style.less';

const RosPage = () => {
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [messages, setMessages] = useState({});
  const [jointStates, setJointStates] = useState(null);

  useEffect(() => {
    // 设置回调
    rosClient.onMessageReceive = (topic, message) => {
      setMessages(prev => ({
        ...prev,
        [topic]: message
      }));

      // 如果是关节状态消息，更新 jointStates
      if (message.name && Array.isArray(message.position)) {
        setJointStates({
          name: message.name,
          position: message.position,
          timestamp: message.timestamp
        });
      }
    };

    rosClient.onTopicsUpdate = setTopics;

    // 组件卸载时清理
    return () => {
      rosClient.disconnect();
      rosClient.onMessageReceive = null;
      rosClient.onTopicsUpdate = null;
    };
  }, []);

  const handleTopicSelect = useCallback((newSelectedTopics) => {
    // 取消订阅已不再选中的主题
    selectedTopics.forEach(topic => {
      if (!newSelectedTopics.includes(topic)) {
        rosClient.unsubscribe(topic);
      }
    });

    // 订阅新选中的主题
    newSelectedTopics.forEach(topic => {
      if (!selectedTopics.includes(topic)) {
        rosClient.subscribe(topic);
      }
    });

    setSelectedTopics(newSelectedTopics);
  }, [selectedTopics]);


  const handleConnect = useCallback(async (url) => {
    try {
      setConnectionError(null);
      await rosClient.connect(url);
      setConnected(true);
      const topicList = await rosClient.getTopics();
      setTopics(topicList);
    } catch (error) {
      setConnectionError(error.message);
      setConnected(false);
      throw error;
    }
  }, []);

  const renderDisconnectedState = () => (
    <Card>
      <Empty
        image={<RobotOutlined style={{ fontSize: 64, color: '#1890ff' }} />}
        description={
          <Space direction="vertical" size="large">
            <div>
              <h3>ROS 仿真控制台</h3>
              <p>连接到 ROS Bridge 以开始仿真调试</p>
            </div>
            
            {connectionError && (
              <Alert
                type="error"
                message="连接失败"
                description={connectionError}
                showIcon
              />
            )}

            <div>
              <p>功能说明：</p>
              <ul style={{ textAlign: 'left' }}>
                <li>1. 连接 ROS Bridge</li>
                <li>2. 订阅 joint_states Topic 进行关节控制</li>
                <li>3. 实时预览机器人状态</li>
                <li>4. 支持关节名称映射</li>
              </ul>
            </div>

            <Alert
              type="info"
              message={
                <Space>
                  如果只需要预览 URDF 模型，请访问
                  <Button 
                    type="link" 
                    icon={<LinkOutlined />}
                    onClick={() => history.push('/online')}
                  >
                    模型预览页面
                  </Button>
                </Space>
              }
            />
          </Space>
        }
      />
    </Card>
  );

  return (
    <div className="ros-page">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <ConnectionPanel
          connected={connected}
          onConnect={handleConnect}
          onDisconnect={() => {
            rosClient.disconnect();
            setConnected(false);
            setTopics([]);
            setSelectedTopics([]);
            setMessages({});
            setJointStates(null);
          }}
        />

        {!connected ? (
          renderDisconnectedState()
        ) : (
          <Splitter
            style={{ height: 'calc(100vh - 120px)' }}
          >
            <Splitter.Panel defaultSize="30%" collapsible >
              <TopicList
                topics={topics}
                selectedTopics={selectedTopics}
                onTopicSelect={handleTopicSelect}
              />
              {selectedTopics.length > 0 && (
                <Card className="content-card" style={{ marginTop: 16 }}>
                  <MessageViewer
                    messages={messages}
                    selectedTopics={selectedTopics}
                  />
                </Card>
              )}
            </Splitter.Panel>
            
            <Splitter.Panel>
              <URDFViewer jointStates={jointStates} />
            </Splitter.Panel>
          </Splitter>
        )}
      </Space>
    </div>
  );
};

export default RosPage;
