<template>
  <div class="list-actions row mt-3 justify-content-start g-3">
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
        :exam-boards="filters?.curriculum?.examBoards"
        placeholder="Exam board"
        :is-required="false"
        ref="examBoardSelectInputRef"
      />
    </div>
    <!-- Filter by level -->
    <div class="col-6 col-md-3" v-if="showLevel">
      <LevelSelect
        @change="onLevelChange"
        :levels="filters?.examBoard?.levels"
        placeholder="Level"
        :is-required="false"
        ref="levelSelectInputRef"
      />
    </div>
    <!-- Filter by subject -->
    <div class="col-6 col-md-3" v-if="showSubject">
      <SubjectSelect
        @change="onSubjectChange"
        :subjects="filters?.level?.subjects"
        placeholder="Subject"
        :is-required="false"
        ref="subjectSelectInputRef"
      />
    </div>
    <!-- Filter by topic -->
    <div class="col-6 col-md-3" v-if="showTopic">
      <TopicSelect
        @change="onTopicChange"
        :topics="filters?.subject?.topics"
        placeholder="Topic"
        :is-required="false"
        ref="topicSelectInputRef"
      />
    </div>

    <!-- Allow parent components to inject extra content (e.g. sort options, buttons, etc.) -->
    <slot name="otherContent"></slot>
  </div>
</template>

<script setup lang="ts">
/**
 * A reusable filter component for narrowing down content using
 * hierarchical education entities (Curriculum → Exam Board → Level → Subject → Topic).
 * Flexible: Each filter can be shown/hidden with props (showCurriculum, showExamBoard, etc).
 * Cascading reset: Changing a higher-level filter (e.g. Curriculum) will reset all dependent filters below it.
 */

import type { Curriculum } from "@/models/curriculum";
import type { ExamBoard } from "@/models/examBoard";
import { HierarchyFilter } from "@/models/hierarchyFilter";
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
  // Props control which filters should be visible
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
  // method that is called called after a filter changes
  callbackMethod: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["filters"]);

// Keep track of the currently applied filters
const filters: Ref<HierarchyFilter> = ref(new HierarchyFilter());
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
  filters.value.reset();
  filters.value.onCurriculumChange(curriculum);
  //reset exam board select input value
  examBoardSelectInputRef.value?.resetSelectedValue();
  //reset level select input value
  levelSelectInputRef.value?.resetSelectedValue();
  //reset subject select input value
  subjectSelectInputRef.value?.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();

  emit("filters", filters.value);
  props.callbackMethod();
};

/**
 * Called when ExamBoard changes
 * - Updates filter
 * - Resets Level, Subject, and Topic
 */
const onExamBoardChange = (examBoard: ExamBoard) => {
  filters.value.onExamBoardChange(examBoard);
  //reset level select input value
  levelSelectInputRef.value?.resetSelectedValue();
  //reset subject select input value
  subjectSelectInputRef.value?.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  emit("filters", filters.value);
  props.callbackMethod();
};

/**
 * Called when Level changes
 * - Updates filter
 * - Resets Subject and Topic
 */
const onLevelChange = (level: Level) => {
  filters.value.onLevelChange(level);
  //reset subject select input value
  subjectSelectInputRef.value?.resetSelectedValue();
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  emit("filters", filters.value);
  props.callbackMethod();
};

/**
 * Called when Subject changes
 * - Updates filter
 * - Resets Topic
 */
const onSubjectChange = (subject: Subject) => {
  filters.value.onSubjectChange(subject);
  //reset topic select input value
  topicSelectInputRef.value?.resetSelectedValue();
  props.callbackMethod();
};
/**
 * Called when Topic changes
 * - Updates filter
 */
const onTopicChange = (topic: Topic) => {
  filters.value.onTopicChange(topic);
  emit("filters", filters.value);
  props.callbackMethod();
};
</script>
