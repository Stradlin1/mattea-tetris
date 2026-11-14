// Mattea Tetris local BGM player — no external embeds or remote audio.
(function () {
  'use strict';

  var DB_NAME = 'mattea-tetris-bgm';
  var STORE = 'tracks';
  var KEY = 'selected';
  var db = null;
  var pendingSave = null;
  var objectUrl = null;
  var chosenDuringLoad = false;

  function init() {
    // Remove a previously injected player, including stale YouTube iframes.
    var old = document.getElementById('mattea-bgm-control');
    if (old) old.parentNode.removeChild(old);
    if (document.getElementById('mattea-bgm-local')) return;

    var container = document.createElement('aside');
    container.id = 'mattea-bgm-local';
    container.setAttribute('aria-label', 'Background music');
    container.style.cssText = 'position:fixed;bottom:14px;right:14px;z-index:10000;font:13px/1.45 system-ui,sans-serif;color:#edf7f5;max-width:calc(100vw - 28px);';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = '♫ BGM · Play';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.style.cssText = 'display:block;margin-left:auto;background:#132e31;color:#f4f7f5;border:1px solid #60b6a3;padding:8px 14px;border-radius:9px;cursor:pointer;font:600 13px system-ui,sans-serif;box-shadow:0 4px 15px #0003;';

    var panel = document.createElement('div');
    panel.hidden = true;
    panel.style.cssText = 'box-sizing:border-box;width:320px;max-width:calc(100vw - 28px);margin-top:7px;padding:12px;background:#102e31;border:1px solid #60b6a3;border-radius:10px;box-shadow:0 9px 25px #0004;';

    var heading = document.createElement('strong');
    heading.textContent = 'Mattea Tetris · Local BGM';
    heading.style.cssText = 'display:block;margin-bottom:8px;';

    var info = document.createElement('p');
    info.textContent = '选择本机 FLAC / MP3 音乐作为 BGM；音乐只保存在本浏览器，不上传到 GitHub。';
    info.style.cssText = 'margin:0 0 9px;font:12px/1.6 system-ui,sans-serif;color:#d7eae5;white-space:normal;';

    var file = document.createElement('input');
    file.type = 'file';
    file.accept = 'audio/*,.flac,.mp3,.wav,.ogg,.m4a';
    file.setAttribute('aria-label', '选择本地背景音乐');
    file.style.cssText = 'display:block;width:100%;margin-bottom:8px;color:#edf7f5;font:12px system-ui,sans-serif;';

    var track = document.createElement('div');
    track.textContent = '当前：尚未选择音乐';
    track.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 0 9px;font-size:12px;';

    var audio = document.createElement('audio');
    audio.controls = true;
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = .45;
    audio.setAttribute('aria-label', 'Background music playback');
    audio.style.cssText = 'display:block;width:100%;height:40px;';

    var fallback = document.createElement('button');
    fallback.type = 'button';
    fallback.textContent = '改用内置 8-bit BGM';
    fallback.style.cssText = 'margin-top:9px;color:#c7f5ec;background:transparent;border:1px solid #6da99c;border-radius:5px;padding:4px 8px;font:12px system-ui,sans-serif;cursor:pointer;';

    var hint = document.createElement('p');
    hint.textContent = 'M 键仅控制游戏音效；这里的 BGM 可以单独调整音量。';
    hint.style.cssText = 'margin:8px 0 0;font:11px/1.5 system-ui,sans-serif;color:#b7d0ca;white-space:normal;';

    function setTrack(source, name, owned) {
      audio.pause();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = owned ? source : null;
      audio.src = source;
      audio.load();
      track.textContent = '当前：' + name;
      track.title = name;
    }

    function useFile(blob, name, start) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      setTrack(url, name, true);
      if (start) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {
          hint.textContent = '浏览器阻止自动播放，请点击音频播放器中的播放键。';
        });
      }
    }

    function saveFile(blob, name) {
      if (!db) {
        pendingSave = { blob: blob, name: name };
        return;
      }
      try {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ blob: blob, name: name }, KEY);
        tx.oncomplete = function () {
          hint.textContent = '已在本浏览器保存音乐；下次打开可继续使用。';
        };
        tx.onabort = tx.onerror = function () {
          hint.textContent = '浏览器存储空间不足：本次可以播放，刷新后可能需要重新选择。';
        };
      } catch (error) {
        hint.textContent = '当前浏览器不支持持久化音频；本次仍可播放。';
      }
    }

    file.addEventListener('change', function () {
      var selected = file.files && file.files[0];
      if (!selected) return;
      if (selected.size > 250 * 1024 * 1024) {
        hint.textContent = '文件超过 250 MB，请选择更小的音频。';
        return;
      }
      chosenDuringLoad = true;
      useFile(selected, selected.name, true);
      saveFile(selected, selected.name);
    });

    fallback.addEventListener('click', function () {
      chosenDuringLoad = true;
      pendingSave = null;
      setTrack('./bgm.wav', '内置原创 8-bit BGM', false);
      if (db) {
        try { db.transaction(STORE, 'readwrite').objectStore(STORE).delete(KEY); }
        catch (error) { /* Playback does not depend on persistent storage. */ }
      }
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
      hint.textContent = '已切换到内置 8-bit BGM。';
    });

    audio.addEventListener('error', function () {
      hint.textContent = '当前音频不能播放，请换成 MP3 格式再试。';
    });

    toggle.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      var open = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '♫ BGM · Close' : '♫ BGM · Play';
      if (open && audio.src) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      }
      if (!open) audio.pause();
    });

    panel.appendChild(heading);
    panel.appendChild(info);
    panel.appendChild(file);
    panel.appendChild(track);
    panel.appendChild(audio);
    panel.appendChild(fallback);
    panel.appendChild(hint);
    container.appendChild(toggle);
    container.appendChild(panel);
    document.body.appendChild(container);

    // Optional local, offline persistence. Audio never leaves this device.
    if (!window.indexedDB) return;
    try {
      var request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function (event) {
        event.target.result.createObjectStore(STORE);
      };
      request.onsuccess = function (event) {
        db = event.target.result;
        if (pendingSave) {
          saveFile(pendingSave.blob, pendingSave.name);
          pendingSave = null;
          return;
        }
        var tx = db.transaction(STORE, 'readonly');
        var get = tx.objectStore(STORE).get(KEY);
        get.onsuccess = function () {
          if (chosenDuringLoad || !get.result) return;
          useFile(get.result.blob, get.result.name, false);
          hint.textContent = '已恢复上次选择的本地音乐。';
        };
      };
      request.onerror = function () {
        hint.textContent = '浏览器本地存储不可用，仍可以临时播放本地音频。';
      };
    } catch (error) {
      hint.textContent = '浏览器本地存储不可用，仍可以临时播放本地音频。';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
