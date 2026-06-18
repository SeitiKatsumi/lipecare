FROM nginx:1.27-alpine

ARG LIPECARE_DEPLOY_VERSION=container
ARG LIPECARE_COMMIT_SHA=sem-commit
ARG CAPROVER_GIT_COMMIT_SHA

COPY package.json /tmp/package.json
COPY preview/ /usr/share/nginx/html/

RUN APP_VERSION="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' /tmp/package.json | head -n 1)" \
  && COMMIT_SHA="${CAPROVER_GIT_COMMIT_SHA:-$LIPECARE_COMMIT_SHA}" \
  && DEPLOY_VERSION="$LIPECARE_DEPLOY_VERSION" \
  && if [ "$DEPLOY_VERSION" = "container" ]; then DEPLOY_VERSION="$(printf '%s' "$COMMIT_SHA" | cut -c1-12)"; fi \
  && printf 'window.LIPECARE_APP_VERSION="%s";\nwindow.LIPECARE_DEPLOY_VERSION="%s";\nwindow.LIPECARE_COMMIT_SHA="%s";\n' "$APP_VERSION" "$DEPLOY_VERSION" "$COMMIT_SHA" > /usr/share/nginx/html/config.js

EXPOSE 80
