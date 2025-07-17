import { fabric } from "fabric";

// Command interface
export interface Command {
  execute(): void;
  undo(): void;
  getDescription(): string;
}

// Command history manager
export class CommandHistory {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  execute(command: Command): void {
    // Remove any commands after current index (when undoing then executing new command)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new command
    this.history.push(command);
    this.currentIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
    
    // Execute the command
    command.execute();
  }

  undo(): boolean {
    if (!this.canUndo()) return false;
    
    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;
    return true;
  }

  redo(): boolean {
    if (!this.canRedo()) return false;
    
    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.execute();
    return true;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getHistory(): string[] {
    return this.history.map(cmd => cmd.getDescription());
  }
}

// Concrete Commands
export class AddObjectCommand implements Command {
  constructor(
    private canvas: fabric.Canvas,
    private object: fabric.Object
  ) {}

  execute(): void {
    this.canvas.add(this.object);
    this.canvas.renderAll();
  }

  undo(): void {
    this.canvas.remove(this.object);
    this.canvas.renderAll();
  }

  getDescription(): string {
    return `Add ${this.object.type || 'object'}`;
  }
}

export class RemoveObjectCommand implements Command {
  constructor(
    private canvas: fabric.Canvas,
    private object: fabric.Object
  ) {}

  execute(): void {
    this.canvas.remove(this.object);
    this.canvas.renderAll();
  }

  undo(): void {
    this.canvas.add(this.object);
    this.canvas.renderAll();
  }

  getDescription(): string {
    return `Remove ${this.object.type || 'object'}`;
  }
}

export class MoveObjectCommand implements Command {
  constructor(
    private object: fabric.Object,
    private oldPosition: { left: number; top: number },
    private newPosition: { left: number; top: number }
  ) {}

  execute(): void {
    this.object.set({
      left: this.newPosition.left,
      top: this.newPosition.top
    });
    this.object.canvas?.renderAll();
  }

  undo(): void {
    this.object.set({
      left: this.oldPosition.left,
      top: this.oldPosition.top
    });
    this.object.canvas?.renderAll();
  }

  getDescription(): string {
    return `Move ${this.object.type || 'object'}`;
  }
}

export class ModifyObjectCommand implements Command {
  constructor(
    private object: fabric.Object,
    private oldProperties: Partial<fabric.Object>,
    private newProperties: Partial<fabric.Object>
  ) {}

  execute(): void {
    this.object.set(this.newProperties);
    this.object.canvas?.renderAll();
  }

  undo(): void {
    this.object.set(this.oldProperties);
    this.object.canvas?.renderAll();
  }

  getDescription(): string {
    return `Modify ${this.object.type || 'object'}`;
  }
}

export class RemoveMultipleObjectsCommand implements Command {
  constructor(
    private canvas: fabric.Canvas,
    private objects: fabric.Object[]
  ) {}

  execute(): void {
    this.objects.forEach(obj => this.canvas.remove(obj));
    this.canvas.renderAll();
  }

  undo(): void {
    this.objects.forEach(obj => this.canvas.add(obj));
    this.canvas.renderAll();
  }

  getDescription(): string {
    return `Remove ${this.objects.length} objects`;
  }
}

export class SetBackgroundCommand implements Command {
  constructor(
    private canvas: fabric.Canvas,
    private oldBackground: string | undefined,
    private newBackground: string
  ) {}

  execute(): void {
    this.canvas.setBackgroundImage(
      this.newBackground,
      this.canvas.renderAll.bind(this.canvas)
    );
  }

  undo(): void {
    if (this.oldBackground) {
      this.canvas.setBackgroundImage(
        this.oldBackground,
        this.canvas.renderAll.bind(this.canvas)
      );
    } else {
      this.canvas.setBackgroundImage(
        '',
        this.canvas.renderAll.bind(this.canvas)
      );
    }
  }

  getDescription(): string {
    return 'Change background';
  }
}