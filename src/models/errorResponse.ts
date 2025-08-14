export class ErrorResponse {
  public static Unexpected = (): string => "An unexpected error occurred. Please try again later.";

  public static NotFound = (entity: string): string => `${entity} not found. Please try again.`;

  public static Unauthorized = (): string => "You are not authorized to perform this action.";
}
