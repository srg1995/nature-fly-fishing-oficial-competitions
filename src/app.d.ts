declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: import("$lib/auth-server").JwtPayload | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
