// Mattea Tetris: optional YouTube background music player.
// Playback uses YouTube's official embed, without downloading or copying audio.
(function () {
  'use strict';
  var videoId = 'cAemCx6mpyM';
  function init() {
    if (document.getElementById('mattea-bgm-control')) return;
    var container = document.createElement('aside');
    container.id = 'mattea-bgm-control';
    container.setAttribute('aria-label', 'Background music');
    container.style.cssText = 'position:fixed;bottom:14px;right:14px;z-index:10000;font:14px/1.5 system-ui,sans-serif;color:#edf7f5;max-width:calc(100vw - 28px);';
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = '♫ BGM · Play';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.style.cssText = 'display:block;margin-left:auto;background:#132e31;color:#f4f7f5;border:1px solid #60b6a3;padding:8px 14px;border-radius:9px;cursor:pointer;font:600 13px system-ui,sans-serif;box-shadow:0 4px 15px #0003;';
    var panel = document.createElement('div');
    panel.hidden = true;
    panel.style.cssText = 'box-sizing:border-box;width:324px;max-width:calc(100vw - 28px);margin-top:7px;padding:10px;background:#102e31;border:1px solid #60b6a3;border-radius:10px;box-shadow:0 9px 25px #0004;';
    var note = document.createElement('p');
    note.textContent = 'YouTube BGM · 使用播放器播放/暂停；M 键仅控制 8-bit 游戏音效。';
    note.style.cssText = 'margin:0 0 8px;font:12px/1.5 system-ui,sans-serif;color:#edf7f5;white-space:normal;';
    var frameSlot = document.createElement('div');
    frameSlot.style.cssText = 'width:100%;aspect-ratio:16/9;background:#000;';
    var link = document.createElement('a');
    link.href = 'https://www.youtube.com/watch?v=' + videoId;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '在 YouTube 打开（嵌入失败时）';
    link.style.cssText = 'display:inline-block;margin-top:7px;color:#a5eadb;font:12px system-ui,sans-serif;text-decoration:underline;';
    panel.appendChild(note);
    panel.appendChild(frameSlot);
    panel.appendChild(link);
    container.appendChild(toggle);
    container.appendChild(panel);
    toggle.addEventListener('click', function () {
      if (panel.hidden) {
        if (!frameSlot.firstChild) {
          var frame = document.createElement('iframe');
          frame.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&playsinline=1&rel=0';
          frame.title = 'Mattea Tetris - YouTube background music';
          frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
          frame.allowFullscreen = true;
          frame.referrerPolicy = 'strict-origin-when-cross-origin';
          frame.style.cssText = 'display:block;width:100%;height:100%;border:0;';
          frameSlot.appendChild(frame);
        }
        panel.hidden = false;
        toggle.textContent = '♫ BGM · Close';
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        panel.hidden = true;
        frameSlot.textContent = ''; // Stops playback when the player closes.
        toggle.textContent = '♫ BGM · Play';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.body.appendChild(container);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else init();
}());
