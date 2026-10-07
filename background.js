console.log("background service worker starts");

const PENDING_DATA_KEY = "pendingListingData";

function setPendingData(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [PENDING_DATA_KEY]: data }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function getPendingData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(PENDING_DATA_KEY, (result) => {
      resolve(result[PENDING_DATA_KEY] || null);
    });
  });
}

function clearPendingData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(PENDING_DATA_KEY, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log("received content message", msg?.page);

  switch (msg.page) {
    case "bandcamp":
    case "discogs":
    case "apple":
    case "spotify":
    case "netease":
    case "steam":
    case "imdb": {
      let data = null;

      try {
        data = JSON.parse(msg.data);
      } catch (error) {
        console.error("Failed to parse metadata", error);
        return false;
      }

      setPendingData(data).catch((error) => {
        console.error("Failed to persist metadata", error);
      });

      if (data.imgUrl && /^https?:\/\//.test(data.imgUrl)) {
        chrome.downloads.download({ url: data.imgUrl }, () => {
          if (chrome.runtime.lastError) {
            console.warn("Image download skipped or failed", chrome.runtime.lastError.message);
          } else {
            console.log("Image downloaded");
          }
        });
      }
      break;
    }

    case "doubanMusic1":
    case "doubanGame1":
    case "doubanMovie1": {
      if (!sender.tab?.id) {
        return false;
      }

      getPendingData()
        .then((data) => {
          if (!data) {
            return;
          }

          chrome.tabs.sendMessage(sender.tab.id, { data: JSON.stringify(data) }, (response) => {
            if (chrome.runtime.lastError) {
              console.warn("Douban tab is not ready for metadata yet", chrome.runtime.lastError.message);
              return;
            }
            if (!response?.ok) {
              console.warn("Douban tab received metadata but did not apply it yet");
              return;
            }
            clearPendingData().catch((error) => {
              console.error("Failed to clear pending metadata", error);
            });
          });
        })
        .catch((error) => {
          console.error("Failed to load pending metadata", error);
        });
      break;
    }
  }

  return false;
});

console.log("background service worker ready");
