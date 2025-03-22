import React, { useState } from 'react';
import { Slider, Row, Col, Typography, Switch, ColorPicker, Button, Drawer, Divider, Tooltip } from 'antd';
import { 
  CameraOutlined, 
  BgColorsOutlined, 
  BulbOutlined, 
  ColumnWidthOutlined, 
  ColumnHeightOutlined, 
  BorderOutlined, 
  SettingOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const SceneController = ({ config, onConfigChange, onViewChange }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const configContent = (
    <>
      {/* 视角控制 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5}><CameraOutlined /> 视角控制</Title>
        <Row gutter={[8, 8]}>
          <Col span={8}>
            <Button 
              icon={<ArrowRightOutlined />} 
              onClick={() => onViewChange('+x')}
              title="+X轴视图"
              block
              color="primary" 
              variant="filled"
            >
              +X
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              icon={<ArrowUpOutlined />} 
              onClick={() => onViewChange('+y')}
              title="+Y轴视图"
              block
              color="primary" 
              variant="filled"
            >
              +Y
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              icon={<VerticalAlignTopOutlined />} 
              onClick={() => onViewChange('+z')}
              title="+Z轴视图"
              block
              color="primary" 
              variant="filled"
            >
              +Z
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => onViewChange('-x')}
              title="-X轴视图"
              block
              color="primary" 
              variant="filled"
            >
              - X
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              icon={<ArrowDownOutlined />} 
              onClick={() => onViewChange('-y')}
              title="-Y轴视图"
              block
              color="primary" 
              variant="filled"
            >
              - Y
            </Button>
          </Col>
          <Col span={8}>
            <Button 
              icon={<VerticalAlignBottomOutlined />} 
              onClick={() => onViewChange('-z')}
              title="-Z轴视图"
              block
              color="primary" 
              variant="filled"
            >
              - Z
            </Button>
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 相机控制 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5}><CameraOutlined /> 相机参数</Title>
        <Row align="middle" gutter={[16, 8]}>
          <Col span={8}>视野角度(FOV)</Col>
          <Col span={16}>
            <Slider
              min={30}
              max={120}
              value={config.fov}
              onChange={(value) => onConfigChange('fov', value)}
            />
          </Col>
          <Col span={8}>相机距离</Col>
          <Col span={16}>
            <Slider
              min={1}
              max={20}
              step={0.1}
              value={config.cameraDistance}
              onChange={(value) => onConfigChange('cameraDistance', value)}
            />
          </Col>
        </Row>
      </div>

      {/* 光照控制 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5}><BulbOutlined /> 光照设置</Title>
        <Row align="middle" gutter={[16, 8]}>
          <Col span={8}>环境光强度</Col>
          <Col span={16}>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={config.ambientIntensity}
              onChange={(value) => onConfigChange('ambientIntensity', value)}
            />
          </Col>
          <Col span={8}>平行光强度</Col>
          <Col span={16}>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={config.directionalIntensity}
              onChange={(value) => onConfigChange('directionalIntensity', value)}
            />
          </Col>
        </Row>
      </div>

      {/* 场景设置 */}
      <div>
        <Title level={5}><BgColorsOutlined /> 场景设置</Title>
        <Row align="middle" gutter={[16, 8]}>
          <Col span={8}>背景颜色</Col>
          <Col span={16}>
            <ColorPicker
              value={config.backgroundColor}
              onChange={(value) => onConfigChange('backgroundColor', value.toHexString())}
            />
          </Col>
          <Col span={8}>网格显示</Col>
          <Col span={16}>
            <Switch
              checked={config.showGrid}
              checkedChildren="开启" 
              unCheckedChildren="关闭"
              onChange={(checked) => onConfigChange('showGrid', checked)}
            />
          </Col>
          <Col span={8}>阴影</Col>
          <Col span={16}>
            <Switch
              checked={config.shadows}
              checkedChildren="开启" 
              unCheckedChildren="关闭"
              onChange={(checked) => onConfigChange('shadows', checked)}
            />
          </Col>
        </Row>
      </div>
    </>
  );

  return (
    <>
      <Tooltip title="场景设置">
        <Button
          color="primary" 
          variant="text"
          icon={<SettingOutlined />}
          onClick={() => setDrawerVisible(true)}
        />
      </Tooltip>
      

      <Drawer
        title="场景配置"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {configContent}
      </Drawer>
    </>
  );
};

export default SceneController; 