export type ToolHandler = (args: any) => Promise<any>;

export class ToolRegistry {
  private handlers = new Map<string, ToolHandler>();

  register(name: string, handler: ToolHandler): void {
    if (this.handlers.has(name)) {
      throw new Error(`Duplicate tool registration: ${name}`);
    }
    this.handlers.set(name, handler);
  }

  dispatch(name: string, args: any): Promise<any> | undefined {
    const h = this.handlers.get(name);
    return h ? h(args) : undefined;
  }

  has(name: string): boolean {
    return this.handlers.has(name);
  }
}
