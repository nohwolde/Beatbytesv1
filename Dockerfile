# Use the official Node.js 16 LTS image as the base image
FROM node:18

# Set the working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Optionally set Python path for npm
# RUN npm config set python /usr/bin/python3

# Install project dependencies
RUN npm install

# Copy the rest of the project files into the Docker container
COPY . .

# Increase the Node.js heap size to prevent memory issues during the build
ENV NODE_OPTIONS=--max-old-space-size=4096

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on