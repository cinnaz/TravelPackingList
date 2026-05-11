import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://wknzurufjlirvnauyqdo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_n8FTsqSDI_Y-VCtkZZoGMg_Om6F4wI-";
const PACKING_LISTS_TABLE = "packing_lists";
const GUEST_DRAFT_KEY = "travelPackingListGuestDraft";
const AUTH_REDIRECT_URL = new URL(window.location.pathname, window.location.origin).toString();

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const defaultCategories = () => [
  {
    id: crypto.randomUUID(),
    name: "Clothing",
    items: [
      "Underwear",
      "Socks",
      "Sleepwear",
      "Shirts / T-shirts",
      "Bottoms",
      "Sweater",
      "Jackets",
      "Shoes",
      "Slippers",
    ].map(createItem),
  },
  {
    id: crypto.randomUUID(),
    name: "Toiletries",
    items: [
      "Toothbrush",
      "Toothpaste",
      "Floss",
      "Deodorant",
      "Face wash",
      "Shampoo",
      "Conditioner",
      "Body wash",
      "Razor",
      "Hairbrush",
      "Sunscreen",
      "Lotion",
      "Makeup (if applicable)",
      "Hair tie (if applicable)",
    ].map(createItem),
  },
  {
    id: crypto.randomUUID(),
    name: "Electronics",
    items: [
      "Phone",
      "Phone charger",
      "Portable battery",
      "Headphones",
      "Laptop (if needed)",
      "Laptop charger",
    ].map(createItem),
  },
  {
    id: crypto.randomUUID(),
    name: "Travel Documents",
    items: [
      "Passport/ID",
      "Credit/debit cards",
      "Local currency (if applicable)",
    ].map(createItem),
  },
  {
    id: crypto.randomUUID(),
    name: "Health & Safety",
    items: [
      "Hand sanitizer",
      "Pain relievers",
      "Insect repellent",
      "Allergy medicine",
      "Somach relief medicine",
      "Daily medicines",
    ].map(createItem),
  },
  {
    id: crypto.randomUUID(),
    name: "Miscellaneous",
    items: [
      "Reusable water bottle",
      "Snacks",
      "Reading glasses / contacts",
      "Sunglasses",
      "Hat or cap",
      "Transit entertainment (book / movies)",
      "Travel pillow",
      "Backpack / tote bag",
      "Umbrella",
    ].map(createItem),
  },
];

function createItem(name) {
  return {
    id: crypto.randomUUID(),
    name,
    isPacked: false,
  };
}

function normalizeCategories(categories) {
  return categories.map((category) => ({
    id: category.id || crypto.randomUUID(),
    name: category.name,
    items: (category.items || []).map((item) => ({
      id: item.id || crypto.randomUUID(),
      name: item.name,
      isPacked: Boolean(item.isPacked),
    })),
  }));
}

function loadGuestDraft() {
  try {
    const raw = sessionStorage.getItem(GUEST_DRAFT_KEY);
    if (!raw) {
      return defaultCategories();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultCategories();
    }
    return normalizeCategories(parsed);
  } catch {
    return defaultCategories();
  }
}

function saveGuestDraft() {
  sessionStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(state.categories));
}

function clearGuestDraft() {
  sessionStorage.removeItem(GUEST_DRAFT_KEY);
}

const state = {
  categories: loadGuestDraft(),
  showRemainingOnly: false,
  user: null,
  accountPanelOpen: false,
  categoryModalOpen: false,
  confirmModalOpen: false,
};

let pendingConfirm = null;

const elements = {
  appShell: document.querySelector("#appShell"),
  accountCloseButton: document.querySelector("#accountCloseButton"),
  accountModalBackdrop: document.querySelector("#accountModalBackdrop"),
  accountPanelBody: document.querySelector("#accountPanelBody"),
  accountToggleButton: document.querySelector("#accountToggleButton"),
  authForm: document.querySelector("#authForm"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  authMessage: document.querySelector("#authMessage"),
  createAccountButton: document.querySelector("#createAccountButton"),
  signInButton: document.querySelector("#signInButton"),
  signOutButton: document.querySelector("#signOutButton"),
  authPanelTitle: document.querySelector("#authPanelTitle"),
  guestCallout: document.querySelector("#guestCallout"),
  signedInPanel: document.querySelector("#signedInPanel"),
  accountLabel: document.querySelector("#accountLabel"),
  accountEmail: document.querySelector("#accountEmail"),
  accountHelperCopy: document.querySelector("#accountHelperCopy"),
  packedCount: document.querySelector("#packedCount"),
  totalCount: document.querySelector("#totalCount"),
  listTitle: document.querySelector("#listTitle"),
  listContainer: document.querySelector("#listContainer"),
  addCategoryButton: document.querySelector("#addCategoryButton"),
  toggleViewButton: document.querySelector("#toggleViewButton"),
  categoryTemplate: document.querySelector("#categoryTemplate"),
  itemTemplate: document.querySelector("#itemTemplate"),
  remainingTemplate: document.querySelector("#remainingTemplate"),
  newTripButton: document.querySelector("#newTripButton"),
  restoreDefaultsButton: document.querySelector("#restoreDefaultsButton"),
  categoryModal: document.querySelector("#categoryModal"),
  categoryModalBackdrop: document.querySelector("#categoryModalBackdrop"),
  categoryCloseButton: document.querySelector("#categoryCloseButton"),
  categoryCancelButton: document.querySelector("#categoryCancelButton"),
  categoryModalForm: document.querySelector("#categoryModalForm"),
  categoryModalInput: document.querySelector("#categoryModalInput"),
  confirmModal: document.querySelector("#confirmModal"),
  confirmModalBackdrop: document.querySelector("#confirmModalBackdrop"),
  confirmModalTitle: document.querySelector("#confirmModalTitle"),
  confirmModalMessage: document.querySelector("#confirmModalMessage"),
  confirmCloseButton: document.querySelector("#confirmCloseButton"),
  confirmActionButton: document.querySelector("#confirmActionButton"),
  confirmCancelButton: document.querySelector("#confirmCancelButton"),
};

function setAuthMessage(message, tone = "error") {
  elements.authMessage.textContent = message;
  elements.authMessage.classList.toggle("success", tone === "success");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function renderShell() {
  const isAuthenticated = Boolean(state.user);
  elements.appShell.classList.remove("hidden");
  elements.accountPanelBody.classList.toggle("hidden", !state.accountPanelOpen);
  elements.accountModalBackdrop.classList.toggle("hidden", !state.accountPanelOpen);
  elements.categoryModal.classList.toggle("hidden", !state.categoryModalOpen);
  elements.categoryModalBackdrop.classList.toggle("hidden", !state.categoryModalOpen);
  elements.confirmModal.classList.toggle("hidden", !state.confirmModalOpen);
  elements.confirmModalBackdrop.classList.toggle("hidden", !state.confirmModalOpen);
  elements.guestCallout.classList.toggle("hidden", isAuthenticated);
  elements.authForm.classList.toggle("hidden", isAuthenticated);
  elements.signedInPanel.classList.toggle("hidden", !isAuthenticated);
  elements.accountHelperCopy.classList.toggle("hidden", isAuthenticated);

  if (isAuthenticated) {
    elements.authPanelTitle.textContent = "Account connected";
    elements.accountLabel.textContent = "Signed in as";
    elements.accountEmail.textContent = state.user.email ?? "";
    elements.accountToggleButton.textContent = "Log out";
  } else {
    elements.authPanelTitle.textContent = "Save your custom list";
    elements.accountLabel.textContent = "Guest mode";
    elements.accountEmail.textContent = "";
    elements.accountToggleButton.textContent = state.accountPanelOpen ? "Close" : "Log in";
  }
}

function closeConfirmModal(confirmed = false) {
  if (pendingConfirm) {
    pendingConfirm(confirmed);
    pendingConfirm = null;
  }
  state.confirmModalOpen = false;
  render();
}

function confirmAction(title, message, actionLabel = "Delete") {
  elements.confirmModalTitle.textContent = title;
  elements.confirmModalMessage.textContent = message;
  elements.confirmActionButton.textContent = actionLabel;
  state.confirmModalOpen = true;
  render();

  return new Promise((resolve) => {
    pendingConfirm = resolve;
  });
}

function getCounts() {
  const items = state.categories.flatMap((category) => category.items);
  return {
    total: items.length,
    packed: items.filter((item) => item.isPacked).length,
  };
}

function getRemainingItems() {
  return state.categories
    .flatMap((category) =>
      category.items
        .filter((item) => !item.isPacked)
        .map((item) => ({ categoryId: category.id, categoryName: category.name, item }))
    )
    .sort((a, b) => a.item.name.localeCompare(b.item.name));
}

function renderStats() {
  const { packed, total } = getCounts();
  elements.packedCount.textContent = String(packed);
  elements.totalCount.textContent = String(total);
  elements.toggleViewButton.textContent = state.showRemainingOnly
    ? `Show full list (${packed}/${total})`
    : "Show remaining only";
  elements.listTitle.textContent = state.showRemainingOnly
    ? "Remaining unpacked items"
    : "Packing categories";
}

function renderEmptyState(message) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  elements.listContainer.appendChild(empty);
}

function attachItemEditor(itemNameNode, categoryId, item) {
  itemNameNode.tabIndex = 0;

  const startEditing = () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = item.name;
    input.className = "item-edit-input";
    input.setAttribute("aria-label", "Edit item name");
    itemNameNode.replaceWith(input);
    input.focus();
    input.select();

    let isSettled = false;
    const finishEditing = async (shouldSave) => {
      if (isSettled) {
        return;
      }
      isSettled = true;

      const nextName = input.value.trim();
      if (shouldSave && nextName && nextName !== item.name) {
        await renameItem(categoryId, item.id, nextName);
        return;
      }

      render();
    };

    input.addEventListener("blur", () => {
      void finishEditing(true);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void finishEditing(true);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        void finishEditing(false);
      }
    });
  };

  itemNameNode.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    startEditing();
  });
  itemNameNode.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    startEditing();
  });
}

function attachCategoryEditor(titleNode, category) {
  titleNode.tabIndex = 0;

  const startEditing = () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = category.name;
    input.className = "category-edit-input";
    input.setAttribute("aria-label", "Edit category name");
    titleNode.replaceWith(input);
    input.focus();
    input.select();

    let isSettled = false;
    const finishEditing = async (shouldSave) => {
      if (isSettled) {
        return;
      }
      isSettled = true;

      const nextName = input.value.trim();
      if (shouldSave && nextName && nextName !== category.name) {
        await renameCategory(category.id, nextName);
        return;
      }

      render();
    };

    input.addEventListener("blur", () => {
      void finishEditing(true);
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        void finishEditing(true);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        void finishEditing(false);
      }
    });
  };

  titleNode.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    startEditing();
  });
  titleNode.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    startEditing();
  });
}

function renderRemainingView() {
  const remainingItems = getRemainingItems();
  if (remainingItems.length === 0) {
    renderEmptyState("Everything is packed.");
    return;
  }

  remainingItems.forEach(({ categoryId, categoryName, item }) => {
    const node = elements.remainingTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = node.querySelector(".item-checkbox");
    const itemName = node.querySelector(".item-name");
    const itemCategory = node.querySelector(".item-category");

    checkbox.checked = item.isPacked;
    itemName.textContent = item.name;
    itemCategory.textContent = categoryName;
    node.classList.toggle("is-packed", item.isPacked);
    attachItemEditor(itemName, categoryId, item);

    checkbox.addEventListener("change", async () => {
      await toggleItem(categoryId, item.id);
    });

    elements.listContainer.appendChild(node);
  });
}

function renderCategoryView() {
  if (state.categories.length === 0) {
    renderEmptyState("Add a category to start building your trip list.");
    return;
  }

  state.categories.forEach((category) => {
    const section = elements.categoryTemplate.content.firstElementChild.cloneNode(true);
    const title = section.querySelector("h3");
    const deleteCategoryButton = section.querySelector(".delete-category");
    const itemsContainer = section.querySelector(".category-items");
    const addItemForm = section.querySelector(".category-add-form");
    const addItemInput = section.querySelector(".category-add-input");
    const cancelAddItemButton = section.querySelector(".category-cancel-button");

    title.textContent = category.name;
    attachCategoryEditor(title, category);
    deleteCategoryButton.addEventListener("click", async () => {
      await deleteCategory(category.id);
    });
    addItemForm.classList.remove("hidden");
    cancelAddItemButton.addEventListener("click", () => {
      addItemForm.reset();
      addItemInput.focus();
    });
    addItemForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const trimmed = addItemInput.value.trim();
      if (!trimmed) {
        addItemInput.focus();
        return;
      }
      await addItem(category.id, trimmed);
      addItemForm.reset();
      addItemInput.focus();
    });

    if (category.items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No items yet in this category.";
      itemsContainer.appendChild(empty);
    } else {
      category.items.forEach((item) => {
        const row = elements.itemTemplate.content.firstElementChild.cloneNode(true);
        const checkbox = row.querySelector(".item-checkbox");
        const itemName = row.querySelector(".item-name");
        const deleteItemButton = row.querySelector(".delete-item");

        checkbox.checked = item.isPacked;
        itemName.textContent = item.name;
        row.classList.toggle("is-packed", item.isPacked);
        attachItemEditor(itemName, category.id, item);

        checkbox.addEventListener("change", async () => {
          await toggleItem(category.id, item.id);
        });

        deleteItemButton.addEventListener("click", async () => {
          await deleteItem(category.id, item.id);
        });

        itemsContainer.appendChild(row);
      });
    }

    elements.listContainer.appendChild(section);
  });
}

function render() {
  renderShell();
  renderStats();
  elements.listContainer.innerHTML = "";
  elements.listContainer.classList.toggle("masonry-layout", !state.showRemainingOnly);

  if (state.showRemainingOnly) {
    renderRemainingView();
  } else {
    renderCategoryView();
  }
}

async function saveCurrentCategoriesToSupabase() {
  if (!state.user) {
    return;
  }

  const { error } = await supabase.from(PACKING_LISTS_TABLE).upsert(
    {
      user_id: state.user.id,
      categories: state.categories,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    setAuthMessage(error.message);
  }
}

async function commit() {
  if (state.user) {
    await saveCurrentCategoriesToSupabase();
  } else {
    saveGuestDraft();
  }
  render();
}

async function hydrateCategoriesForUser() {
  if (!state.user) {
    state.categories = loadGuestDraft();
    return;
  }

  const { data, error } = await supabase
    .from(PACKING_LISTS_TABLE)
    .select("categories")
    .eq("user_id", state.user.id)
    .maybeSingle();

  if (error) {
    setAuthMessage(error.message);
    state.categories = defaultCategories();
    return;
  }

  if (data?.categories?.length) {
    state.categories = normalizeCategories(data.categories);
    clearGuestDraft();
    return;
  }

  state.categories = loadGuestDraft();
  await saveCurrentCategoriesToSupabase();
  clearGuestDraft();
}

async function signIn(email, password) {
  if (!isValidEmail(email)) {
    setAuthMessage("Enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Password must be at least 6 characters.");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setAuthMessage(error.message);
    return;
  }

  setAuthMessage("Signed in.", "success");
}

async function createAccount(email, password) {
  if (!isValidEmail(email)) {
    setAuthMessage("Enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Password must be at least 6 characters.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: AUTH_REDIRECT_URL,
    },
  });

  if (error) {
    setAuthMessage(error.message);
    return;
  }

  if (!data.session) {
    setAuthMessage("Account created. Check your email to confirm your sign-in.", "success");
    return;
  }

  setAuthMessage("Account created and signed in.", "success");
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    setAuthMessage(error.message);
  }
}

async function applyUser(user) {
  state.user = user;

  if (user) {
    await hydrateCategoriesForUser();
    state.accountPanelOpen = false;
    elements.authForm.reset();
  } else {
    state.categories = loadGuestDraft();
  }

  render();
}

async function addCategory(name) {
  state.categories.push({
    id: crypto.randomUUID(),
    name,
    items: [],
  });
  await commit();
}

async function renameCategory(categoryId, name) {
  const category = state.categories.find((entry) => entry.id === categoryId);
  if (!category) {
    return;
  }
  category.name = name;
  await commit();
}

async function addItem(categoryId, name) {
  const category = state.categories.find((entry) => entry.id === categoryId);
  if (!category) {
    return;
  }
  category.items.push(createItem(name));
  await commit();
}

async function renameItem(categoryId, itemId, name) {
  const category = state.categories.find((entry) => entry.id === categoryId);
  const item = category?.items.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }
  item.name = name;
  await commit();
}

async function toggleItem(categoryId, itemId) {
  const category = state.categories.find((entry) => entry.id === categoryId);
  const item = category?.items.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }
  item.isPacked = !item.isPacked;
  await commit();
}

async function deleteCategory(categoryId) {
  const category = state.categories.find((entry) => entry.id === categoryId);
  if (!category) {
    return;
  }
  const confirmed = await confirmAction(
    "Delete category?",
    `Delete "${category.name}" and all of its items?`
  );
  if (!confirmed) {
    return;
  }
  state.categories = state.categories.filter((entry) => entry.id !== categoryId);
  await commit();
}

async function deleteItem(categoryId, itemId) {
  const category = state.categories.find((entry) => entry.id === categoryId);
  const item = category?.items.find((entry) => entry.id === itemId);
  if (!category || !item) {
    return;
  }
  const confirmed = await confirmAction("Delete item?", `Delete "${item.name}"?`);
  if (!confirmed) {
    return;
  }
  category.items = category.items.filter((entry) => entry.id !== itemId);
  await commit();
}

async function resetTrip() {
  state.categories = state.categories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item, isPacked: false })),
  }));
  await commit();
}

async function restoreDefaults() {
  const confirmed = window.confirm(
    "This will delete all custom categories and items, and restore the default lists."
  );
  if (!confirmed) {
    return;
  }
  state.categories = defaultCategories();
  await commit();
}

elements.toggleViewButton.addEventListener("click", () => {
  state.showRemainingOnly = !state.showRemainingOnly;
  render();
});

elements.newTripButton.addEventListener("click", resetTrip);
elements.restoreDefaultsButton.addEventListener("click", restoreDefaults);
elements.addCategoryButton.addEventListener("click", () => {
  state.categoryModalOpen = true;
  render();
  elements.categoryModalInput.focus();
});
elements.accountToggleButton.addEventListener("click", () => {
  if (state.user) {
    signOut();
    return;
  }
  state.accountPanelOpen = !state.accountPanelOpen;
  render();
});
elements.accountCloseButton.addEventListener("click", () => {
  state.accountPanelOpen = false;
  render();
});
elements.accountModalBackdrop.addEventListener("click", () => {
  state.accountPanelOpen = false;
  render();
});
elements.categoryCloseButton.addEventListener("click", () => {
  state.categoryModalOpen = false;
  elements.categoryModalForm.reset();
  render();
});
elements.categoryCancelButton.addEventListener("click", () => {
  state.categoryModalOpen = false;
  elements.categoryModalForm.reset();
  render();
});
elements.categoryModalBackdrop.addEventListener("click", () => {
  state.categoryModalOpen = false;
  elements.categoryModalForm.reset();
  render();
});
elements.confirmCloseButton.addEventListener("click", () => {
  closeConfirmModal(false);
});
elements.confirmCancelButton.addEventListener("click", () => {
  closeConfirmModal(false);
});
elements.confirmActionButton.addEventListener("click", () => {
  closeConfirmModal(true);
});
elements.confirmModalBackdrop.addEventListener("click", () => {
  closeConfirmModal(false);
});
elements.authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = elements.emailInput.value.trim().toLowerCase();
  const password = elements.passwordInput.value;
  await signIn(email, password);
});
elements.categoryModalForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = elements.categoryModalInput.value.trim();
  if (!name) {
    elements.categoryModalInput.focus();
    return;
  }
  await addCategory(name);
  state.categoryModalOpen = false;
  elements.categoryModalForm.reset();
  render();
});
elements.createAccountButton.addEventListener("click", async () => {
  const email = elements.emailInput.value.trim().toLowerCase();
  const password = elements.passwordInput.value;
  await createAccount(email, password);
});
elements.signOutButton.addEventListener("click", signOut);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.confirmModalOpen) {
    closeConfirmModal(false);
  }
  if (event.key === "Escape" && state.accountPanelOpen) {
    state.accountPanelOpen = false;
    render();
  }
  if (event.key === "Escape" && state.categoryModalOpen) {
    state.categoryModalOpen = false;
    elements.categoryModalForm.reset();
    render();
  }
});

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    applyUser(session?.user ?? null);
  }

  if (event === "SIGNED_OUT") {
    clearGuestDraft();
    applyUser(null);
  }
});

const {
  data: { session },
} = await supabase.auth.getSession();

await applyUser(session?.user ?? null);
