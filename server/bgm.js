// Mattea Tetris: self-hosted, original 8-bit background music.
(function () {
  'use strict';
  function init() {
    if (document.getElementById('mattea-bgm-control')) return;
    var container = document.createElement('aside');
    container.id = 'mattea-bgm-control';
    container.setAttribute('aria-label', 'Background music');
    container.style.cssText = 'position:fixed;bottom:14px;right:14px;z-index:10000;font:14px/1.5 system-ui,sans-serif;color:#edf7f5;max-width:calc(100vw - 28px);';
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = '♫ BGM · Play';
    button.setAttribute('aria-expanded', 'false');
    button.style.cssText = 'display:block;margin-left:auto;background:#132e31;color:#f4f7f5;border:1px solid #60b6a3;padding:8px 14px;border-radius:9px;cursor:pointer;font:600 13px system-ui,sans-serif;box-shadow:0 4px 15px #0003;';
    var panel = document.createElement('div');
    panel.hidden = true;
    panel.style.cssText = 'box-sizing:border-box;width:310px;max-width:calc(100vw - 28px);margin-top:7px;padding:12px;background:#102e31;border:1px solid #60b6a3;border-radius:10px;box-shadow:0 9px 25px #0004;';
    var title = document.createElement('strong');
    title.textContent = 'Mattea Arcade · Original 8-bit BGM';
    title.style.cssText = 'display:block;font-size:13px;margin-bottom:6px;';
    var note = document.createElement('p');
    note.textContent = '本地音频循环播放；M 键只控制游戏音效。';
    note.style.cssText = 'margin:0 0 10px;font:12px/1.5 system-ui,sans-serif;color:#d5e9e4;white-space:normal;';
    var audio = document.createElement('audio');
    audio.src = './bgm.wav';
    audio.controls = true;
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0.42;
    audio.setAttribute('aria-label', 'Original 8-bit background music');
    audio.style.cssText = 'display:block;width:100%;height:40px;';
    audio.addEventListener('error', function () {
      note.textContent = 'BGM 文件加载失败，请刷新页面或检查网络。';
    });
    panel.appendChild(title);
    panel.appendChild(note);
    panel.appendChild(audio);
    container.appendChild(button);
    container.appendChild(panel);
    button.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      var open = !panel.hidden;
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? '♫ BGM · Close' : '♫ BGM · Play';
      if (open) {
        var attempt = audio.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            note.textContent = '点击播放器中的播放键开始播放；M 键只控制游戏音效。';
          });
        }
      } else {
        audio.pause();
      }
    });
    document.body.appendChild(container);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else init();
}());
