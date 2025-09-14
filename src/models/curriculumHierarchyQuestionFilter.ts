import { QuestionSortOption } from "@/enums/questions/questionSortOption";
import type { Curriculum } from "./curriculum";
import type { ExamBoard } from "./examBoard";
import type { Level } from "./level";
import type { Subject } from "./subject";
import type { Subtopic } from "./subtopic";
import type { Topic } from "./topic";
import type { QuestionQueryParams } from "@/interfaces/questions/questionQueryParams";
import router from "@/router";

/**
 * A filter for selecting items based on their hierarchy:
 * Curriculum → Exam Board → Level → Subject → Topic → Subtopic.
 * Each property can be set to filter items or left as null to include all.
 * Additional fields:
 * - `search`: optional free-text search term
 * - `sortBy`: optional sorting option
 * - `page`: current page number for pagination
 * - `pageSize`: number of items to return per page
 */
export class CurriculumHierarchyFilter {
  public constructor(
    public curriculum: Curriculum | null = null,
    public examBoard: ExamBoard | null = null,
    public level: Level | null = null,
    public subject: Subject | null = null,
    public topic: Topic | null = null,
    public subtopic: Subtopic | null = null,
    public search: string | null = null,
    public page: number = 1,
    public pageSize: number = 10,
    public sortBy: QuestionSortOption | null = null,
    public tags: string | null = null,
  ) {}

  /**
   * Clears all filters, including:
   * - Hierarchical filters (curriculum → subtopic)
   * - Search term
   * - Pagination info
   * - Sorting option
   *
   * Use this when you want to fully reset the filter state.
   */
  public clear() {
    this.curriculum = null;
    this.examBoard = null;
    this.level = null;
    this.subject = null;
    this.topic = null;
    this.subtopic = null;
    this.search = null;
    // this.page = 1;
    // this.pageSize = 10;
    this.sortBy = null;
    this.tags = null;
  }

  /**
   * Clears only the hierarchical filters:
   * curriculum, examBoard, level, subject, topic, and subtopic.
   *
   * This method is called when curriculum changes and so it resets
   * all dependent filters (Exam board → Level → Subject → Topic → Subtopic)
   * before setting the new curriculum.
   * Does NOT reset the search term, pagination, or sort options.
   */
  public clearHierarchyFilters() {
    this.curriculum = null;
    this.examBoard = null;
    this.level = null;
    this.subject = null;
    this.topic = null;
    this.subtopic = null;
  }

  /**
   * Clears all filters except for `search`, `page`, and `pageSize`.
   * This is useful when performing a text-based search to make sure the results are not
   * unintentionally restricted by previously selected filters. It allows the search
   * to run across all questions while keeping the current search term and pagination state.
   */
  public clearFiltersExceptSearchAndPagination() {
    const { search } = this;
    this.clear();
    this.search = search;
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

  /**
   * Converts the current filter state into a QuestionQueryParams object.
   * Useful for building query strings or API calls.
   */
  public toQueryParams(
    page: number | null = null,
    pageSize: number | null = null,
  ): QuestionQueryParams {
    return {
      page,
      pageSize,
      sortBy: this.sortBy,
      curriculumId: this.curriculum ? this.curriculum.id : null,
      examBoardId: this.examBoard ? this.examBoard.id : null,
      levelId: this.level ? this.level.id : null,
      subjectId: this.subject ? this.subject.id : null,
      topicId: this.topic ? this.topic.id : null,
      subtopicId: this.subtopic ? this.subtopic.id : null,
      search: this.search,
      tags: this.tags,
    };
  }

  /**
   * Updates the browser URL to reflect the current filter state.
   * Converts the filter state into query parameters, omitting any null or undefined values.
   */
  public applyFilterToBrowserUrl() {
    // Convert the current filter state into query parameters
    const queryParams = this.toQueryParams();
    // Filter out any query parameters that are null or undefined
    const availableQueryParams = Object.fromEntries(
      // Convert the queryParams object into an array of [key, value] pairs
      Object.entries(queryParams)
        // Keep only entries where the value(index is 1) is not null or undefined
        .filter((val) => val["1"] != null && val["1"]),
      // Convert the filtered array back into an object
    );

    //update the browser URL
    router.push({ query: { ...availableQueryParams } });

    return availableQueryParams;
  }
}
