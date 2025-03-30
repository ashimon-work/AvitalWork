# Use an official Node.js LTS image based on Debian Bullseye Slim for good compatibility
# See https://github.com/microsoft/vscode-dev-containers/tree/v0.245.0/containers/typescript-node
ARG VARIANT="20-bullseye-slim"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=16
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list-here>"

# Install Angular CLI globally (useful within the container)
# Run as root before switching to non-root user
USER root
RUN npm install -g @angular/cli

# Switch back to the non-root user 'node'
USER node

# Set working directory (optional, defaults usually work)
# WORKDIR /workspaces/magic-store-workspace

# Note: Dependencies will be installed via postCreateCommand in devcontainer.json
# This avoids rebuilding the image layer every time package-lock.json changes during development.
