# 使用官方 Nginx 镜像作为基础镜像
FROM nginx:alpine

# 删除默认的 nginx 静态文件
RUN rm -rf /usr/share/nginx/html/*

# 复制构建后的文件到容器中
COPY dist/ /usr/share/nginx/html/

# 复制自定义的 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"] 