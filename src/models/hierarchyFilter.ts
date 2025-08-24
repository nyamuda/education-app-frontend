import type { Curriculum } from "./curriculum";
import type { ExamBoard } from "./examBoard";
import type { Level } from "./level";
import type { Subject } from "./subject";
import type { Topic } from "./topic";

/**
 * A filter for selecting items based on their hierarchy:
 * Curriculum → Exam Board → Level → Subject → Topic.
 * Each property can be set to filter items or left as null to include all.
 */
export class HierarchyFilter {
  public constructor(
    public curriculum: Curriculum | null = null,
    public examBoard: ExamBoard | null = null,
    public level: Level | null = null,
    public subject: Subject | null = null,
    public topic: Topic | null = null,
  ) {}

  /** Resets all values in the filter */
  public reset() {
    this.curriculum = null;
    this.examBoard = null;
    this.level = null;
    this.subject = null;
    this.topic = null;
  }

  /**
   * Called when the curriculum changes.
   * Sets the curriculum and resets exam board, level, subject, and topic.
   */
  public onCurriculumChange(curriculum: Curriculum | null) {
    this.curriculum = curriculum;
    this.examBoard = null;
    this.level = null;
    this.subject = null;
    this.topic = null;
  }

  /**
   * Called when the exam board changes.
   * Sets the exam board and resets level, subject, and topic.
   */
  public onExamBoardChange(examBoard: ExamBoard | null) {
    this.examBoard = examBoard;
    this.level = null;
    this.subject = null;
    this.topic = null;
  }

  /**
   * Called when the level changes.
   * Sets the level and resets subject and topic.
   */
  public onLevelChange(level: Level | null) {
    this.level = level;
    this.subject = null;
    this.topic = null;
  }

  /**
   * Called when the subject changes.
   * Sets the subject and resets topic.
   */
  public onSubjectChange(subject: Subject | null) {
    this.subject = subject;
    this.topic = null;
  }

  /**
   * Called when the topic changes.
   * Sets the topic only.
   */
  public onTopicChange(topic: Topic | null) {
    this.topic = topic;
  }
}
