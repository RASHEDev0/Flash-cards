document.addEventListener("DOMContentLoaded", () => {
  let flashcards = JSON.parse(localStorage.getItem('flashcards')) || {};
  let categories = JSON.parse(localStorage.getItem('categories')) || Object.keys(flashcards);
  let currentCategory = categories.length > 0 ? categories[0] : null;
  let currentCardIndex = 0;
  const flashcardElement = document.getElementById("flashcard");
  const stats = document.getElementById("stats");

  const flashcardModal = document.getElementById("flashcardModal");
  const flashcardModalTitle = document.getElementById("modalTitle");
  const flashcardForm = document.getElementById("flashcardForm");
  const categorySelect = document.getElementById("category");
  const newCategoryButton = document.getElementById("newCategoryButton");
  const closeFlashcardModalButton = document.querySelector("#flashcardModal .close-button");

  const categoryModal = document.getElementById("categoryModal");
  const categoryForm = document.getElementById("categoryForm");
  const closeCategoryModalButton = document.querySelector("#categoryModal .close-button");

  const deleteCategoryModal = document.getElementById("deleteCategoryModal");
  const deleteCategoryForm = document.getElementById("deleteCategoryForm");
  const deleteCategorySelect = document.getElementById("deleteCategorySelect");
  const closeDeleteCategoryModalButton = document.querySelector("#deleteCategoryModal .close-button");

  function openModal(modal, title) {
    if (modal === flashcardModal) {
      flashcardModalTitle.innerText = title;
    }
    modal.style.display = "block";
  }

  function closeModal(modal) {
    modal.style.display = "none";
  }

  closeFlashcardModalButton.addEventListener("click", () => closeModal(flashcardModal));
  closeCategoryModalButton.addEventListener("click", () => closeModal(categoryModal));
  closeDeleteCategoryModalButton.addEventListener("click", () => closeModal(deleteCategoryModal));

  window.addEventListener("click", (event) => {
    if (event.target === flashcardModal) closeModal(flashcardModal);
    if (event.target === categoryModal) closeModal(categoryModal);
    if (event.target === deleteCategoryModal) closeModal(deleteCategoryModal);
  });

  flashcardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const category = categorySelect.value;
    const question = document.getElementById("question").value;
    const answer = document.getElementById("answer").value;

    if (flashcardModalTitle.innerText === "Add Flashcard") {
      if (category) {
        flashcards[category] = flashcards[category] || [];
        flashcards[category].push({ question, answer, known: false });
      } else {
        alert("No category selected!");
        closeModal(flashcardModal);
        return;
      }
    } else if (flashcardModalTitle.innerText === "Edit Flashcard") {
      if (category) {
        flashcards[category][currentCardIndex] = { ...flashcards[category][currentCardIndex], question, answer };
      } else {
        alert("No category selected!");
        closeModal(flashcardModal);
        return;
      }
    }

    saveFlashcards();
    updateFlashcard();
    updateStats();
    closeModal(flashcardModal);
  });

  categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const categoryName = document.getElementById("categoryName").value;
    if (!flashcards[categoryName]) {
      flashcards[categoryName] = [];
      categories.push(categoryName);
      updateCategoryList();
      saveFlashcards();
      closeModal(categoryModal);
    } else {
      alert("Category already exists!");
    }
  });

  deleteCategoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const categoryName = deleteCategorySelect.value;
    if (flashcards[categoryName]) {
      delete flashcards[categoryName];
      categories = categories.filter(category => category !== categoryName);
      if (currentCategory === categoryName) {
        currentCategory = categories.length > 0 ? categories[0] : null;
      }
      updateCategoryList();
      saveFlashcards();
      closeModal(deleteCategoryModal);
    } else {
      alert("Category not found!");
    }
  });

  newCategoryButton.addEventListener("click", () => {
    document.getElementById("categoryName").value = '';
    openModal(categoryModal, "Add Category");
  });

  document.getElementById("deleteCategory").addEventListener("click", () => {
    openModal(deleteCategoryModal, "Delete Category");
    updateDeleteCategorySelect();
  });

  function updateFlashcard() {
    if (currentCategory && flashcards[currentCategory].length > 0) {
      const card = flashcards[currentCategory][currentCardIndex];
      flashcardElement.querySelector('.front').innerText = card.question;
      flashcardElement.querySelector('.back').innerText = card.answer;
      flashcardElement.classList.remove("flip");
      document.getElementById("markKnown").disabled = card.known;
    } else {
      flashcardElement.querySelector('.front').innerText = 'No flashcards';
      flashcardElement.querySelector('.back').innerText = 'Add some flashcards to get started!';
      flashcardElement.classList.remove("flip");
      updateStats();
    }
  }

  function shuffleFlashcards() {
    if (currentCategory && flashcards[currentCategory].length > 0) {
      for (let i = flashcards[currentCategory].length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcards[currentCategory][i], flashcards[currentCategory][j]] = [flashcards[currentCategory][j], flashcards[currentCategory][i]];
      }
      currentCardIndex = 0;
      updateFlashcard();
    }
  }

  function updateCategoryList() {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = '';
    categories.forEach(category => {
      const categoryItem = document.createElement("div");
      categoryItem.innerText = category;
      categoryItem.classList.add("category-item");
      if (category === currentCategory) {
        categoryItem.classList.add("selected");
      }
      categoryItem.addEventListener("click", () => {
        currentCategory = category;
        currentCardIndex = 0;
        updateFlashcard();
        updateStats();
        updateCategoryList();
      });
      categoryList.appendChild(categoryItem);
    });

    updateCategorySelect();
    updateDeleteCategorySelect();
  }

  function updateCategorySelect() {
    categorySelect.innerHTML = '';
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.innerText = category;
      categorySelect.appendChild(option);
    });

    if (currentCategory) {
      categorySelect.value = currentCategory;
    }
  }

  function updateDeleteCategorySelect() {
    deleteCategorySelect.innerHTML = '';
    categories.forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.innerText = category;
      deleteCategorySelect.appendChild(option);
    });
  }

  document.getElementById("addCategory").addEventListener("click", () => {
    document.getElementById("categoryName").value = '';
    openModal(categoryModal, "Add Category");
  });

  document.getElementById("addCard").addEventListener("click", () => {
    openModal(flashcardModal, "Add Flashcard");
  });

  document.getElementById("editCard").addEventListener("click", () => {
    if (currentCategory && flashcards[currentCategory].length > 0) {
      document.getElementById("category").value = currentCategory;
      document.getElementById("question").value = flashcards[currentCategory][currentCardIndex].question;
      document.getElementById("answer").value = flashcards[currentCategory][currentCardIndex].answer;
      openModal(flashcardModal, "Edit Flashcard");
    } else {
      alert("No flashcards to edit!");
    }
  });

  document.getElementById("deleteCard").addEventListener("click", () => {
    if (currentCategory && flashcards[currentCategory].length > 0) {
      flashcards[currentCategory].splice(currentCardIndex, 1);
      currentCardIndex = currentCardIndex > 0 ? currentCardIndex - 1 : 0;
      saveFlashcards();
      updateFlashcard();
      updateStats();
    } else {
      alert("No flashcards to delete!");
    }
  });

  document.getElementById("shuffleCards").addEventListener("click", shuffleFlashcards);

  document.getElementById("markKnown").addEventListener("click", () => {
    if (currentCategory && flashcards[currentCategory].length > 0 && !flashcards[currentCategory][currentCardIndex].known) {
      flashcards[currentCategory][currentCardIndex].known = true;
      saveFlashcards();
      updateStats();
      document.getElementById("markKnown").disabled = true;
    } else {
      alert("No flashcards to mark as known!");
    }
  });

  flashcardElement.addEventListener("click", () => {
    flashcardElement.classList.toggle("flip");
  });

  function updateStats() {
    if (currentCategory) {
      const total = flashcards[currentCategory].length;
      const known = flashcards[currentCategory].filter(card => card.known).length;
      stats.innerText = `Known: ${known} | Unknown: ${total - known}`;
    } else {
      stats.innerText = `Known: 0 | Unknown: 0`;
    }
  }

  function saveFlashcards() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    localStorage.setItem('categories', JSON.stringify(categories));
    console.log("Saved flashcards and categories to localStorage");
  }

  updateCategoryList();
  updateFlashcard();
  updateStats();
});
