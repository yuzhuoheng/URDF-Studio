import { ViewerMessage, UpdateJointData, UpdateJointResponse } from '../types/message';

export class MessageHandler {
  private urdfRender: any;  // URDFRender 组件实例

  constructor(urdfRender: any) {
    this.urdfRender = urdfRender;
    this.initMessageListener();
  }

  private initMessageListener() {
    window.addEventListener('message', this.handleMessage);
  }

  private handleMessage = async (event: MessageEvent) => {
    const message: ViewerMessage = event.data;
    const { type, data, requestId } = message;

    try {
      let response;
      switch (type) {
        case 'LOAD_MODEL':
          response = await this.urdfRender.handleModelLoad(data);
          break;
        case 'UPDATE_JOINT':
          const jointData = data as UpdateJointData;
          await this.urdfRender.handleJointChange(
            jointData.robotId,
            jointData.jointName, 
            jointData.angle
          );
          response = {
            success: true,
            jointName: jointData.jointName,
            angle: jointData.angle
          } as UpdateJointResponse;
          break;
        case 'SET_VIEW':
          response = this.urdfRender.handleViewChange(data.view);
          break;
        case 'GET_JOINTS':
          response = this.urdfRender.getJointsInfo();
          break;
        case 'RESET_SCENE':
          response = this.urdfRender.resetScene();
          break;
      }

      // 发送响应
      if (response) {
        this.sendResponse(event.source as Window, {
          type: `${type}_RESPONSE`,
          data: response,
          requestId
        });
      }
    } catch (error: any) {
      // 发送错误响应
      this.sendResponse(event.source as Window, {
        type: 'ERROR',
        data: { 
          message: error.message,
          jointName: (data as UpdateJointData)?.jointName 
        },
        requestId
      });
    }
  }

  private sendResponse(target: Window, message: ViewerMessage) {
    target.postMessage(message, '*');
  }

  public destroy() {
    window.removeEventListener('message', this.handleMessage);
  }
} 