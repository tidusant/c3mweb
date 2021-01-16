FROM nginx:latest
#remove image config
RUN rm /etc/nginx/conf.d/default.conf
#copy web content
COPY ./out /usr/share/nginx/html
#copy custom nginx config to image
COPY nginx/default.conf /etc/nginx/conf.d/default.conf