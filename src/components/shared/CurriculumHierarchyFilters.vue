<template>
  <div class="list-actions row mt-0 justify-content-start g-3">
    <!-- Filter by curriculum -->
    <div class="col-6 col-md-3" v-if="showCurriculum">
      <CurriculumSelect
        placeholder="Curriculum"
        :is-required="false"
        @change="onCurriculumChange"
      />
    </div>
    <!-- Filter by exam board -->
    <div class="col-6 col-md-3" v-if="showExamBoard">
      <ExamBoardSelect
        @change="onExamBoardChange"
        :exam-boards="filter?.curriculum?.examBoards"
        placeholder="Exam board"
        :is-required="false"
        ref="examBoardSelectInputRef"
      />
    </div>
    <!-- Filter by level -->
    <div class="col-6 col-md-3" v-if="showLevel">
      <LevelSelect
        @change="onLevelChange"
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
        ref="subjectSelectInputRef"
      />
    </div>
    <!-- Filter by topic -->
    <div class="col-6 col-md-3" v-if="showTopic">
      <TopicSelect
        @change="onTopicChange"
        :topics="filter?.subject?.topics"
        placeholder="Topic"
        :is-required="false"
        ref="topicSelectInputRef"
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
 * hierarchical education entities (Curriculum → Exam Board → Level → Subject → Topic).
 * Filters included (in order):
 *   1. Curriculum
 *   2. Exam Board
 *   3. Level
 *   4. Subject
 *   5. Topic
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
import { ref, type Ref } from "vue";

const props = defineProps({
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
  // Method that is called called after a filter changes
  callbackMethod: {
    type: Function,
    required: true,
  },
});

// Emit any filter changes to the parent component
const emit = defineEmits(["filter"]);

// Keep track of the currently applied filters
const filter: Ref<CurriculumHierarchyFilter> = ref(new CurriculumHierarchyFilter());
const examBoardSelectInputRef = ref();
const levelSelectInputRef = ref();
const subjectSelectInputRef = ref();
const topicSelectInputRef = ref();

/**
 * Called when Curriculum changes
 * - Updates filter
 * - Resets all dependent filters (Exam board → Level → Subject → Topic)
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

  emit("filter", filter.value);
  props.callbackMethod();
};

/**
 * Called when ExamBoard changes
 * - Updates filter
 * - Resets Level, Subject, and Topic
 */
const onExamBoardChange = (examBoard: ExamBoard) => {
  filter.value.onExamBoardChange(examBoard);
  //reset level select input value
  levelSelectInputRef.value?.resetSelectedValue();
  //reset subject select input value
  subjectSelectInputRef.value?.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  emit("filter", filter.value);
  props.callbackMethod();
};

/**
 * Called when Level changes
 * - Updates filter
 * - Resets Subject and Topic
 */
const onLevelChange = (level: Level) => {
  filter.value.onLevelChange(level);
  //reset subject select input value
  subjectSelectInputRef.value?.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  emit("filter", filter.value);
  props.callbackMethod();
};

/**
 * Called when Subject changes
 * - Updates filter
 * - Resets Topic
 */
const onSubjectChange = (subject: Subject) => {
  filter.value.onSubjectChange(subject);
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  props.callbackMethod();
};
/**
 * Called when Topic changes
 * - Updates filter
 */
const onTopicChange = (topic: Topic) => {
  filter.value.onTopicChange(topic);
  emit("filter", filter.value);
  props.callbackMethod();
};
</script>
