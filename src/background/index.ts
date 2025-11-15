/**
 * Background service worker for the extension
 * Handles extension lifecycle and tab/group/window events
 */

import './tabEvents';
import './tabGroupEvents';
import './windowEvents';
import { ruleEngine } from './ruleEngine';

chrome.runtime.onInstalled.addListener(() => {
  console.log('OverTabbed extension installed');
  ruleEngine.start();
});

chrome.runtime.onStartup.addListener(() => {
  ruleEngine.start();
});

ruleEngine.start();

chrome.action.onClicked.addListener(async () => {
  const extensionUrl = chrome.runtime.getURL('index.html');
  
  const tabs = await chrome.tabs.query({ url: extensionUrl });
  
  if (tabs.length > 0) {
    const existingTab = tabs[0];
    await chrome.tabs.update(existingTab.id!, { active: true });
    if (existingTab.windowId) {
      await chrome.windows.update(existingTab.windowId, { focused: true });
    }
  } else {
    chrome.tabs.create({
      url: extensionUrl,
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open-extensions-page') {
    const extensionUrl = chrome.runtime.getURL('index.html');
    
    const tabs = await chrome.tabs.query({ url: extensionUrl });
    
    if (tabs.length > 0) {
      const existingTab = tabs[0];
      await chrome.tabs.update(existingTab.id!, { active: true });
      if (existingTab.windowId) {
        await chrome.windows.update(existingTab.windowId, { focused: true });
      }
    } else {
      chrome.tabs.create({
        url: extensionUrl,
      });
    }
  }
});
