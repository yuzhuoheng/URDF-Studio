import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;


const App = (props) => {

  const formatTime = () => {
    const date = new Date()
    const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${minute}:${date.getSeconds()}`;
  }

    const config = {
        name: 'file',
        // multiple: true,
        // showUploadList:false,
        maxCount:1,
        accept: '.docx,.pdf',
        action: props.url,
        onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
              console.log(info.file.response)
              if(info.file.response.is_success){
                message.success(`${info.file.name} 上传成功`);
                props.add({
                  uploadTime: formatTime(),
                  id:info.file.response.data.task_id,
                  name: info.file.name,
                  status: '开始翻译',
                })
              }else{
                message.error(`${info.file.name} 上传失败， 请再次尝试上传`);
              }
            } else if (status === 'error') {
              message.error(`${info.file.name} 上传失败`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return (
        <Dragger {...config} style={{marginTop:16}}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击和拖拽上传文件</p>
        <p className="ant-upload-hint">
          当前只支持docx和pdf格式的文件
        </p>
      </Dragger>
    );
  };
  
  export default App;