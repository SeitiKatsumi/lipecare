FROM nginx:1.27-alpine

ARG LIPECARE_DEPLOY_VERSION=container
ARG LIPECARE_COMMIT_SHA=sem-commit
ARG LIPECARE_API_URL=/_lipecare
ARG CAPROVER_GIT_COMMIT_SHA

COPY package.json /tmp/package.json
COPY preview/ /usr/share/nginx/html/
COPY deploy/preview-nginx.conf /etc/nginx/conf.d/default.conf

RUN APP_VERSION="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' /tmp/package.json | head -n 1)" \
  && DEPLOY_NUMBER="$(sed -n 's/.*"deployNumber": *\([0-9][0-9]*\).*/\1/p' /tmp/package.json | head -n 1)" \
  && COMMIT_SHA="$(printf '%s' "${CAPROVER_GIT_COMMIT_SHA:-$LIPECARE_COMMIT_SHA}" | tr -d '[:space:]')" \
  && DEPLOY_VERSION="$LIPECARE_DEPLOY_VERSION" \
  && if [ "$DEPLOY_VERSION" = "container" ]; then DEPLOY_VERSION="deploy-$DEPLOY_NUMBER"; fi \
  && printf 'window.LIPECARE_APP_VERSION="%s";\nwindow.LIPECARE_DEPLOY_NUMBER="%s";\nwindow.LIPECARE_DEPLOY_VERSION="%s";\nwindow.LIPECARE_COMMIT_SHA="%s";\nwindow.LIPECARE_API_URL="%s";\n' "$APP_VERSION" "$DEPLOY_NUMBER" "$DEPLOY_VERSION" "$COMMIT_SHA" "$LIPECARE_API_URL" > /usr/share/nginx/html/config.js

EXPOSE 80
