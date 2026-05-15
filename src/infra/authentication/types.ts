/**
 * Tipos auxiliares para os requests autenticados.
 * Usados em controllers via `@Req()`.
 */
export interface AuthenticatedCustomerRequest extends Express.Request {
  user: { id: string };
}

export interface AuthenticatedAdminRequest extends Express.Request {
  user: { id: string; role: string };
}
