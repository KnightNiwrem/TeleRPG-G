FROM node:16-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (if needed)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]