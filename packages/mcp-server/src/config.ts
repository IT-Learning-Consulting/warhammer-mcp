import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ConfigSchema = z.object({
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  logFormat: z.enum(['json', 'simple']).default('simple'),
  enableFileLogging: z.boolean().default(false),
  logFilePath: z.string().optional(),
  foundry: z.object({
    host: z.string().default('localhost'),
    port: z.number().min(1024).max(65535).default(31415),
    namespace: z.string().default('/warhammer-mcp'),
    reconnectAttempts: z.number().min(1).max(20).default(5),
    reconnectDelay: z.number().min(100).max(30000).default(1000),
    connectionTimeout: z.number().min(1000).max(60000).default(10000),
  }),
  server: z.object({
    name: z.string().default('foundry-mcp-server'),
    version: z.string().default('1.0.0'),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

const rawConfig = {
  logLevel: process.env.LOG_LEVEL || 'warn',
  logFormat: process.env.LOG_FORMAT || 'simple',
  enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
  logFilePath: process.env.LOG_FILE_PATH,
  foundry: {
    host: process.env.FOUNDRY_HOST || 'localhost',
    port: parseInt(process.env.FOUNDRY_PORT || '31415', 10),
    namespace: process.env.FOUNDRY_NAMESPACE || '/warhammer-mcp',
    reconnectAttempts: parseInt(process.env.FOUNDRY_RECONNECT_ATTEMPTS || '5', 10),
    reconnectDelay: parseInt(process.env.FOUNDRY_RECONNECT_DELAY || '1000', 10),
    connectionTimeout: parseInt(process.env.FOUNDRY_CONNECTION_TIMEOUT || '10000', 10),
  },
  server: {
    name: process.env.SERVER_NAME || 'foundry-mcp-server',
    version: process.env.SERVER_VERSION || '1.0.0',
  },
};

export const config = ConfigSchema.parse(rawConfig);
