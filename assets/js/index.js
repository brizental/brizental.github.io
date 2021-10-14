const postListChooserButtons = document.querySelectorAll(".post-headers button");
for (const postListChooserButton of postListChooserButtons) {
  postListChooserButton.addEventListener("click", () => {
    const { target } = postListChooserButton.dataset;
    const currentlyActivePostsList = document.querySelector(".post-block.active")
    if (target !== currentlyActivePostsList.id) {
      const currentlyActiveButton = document.querySelector(".post-headers button.active");
      currentlyActiveButton.classList.remove("active");
      currentlyActivePostsList.classList.remove("active");
    } else {
      return;
    }
    const postsList = document.getElementById(target);
    postsList.classList.add("active");
    postListChooserButton.classList.add("active");
  });
}
