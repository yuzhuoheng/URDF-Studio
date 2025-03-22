import { Card, Modal, Form, Input, Button, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { } from '@ant-design/icons';
import URDFRender from './components/URDFRender';
import './styles.less';

const RobotModelStudio = () => {
  const [jointMappings, setJointMappings] = useState({});

  // const [data, setData] = useState<any>(getExpire('youdao') || []);

  useEffect(() => {
    // 添加消息监听器
    const handleMessage = (event) => {
      const message = event.data;
      // console.log('RobotModelStudio received message:', {
      //   type: message.type,
      //   data: message.data,
      //   source: event.source,
      //   origin: event.origin
      // });

      if (message.type === 'UPDATE_JOINT') {
        // console.log('Joint update data:', message.data);
        message.data.forEach(joint => {
          const mappedName = jointMappings[joint.jointName] || joint.jointName;
          // console.log(`Joint: ${joint.jointName} (mapped to: ${mappedName}), Angle: ${joint.angle}`);
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [jointMappings]);


  return (
    <>
      <URDFRender />
    </>
  );
};

export default RobotModelStudio;
