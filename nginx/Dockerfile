FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom config + Cloudflare real IP ranges
COPY nginx.conf /etc/nginx/nginx.conf
COPY cloudflare.conf /etc/nginx/cloudflare.conf
COPY 50x.html /usr/share/nginx/html/50x.html

EXPOSE 80
