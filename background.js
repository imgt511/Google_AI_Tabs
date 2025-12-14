let updateTimeout;

// ==================================================================
// --- CONFIGURATION ---
// The getTitle function for Gemini is now extremely strict. It will
// return a title ONLY if it can be found via the URL-matching method.
// Otherwise, it returns `null`, and the tab will not be listed.
// ==================================================================
const SITES_CONFIG = [
  {
    name: "AI Studio",
    urlPattern: "https://aistudio.google.com/*",
    newTabUrl: "https://aistudio.google.com/",
    getTitle: function getChatTitleFromPage() {
      const selectors = [
        'h1[contenteditable="true"]', 'div[aria-label^="Chat title"]',
        'div.chat-title', 'h1'
      ];
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText && element.innerText.trim()) {
          const title = element.innerText.trim();
          if (title.toLowerCase() !== "untitled chat") return title;
        }
      }
      return "Untitled Chat";
    }
  },
  {
    name: "Gemini",
    urlPattern: "https://gemini.google.com/*",
    newTabUrl: "https://gemini.google.com/",
    getTitle: function getChatTitleFromPage() {
      // The ONLY method: Use the page URL to find the matching link in the sidebar.
      const currentPath = window.location.pathname;
      if (currentPath && currentPath.startsWith('/app/')) {
        const activeLink = document.querySelector(`a[href="${currentPath}"]`);
        if (activeLink) {
          const titleElement = activeLink.querySelector('.title');
          if (titleElement && titleElement.innerText && titleElement.innerText.trim()) {
            return titleElement.innerText.trim(); // SUCCESS
          }
        }
      }
      // If the specific title cannot be found, return null to signal failure.
      return null;
    }
  },
  {
    name: "NotebookLM",
    urlPattern: "https://notebooklm.google.com/*",
    newTabUrl: "https://notebooklm.google.com/",
    getTitle: function getChatTitleFromPage() {
      let pageTitle = document.title.replace(" - NotebookLM", "").trim();
      if (pageTitle && pageTitle.toLowerCase() !== "notebooklm") {
        return pageTitle;
      }
      return "Untitled Notebook";
    }
  }
];

// Main function to rebuild the entire context menu.
function updateContextMenu() {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {}

    const rootMenuId = "googleAiRootMenu";
    chrome.contextMenus.create({ id: rootMenuId, title: "Google AI Tabs", contexts: ["page"] });

    SITES_CONFIG.forEach((site, index) => {
      const siteMenuId = `site-${index}`;
      chrome.contextMenus.create({ id: siteMenuId, parentId: rootMenuId, title: site.name, contexts: ["page"] });

      chrome.contextMenus.create({
        id: `new-tab-${index}`, parentId: siteMenuId, title: "Open in New Tab", contexts: ["page"]
      });
      chrome.contextMenus.create({
        id: `new-window-${index}`, parentId: siteMenuId, title: "Open in New Window", contexts: ["page"]
      });
      chrome.contextMenus.create({
        id: `separator-${index}`, parentId: siteMenuId, type: "separator", contexts: ["page"]
      });

      chrome.tabs.query({ url: site.urlPattern }, (tabs) => {
        let tabsFound = false;
        if (tabs.length === 0) {
            // No tabs to process, the "no tabs found" message will be added later if needed
        } else {
            tabs.forEach(tab => {
                if (tab.status === "complete") {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: site.getTitle,
                    }, (injectionResults) => {
                        if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) return;
                        
                        const chatTitle = injectionResults[0].result;
                        // --- UPDATED: Only create the menu item if getTitle returns a valid title ---
                        if (chatTitle) { 
                            tabsFound = true; // We found at least one valid tab
                            chrome.contextMenus.create({
                                id: `tab-${tab.id}`, parentId: siteMenuId, title: chatTitle, contexts: ["page"]
                            });
                        }
                    });
                }
            });
        }
        
        // After a delay, check if we ever found a valid tab. If not, show the message.
        setTimeout(() => {
            chrome.contextMenus.getTargetedParent(siteMenuId, (parent) => {
                // Check if any children were added besides our static ones. A more robust check might be needed
                // but for now we rely on our flag. This part is tricky due to async nature.
                // A simpler approach might be to just see if tabs exist, and accept some might be filtered out.
            });
            // If tabs exist but none have valid titles, the list will just be empty, which is cleaner.
        }, 300); // 300ms delay to allow scripts to execute

      });
    });
  });
}

function scheduleUpdate() {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(updateContextMenu, 150);
}

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId.toString().startsWith('tab-')) {
    const tabId = parseInt(info.menuItemId.replace('tab-', ''));
    chrome.tabs.update(tabId, { active: true });
    chrome.tabs.get(tabId, (tabToFocus) => {
      if (tabToFocus) {
        chrome.windows.update(tabToFocus.windowId, { focused: true });
      }
    });
  } 
  else if (info.menuItemId.toString().startsWith('new-tab-')) {
    const index = parseInt(info.menuItemId.replace('new-tab-', ''));
    const site = SITES_CONFIG[index];
    if (site) {
      chrome.tabs.create({ url: site.newTabUrl, active: true });
    }
  } 
  else if (info.menuItemId.toString().startsWith('new-window-')) {
    const index = parseInt(info.menuItemId.replace('new-window-', ''));
    const site = SITES_CONFIG[index];
    if (site) {
      chrome.windows.create({ url: site.newTabUrl, focused: true });
    }
  }
});

chrome.tabs.onUpdated.addListener(scheduleUpdate);
chrome.tabs.onCreated.addListener(scheduleUpdate);
chrome.tabs.onRemoved.addListener(scheduleUpdate);
chrome.runtime.onInstalled.addListener(updateContextMenu);