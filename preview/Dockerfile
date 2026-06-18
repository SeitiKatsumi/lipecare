FROM nginx:1.27-alpine

ARG LIPECARE_DEPLOY_VERSION=container
ARG LIPECARE_COMMIT_SHA=sem-commit

COPY preview/ /usr/share/nginx/html/

RUN printf 'window.LIPECARE_DEPLOY_VERSION="%s";\nwindow.LIPECARE_COMMIT_SHA="%s";\n' "$LIPECARE_DEPLOY_VERSION" "$LIPECARE_COMMIT_SHA" > /usr/share/nginx/html/config.js

EXPOSE 80
