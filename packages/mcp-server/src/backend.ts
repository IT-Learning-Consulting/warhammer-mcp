import * as fs from 'fs';

import * as os from 'os';

import * as path from 'path';

import * as net from 'net';

import { spawn, ChildProcess } from 'child_process';

import { config } from './config.js';

import { Logger } from './logger.js';

import { FoundryClient } from './foundry-client.js';

import { CharacterTools } from './tools/character.js';

import { CareerAdvancementTools } from './tools/career-advancement.js';

import { CorruptionMutationTools } from './tools/corruption-mutation.js';

import { FortuneFateTools } from './tools/fortune-fate.js';

import { CriticalWoundsTools } from './tools/critical-wounds.js';

import { AdvantageTools } from './tools/advantage-tracker.js';

import { DiseaseInfectionTools } from './tools/disease-infection.js';

import { InventoryManagementTools } from './tools/inventory-management.js';

import { ItemCreatorTools } from './tools/item-creator.js';

import { PrayerBlessingTools } from './tools/prayer-blessing.js';

import { SpellMagicTools } from './tools/spell-magic.js';

import { SocialStatusTools } from './tools/social-status.js';

import { CustomNPCGeneratorTools } from './tools/custom-npc-generator.js';

import { CompendiumTools } from './tools/compendium.js';

import { SceneTools } from './tools/scene.js';

import { ActorCreationTools } from './tools/actor-creation.js';

import { QuestCreationTools } from './tools/quest-creation.js';

import { DiceRollTools } from './tools/dice-roll.js';

import { CampaignManagementTools } from './tools/campaign-management.js';

import { OwnershipTools } from './tools/ownership.js';

import { MapGenerationTools } from './tools/map-generation.js';

import { RollTableTools } from './tools/rolltable-management.js';

const CONTROL_HOST = '127.0.0.1';

const CONTROL_PORT = 31414;

const LOCK_FILE = path.join(os.tmpdir(), 'foundry-mcp-backend.lock');

function getBundledPythonPath(): string {
  // Detect installation directory based on current executable location
  let installDir = path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer');

  // Try to detect install directory from current process location
  const currentDir = process.cwd();
  const execDir = path.dirname(process.execPath);

  // Check if we're running from an installed location
  if (currentDir.includes('FoundryMCPServer') || execDir.includes('FoundryMCPServer')) {
    // Extract the installation directory
    const foundryMcpIndex = currentDir.indexOf('FoundryMCPServer');
    if (foundryMcpIndex !== -1) {
      installDir = currentDir.substring(0, foundryMcpIndex + 'FoundryMCPServer'.length);
    } else {
      const foundryMcpExecIndex = execDir.indexOf('FoundryMCPServer');
      if (foundryMcpExecIndex !== -1) {
        installDir = execDir.substring(0, foundryMcpExecIndex + 'FoundryMCPServer'.length);
      }
    }
  }

  // Check for nested ComfyUI installation (current actual structure)
  const nestedComfyUIPythonPath = path.join(installDir, 'ComfyUI', 'ComfyUI', 'python_embeded', 'python.exe');
  if (fs.existsSync(nestedComfyUIPythonPath)) {
    return nestedComfyUIPythonPath;
  }

  // Check for flat ComfyUI portable installation (fallback)
  const portablePythonPath = path.join(installDir, 'ComfyUI', 'python_embeded', 'python.exe');
  if (fs.existsSync(portablePythonPath)) {
    return portablePythonPath;
  }

  // Path to bundled Python virtual environment (legacy)
  const bundledPythonPath = path.join(installDir, 'ComfyUI-env', 'Scripts', 'python.exe');

  // Check if bundled Python exists
  if (fs.existsSync(bundledPythonPath)) {
    return bundledPythonPath;
  }

  // Fallback: try alternative installation paths
  const fallbackPaths = [
    path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'ComfyUI', 'ComfyUI', 'python_embeded', 'python.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'ComfyUI-headless', 'ComfyUI', 'python_embeded', 'python.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'ComfyUI', 'python_embeded', 'python.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'ComfyUI-headless', 'python_embeded', 'python.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'ComfyUI-env', 'Scripts', 'python.exe'),
    path.join(process.cwd(), '..', '..', 'ComfyUI-env', 'Scripts', 'python.exe'),
    path.join(__dirname, '..', '..', '..', 'ComfyUI-env', 'Scripts', 'python.exe'),
    path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'Python', 'python.exe')
  ];

  for (const fallbackPath of fallbackPaths) {
    if (fs.existsSync(fallbackPath)) {
      return fallbackPath;
    }
  }

  // Final fallback to system Python (should not happen with bundled installer)
  console.error('Bundled Python not found, falling back to system Python');
  return 'python';
}


// ComfyUI Service Management

let comfyuiProcess: ChildProcess | null = null;

let comfyuiStatus: 'stopped' | 'starting' | 'running' | 'error' = 'stopped';

let lockFd: number | null = null;

function acquireLock(): boolean {

  try {

    try {

      lockFd = fs.openSync(LOCK_FILE, 'wx');

    } catch (err: any) {

      if (err && err.code === 'EEXIST') {

        try {

          const lockData = fs.readFileSync(LOCK_FILE, 'utf8');

          const lockPid = parseInt(lockData.trim(), 10);

          try {

            process.kill(lockPid, 0);

            console.error(`Backend already running with PID ${lockPid}`);

            return false;

          } catch {

            console.error(`Removing stale backend lock for PID ${lockPid}`);

            try { fs.unlinkSync(LOCK_FILE); } catch { }

            lockFd = fs.openSync(LOCK_FILE, 'wx');

          }

        } catch (readErr) {

          console.error('Corrupt backend lock file, removing:', readErr);

          try { fs.unlinkSync(LOCK_FILE); } catch { }

          lockFd = fs.openSync(LOCK_FILE, 'wx');

        }

      } else {

        console.error('Failed to open backend lock file:', err);

        return false;

      }

    }

    if (lockFd === null) return false;

    fs.writeFileSync(lockFd, String(process.pid));

    try { fs.fsyncSync(lockFd); } catch { }

    console.error(`Acquired backend lock with PID ${process.pid}`);

    return true;

  } catch (error) {

    console.error('Failed to acquire backend lock:', error);

    return false;

  }

}

function releaseLock(): void {

  try {

    if (lockFd !== null) { try { fs.closeSync(lockFd); } catch { } lockFd = null; }

    if (fs.existsSync(LOCK_FILE)) { try { fs.unlinkSync(LOCK_FILE); } catch { } }

  } catch (error) {

    console.error('Failed to release backend lock:', error);

  }

}

// ComfyUI Service Management Functions

async function findComfyUIPath(): Promise<string> {

  // Check for nested ComfyUI installation (current actual structure)

  const nestedComfyUIPath = path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'ComfyUI', 'ComfyUI');

  if (fs.existsSync(path.join(nestedComfyUIPath, 'main.py'))) {

    return nestedComfyUIPath;

  }

  // Check for legacy nested ComfyUI-headless installation (fallback)

  const nestedHeadlessPath = path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'ComfyUI-headless', 'ComfyUI');

  if (fs.existsSync(path.join(nestedHeadlessPath, 'main.py'))) {

    return nestedHeadlessPath;

  }

  // Check for flat ComfyUI installation (unlikely but possible)

  const flatPath = path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'ComfyUI');

  if (fs.existsSync(path.join(flatPath, 'main.py'))) {

    return flatPath;

  }

  // Check for legacy flat ComfyUI-headless installation (fallback)

  const legacyFlatPath = path.join(os.homedir(), 'AppData', 'Local', 'FoundryMCPServer', 'ComfyUI-headless');

  if (fs.existsSync(path.join(legacyFlatPath, 'main.py'))) {

    return legacyFlatPath;

  }

  throw new Error('ComfyUI installation not found');

}

async function waitForComfyUIReady(timeoutMs: number = 60000): Promise<void> {

  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {

    try {

      const response = await fetch('http://127.0.0.1:31411/system_stats', {

        signal: AbortSignal.timeout(5000)

      });

      if (response.ok) {

        return; // ComfyUI is ready

      }

    } catch (error) {

      // Still starting up, continue polling

    }

    await new Promise(resolve => setTimeout(resolve, 2000));

  }

  throw new Error('ComfyUI failed to start within timeout');

}

async function startComfyUIService(logger: Logger): Promise<any> {

  if (comfyuiStatus === 'running') {

    return { status: 'already_running', message: 'ComfyUI service is already running' };

  }

  if (comfyuiStatus === 'starting') {

    return { status: 'starting', message: 'ComfyUI service start already in progress' };

  }

  try {

    comfyuiStatus = 'starting';

    logger.info('Starting ComfyUI service...');

    // Find ComfyUI installation

    const comfyUIPath = await findComfyUIPath();

    logger.info('ComfyUI found', { path: comfyUIPath });

    // Spawn ComfyUI process

    logger.info('Starting ComfyUI process', { path: path.join(comfyUIPath, 'main.py') });

    // Use bundled Python virtual environment
    const pythonExe = getBundledPythonPath();
    logger.info('Using bundled Python', { pythonPath: pythonExe });

    comfyuiProcess = spawn(pythonExe, [

      'main.py',

      '--port', '31411',

      '--listen', '127.0.0.1',

      '--disable-auto-launch',

      '--dont-print-server'

    ], {

      cwd: comfyUIPath,

      stdio: ['ignore', 'pipe', 'pipe'],

      detached: false,

      windowsHide: true // Prevent Python console window on Windows

    });

    // Handle process events

    comfyuiProcess.on('spawn', () => {

      logger.info('ComfyUI process spawned successfully');

    });

    comfyuiProcess.on('error', (error) => {

      logger.error('ComfyUI process error', { error: error.message });

      comfyuiStatus = 'error';

    });

    comfyuiProcess.on('exit', (code, signal) => {

      logger.info('ComfyUI process exited', { code, signal });

      comfyuiStatus = 'stopped';

      comfyuiProcess = null;

    });

    // Capture stdout/stderr for debugging

    comfyuiProcess.stdout?.on('data', (data) => {

      logger.debug('ComfyUI stdout', { data: data.toString().trim() });

    });

    comfyuiProcess.stderr?.on('data', (data) => {

      logger.debug('ComfyUI stderr', { data: data.toString().trim() });

    });

    // Wait for ComfyUI API to be ready

    await waitForComfyUIReady();

    comfyuiStatus = 'running';

    logger.info('ComfyUI service started successfully', {

      pid: comfyuiProcess.pid,

      status: comfyuiStatus

    });

    return {

      status: 'running',

      message: 'ComfyUI service started successfully',

      pid: comfyuiProcess.pid

    };

  } catch (error: any) {

    logger.error('ComfyUI service start failed', { error: error.message });

    comfyuiStatus = 'error';

    if (comfyuiProcess) {

      comfyuiProcess.kill();

      comfyuiProcess = null;

    }

    return {

      status: 'error',

      message: `Failed to start ComfyUI service: ${error.message}`

    };

  }

}

async function stopComfyUIService(logger: Logger): Promise<any> {

  if (comfyuiStatus === 'stopped') {

    return { status: 'already_stopped', message: 'ComfyUI service is already stopped' };

  }

  try {

    logger.info('Stopping ComfyUI service...');

    if (comfyuiProcess) {

      comfyuiProcess.kill('SIGTERM');

      // Wait for graceful shutdown, then force kill if needed

      await new Promise(resolve => setTimeout(resolve, 5000));

      if (comfyuiProcess && !comfyuiProcess.killed) {

        comfyuiProcess.kill('SIGKILL');

      }

    }

    comfyuiStatus = 'stopped';

    comfyuiProcess = null;

    logger.info('ComfyUI service stopped successfully');

    return { status: 'stopped', message: 'ComfyUI service stopped successfully' };

  } catch (error: any) {

    logger.error('ComfyUI service stop failed', { error: error.message });

    return { status: 'error', message: `Failed to stop ComfyUI service: ${error.message}` };

  }

}

async function checkComfyUIStatus(): Promise<any> {

  // Check process status first

  if (!comfyuiProcess || comfyuiProcess.killed) {

    comfyuiStatus = 'stopped';

  }

  // If status shows running, verify API is actually responsive

  if (comfyuiStatus === 'running') {

    try {

      const response = await fetch('http://127.0.0.1:31411/system_stats', {

        signal: AbortSignal.timeout(5000)

      });

      if (!response.ok) {

        comfyuiStatus = 'error';

      }

    } catch (error) {

      comfyuiStatus = 'error';

    }

  }

  return {

    status: comfyuiStatus,

    message: getStatusMessage(comfyuiStatus),

    pid: comfyuiProcess?.pid || null

  };

}

function getStatusMessage(status: string): string {

  const statusMessages = {

    'stopped': 'ComfyUI service is not running',

    'starting': 'ComfyUI service is starting...',

    'running': 'ComfyUI service is running',

    'error': 'ComfyUI service encountered an error'

  };

  return statusMessages[status as keyof typeof statusMessages] || 'Unknown status';

}

// Map generation WebSocket handlers (matching existing tool pattern)
async function handleGenerateMapRequest(message: any, jobQueue: any, comfyuiClient: any, logger: Logger, foundryClient: any): Promise<any> {
  try {
    logger.info('Map generation request received via WebSocket', { message });

    if (!jobQueue || !comfyuiClient) {
      throw new Error('Map generation components not initialized');
    }

    // Extract data from message - could be in message.data or message directly
    const data = message.data || message;

    // Validate input
    if (!data.prompt || typeof data.prompt !== 'string') {
      throw new Error('Prompt is required and must be a string');
    }

    if (!data.scene_name || typeof data.scene_name !== 'string') {
      throw new Error('Scene name is required and must be a string');
    }

    const params = {
      prompt: data.prompt.trim(),
      scene_name: data.scene_name.trim(),
      size: data.size || 'medium',
      grid_size: data.grid_size || 70
    };

    // Create job using mapgen's JobQueue
    const job = await jobQueue.createJob({ params });
    const jobId = job.id;

    // Start background processing (mapgen style)
    processMapGenerationInBackend(jobId, jobQueue, comfyuiClient, logger, foundryClient).catch((error) => {
      logger.error('Background map generation failed', { jobId, error });
    });

    return {
      status: 'success',
      jobId: jobId,
      message: 'Map generation started',
      estimatedTime: '30-90 seconds'
    };

  } catch (error: any) {
    logger.error('Map generation request failed', { error: error.message });
    return {
      status: 'error',
      message: error.message
    };
  }
}

async function handleCheckMapStatusRequest(data: any, jobQueue: any, logger: Logger): Promise<any> {
  try {
    if (!data) {
      throw new Error('Request data is required');
    }
    const jobId = data.job_id;
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const job = await jobQueue.getJob(jobId);
    if (!job) {
      return {
        status: 'error',
        message: `Job ${jobId} not found`
      };
    }

    return {
      status: 'success',
      job: {
        id: job.id,
        status: job.status,
        progress_percent: job.progress_percent,
        current_stage: job.current_stage,
        result: job.result,
        error: job.error
      }
    };

  } catch (error: any) {
    logger.error('Map status check failed', { error: error.message });
    return {
      status: 'error',
      message: error.message
    };
  }
}

async function handleCancelMapJobRequest(data: any, jobQueue: any, logger: Logger): Promise<any> {
  try {
    if (!data) {
      throw new Error('Request data is required');
    }
    const jobId = data.job_id;
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    const cancelled = await jobQueue.cancelJob(jobId);

    return {
      status: cancelled ? 'success' : 'error',
      message: cancelled ? 'Job cancelled successfully' : 'Failed to cancel job'
    };

  } catch (error: any) {
    logger.error('Map job cancellation failed', { error: error.message });
    return {
      status: 'error',
      message: error.message
    };
  }
}

// Background processing using mapgen's proven approach
async function processMapGenerationInBackend(jobId: string, jobQueue: any, comfyuiClient: any, logger: Logger, foundryClient: any): Promise<void> {
  try {
    const job = await jobQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    logger.info('Starting background map generation processing', { jobId, params: job.params });

    // Mark job as started (mapgen style)
    await jobQueue.markJobStarted(jobId);

    // Emit progress to Foundry module
    foundryClient.sendMessage({
      type: 'map-generation-progress',
      jobId: jobId,
      progress: 10,
      stage: 'Starting processing...'
    });

    // Ensure ComfyUI is running
    const healthInfo = await comfyuiClient.checkHealth();
    if (!healthInfo.available) {
      await comfyuiClient.startService();
    }

    await jobQueue.updateJobProgress(jobId, 25, 'Submitting to ComfyUI...');
    foundryClient.sendMessage({
      type: 'map-generation-progress',
      jobId: jobId,
      progress: 25,
      stage: 'Submitting to ComfyUI...'
    });

    // Submit to ComfyUI (using mapgen's client)
    const sizePixels = comfyuiClient.getSizePixels(job.params.size as any);
    const comfyuiJob = await comfyuiClient.submitJob({
      prompt: job.params.prompt,
      width: sizePixels,
      height: sizePixels
    });

    // Wait for completion (mapgen style)
    await jobQueue.updateJobProgress(jobId, 50, 'Generating battlemap...');
    foundryClient.sendMessage({
      type: 'map-generation-progress',
      jobId: jobId,
      progress: 50,
      stage: 'Generating battlemap...'
    });

    let status = await comfyuiClient.getJobStatus(comfyuiJob.prompt_id);

    while (status === 'queued' || status === 'running') {
      await new Promise(resolve => setTimeout(resolve, 5000));
      status = await comfyuiClient.getJobStatus(comfyuiJob.prompt_id);

      if (status === 'running') {
        await jobQueue.updateJobProgress(jobId, 70, 'AI generating battlemap...');
        foundryClient.sendMessage({
          type: 'map-generation-progress',
          jobId: jobId,
          progress: 70,
          stage: 'AI generating battlemap...'
        });
      }
    }

    if (status === 'failed') {
      throw new Error('ComfyUI generation failed');
    }

    // Download and save the generated image (like mapgen does)
    await jobQueue.updateJobProgress(jobId, 85, 'Downloading image...');

    // Get the generated image filenames from ComfyUI history
    const imageFilenames = await comfyuiClient.getJobImages(comfyuiJob.prompt_id);
    if (!imageFilenames || imageFilenames.length === 0) {
      throw new Error('No images found in ComfyUI job output');
    }

    // Download the first generated image
    const firstImageFilename = imageFilenames[0];
    const imageBuffer = await comfyuiClient.downloadImage(firstImageFilename);
    if (!imageBuffer) {
      throw new Error(`Failed to download generated image: ${firstImageFilename}`);
    }

    await jobQueue.updateJobProgress(jobId, 90, 'Saving image...');

    // Save image to Foundry-accessible location (like mapgen does)
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    const os = await import('os');

    const timestamp = Date.now();
    const filename = `map_${jobId}_${timestamp}.png`;

    // Save to Foundry's data directory (like working mapgen system)
    const foundryDataDir = path.join(os.homedir(), 'AppData', 'Local', 'FoundryVTT', 'Data', 'modules', 'foundry-mcp-bridge', 'generated-maps');
    const imagePath = path.join(foundryDataDir, filename);
    const webPath = `modules/foundry-mcp-bridge/generated-maps/${filename}`;

    // Ensure directory exists
    await fs.mkdir(foundryDataDir, { recursive: true });

    // Save the image
    await fs.writeFile(imagePath, imageBuffer);

    await jobQueue.updateJobProgress(jobId, 95, 'Creating scene data...');

    // Create scene data payload (simplified version of mapgen's FoundryIntegrator)
    const sceneSize = comfyuiClient.getSizePixels(job.params.size as any);
    // Debug: Log what we received
    logger.info('Job params received', {
      scene_name: job.params.scene_name,
      prompt: job.params.prompt,
      all_params: job.params
    });

    if (!job.params.scene_name) {
      throw new Error(`Scene name missing from job params. Received params: ${JSON.stringify(job.params)}`);
    }

    const sceneName = job.params.scene_name.trim();
    logger.info('Using scene name', { scene_name: sceneName });
    const sceneData = {
      name: sceneName,
      img: webPath,
      background: { src: webPath }, // Foundry v13 compatibility
      width: sceneSize,
      height: sceneSize,
      padding: 0.25,
      initial: {
        x: sceneSize / 2,
        y: sceneSize / 2,
        scale: 1
      },
      backgroundColor: "#999999",
      grid: {
        type: 1, // CONST.GRID_TYPES.SQUARE
        size: job.params.grid_size || 100,
        color: "#000000",
        alpha: 0.2,
        distance: 5,
        units: "ft"
      },
      tokenVision: true,
      fogExploration: true,
      fogReset: Date.now(),
      globalLight: false,
      darkness: 0,
      navigation: true,
      active: false,
      permission: {
        default: 2 // CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
      },
      walls: [] // Could add wall detection here later
    };

    // Mark job as complete with full result data
    await jobQueue.updateJobProgress(jobId, 100, 'Complete');
    await jobQueue.markJobComplete(jobId, {
      generation_time_ms: Date.now() - (job.started_at || job.created_at),
      image_url: webPath,
      foundry_scene_payload: sceneData
    });

    // Broadcast completion with scene data (like mapgen does)
    foundryClient.broadcastMessage({
      type: 'job-completed', // Use mapgen's message type
      jobId: jobId,
      data: {
        status: 'completed',
        result: sceneData, // Complete scene payload
        image_path: webPath,
        prompt: job.params.prompt
      }
    });

    logger.info('Map generation completed successfully', { jobId });

  } catch (error: any) {
    logger.error('Background map generation processing failed', { jobId, error });
    await jobQueue.markJobFailed(jobId, error.message);

    // Emit failure to Foundry module
    foundryClient.sendMessage({
      type: 'map-generation-failed',
      jobId: jobId,
      error: error.message
    });
  }
}

async function startBackend(): Promise<void> {

  // Logger: file output allowed; avoid stdout noise

  const logger = new Logger({

    level: config.logLevel,

    format: config.logFormat,

    enableConsole: false,

    enableFile: true,

    filePath: path.join(os.tmpdir(), 'foundry-mcp-server', 'mcp-server.log'),

  });

  logger.info('Starting Foundry MCP Backend', {

    version: config.server.version,

    foundryHost: config.foundry.host,

    foundryPort: config.foundry.port,

  });

  // Initialize Foundry client and tools

  const foundryClient = new FoundryClient(config.foundry, logger);

  const characterTools = new CharacterTools({ foundryClient, logger });

  const careerAdvancementTools = new CareerAdvancementTools({ foundryClient, logger });

  const corruptionMutationTools = new CorruptionMutationTools({ foundryClient, logger });

  const fortuneFateTools = new FortuneFateTools({ foundryClient, logger });

  const criticalWoundsTools = new CriticalWoundsTools({ foundryClient, logger });

  const advantageTools = new AdvantageTools({ foundryClient, logger });

  const diseaseInfectionTools = new DiseaseInfectionTools(foundryClient, logger);

  const inventoryManagementTools = new InventoryManagementTools(foundryClient, logger);

  const itemCreatorTools = new ItemCreatorTools({ foundryClient, logger });

  const prayerBlessingTools = new PrayerBlessingTools(foundryClient, logger);

  const spellMagicTools = new SpellMagicTools(foundryClient, logger);

  const socialStatusTools = new SocialStatusTools(foundryClient, logger);

  const customNPCGeneratorTools = new CustomNPCGeneratorTools(foundryClient, logger);

  const compendiumTools = new CompendiumTools({ foundryClient, logger });

  const sceneTools = new SceneTools({ foundryClient, logger });

  const actorCreationTools = new ActorCreationTools({ foundryClient, logger });

  const questCreationTools = new QuestCreationTools({ foundryClient, logger });

  const diceRollTools = new DiceRollTools({ foundryClient, logger });

  const campaignManagementTools = new CampaignManagementTools(foundryClient, logger);

  const ownershipTools = new OwnershipTools({ foundryClient, logger });

  const rollTableTools = new RollTableTools(foundryClient, logger);

  // Initialize mapgen-style backend components for map generation
  let mapGenerationJobQueue: any = null;
  let mapGenerationComfyUIClient: any = null;

  try {
    // Import and initialize job queue and ComfyUI client
    const { JobQueue } = await import('./job-queue.js');
    const { ComfyUIClient } = await import('./comfyui-client.js');

    mapGenerationJobQueue = new JobQueue({ logger });
    mapGenerationComfyUIClient = new ComfyUIClient({ logger });

    logger.info('Map generation backend components initialized');
  } catch (error) {
    logger.warn('Failed to initialize map generation components', { error });
  }

  // Set up global ComfyUI message handlers for WebSocket messages from Foundry BEFORE creating map tools

  (globalThis as any).backendComfyUIHandlers = {

    handleMessage: async (message: any) => {

      logger.info('Handling ComfyUI message', {

        requestId: message.requestId,

        type: message.type,

        hasData: !!message.data

      });

      try {

        let result: any;

        switch (message.type) {

          case 'start-comfyui-service':

            result = await startComfyUIService(logger);

            break;

          case 'stop-comfyui-service':

            result = await stopComfyUIService(logger);

            break;

          case 'check-comfyui-status':

            result = await checkComfyUIStatus();

            break;

          // Map generation handlers (following existing tool pattern)
          case 'generate-map-request':

            result = await handleGenerateMapRequest(message, mapGenerationJobQueue, mapGenerationComfyUIClient, logger, foundryClient);

            break;

          case 'check-map-status-request':

            result = await handleCheckMapStatusRequest(message.data, mapGenerationJobQueue, logger);

            break;

          case 'cancel-map-job-request':

            result = await handleCancelMapJobRequest(message.data, mapGenerationJobQueue, logger);

            break;

          default:

            logger.warn('Unknown ComfyUI message type', { type: message.type });

            result = { status: 'error', message: `Unknown message type: ${message.type}` };

        }

        // Send response back through foundryClient if requestId is provided

        if (message.requestId && foundryClient) {

          const response = {

            type: `${message.type}-response`,

            requestId: message.requestId,

            ...result

          };

          // Send response to Foundry via WebSocket

          try {

            foundryClient.sendMessage(response);

          } catch (error) {

            logger.error('Failed to send ComfyUI response to Foundry', { error, response });

          }

        }

        return result;

      } catch (error: any) {

        logger.error('ComfyUI message handling failed', {

          requestId: message.requestId,

          type: message.type,

          error: error.message

        });

        const errorResult = {

          status: 'error',

          message: error.message

        };

        // Send error response if requestId provided

        if (message.requestId && foundryClient) {

          try {

            foundryClient.sendMessage({

              type: `${message.type}-response`,

              requestId: message.requestId,

              ...errorResult

            });

          } catch (sendError) {

            logger.error('Failed to send ComfyUI error response', { sendError });

          }

        }

        return errorResult;

      }

    }

  };

  // Now create MapGenerationTools with the handlers available

  const mapGenerationTools = new MapGenerationTools({
    foundryClient,
    logger,
    backendComfyUIHandlers: (globalThis as any).backendComfyUIHandlers
  });

  const allTools = [

    ...characterTools.getToolDefinitions(),

    ...careerAdvancementTools.getToolDefinitions(),

    ...corruptionMutationTools.getToolDefinitions(),

    ...fortuneFateTools.getToolDefinitions(),

    ...criticalWoundsTools.getToolDefinitions(),

    ...advantageTools.getToolDefinitions(),

    ...diseaseInfectionTools.getToolDefinitions(),

    ...inventoryManagementTools.getToolDefinitions(),

    ...itemCreatorTools.getToolDefinitions(),

    ...prayerBlessingTools.getToolDefinitions(),

    ...spellMagicTools.getToolDefinitions(),

    ...socialStatusTools.getToolDefinitions(),

    ...customNPCGeneratorTools.getToolDefinitions(),

    ...compendiumTools.getToolDefinitions(),

    ...sceneTools.getToolDefinitions(),

    ...actorCreationTools.getToolDefinitions(),

    ...questCreationTools.getToolDefinitions(),

    ...diceRollTools.getToolDefinitions(),

    ...campaignManagementTools.getToolDefinitions(),

    ...ownershipTools.getToolDefinitions(),

    ...mapGenerationTools.getToolDefinitions(),

    ...rollTableTools.getToolDefinitions(),

  ];

  // Start Foundry connector (owns app port 31415)

  foundryClient.connect().catch((e) => {

    logger.error('Foundry connector failed to start', e);

  });

  const autoStartComfyUI = async () => {

    try {

      logger.info('Auto-starting ComfyUI service...');

      const result = await startComfyUIService(logger);

      logger.info('ComfyUI auto-start result', result);

    } catch (error: any) {

      logger.warn('ComfyUI auto-start failed', {

        error: error instanceof Error ? error.message : String(error)

      });

      // Don't throw - backend should continue even if ComfyUI fails to start

    }

  };

  // Control channel (TCP JSON-lines)

  const server = net.createServer((socket) => {

    socket.setEncoding('utf8');

    let buffer = '';

    socket.on('data', async (chunk: string) => {

      buffer += chunk;

      let idx: number;

      while ((idx = buffer.indexOf('\n')) >= 0) {

        const line = buffer.slice(0, idx).trim();

        buffer = buffer.slice(idx + 1);

        if (!line) continue;

        try {

          const msg = JSON.parse(line) as { id: string; method: string; params?: any };

          if (msg.method === 'ping') {

            socket.write(JSON.stringify({ id: msg.id, result: { ok: true } }) + '\n');

            continue;

          }

          if (msg.method === 'list_tools') {

            socket.write(JSON.stringify({ id: msg.id, result: { tools: allTools } }) + '\n');

            continue;

          }

          if (msg.method === 'call_tool') {

            const { name, args } = (msg.params || {}) as { name: string; args?: any };

            try {

              let result: any;

              switch (name) {

                // Character tools

                case 'get-character':

                  result = await characterTools.handleGetCharacter(args);

                  break;

                case 'list-characters':

                  result = await characterTools.handleListCharacters(args);

                  break;

                // Career advancement tools

                case 'get-career-advancement':

                  result = await careerAdvancementTools.handleGetCareerAdvancement(args);

                  break;

                case 'advance-characteristic':

                  result = await careerAdvancementTools.handleAdvanceCharacteristic(args);

                  break;

                case 'advance-skill':

                  result = await careerAdvancementTools.handleAdvanceSkill(args);

                  break;

                case 'advance-talent':

                  result = await careerAdvancementTools.handleAdvanceTalent(args);

                  break;

                // Corruption & Mutation tools

                case 'get-corruption-status':

                  result = await corruptionMutationTools.handleGetCorruptionStatus(args);

                  break;

                case 'add-corruption':

                  result = await corruptionMutationTools.handleAddCorruption(args);

                  break;

                case 'remove-corruption':

                  result = await corruptionMutationTools.handleRemoveCorruption(args);

                  break;

                case 'list-mutations':

                  result = await corruptionMutationTools.handleListMutations(args);

                  break;

                case 'add-mutation':

                  result = await corruptionMutationTools.handleAddMutation(args);

                  break;

                case 'remove-mutation':

                  result = await corruptionMutationTools.handleRemoveMutation(args);

                  break;

                // Fortune & Fate tools

                case 'get-fortune-fate-status':

                  result = await fortuneFateTools.handleGetFortuneFateStatus(args);

                  break;

                case 'spend-fortune':

                  result = await fortuneFateTools.handleSpendFortune(args);

                  break;

                case 'burn-fate':

                  result = await fortuneFateTools.handleBurnFate(args);

                  break;

                case 'refresh-fortune':

                  result = await fortuneFateTools.handleRefreshFortune(args);

                  break;

                // Critical Wounds tools

                case 'get-critical-wounds':

                  result = await criticalWoundsTools.handleGetCriticalWounds(args);

                  break;

                case 'add-critical-wound':

                  result = await criticalWoundsTools.handleAddCriticalWound(args);

                  break;

                case 'remove-critical-wound':

                  result = await criticalWoundsTools.handleRemoveCriticalWound(args);

                  break;

                case 'check-death-from-criticals':

                  result = await criticalWoundsTools.handleCheckDeathFromCriticals(args);

                  break;

                // Advantage tools

                case 'get-advantage':

                  result = await advantageTools.handleGetAdvantage(args);

                  break;

                case 'add-advantage':

                  result = await advantageTools.handleAddAdvantage(args);

                  break;

                case 'remove-advantage':

                  result = await advantageTools.handleRemoveAdvantage(args);

                  break;

                case 'calculate-advantage-bonus':

                  result = await advantageTools.handleCalculateAdvantageBonus(args);

                  break;

                // Disease & Infection tools

                case 'get-diseases':

                  result = await diseaseInfectionTools.handleGetDiseases(args);

                  break;

                case 'add-disease':

                  result = await diseaseInfectionTools.handleAddDisease(args);

                  break;

                case 'check-infection-resilience':

                  result = await diseaseInfectionTools.handleCheckInfectionResilience(args);

                  break;

                case 'remove-disease':

                  result = await diseaseInfectionTools.handleRemoveDisease(args);

                  break;

                // Inventory Management tools

                case 'get-inventory-status':

                  result = await inventoryManagementTools.handleGetInventoryStatus(args);

                  break;

                case 'track-ammunition':

                  result = await inventoryManagementTools.handleTrackAmmunition(args);

                  break;

                case 'check-encumbrance':

                  result = await inventoryManagementTools.handleCheckEncumbrance(args);

                  break;

                case 'add-inventory-item':

                  result = await inventoryManagementTools.handleAddInventoryItem(args);

                  break;

                case 'remove-inventory-item':

                  result = await inventoryManagementTools.handleRemoveInventoryItem(args);

                  break;

                // Item Creator tools

                case 'create-weapon':

                  result = await itemCreatorTools.handleCreateWeapon(args);

                  break;

                case 'create-armour':

                  result = await itemCreatorTools.handleCreateArmour(args);

                  break;

                case 'create-trapping':

                  result = await itemCreatorTools.handleCreateTrapping(args);

                  break;

                case 'create-ammunition':

                  result = await itemCreatorTools.handleCreateAmmunition(args);

                  break;

                case 'create-container':

                  result = await itemCreatorTools.handleCreateContainer(args);

                  break;

                case 'modify-item-qualities':

                  result = await itemCreatorTools.handleModifyItemQualities(args);

                  break;

                case 'add-item-to-character':

                  result = await itemCreatorTools.handleAddItemToCharacter(args);

                  break;

                case 'remove-item-from-character':

                  result = await itemCreatorTools.handleRemoveItemFromCharacter(args);

                  break;

                // Prayer & Blessing tools

                case 'get-active-blessings':

                  result = await prayerBlessingTools.handleGetActiveBlessings(args);

                  break;

                case 'invoke-prayer':

                  result = await prayerBlessingTools.handleInvokePrayer(args);

                  break;

                case 'check-divine-favor':

                  result = await prayerBlessingTools.handleCheckDivineFavor(args);

                  break;

                case 'add-sin-point':

                  result = await prayerBlessingTools.handleAddSinPoint(args);

                  break;

                case 'perform-penance':

                  result = await prayerBlessingTools.handlePerformPenance(args);

                  break;

                case 'end-blessing':

                  result = await prayerBlessingTools.handleEndBlessing(args);

                  break;

                // Spell & Magic tools

                case 'get-known-spells':

                  result = await spellMagicTools.handleGetKnownSpells(args);

                  break;

                case 'cast-spell':

                  result = await spellMagicTools.handleCastSpell(args);

                  break;

                case 'channel-power':

                  result = await spellMagicTools.handleChannelPower(args);

                  break;

                case 'check-miscast':

                  result = await spellMagicTools.handleCheckMiscast(args);

                  break;

                case 'memorize-spell':

                  result = await spellMagicTools.handleMemorizeSpell(args);

                  break;

                case 'learn-new-spell':

                  result = await spellMagicTools.handleLearnNewSpell(args);

                  break;

                // Social Status Tools
                case 'get-social-status':

                  result = await socialStatusTools.handleGetSocialStatus(args);

                  break;

                case 'change-social-status':

                  result = await socialStatusTools.handleChangeSocialStatus(args);

                  break;

                case 'make-social-test':

                  result = await socialStatusTools.handleMakeSocialTest(args);

                  break;

                case 'calculate-income':

                  result = await socialStatusTools.handleCalculateIncome(args);

                  break;

                case 'check-reputation':

                  result = await socialStatusTools.handleCheckReputation(args);

                  break;

                // Custom NPC Generator tools
                case 'create-custom-npc':

                  result = await customNPCGeneratorTools.handleCreateCustomNPC(args);

                  break;

                case 'list-npc-archetypes':

                  result = await customNPCGeneratorTools.handleListNPCArchetypes(args);

                  break;

                case 'calculate-npc-xp-distribution':

                  result = await customNPCGeneratorTools.handleCalculateXPDistribution(args);

                  break;

                // Compendium tools

                case 'search-compendium':

                  result = await compendiumTools.handleSearchCompendium(args);

                  break;

                case 'get-compendium-item':

                  result = await compendiumTools.handleGetCompendiumItem(args);

                  break;

                case 'list-creatures-by-criteria':

                  result = await compendiumTools.handleListCreaturesByCriteria(args);

                  break;

                case 'list-compendium-packs':

                  result = await compendiumTools.handleListCompendiumPacks(args);

                  break;

                // Scene tools

                case 'get-current-scene':

                  result = await sceneTools.handleGetCurrentScene(args);

                  break;

                case 'get-world-info':

                  result = await sceneTools.handleGetWorldInfo(args);

                  break;

                // Actor creation tools

                case 'create-actor-from-compendium':

                  result = await actorCreationTools.handleCreateActorFromCompendium(args);

                  break;

                case 'get-compendium-entry-full':

                  result = await actorCreationTools.handleGetCompendiumEntryFull(args);

                  break;

                // Quest creation tools

                case 'create-quest-journal':

                  result = await questCreationTools.handleCreateQuestJournal(args);

                  break;

                case 'link-quest-to-npc':

                  result = await questCreationTools.handleLinkQuestToNPC(args);

                  break;

                case 'update-quest-journal':

                  result = await questCreationTools.handleUpdateQuestJournal(args);

                  break;

                case 'list-journals':

                  result = await questCreationTools.handleListJournals(args);

                  break;

                case 'search-journals':

                  result = await questCreationTools.handleSearchJournals(args);

                  break;

                // Dice roll tools

                case 'request-player-rolls':

                  result = await diceRollTools.handleRequestPlayerRolls(args);

                  break;

                // Campaign management tools

                case 'create-campaign-dashboard':

                  result = await campaignManagementTools.handleCreateCampaignDashboard(args);

                  break;

                // Ownership tools

                case 'assign-actor-ownership':

                  result = await ownershipTools.handleToolCall('assign-actor-ownership', args);

                  break;

                case 'remove-actor-ownership':

                  result = await ownershipTools.handleToolCall('remove-actor-ownership', args);

                  break;

                case 'list-actor-ownership':

                  result = await ownershipTools.handleToolCall('list-actor-ownership', args);

                  break;

                // Map generation tools

                case 'generate-map':

                  result = await mapGenerationTools.generateMap(args);

                  break;

                case 'check-map-status':

                  result = await mapGenerationTools.checkMapStatus(args);

                  break;

                case 'cancel-map-job':

                  result = await mapGenerationTools.cancelMapJob(args);

                  break;

                case 'list-scenes':

                  result = await mapGenerationTools.listScenes(args);

                  break;

                case 'switch-scene':

                  result = await mapGenerationTools.switchScene(args);

                  break;

                // RollTable tools

                case 'create-rolltable':

                  result = await rollTableTools.handleCreateRollTable(args);

                  break;

                case 'list-rolltables':

                  result = await rollTableTools.handleListRollTables(args);

                  break;

                case 'get-rolltable':

                  result = await rollTableTools.handleGetRollTable(args);

                  break;

                case 'roll-on-table':

                  result = await rollTableTools.handleRollOnTable(args);

                  break;

                case 'delete-rolltable':

                  result = await rollTableTools.handleDeleteRollTable(args);

                  break;

                default:

                  throw new Error(`Unknown tool: ${name}`);

              }

              const payload = {

                content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result) }],

              };

              socket.write(JSON.stringify({ id: msg.id, result: payload }) + '\n');

            } catch (e: any) {

              const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';

              socket.write(

                JSON.stringify({ id: msg.id, result: { content: [{ type: 'text', text: `Error: ${errorMessage}` }], isError: true } }) + '\n'

              );

            }

            continue;

          }

          // Unknown method

          socket.write(JSON.stringify({ id: msg.id, error: { message: 'Unknown method' } }) + '\n');

        } catch (e: any) {

          try { socket.write(JSON.stringify({ error: { message: e?.message || 'Bad request' } }) + '\n'); } catch { }

        }

      }

    });

  });

  await new Promise<void>((resolve, reject) => {

    server.listen(CONTROL_PORT, CONTROL_HOST, () => {

      logger.info(`Backend control channel listening on ${CONTROL_HOST}:${CONTROL_PORT}`);

      resolve();

    });

    server.on('error', reject);

  });

  void autoStartComfyUI();

  // Shutdown hooks

  process.on('SIGINT', () => { foundryClient.disconnect(); releaseLock(); process.exit(0); });

  process.on('SIGTERM', () => { foundryClient.disconnect(); releaseLock(); process.exit(0); });

}

(async function main() {

  if (!acquireLock()) process.exit(0);

  process.on('exit', releaseLock);

  try {

    await startBackend();

  } catch (e: any) {

    console.error('Failed to start backend:', e?.message || e);

    releaseLock();

    process.exit(1);

  }

})();
