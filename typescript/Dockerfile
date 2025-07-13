# Use an official Bun runtime as a parent image
FROM oven/bun:1-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy application dependency files to the working directory
# bun.lockb is automatically generated on install
COPY package.json tsconfig.json bun.lock ./

# Install dependencies
# Using --frozen-lockfile ensures that the exact versions of dependencies from bun.lockb are used.
# This is crucial for creating reproducible builds.
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# The server listens on port 3000 by default, but can be configured with the PORT env var.
EXPOSE 3000

# The default command to run when starting the container
# This starts the server in REST mode by default, but can be overridden
CMD [ "bun", "run", "start" ] 