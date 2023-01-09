export abstract class ServiceProvider {
  protected abstract get callHeaders(): Record<string, string>;
}
