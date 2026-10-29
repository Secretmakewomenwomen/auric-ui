# Package the existing frontend build; no Node.js toolchain is needed in the image.
ARG NGINX_IMAGE=docker.xuanyuan.run/nginx/nginx-unprivileged:stable-alpine
FROM ${NGINX_IMAGE}

LABEL org.opencontainers.image.title="AuricUI Docs" \
      org.opencontainers.image.description="AuricUI component documentation and demos"

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
