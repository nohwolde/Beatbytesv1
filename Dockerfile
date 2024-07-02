# Stage 1: Build the frontend with Node.js
FROM node:18 AS build-env

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Build the frontend
COPY . .
RUN npm run build

# Optionally expose another port if your frontend is served separately in production
EXPOSE 3000

# Command to run both frontend and backend on separate ports
CMD ["npm start"]