<template>
  <div class="list-actions row mt-0 justify-content-start g-3">
    <!-- Filter by curriculum -->
    <div class="col-6 col-md-3" v-if="showCurriculum">
      <CurriculumSelect
        placeholder="Curriculum"
        @curriculums="(val: Curriculum[]) => (curriculums = val)"
        :is-required="false"
        @is-loading="(val: boolean) => (isLoadingCurriculums = val)"
        @change="onCurriculumChange"
        ref="curriculumSelectInputRef"
      />
    </div>
    <!-- Filter by exam board -->
    <div class="col-6 col-md-3" v-if="showExamBoard">
      <ExamBoardSelect
        @change="onExamBoardChange"
        :exam-boards="filter?.curriculum?.examBoards"
        :is-loading-exam-boards="isLoadingCurriculums"
        placeholder="Exam board"
        :is-required="false"
        ref="examBoardSelectInputRef"
      />
    </div>
    <!-- Filter by level -->
    <div class="col-6 col-md-3" v-if="showLevel">
      <LevelSelect
        :is-loading-levels="isLoadingCurriculums"
        @change="onLevelChange"
        @subjects="(val: Subject[]) => (filter.level ? (filter.level.subjects = val) : null)"
        @is-loading-subjects="(val: boolean) => (isLoadingSubjects = val)"
        :levels="filter?.examBoard?.levels"
        placeholder="Level"
        :is-required="false"
        ref="levelSelectInputRef"
      />
    </div>
    <!-- Filter by subject -->
    <div class="col-6 col-md-3" v-if="showSubject">
      <SubjectSelect
        @change="onSubjectChange"
        :subjects="filter?.level?.subjects"
        placeholder="Subject"
        :is-required="false"
        :is-loading-subjects="isLoadingSubjects"
        ref="subjectSelectInputRef"
      />
    </div>
    <!-- Filter by topic -->
    <div class="col-6 col-md-3" v-if="showTopic">
      <TopicSelect
        @change="onTopicChange"
        :topics="filter?.subject?.topics"
        :is-loading-topics="isLoadingSubjects"
        placeholder="Topic"
        :is-required="false"
        ref="topicSelectInputRef"
      />
    </div>
    <!-- Filter by subtopic -->
    <div class="col-6 col-md-3" v-if="showSubtopic">
      <SubtopicSelect
        @change="onSubtopicChange"
        :is-loading-subtopics="isLoadingSubjects"
        :subtopics="filter?.topic?.subtopics"
        placeholder="Subtopic"
        :is-required="false"
        ref="subtopicSelectInputRef"
      />
    </div>

    <!-- Allow parent components to inject extra content (e.g. sort options, buttons, etc.) -->
    <slot name="extraContent"></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * CurriculumHierarchyFilters
 *
 * A reusable filter component for narrowing down content using
 * hierarchical education entities (Curriculum → Exam Board → Level → Subject → Topic → Subtopic)).
 * Filters included (in order):
 *   1. Curriculum
 *   2. Exam Board
 *   3. Level
 *   4. Subject
 *   5. Topic
 *   6. Subtopic
 *
 * Each level depends on the selection of the previous one.
 *
 * Example: Selecting "South African CAPS" → "DBE" → "Grade 11" → "Mathematics" → "Algebra".
 *
 * Flexible: Each filter can be shown/hidden with props (showCurriculum, showExamBoard, etc).
 *
 * Cascading reset: Changing a higher-level filter (e.g. Curriculum) will reset all dependent filters below it.
 *
 * This component emits change events for each filter
 * so the parent can react to partial or full selections.
 */

import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";
import { CurriculumHierarchyFilter } from "@/models/curriculumHierarchyFilter";
import type { Level } from "@/models/level";
import type { Subject } from "@/models/subject";
import type { Topic } from "@/models/topic";
import CurriculumSelect from "./selects/CurriculumSelect.vue";
import ExamBoardSelect from "./selects/ExamBoardSelect.vue";
import LevelSelect from "./selects/LevelSelect.vue";
import SubjectSelect from "./selects/SubjectSelect.vue";
import TopicSelect from "./selects/TopicSelect.vue";
import { onMounted, ref, type Ref } from "vue";
import SubtopicSelect from "./selects/SubtopicSelect.vue";
import type { Subtopic } from "@/models/subtopic";
import { useRouter } from "vue-router";

defineProps({
  // Props to control which filters should be visible
  showCurriculum: {
    type: Boolean,
    default: true,
  },
  showExamBoard: {
    type: Boolean,
    default: true,
  },
  showLevel: {
    type: Boolean,
    default: true,
  },
  showSubject: {
    type: Boolean,
    default: true,
  },
  showTopic: {
    type: Boolean,
    default: true,
  },
  showSubtopic: {
    type: Boolean,
    default: true,
  },
  // Method that is called called after a filter changes
  // callbackMethod: {
  //   type: Function,
  //   required: true,
  // },
});

onMounted(async () => {
  await curriculumSelectInputRef.value?.getAllCurriculums();
  applyDefaultsFromQuery(curriculums.value);
});

// Emit any filter changes to the parent component
const emit = defineEmits(["filter"]);
const router = useRouter();
// All curriculum options for the curriculum select input
// Used to apply the default curriculum from query params
const curriculums: Ref<Curriculum[]> = ref([]);

// Keep track of the currently applied filters
const filter: Ref<CurriculumHierarchyFilter> = ref(new CurriculumHierarchyFilter());
const curriculumSelectInputRef = ref();
const examBoardSelectInputRef = ref();
const levelSelectInputRef = ref();
const subjectSelectInputRef = ref();
const topicSelectInputRef = ref();
const subtopicSelectInputRef = ref();

// Show loader in curriculum, exam board and level selects when curriculums are being fetched
const isLoadingCurriculums = ref(false);
// Show loader in subject, topic and subtopic selects when subjects are being fetched
const isLoadingSubjects = ref(false);

/**
 * Called when Curriculum changes
 * - Updates filter
 * - Resets all dependent filters (Exam board → Level → Subject → Topic → Subtopic)
 */
const onCurriculumChange = (curriculum: Curriculum) => {
  filter.value.reset();
  filter.value.onCurriculumChange(curriculum);
  //reset exam board select input value
  examBoardSelectInputRef.value?.resetSelectedValue();
  //reset level select input value
  levelSelectInputRef.value?.resetSelectedValue();
  //reset subject select input value
  subjectSelectInputRef.value?.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  //reset subtopic select input value
  subtopicSelectInputRef.value?.resetSelectedValue();

  emit("filter", filter.value);
  // props.callbackMethod();
};

/**
 * Called when ExamBoard changes
 * - Updates filter
 * - Resets Level, Subject, Topic and Subtopic
 */
const onExamBoardChange = (examBoard: ExamBoard) => {
  filter.value.onExamBoardChange(examBoard);
  //reset level select input value
  levelSelectInputRef.value?.resetSelectedValue();
  //reset subject select input value
  subjectSelectInputRef.value?.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  //reset subtopic select input value
  subtopicSelectInputRef.value?.resetSelectedValue();
  emit("filter", filter.value);
  // props.callbackMethod();
};

/**
 * Called when Level changes
 * - Updates filter
 * - Resets Subject, Topic and Subtopic
 */
const onLevelChange = (level: Level) => {
  filter.value.onLevelChange(level);
  //reset subject select input value
  subjectSelectInputRef.value?.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  //reset subtopic select input value
  subtopicSelectInputRef.value?.resetSelectedValue();
  emit("filter", filter.value);
  // props.callbackMethod();
};

/**
 * Called when Subject changes
 * - Updates filter
 * - Resets Topic and Subtopic
 */
const onSubjectChange = (subject: Subject) => {
  filter.value.onSubjectChange(subject);

  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  //reset subtopic select input value
  subtopicSelectInputRef.value?.resetSelectedValue();
  emit("filter", filter.value);
  // props.callbackMethod();
};
/**
 * Called when Topic changes
 * - Updates filter
 * - Resets subtopic
 */
const onTopicChange = (topic: Topic) => {
  filter.value.onTopicChange(topic);
  //reset subtopic select input value
  subtopicSelectInputRef.value?.resetSelectedValue();
  emit("filter", filter.value);
  // props.callbackMethod();
};
/**
 * Called when Subtopic changes
 * - Updates filter
 */
const onSubtopicChange = (subtopic: Subtopic) => {
  filter.value.onSubtopicChange(subtopic);
  emit("filter", filter.value);
  // props.callbackMethod();
};

/**
 * Applies default values from query parameters to the filter.
 *
 * The order of applying defaults is important because
 * each hierarchy level depends on the one before it:
 * Curriculum → Exam Board → Level → Subject → Topic → Subtopic
 *
 * This ensures that when a user lands on the page with query params
 * (e.g., /questions?curriculumId=1&examBoardId=2&levelId=3),
 * the correct values are pre-selected and the filter state
 * matches the query string.
 */
const applyDefaultsFromQuery = async (curriculums: Curriculum[]) => {
  const query = router.currentRoute.value.query;
  // Curriculum
  if (query.curriculumId) {
    const curriculum = curriculums.find((x) => x.id === Number(query.curriculumId));
    if (curriculum) {
      filter.value.curriculum = curriculum;
      curriculumSelectInputRef.value?.applyDefaultValue(curriculum.id);
    }
  }

  // Exam Board
  if (query.examBoardId) {
    const examBoard = filter.value.curriculum?.examBoards.find(
      (x) => x.id === Number(query.examBoardId),
    );
    if (examBoard) {
      filter.value.examBoard = examBoard;
      examBoardSelectInputRef.value?.applyDefaultValue(examBoard.id);
    }
  }

  // Level
  if (query.levelId) {
    const level = filter.value.examBoard?.levels.find((x) => x.id === Number(query.levelId));
    if (level) {
      filter.value.level = level;
      // Apply default value to level select input AND fetch subjects for that level
      await levelSelectInputRef.value?.applyDefaultValue(level.id);
    }
  }

  // Subject
  if (query.subjectId) {
    const subject = filter.value.level?.subjects.find((x) => x.id === Number(query.subjectId));
    if (subject) {
      filter.value.subject = subject;
      subjectSelectInputRef.value?.applyDefaultValue(subject.id);
    }
  }

  // Topic
  if (query.topicId) {
    const topic = filter.value.subject?.topics.find((x) => x.id === Number(query.topicId));
    if (topic) {
      filter.value.topic = topic;
    }
  }

  // Subtopic
  if (query.subtopicId) {
    const subtopic = filter.value.topic?.subtopics.find((x) => x.id === Number(query.subtopicId));
    if (subtopic) {
      filter.value.subtopic = subtopic;
    }
  }

  emit("filter", filter.value);
};
</script>
