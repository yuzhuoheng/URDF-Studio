import React from 'react';
import { Card, Slider, InputNumber, Row, Col, Typography } from 'antd';

const { Title } = Typography;

const URDFController = ({ joints, onJointChange }) => {
  return (
    <Card title="关节控制器" style={{ marginBottom: 16 }}>
      {Object.entries(joints).map(([jointName, joint]) => (
        <div key={jointName} style={{ marginBottom: 16 }}>
          <Title level={5}>
            {jointName} ({joint.type})
          </Title>
          <Row align="middle" gutter={16}>
            <Col span={16}>
              <Slider
                min={joint.limits.lower}
                max={joint.limits.upper}
                value={joint.angle}
                onChange={(value) => onJointChange(jointName, value)}
                step={0.1}
              />
            </Col>
            <Col span={8}>
              <InputNumber
                min={joint.limits.lower}
                max={joint.limits.upper}
                value={joint.angle}
                onChange={(value) => onJointChange(jointName, value)}
                style={{ width: '100%' }}
                step={0.1}
              />
            </Col>
          </Row>
        </div>
      ))}
    </Card>
  );
};

export default URDFController; 