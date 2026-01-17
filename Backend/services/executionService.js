const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Execution service for running code in Docker containers
 */
class ExecutionService {
  constructor() {
    this.dockerfilePath = path.join(__dirname, '../docker');
    this.tempDir = path.join(__dirname, '../temp');
  }

  /**
   * Get the appropriate Dockerfile and file extension for a language
   */
  getLanguageConfig(language) {
    const configs = {
      python: {
        dockerfile: 'python.Dockerfile',
        filename: 'solution.py',
        extension: '.py',
      },
      javascript: {
        dockerfile: 'javascript.Dockerfile',
        filename: 'solution.js',
        extension: '.js',
      },
      java: {
        dockerfile: 'java.Dockerfile',
        filename: 'Solution.java',
        extension: '.java',
      },
    };

    return configs[language.toLowerCase()];
  }

  /**
   * Execute code in a Docker container
   * @param {string} code - The code to execute
   * @param {string} language - Programming language (python, javascript, java)
   * @param {string} input - Input to pass to the program
   * @param {number} timeLimit - Time limit in milliseconds
   * @param {number} memoryLimit - Memory limit in MB
   * @returns {Promise<Object>} Execution result with stdout, stderr, exitCode, runtime, memory
   */
  async executeCode(code, language, input = '', timeLimit = 2000, memoryLimit = 256) {
    const config = this.getLanguageConfig(language);
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const executionId = uuidv4();
    const workDir = path.join(this.tempDir, executionId);
    const imageName = `code-runner-${language.toLowerCase()}:latest`;
    const containerName = `exec-${executionId}`;

    try {
      // Create temporary directory
      await fs.mkdir(workDir, { recursive: true });

      // Write code to file
      const codeFilePath = path.join(workDir, config.filename);
      await fs.writeFile(codeFilePath, code);

      // Build Docker image if it doesn't exist
      await this.ensureImageExists(language, imageName);

      // Run code in Docker container
      const result = await this.runInContainer(
        imageName,
        containerName,
        workDir,
        config.filename,
        input,
        timeLimit,
        memoryLimit
      );

      return result;
    } finally {
      // Cleanup: remove container and temp directory
      await this.cleanup(containerName, workDir);
    }
  }

  /**
   * Ensure Docker image exists, build if necessary
   */
  async ensureImageExists(language, imageName) {
    const config = this.getLanguageConfig(language);
    const dockerfilePath = path.join(this.dockerfilePath, config.dockerfile);

    // Check if image exists
    const imageExists = await this.checkImageExists(imageName);
    
    if (!imageExists) {
      // Build the image
      await this.buildImage(dockerfilePath, imageName);
    }
  }

  /**
   * Check if Docker image exists
   */
  checkImageExists(imageName) {
    return new Promise((resolve) => {
      const process = spawn('docker', ['image', 'inspect', imageName]);
      
      process.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  /**
   * Build Docker image
   */
  buildImage(dockerfilePath, imageName) {
    return new Promise((resolve, reject) => {
      const process = spawn('docker', [
        'build',
        '-f', dockerfilePath,
        '-t', imageName,
        path.dirname(dockerfilePath)
      ]);

      let stderr = '';

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to build Docker image: ${stderr}`));
        }
      });
    });
  }

  /**
   * Run code in Docker container with resource limits
   */
  runInContainer(imageName, containerName, workDir, filename, input, timeLimit, memoryLimit) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let timedOut = false;

      // Docker run command with resource limits
      const dockerArgs = [
        'run',
        '--rm',
        '--name', containerName,
        '--cpus', '1.0',
        '--memory', `${memoryLimit}m`,
        '--memory-swap', `${memoryLimit}m`,
        '--network', 'none',
        '--read-only',
        '--tmpfs', '/tmp:rw,noexec,nosuid,size=10m',
        '-v', `${workDir}:/code:ro`,
        '-i',
        imageName
      ];

      const process = spawn('docker', dockerArgs);

      let stdout = '';
      let stderr = '';
      let killed = false;

      // Set timeout to kill container
      const timeout = setTimeout(async () => {
        timedOut = true;
        killed = true;
        await this.killContainer(containerName);
      }, timeLimit);

      // Write input to stdin
      if (input) {
        process.stdin.write(input);
      }
      process.stdin.end();

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        clearTimeout(timeout);
        const runtime = Date.now() - startTime;

        // Determine status
        let status = 'success';
        if (timedOut) {
          status = 'Time Limit Exceeded';
        } else if (stderr.includes('MemoryError') || stderr.includes('out of memory')) {
          status = 'Memory Limit Exceeded';
        } else if (code !== 0) {
          status = 'Runtime Error';
        }

        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code,
          runtime,
          memory: 0, // Memory tracking would require additional monitoring
          status,
          timedOut,
        });
      });

      process.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          stdout: '',
          stderr: error.message,
          exitCode: -1,
          runtime: Date.now() - startTime,
          memory: 0,
          status: 'Runtime Error',
          timedOut: false,
        });
      });
    });
  }

  /**
   * Kill a running container
   */
  async killContainer(containerName) {
    return new Promise((resolve) => {
      const process = spawn('docker', ['kill', containerName]);
      process.on('close', () => resolve());
      // Ignore errors if container doesn't exist
      process.on('error', () => resolve());
    });
  }

  /**
   * Cleanup container and temporary files
   */
  async cleanup(containerName, workDir) {
    try {
      // Try to remove container (in case it wasn't removed)
      await new Promise((resolve) => {
        const process = spawn('docker', ['rm', '-f', containerName]);
        process.on('close', () => resolve());
        process.on('error', () => resolve());
      });

      // Remove temporary directory
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
      console.error('Cleanup error:', error.message);
    }
  }
}

module.exports = new ExecutionService();
