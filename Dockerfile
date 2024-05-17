FROM nginx

COPY dist /usr/share/nginx/html

COPY ssl.crt /root/ssl/ssl.crt
COPY ssl.key /root/ssl/ssl.key

COPY index.conf /etc/nginx/conf.d/default.conf