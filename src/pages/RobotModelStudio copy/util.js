/**
 * 读取文件内容，自动根据文件类型选择合适的读取方法
 * @param {File} file - 要读取的文件对象
 * @returns {Promise<string|ArrayBuffer>} 返回文件内容的Promise
 */
const readFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        
        // 检查文件扩展名
        const fileName = file.name.toLowerCase();
        
        // 如果是stl文件，使用readAsArrayBuffer
        if (fileName.endsWith('.stl')) {
            reader.readAsArrayBuffer(file);
        } else {
            // 其他文件使用readAsText
            reader.readAsText(file);
        }
    });
};

export default readFile;