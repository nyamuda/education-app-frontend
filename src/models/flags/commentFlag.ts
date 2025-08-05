import type { User } from "@/user";
import { BaseFlag } from "./baseFlag";
import type { FlagStatus } from "@/enums/flags/flagStatus";
import type { CommentFlagType } from "@/enums/flags/commentFlagType";
import type { Comment } from "../comment";

export class CommentFlag extends BaseFlag {
  public constructor(
    // BaseFlag properties
    id: number,
    content: string | null,
    userId: number,
    user: User | null,
    status: FlagStatus,
    createdAt: Date = new Date(),

    // CommentFlag properties
    public commentId: number,
    public comment: Comment | null,
    public flagType: CommentFlagType,
  ) {
    super(id, content, userId, user, status, createdAt);
  }
}
