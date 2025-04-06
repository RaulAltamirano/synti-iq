/**
 * Interface para el patrón Command
 * Permite ejecutar y deshacer operaciones
 */
export interface ScheduleCommand {
  execute(): Promise<void>;
  undo(): Promise<void>;
  getResult?(): any;
}
