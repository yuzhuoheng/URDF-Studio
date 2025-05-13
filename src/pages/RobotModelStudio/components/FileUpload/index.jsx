import { CheckCircleTwoTone, CloseCircleTwoTone, UploadOutlined } from '@ant-design/icons';
import { Button, Typography, Upload, message } from 'antd';
import { useRef } from 'react';
import './style.less';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

const FileUpload = ({ onChange }) => {
  const fileMap = useRef(new Map());

  // 处理单个STL文件上传
  const handleStlUpload = (file) => {
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.stl')) {
      message.error('请选择STL文件');
      return false;
    }

    // 创建文件对象
    const stlFile = {
      id: `stl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      file: file,
      type: 'stl',
    };

    onChange([stlFile], null);
    return false; // 阻止自动上传
  };

  const handleUpload = async (options) => {
    const { file, onSuccess } = options;

    try {
      // 如果是 URDF 文件
      if (file.name.endsWith('.urdf')) {
        const urdfFile = {
          id: `robot-${Date.now()}`,
          name: file.name,
          file: file,
          type: 'urdf',
        };
        onChange([urdfFile], fileMap.current);
      }
      // 如果是 mesh 文件
      else if (file.webkitRelativePath?.includes('meshes/')) {
        fileMap.current.set(file.name, file);
      }

      onSuccess?.('ok');
    } catch (error) {
      message.error(`文件处理失败: ${error.message}`);
    }
  };

  const props = {
    name: 'file',
    multiple: true,
    customRequest: handleUpload,
    showUploadList: false,
    directory: true,
    beforeUpload: (file) => {
      // 只处理 urdf, dae, stl 文件
      const ext = file.name.toLowerCase().split('.').pop();
      return ['urdf', 'dae', 'stl'].includes(ext);
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        const urdfFiles = info.fileList
          .filter((file) => file.name.toLowerCase().endsWith('.urdf'))
          .map((file) => ({
            id: `robot-${Date.now()}`,
            name: file.name,
            file: file.originFileObj || file,
            type: 'urdf',
          }));

        if (urdfFiles.length > 0) {
          onChange(urdfFiles, fileMap.current);
        }
      }
    },
  };

  return (
    <div>
      <Dragger {...props} className="custom-upload-dragger" style={{ padding: 4 }}>
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <Text strong>点击或拖拽URDF文件夹到此区域</Text>
        <Paragraph type="secondary" style={{ marginTop: 12 }}>
          <Text strong>文件夹结构示例：</Text>
          <pre
            style={{
              padding: '8px',
              borderRadius: '4px',
              marginTop: '8px',
              fontSize: '12px',
            }}
          >
            {`your_model/
  ├── urdf/
           │   └── robot.urdf
    └── meshes/
               ├── link1.dae
               ├── link2.stl
         └── ...`}
          </pre>
          <Text strong>URDF文件中的路径引用：</Text>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
            <CheckCircleTwoTone twoToneColor="#52c41a" />
            <Text style={{ marginLeft: 4 }}>&ensp;../meshes/part1.dae</Text>
          </div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center' }}>
            <CloseCircleTwoTone twoToneColor="#eb2f96" />
            <Text style={{ marginLeft: 4 }}>&ensp;package://your_model/meshes/link1.dae</Text>
          </div>
        </Paragraph>
      </Dragger>
      <div style={{ marginTop: 8, width: '100%' }}>
        <Upload
          accept=".stl,.STL"
          showUploadList={false}
          beforeUpload={handleStlUpload}
          style={{ width: '100%' }}
        >
          <Button icon={<UploadOutlined />} block type="dashed" style={{ width: '100%' }}>
            上传单个STL文件
          </Button>
        </Upload>
      </div>
    </div>
  );
};

export default FileUpload;
