import type { Curriculum } from "./curriculum";
import type { ExamBoard } from "./examBoard";
import type { Level } from "./level";
import type { Subject } from "./subject";
import type { Subtopic } from "./subtopic";
import type { Topic } from "./topic";

/**
 * A filter for selecting items based on their hierarchy:
 * Curriculum → Exam Board → Level → Subject → Topic → Subtopic.
 * Each property can be set to filter items or left as null to include all.
 */
export class CurriculumHierarchyFilter {
  public constructor(
    public curriculum: Curriculum | null = null,
    public examBoard: ExamBoard | null = null,
    public level: Level | null = null,
    public subject: Subject | null = null,
    public topic: Topic | null = null,
    public subtopic: Subtopic | null = null,
    public searchQuery: string | null = null,
  ) {}

  /** Resets all values in the filter */
  public reset() {
    this.curriculum = null;
    this.examBoard = null;
    this.level = null;
    this.subject = null;
    this.topic = null;
    this.subtopic = null;
  }

  /**
   * Called when the curriculum changes.
   * Sets the curriculum and resets exam board, level, subject, topic and subtopic.
   */
  public onCurriculumChange(curriculum: Curriculum | null) {
    this.curriculum = curriculum;
    this.examBoard = null;
    this.level = null;
    this.subject = null;
    this.topic = null;
    this.subtopic = null;
  }

  /**
   * Called when the exam board changes.
   * Sets the exam board and resets level, subject, topic and subtopic.
   */
  public onExamBoardChange(examBoard: ExamBoard | null) {
    this.examBoard = examBoard;
    this.level = null;
    this.subject = null;
    this.topic = null;
    this.subtopic = null;
  }

  /**
   * Called when the level changes.
   * Sets the level and resets subject topic and subtopic.
   */
  public onLevelChange(level: Level | null) {
    this.level = level;
    this.subject = null;
    this.topic = null;
    this.subtopic = null;
  }

  /**
   * Called when the subject changes.
   * Sets the subject and resets topic and subtopic.
   */
  public onSubjectChange(subject: Subject | null) {
    this.subject = subject;
    this.topic = null;
    this.subtopic = null;
  }

  /**
   * Called when the topic changes.
   * Sets the topic and resets subtopic.
   */
  public onTopicChange(topic: Topic | null) {
    this.topic = topic;
    this.subtopic = null;
  }
  /**
   * Called when the subtopic changes.
   * Sets the subtopic.
   */
  public onSubtopicChange(subtopic: Subtopic | null) {
    this.subtopic = subtopic;
  }
}
