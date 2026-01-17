FROM node:18-alpine

# Create non-root user
RUN adduser -D -u 1000 runner

# Set working directory
WORKDIR /code

# Switch to non-root user
USER runner

# Default command
CMD ["node", "solution.js"]
