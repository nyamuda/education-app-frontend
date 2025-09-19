<template>
  <div>
    <!-- Share trigger button -->
    <Button
      label="Share"
      @click="togglePopover"
      icon="pi pi-share-alt"
      text
      size="small"
      severity="secondary"
      class="action-btn"
    />

    <!-- Popover content -->
    <Popover ref="popover">
      <div class="d-flex flex-column gap-2">
        <span class="fw-bold">Share this question</span>

        <!-- Link field -->
        <InputGroup
          ><InputText style="width: 20rem" size="small" :value="shareUrl" readonly fluid />
          <Button
            @click="copyLink"
            severity="secondary"
            size="small"
            :label="isCopied ? 'Copied!' : 'Copy'"
            icon="pi pi-copy"
          ></Button
        ></InputGroup>

        <!-- Footer: copy button + social icons -->

        <div class="d-flex gap-3 mt-2">
          <!-- WhatsApp -->
          <a :href="`https://wa.me/?text=${encodedUrl}`" target="_blank" rel="noopener">
            <i class="pi pi-whatsapp" style="font-size: 1.2rem"></i>
          </a>

          <!-- Facebook -->
          <a
            :href="`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`"
            target="_blank"
            rel="noopener"
          >
            <i class="pi pi-facebook" style="font-size: 1.2rem"></i>
          </a>

          <!-- X (Twitter) -->
          <a :href="`https://x.com/intent/tweet?url=${encodedUrl}`" target="_blank" rel="noopener">
            <i class="pi pi-twitter" style="font-size: 1.2rem"></i>
          </a>

          <!-- Telegram -->
          <a :href="`https://t.me/share/url?url=${encodedUrl}`" target="_blank" rel="noopener">
            <i class="pi pi-send" style="font-size: 1.2rem"></i>
          </a>
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

// Encode the URL for use in query params
const encodedUrl = computed(() => encodeURIComponent(props.shareUrl));

const togglePopover = (event: MouseEvent) => {
  popover.value.toggle(event);
  isCopied.value = false;
};

const isCopied = ref(false);

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
    isCopied.value = true;
  } catch {
    toast.add({
      severity: "error",
      summary: "Copy Failed",
      detail: "We couldn't copy the link to your clipboard. Please try again.",
      life: 10000,
    });
    isCopied.value = false;
  }
};
</script>

<style scoped>
/* Optional styling to match your theme */
</style>
