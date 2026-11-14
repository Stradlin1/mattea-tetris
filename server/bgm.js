// Mattea Tetris: one-track looping BGM, served directly by GitHub Pages.
// Optional private browser-file fallback until bgm.mp3 is available.
(function () {
  'use strict';

  var REMOTE = './BGM_320kbps.mp3?v=20261114-uploaded';
  var DB_NAME = 'mattea-tetris-bgm';
  var STORE = 'tracks';
  var KEY = 'selected';
  var db = null;
  var savedObjectUrl = null;
  var switchedToLocal = false;
  var savedRecord = null;

  function init() {
    ['mattea-bgm-control', 'mattea-bgm-local', 'mattea-bgm-single'].forEach(function (id) {
      var stale = document.getElementById(id);
      if (stale) stale.parentNode.removeChild(stale);
    });

    var container = document.createElement('aside');
    container.id = 'mattea-bgm-single';
    container.style.cssText = 'position:fixed;bottom:14px;right:14px;z-index:10000;font:13px/1.5 system-ui,sans-serif;color:#edf7f5;max-width:calc(100vw - 28px);';

    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = '♫ BGM · Play';
    button.setAttribute('aria-expanded', 'false');
    button.style.cssText = 'display:block;margin-left:auto;background:#132e31;color:#f4f7f5;border:1px solid #60b6a3;padding:8px 14px;border-radius:9px;cursor:pointer;font:600 13px system-ui,sans-serif;box-shadow:0 4px 15px #0003;';

    var panel = document.createElement('section');
    panel.hidden = true;
    panel.style.cssText = 'box-sizing:border-box;width:320px;max-width:calc(100vw - 28px);margin-top:7px;padding:12px;background:#102e31;border:1px solid #60b6a3;border-radius:10px;box-shadow:0 9px 25px #0004;';

    var title = document.createElement('strong');
    title.textContent = 'Mattea Tetris · Background Music';
    title.style.cssText = 'display:block;margin-bottom:8px;font:600 13px system-ui,sans-serif;';

    var name = document.createElement('p');
    name.textContent = 'BGM_320kbps(1).mp3 · 单曲循环';
    name.style.cssText = 'margin:0 0 8px;color:#d5e9e4;font:12px/1.4 system-ui,sans-serif;white-space:normal;';

    var audio = document.createElement('audio');
    audio.controls = true;
    audio.loop = true;
    audio.volume = .42;
    audio.preload = 'metadata';
    audio.src = REMOTE;
    audio.setAttribute('aria-label', 'Single-track looping background music');
    audio.style.cssText = 'display:block;width:100%;height:42px;';

    var fallback = document.createElement('div');
    fallback.hidden = true;
    fallback.style.cssText = 'margin-top:10px;font:12px/1.5 system-ui,sans-serif;white-space:normal;';
    var note = document.createElement('p');
    note.textContent = '尚未上传 bgm.mp3。可先从本机选取同一 MP3 播放，音频仅存于浏览器。';
    note.style.cssText = 'margin:0 0 8px;';
    var file = document.createElement('input');
    file.type = 'file';
    file.accept = 'audio/mpeg,.mp3,audio/*';
    file.setAttribute('aria-label', '选择本机 BGM');
    file.style.cssText = 'display:block;width:100%;font:12px system-ui,sans-serif;color:#edf7f5;';

    fallback.appendChild(note);
    fallback.appendChild(file);
    panel.appendChild(title);
    panel.appendChild(name);
    panel.appendChild(audio);
    panel.appendChild(fallback);
    container.appendChild(button);
    container.appendChild(panel);
    document.body.appendChild(container);

    function save(blob) {
      if (!db) return;
      try {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ blob: blob, name: blob.name || 'BGM.mp3' }, KEY);
        tx.onerror = function () { note.textContent = '本次可播放，但浏览器保存失败。'; };
      } catch (err) { note.textContent = '本次可播放，但浏览器保存失败。'; }
    }

    function useLocal(blob, label, start) {
      if (!blob) return;
      switchedToLocal = true;
      if (savedObjectUrl) URL.revokeObjectURL(savedObjectUrl);
      savedObjectUrl = URL.createObjectURL(blob);
      audio.pause();
      audio.src = savedObjectUrl;
      audio.load();
      name.textContent = (label || '本地 BGM') + ' · 单曲循环';
      fallback.hidden = true;
      if (start) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {
          fallback.hidden = false;
          note.textContent = '请点击播放器中的播放键。';
        });
      }
    }

    function remoteFailed() {
      if (switchedToLocal) {
        fallback.hidden = false;
        note.textContent = '音频解码失败，请改用浏览器支持的 MP3。';
        return;
      }
      fallback.hidden = false;
      if (savedRecord) {
        useLocal(savedRecord.blob, savedRecord.name, false);
      }
    }
    audio.addEventListener('error', remoteFailed);

    file.addEventListener('change', function () {
      var picked = file.files && file.files[0];
      if (!picked) return;
      if (picked.size > 100 * 1024 * 1024) {
        note.textContent = '音频不能超过 100 MB。';
        return;
      }
      useLocal(picked, picked.name, true);
      save(picked);
    });

    button.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      var open = !panel.hidden;
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '♫ BGM · Close' : '♫ BGM · Play';
      if (open) {
        var attempt = audio.play();
        if (attempt && attempt.catch) attempt.catch(function () {
          if (!switchedToLocal) fallback.hidden = false;
        });
      } else {
        audio.pause();
      }
    });

    if (!window.indexedDB) return;
    try {
      var request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function (event) {
        var database = event.target.result;
        if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE);
      };
      request.onsuccess = function (event) {
        db = event.target.result;
        var get = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
        get.onsuccess = function () {
          savedRecord = get.result || null;
          if (!switchedToLocal && audio.error && savedRecord) {
            useLocal(savedRecord.blob, savedRecord.name, false);
          }
        };
      };
    } catch (err) { /* Local storage is optional. */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
