<template>
  <div>
    <!-- Share trigger button -->
    <Button icon="pi pi-share-alt" label="Share" @click="togglePopover" ref="shareBtn" />

    <!-- Popover content -->
    <Popover ref="popover">
      <div class="d-flex flex-column gap-2">
        <span class="fw-bold">Share this question</span>

        <!-- Link field -->
        <InputGroup
          ><InputText style="width: 20rem" size="small" :value="shareUrl" readonly fluid />
          <Button severity="secondary" size="small" label="Copy" icon="pi pi-copy"></Button
        ></InputGroup>

        <!-- Footer: copy button + social icons -->
        <div class="d-flex justify-content-between align-items-center mt-2">
          <Button label="Copy Link" size="small" @click="copyLink" />

          <div class="flex gap-2">
            <!-- WhatsApp -->
            <a :href="`https://wa.me/?text=${encodedUrl}`" target="_blank" rel="noopener">
              <i class="pi pi-whatsapp text-xl"></i>
            </a>

            <!-- Facebook -->
            <a
              :href="`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`"
              target="_blank"
              rel="noopener"
            >
              <i class="pi pi-facebook text-xl"></i>
            </a>

            <!-- X (Twitter) -->
            <a
              :href="`https://x.com/intent/tweet?url=${encodedUrl}`"
              target="_blank"
              rel="noopener"
            >
              <i class="pi pi-twitter text-xl"></i>
            </a>

            <!-- Telegram -->
            <a :href="`https://t.me/share/url?url=${encodedUrl}`" target="_blank" rel="noopener">
              <i class="pi pi-send text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Popover from "primevue/popover";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputGroup from "primevue/inputgroup";
import { useToast } from "primevue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  shareUrl: {
    type: String,
    required: true,
  },
});

const toast = useToast();
const popover = ref();
const shareBtn = ref();

// Encode the URL for use in query params
const encodedUrl = computed(() => encodeURIComponent(props.shareUrl));

const togglePopover = (event: MouseEvent) => {
  popover.value.toggle(event);
};

//Copy the URL
const copyLink = () => {
  try {
    navigator.clipboard.writeText(props.shareUrl);
    toast.add({
      severity: "success",
      summary: "Link Copied",
      detail: "The link has been copied to your clipboard.",
      life: 5000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Copy Failed",
      detail: "We couldn't copy the link to your clipboard. Please try again.",
      life: 10000,
    });
  }
};
</script>

<style scoped>
/* Optional styling to match your theme */
</style>
