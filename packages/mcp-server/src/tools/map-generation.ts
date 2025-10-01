import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';

export interface MapGenerationToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
  backendComfyUIHandlers?: any; // Access to backend ComfyUI service
}

interface JobData {
  id: string;
  status: 'queued' | 'generating' | 'processing' | 'complete' | 'failed' | 'expired';
  created_at: number;
  started_at?: number;
  completed_at?: number;
  progress_percent: number;
  current_stage: string;
  result?: any;
  error?: string;
  attempts: number;
  max_attempts: number;
  params: {
    prompt: string;
    scene_name: string;
    size: string;
    grid_size: number;
  };
}

export class MapGenerationTools {
  private foundryClient: FoundryClient;
  private logger: Logger;
  private backendComfyUIHandlers: any;
  private jobs = new Map<string, JobData>(); // Simple in-memory job storage
  private jobStartTimes = new Map<string, number>();
  private lastStatusCheck = new Map<string, number>();
  private jobIdCounter = 0;

  constructor(options: MapGenerationToolsOptions) {
    this.foundryClient = options.foundryClient;
    this.logger = options.logger.child({ component: 'MapGenerationTools' });
    this.backendComfyUIHandlers = options.backendComfyUIHandlers;
  }

  getToolDefinitions(): Tool[] {
    return [
      {
        name: 'generate-map',
        description: 'Start AI map generation using fantasy battlemap style (async). Supports maps for D&D, WFRP, and other fantasy RPG systems. Examples: "Altdorf market square with merchant stalls" (WFRP), "Reikwald forest clearing with ancient standing stones" (WFRP), "Tavern interior with fireplace" (Universal), "Underground sewer tunnels" (Universal).',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Map description (will be enhanced with "2d fantasy battlemap" trigger and top-down perspective). For WFRP: consider Old World architecture, grim & perilous atmosphere. For D&D: classic fantasy dungeons, taverns, wilderness.'
            },
            scene_name: {
              type: 'string',
              description: 'Short, creative name for the Foundry scene. WFRP examples: "Altdorf Market", "The Reikwald", "Ubersreik Gate", "Temple of Sigmar". D&D examples: "Harbor District", "Moonlit Tavern", "Crystal Caverns". Be creative and evocative!'
            },
            size: {
              type: 'string',
              enum: ['small', 'medium', 'large'],
              default: 'medium',
              description: 'Map size (small=1024px, medium=1536px, large=2048px)'
            },
            grid_size: {
              type: 'number',
              default: 70,
              description: 'Pixels per grid square for Foundry scene setup. Recommended: 70 pixels for both D&D (5ft squares) and WFRP (2 yard squares)'
            }
          },
          required: ['prompt', 'scene_name']
        }
      },
      {
        name: 'check-map-status',
        description: 'Check status of map generation job (WAIT 25-40 seconds after starting before first check)',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: 'Job ID to check status for'
            }
          },
          required: ['job_id']
        }
      },
      {
        name: 'cancel-map-job',
        description: 'Cancel a running map generation job',
        inputSchema: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: 'Job ID to cancel'
            }
          },
          required: ['job_id']
        }
      },
      {
        name: 'list-scenes',
        description: 'List all available Foundry VTT scenes with their details',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              description: 'Optional filter to search scene names (case-insensitive)',
              default: ''
            },
            include_active_only: {
              type: 'boolean',
              description: 'Only return the currently active scene',
              default: false
            }
          }
        }
      },
      {
        name: 'switch-scene',
        description: 'Switch to a different Foundry VTT scene by name or ID',
        inputSchema: {
          type: 'object',
          properties: {
            scene_identifier: {
              type: 'string',
              description: 'Scene name or ID to switch to'
            },
            optimize_view: {
              type: 'boolean',
              description: 'Automatically optimize the view for the scene',
              default: true
            }
          },
          required: ['scene_identifier']
        }
      }
    ];
  }

  async listScenes(input: any): Promise<any> {
    const safeInput = input ?? {};
    try {
      const params = {
        filter: typeof safeInput.filter === 'string' ? safeInput.filter : undefined,
        include_active_only: Boolean(safeInput.include_active_only),
      };
      return await this.foundryClient.query('foundry-mcp-bridge.list-scenes', params);
    } catch (error: any) {
      this.logger.error('List scenes failed', { error, input: safeInput });
      return { success: false, error: error?.message ?? 'Unknown error' };
    }
  }

  async switchScene(input: any): Promise<any> {
    const safeInput = input ?? {};
    try {
      const sceneIdentifier = typeof safeInput.scene_identifier === 'string' ? safeInput.scene_identifier : safeInput.sceneId;
      if (!sceneIdentifier || typeof sceneIdentifier !== 'string' || !sceneIdentifier.trim()) {
        return { success: false, error: 'scene_identifier is required' };
      }

      const params = {
        scene_identifier: sceneIdentifier,
        optimize_view: safeInput.optimize_view !== false,
      };

      return await this.foundryClient.query('foundry-mcp-bridge.switch-scene', params);
    } catch (error: any) {
      this.logger.error('Switch scene failed', { error, input: safeInput });
      return { success: false, error: error?.message ?? 'Unknown error' };
    }
  }

  async generateMap(input: any): Promise<any> {
    const safeInput = input ?? {};
    try {
      this.logger.info('Map generation requested via MCP', { input: safeInput });

      const prompt = typeof safeInput.prompt === 'string' ? safeInput.prompt.trim() : '';
      if (!prompt) {
        return 'Error: Prompt is required and must be a string.';
      }

      const sceneName = typeof safeInput.scene_name === 'string' ? safeInput.scene_name.trim() : '';
      if (!sceneName) {
        return 'Error: Scene name is required and must be a string.';
      }

      const size = typeof safeInput.size === 'string' ? safeInput.size : 'medium';
      const gridSizeRaw = typeof safeInput.grid_size === 'number' ? safeInput.grid_size : Number(safeInput.grid_size);
      const gridSize = Number.isFinite(gridSizeRaw) ? gridSizeRaw : 70;

      const params = {
        prompt,
        scene_name: sceneName,
        size,
        grid_size: gridSize,
      } as const;

      const response = await this.foundryClient.query('foundry-mcp-bridge.generate-map', params);
      if (response?.error) {
        throw new Error(response.error);
      }

      const jobId = response?.jobId ?? 'unknown';
      const estimatedTime = response?.estimatedTime ?? '30-90 seconds';
      const lines = [
        `Map generation started. Job ID: ${jobId}`,
        '',
        `Prompt: ${params.prompt}`,
        `Size: ${params.size} (${this.getSizePixels(params.size)})`,
        `Grid size: ${params.grid_size}px`,
        '',
        `Estimated time: ${estimatedTime}`,
        'Wait at least 25 seconds before calling check-map-status.',
        `Use job_id "${jobId}" when checking status.`,
      ];

      return lines.join('\n');
    } catch (error: any) {
      this.logger.error('Map generation failed', { error, input: safeInput });
      return `Error: ${error?.message ?? 'Unknown error'}`;
    }
  }

  async checkMapStatus(input: any): Promise<any> {
    const safeInput = input ?? {};
    try {
      const jobIdCandidate = typeof safeInput.job_id === 'string' ? safeInput.job_id : safeInput.jobId;
      const jobId = typeof jobIdCandidate === 'string' ? jobIdCandidate.trim() : '';
      if (!jobId) {
        return 'Error: job_id is required.';
      }

      this.logger.info('Map status check requested via MCP', { jobId, input: safeInput });

      const response = await this.foundryClient.query('foundry-mcp-bridge.check-map-status', { job_id: jobId });
      if (response?.error) {
        const message = response?.message ?? response?.error ?? 'Failed to check job status';
        return `Error: ${message}`;
      }

      const job = response?.job;
      if (!job) {
        return `Job ${jobId} not found. It may have expired or been cleaned up.`;
      }

      switch (job.status) {
        case 'queued':
          return `Job ${jobId} is queued. Status: ${job.current_stage ?? 'Pending'}.`;
        case 'generating':
        case 'processing':
          return `Job ${jobId} in progress. Stage: ${job.current_stage ?? 'Processing'}. Progress: ${job.progress_percent ?? 0}%`;
        case 'complete': {
          const duration = job.result?.generation_time_ms;
          const durationText = typeof duration === 'number' ? ` Generation time: ${Math.round(duration / 1000)}s.` : '';
          return `Job ${jobId} completed successfully.${durationText}`;
        }
        case 'failed':
          return `Job ${jobId} failed. Reason: ${job.error ?? 'Unknown error'}.`;
        case 'expired':
          return `Job ${jobId} has expired.`;
        default:
          return `Job ${jobId} returned status "${job.status}".`;
      }
    } catch (error: any) {
      this.logger.error('Status check failed', { error, input: safeInput });
      return `Error checking status: ${error?.message ?? 'Unknown error'}`;
    }
  }

  async cancelMapJob(input: any): Promise<any> {
    const safeInput = input ?? {};
    try {
      const jobIdCandidate = typeof safeInput.job_id === 'string' ? safeInput.job_id : safeInput.jobId;
      const jobId = typeof jobIdCandidate === 'string' ? jobIdCandidate.trim() : '';
      if (!jobId) {
        return 'Error: job_id is required.';
      }

      this.logger.info('Map job cancellation requested via MCP', { jobId, input: safeInput });

      const response = await this.foundryClient.query('foundry-mcp-bridge.cancel-map-job', { job_id: jobId });
      if (response?.error) {
        const message = response?.message ?? response?.error ?? 'Failed to cancel map job';
        return `Error: ${message}`;
      }

      const status = typeof response?.status === 'string' ? response.status : (response?.success ? 'success' : 'unknown');
      const message = response?.message ?? 'Map generation job cancelled.';
      return `${message} (status: ${status})`;
    } catch (error: any) {
      this.logger.error('Map job cancellation failed', { error, input: safeInput });
      return `Error cancelling job: ${error?.message ?? 'Unknown error'}`;
    }
  }

  private getSizePixels(size: string): string {
    switch (size) {
      case 'small':
        return '1024x1024';
      case 'large':
        return '2048x2048';
      case 'medium':
      default:
        return '1536x1536';
    }
  }

  private generateJobId(): string {
    this.jobIdCounter++;
    const timestamp = Date.now().toString(36);
    const counter = this.jobIdCounter.toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `job_${timestamp}_${counter}_${random}`;
  }

  private async submitComfyUIJob(input: { prompt: string; width: number; height: number }): Promise<any> {
    const workflow = this.buildWorkflow(input);

    try {
      const response = await fetch('http://127.0.0.1:31411/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: workflow,
          client_id: `ai-maps-server-${Date.now()}`
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`ComfyUI API Error: ${response.status}`);
      }

      const data = await response.json();
      this.logger.info('ComfyUI job submitted', { promptId: data.prompt_id });

      return data;
    } catch (error) {
      this.logger.error('Failed to submit job to ComfyUI', { error });
      throw error;
    }
  }

  private async getComfyUIJobStatus(promptId: string): Promise<'queued' | 'running' | 'complete' | 'failed'> {
    try {
      // Check history for completed jobs
      const historyResponse = await fetch(`http://127.0.0.1:31411/history/${promptId}`, {
        signal: AbortSignal.timeout(5000)
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        if (historyData && Object.keys(historyData).length > 0) {
          return 'complete';
        }
      }

      // Check queue for pending/running jobs
      const queueResponse = await fetch(`http://127.0.0.1:31411/queue`, {
        signal: AbortSignal.timeout(5000)
      });

      if (!queueResponse.ok) {
        return 'failed';
      }

      const queueData = await queueResponse.json();

      // Check running queue
      if (queueData.queue_running && queueData.queue_running.some((item: any) => item[1] === promptId)) {
        return 'running';
      }

      // Check pending queue
      if (queueData.queue_pending && queueData.queue_pending.some((item: any) => item[1] === promptId)) {
        return 'queued';
      }

      // Not found in any queue, might have failed or been removed
      return 'failed';
    } catch (error) {
      this.logger.error('Failed to get job status from ComfyUI', { promptId, error });
      return 'failed';
    }
  }

  private buildWorkflow(input: { prompt: string; width: number; height: number }): Record<string, any> {
    // Enhanced prompt for fantasy battlemap generation (works for D&D, WFRP, and other fantasy systems)
    const enhancedPrompt = `2d fantasy battlemap of ${input.prompt}, top-down view, overhead perspective, aerial`;

    // Negative prompt optimized for battlemap generation
    const negativePrompt = 'grid, low angle, isometric, oblique, horizon, text, watermark, logo, caption, people, creatures, monsters, blurry, artifacts';

    return {
      "1": { // CheckpointLoaderWithConfig
        "inputs": {
          "ckpt_name": "dDBattlemapsSDXL10_upscaleV10.safetensors",
          "config_name": "dDBattlemapsSDXL10_upscaleV10.yaml"
        },
        "class_type": "CheckpointLoaderWithConfig"
      },
      "2": { // CLIP Text Encode (Positive)
        "inputs": {
          "text": enhancedPrompt,
          "clip": ["1", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "3": { // CLIP Text Encode (Negative)
        "inputs": {
          "text": negativePrompt,
          "clip": ["1", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "4": { // Empty Latent Image
        "inputs": {
          "width": input.width,
          "height": input.height,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage"
      },
      "5": { // KSampler
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000),
          "steps": 35, // SDXL optimized
          "cfg": 10.0, // Fantasy battlemap model guidelines
          "denoise": 1.0,
          "sampler_name": "dpmpp_2m",
          "scheduler": "karras",
          "model": ["1", 0],
          "positive": ["2", 0],
          "negative": ["3", 0],
          "latent_image": ["4", 0]
        },
        "class_type": "KSampler"
      },
      "9": { // VAE Loader
        "inputs": {
          "vae_name": "sdxl_vae.safetensors"
        },
        "class_type": "VAELoader"
      },
      "6": { // VAE Decode
        "inputs": {
          "samples": ["5", 0],
          "vae": ["9", 0]
        },
        "class_type": "VAEDecode"
      },
      "7": { // Save Image
        "inputs": {
          "filename_prefix": "battlemap",
          "images": ["6", 0]
        },
        "class_type": "SaveImage"
      }
    };
  }

  async shutdown(): Promise<void> {
    this.logger.info('MapGenerationTools shutdown complete');
  }
}


