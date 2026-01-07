export interface ScheduleCommand {
  execute(): Promise<void>;
  undo(): Promise<void>;
  getResult?(): any;
}
