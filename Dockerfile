FROM node:23-slim

WORKDIR /app

COPY . .
RUN npm install --silent
RUN npm install react-scripts@5.0.1 -g --silent


CMD ["npm", "start"]