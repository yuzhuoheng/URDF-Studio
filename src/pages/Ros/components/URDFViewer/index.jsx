import React, { useEffect, useRef } from 'react';

const URDFViewer = ({ jointStates }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (jointStates && jointStates.name && Array.isArray(jointStates.name)) {
      // 将关节状态数据转换为更新消息
      const data = jointStates.name.map((name, index) => ({
        jointName: name,
        angle: Array.isArray(jointStates.position) ? jointStates.position[index] || 0 : 0
      }));

      // 发送关节状态更新消息
      iframeRef.current?.contentWindow.postMessage({
        type: 'UPDATE_JOINT',
        data
      }, '*');
    }
  }, [jointStates]);

  return (
    <iframe
      ref={iframeRef}
      src="/"
      style={{
        width: '100%',
        height: '100%',
        minHeight: 'calc(100vh - 240px)',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#f0f2f5'
      }}
      title="URDF Viewer"
    />
  );
};

export default React.memo(URDFViewer); 