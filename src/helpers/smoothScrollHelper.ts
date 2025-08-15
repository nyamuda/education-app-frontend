export class SmoothScrollHelper {
  /**
   * Smoothly scrolls the page to the element with the given ID.
   * @param elementId The ID of the target element to scroll into view.
   */
  public static scrollToElement = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth", // smooth scrolling
        block: "start", // align to the top
        inline: "nearest",
      });
    }
  };
}
