# Dockerfile for manageUsersService
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5003
CMD ["node", "index.js"] 