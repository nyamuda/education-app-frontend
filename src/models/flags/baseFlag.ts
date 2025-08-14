import { FlagStatus } from "@/enums/flags/flagStatus";
import type { User } from "@/interfaces/auth/user";

export abstract class BaseFlag {
  public constructor(
    public id: number,

    /**
     * Optional description provided by the user when flagging the content.
     * Only required when the selected flag type is `Other`.
     */
    public content: string | null,

    /**
     * ID of the user who submitted the flag.
     */
    public userId: number,

    public user: User | null,

    /**
     * The current status of the flag (e.g., pending review, resolved).
     */
    public status: FlagStatus = FlagStatus.Pending,

    public createdAt: Date = new Date(),
  ) {}
}
