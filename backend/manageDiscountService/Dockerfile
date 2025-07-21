# Dockerfile for manageDiscountService
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production || true
COPY . .
EXPOSE 5004
CMD ["node", "index.js"] 