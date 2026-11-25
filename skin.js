(() => {
  'use strict';

  const html = document.documentElement;
  const path = window.location.pathname;
  const loginArea = path === '/login/' || path === '/login/index.php';

  html.classList.add('pz-real');
  if (loginArea) { html.classList.add('pz-login-real'); }

  // Шрифты лежат внутри расширения и не зависят от внешних CDN.
  try {
    const base = chrome.runtime.getURL('fonts/');
    const cyr = 'U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116';
    const lat = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
    const faces = [
      ['PZDisplay', 'oswald-cyrillic-600.woff2', '600', cyr],
      ['PZDisplay', 'oswald-latin-600.woff2', '600', lat],
      ['PZHead', 'bitter-cyrillic-700.woff2', '700', cyr],
      ['PZHead', 'bitter-latin-700.woff2', '700', lat],
      ['PZBody', 'pt-sans-narrow-cyrillic-400.woff2', '400', cyr],
      ['PZBody', 'pt-sans-narrow-latin-400.woff2', '400', lat]
    ];
    const style = document.createElement('style');
    style.id = 'pz-real-fonts';
    style.textContent = faces.map(([family, file, weight, range]) => (
      '@font-face{font-family:"' + family + '";font-style:normal;font-weight:' + weight +
      ';font-display:swap;src:url("' + base + file + '") format("woff2");unicode-range:' + range + ';}'
    )).join('');
    (document.head || html).appendChild(style);
  } catch (error) {
    // Если браузер не дал доступ к ресурсу, остаются системные шрифты.
  }

  const initial = (name) => {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) { return 'П'; }
    return parts.slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  };

  const makeBrand = (href) => {
    const link = document.createElement('a');
    link.className = 'pz-real-brand';
    link.href = href;
    link.setAttribute('aria-label', 'ПензГТУ — учебный портал');
    link.innerHTML = '<span class="pz-real-mark">П</span><span class="pz-real-word">ПЕНЗГТУ<small>учебный портал</small></span>';
    return link;
  };

  const decorateLogin = () => {
    const wrapper = document.querySelector('.login-wrapper');
    const form = document.querySelector('form#login.login-form, form.login-form#login');
    if (!wrapper || !form || wrapper.querySelector('.pz-login-aside')) { return; }

    const aside = document.createElement('aside');
    aside.className = 'pz-login-aside';
    aside.innerHTML = [
      '<a class="pz-login-brand" href="https://edu.penzgtu.ru/">',
      '  <span class="pz-real-mark">П</span>',
      '  <span class="pz-real-word">ПЕНЗГТУ<small>учебный портал</small></span>',
      '</a>',
      '<div>',
      '  <p class="pz-kicker">Пензенский государственный технологический университет</p>',
      '  <h1>Учёба<br><em>без лишнего.</em></h1>',
      '  <p class="pz-login-lead">Курсы, задания, файлы и оценки — в одном спокойном рабочем пространстве.</p>',
      '  <div class="pz-login-facts">',
      '    <div class="pz-login-fact"><span>01</span><span>Все курсы, на которые вы записаны, включая новые.</span></div>',
      '    <div class="pz-login-fact"><span>02</span><span>Материалы, задания и дедлайны — на своих местах.</span></div>',
      '    <div class="pz-login-fact"><span>03</span><span>Вход и данные остаются на портале ПензГТУ.</span></div>',
      '  </div>',
      '</div>',
      '<p class="pz-login-note">Этот слой оформления работает только в вашем браузере. Пароль вводится здесь же, на edu.penzgtu.ru.</p>'
    ].join('');
    wrapper.insertBefore(aside, wrapper.firstElementChild);

    const container = wrapper.querySelector('.login-container');
    if (container && !container.querySelector('.pz-login-title')) {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'pz-login-eyebrow';
      eyebrow.textContent = 'Личный кабинет';
      const title = document.createElement('h2');
      title.className = 'pz-login-title';
      title.textContent = 'Вход в систему';
      const anchor = form.closest('.loginform') || form;
      anchor.parentNode.insertBefore(eyebrow, anchor);
      anchor.parentNode.insertBefore(title, anchor);

      const help = document.createElement('p');
      help.className = 'pz-login-help';
      help.innerHTML = 'Не получается войти? <a href="https://edu.penzgtu.ru/mod/forum/discuss.php?d=5011#p12094">Инструкция на портале</a>.';
      form.insertAdjacentElement('afterend', help);
    }

    document.title = 'Вход · ПензГТУ';
  };

  const navItems = (() => {
    const items = [
      ['Главная', '/my/', path === '/my/' || path === '/'],
      ['Мои курсы', '/my/courses.php', path.startsWith('/my/courses') || path.startsWith('/course/')],
      ['Календарь', '/calendar/view.php?view=month', path.startsWith('/calendar/')],
      ['Сообщения', '/message/index.php', path.startsWith('/message/')],
      ['Личные файлы', '/user/files.php', path.startsWith('/user/files')]
    ];
    return items;
  })();

  const isDashboard = path === '/my/' || path === '/my/index.php';

  const orderDashboard = () => {
    if (!isDashboard) { return; }
    const region = document.querySelector('#block-region-content');
    if (!region) { return; }
    const recent = region.querySelector('.block_recentlyaccessedcourses');
    const timeline = region.querySelector('.block_timeline');
    const calendar = region.querySelector('.block_calendar_month');
    if (!recent || !calendar) { return; }
    if (recent.parentElement !== region || calendar.parentElement !== region) { return; }

    const blocks = [...region.children].filter((el) => el.matches && el.matches('section.block'));
    const firstBlock = blocks[0];
    if (firstBlock && recent !== firstBlock) {
      region.insertBefore(recent, firstBlock);
    }
    if (timeline && timeline.parentElement === region && timeline !== calendar) {
      region.insertBefore(timeline, calendar);
    }
  };

  const russianFiles = (count) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) { return 'файл'; }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) { return 'файла'; }
    return 'файлов';
  };

  const enhanceFilemanager = (manager) => {
    if (!manager || manager.classList.contains('fp-select')) { return; }
    if (manager.dataset.pzBulk === '1') {
      if (manager.querySelector('.pz-bulk-upload')) { return; }
      delete manager.dataset.pzBulk;
    }
    if (!manager.querySelector('.filemanager-container') || !manager.querySelector('.fp-btn-add')) { return; }
    if (!document.body.classList.contains('dndsupported')) { return; }
    manager.dataset.pzBulk = '1';

    const panel = document.createElement('div');
    panel.className = 'pz-bulk-upload';
    panel.innerHTML = [
      '<div class="pz-bulk-copy">',
      '<strong>Несколько файлов сразу</strong>',
      '<span>Выберите все нужные файлы — они загрузятся за один раз.</span>',
      '</div>',
      '<button class="pz-bulk-button" type="button">Выбрать несколько файлов</button>',
      '<input class="pz-bulk-input" type="file" multiple aria-label="Выбрать несколько файлов для загрузки">',
      '<p class="pz-bulk-status" role="status"></p>'
    ].join('');
    const restrictions = manager.querySelector('.fp-restrictions');
    if (restrictions) {
      restrictions.insertAdjacentElement('afterend', panel);
    } else {
      manager.insertBefore(panel, manager.firstChild);
    }

    const button = panel.querySelector('.pz-bulk-button');
    const input = panel.querySelector('.pz-bulk-input');
    const status = panel.querySelector('.pz-bulk-status');

    button.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const files = Array.from(input.files || []);
      input.value = '';
      if (!files.length) { return; }

      if (!window.DataTransfer || !window.DragEvent) {
        status.textContent = 'Этот браузер не поддерживает выбор нескольких файлов. Используйте кнопку «+» в файловом менеджере.';
        status.classList.add('is-error');
        return;
      }

      try {
        const transfer = new DataTransfer();
        files.forEach((file) => transfer.items.add(file));
        const target = manager.querySelector('.filemanager-container') || manager;
        status.classList.remove('is-error');
        status.textContent = 'Загружаю ' + files.length + ' ' + russianFiles(files.length) + '…';
        button.disabled = true;
        target.dispatchEvent(new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer
        }));

        let finished = false;
        let observer = null;
        let timer = 0;
        const finish = () => {
          if (finished) { return; }
          finished = true;
          button.disabled = false;
          status.textContent = 'Файлы переданы. Проверьте список ниже.';
          if (observer) { observer.disconnect(); }
          window.clearTimeout(timer);
        };
        observer = new MutationObserver(() => {
          if (!target.classList.contains('dndupload-inprogress')) {
            window.setTimeout(finish, 500);
          }
        });
        observer.observe(target, { attributes: true, attributeFilter: ['class'] });
        timer = window.setTimeout(finish, 15000);
      } catch (error) {
        status.textContent = 'Не удалось добавить файлы. Попробуйте кнопку «+» в файловом менеджере.';
        status.classList.add('is-error');
        button.disabled = false;
      }
    });
  };

  const enhanceFilemanagers = () => {
    document.querySelectorAll('.filemanager').forEach((manager) => {
      if (manager.closest('.fp-select')) { return; }
      enhanceFilemanager(manager);
    });
  };

  const watchFilemanagers = () => {
    enhanceFilemanagers();
    window.setTimeout(enhanceFilemanagers, 800);
    if (!document.body || !document.querySelector('.filemanager')) { return; }
    let pending = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(pending);
      pending = window.setTimeout(enhanceFilemanagers, 200);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  const decorateShell = () => {
    if (!document.body || document.body.querySelector('.pz-real-header')) { return; }

    const isGuest = document.body.classList.contains('userguest');
    const loggedIn = document.body.classList.contains('loggedin') && !isGuest;
    const sesskeyInput = document.querySelector('input[name="sesskey"]');
    const logoutAnchor = [...document.querySelectorAll('a[href*="logout.php"]')].find((a) => a.href.includes('sesskey='));
    const sesskey = sesskeyInput ? sesskeyInput.value : (logoutAnchor ? new URL(logoutAnchor.href).searchParams.get('sesskey') : '');

    const visibleHeading = [...document.querySelectorAll('h1')].find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 20 && rect.height > 10 && getComputedStyle(el).visibility !== 'hidden';
    });
    if (!visibleHeading) {
      const region = document.querySelector('#region-main');
      const rawTitle = (document.title || '').replace(/\s*\|\s*EDU\.PENZGTU\.RU\s*$/i, '').trim();
      const hiddenHeading = [...document.querySelectorAll('h1')].find((el) => {
        const text = el.textContent.replace(/\s+/g, ' ').trim();
        return text && !/(\.\.\.|…)\s*$/.test(text) && !/^Образовательный портал/i.test(text) && !/^EDU\.PENZGTU\.RU$/i.test(text);
      });
      const hiddenTitle = hiddenHeading ? hiddenHeading.textContent.replace(/\s+/g, ' ').trim() : '';
      const pageTitle = hiddenTitle || (rawTitle && rawTitle !== 'EDU.PENZGTU.RU' ? rawTitle : 'Учебный портал');
      if (region) {
        const head = document.createElement('div');
        head.className = 'pz-real-pagehead';
        head.innerHTML = '<p class="pz-kicker">ПензГТУ · учебный портал</p><h1></h1>';
        head.querySelector('h1').textContent = pageTitle;
        region.insertBefore(head, region.firstChild);
      }
    }

    const header = document.createElement('header');
    header.className = 'pz-real-header';
    header.appendChild(makeBrand('https://edu.penzgtu.ru/my/'));

    if (loggedIn) {
      const nav = document.createElement('nav');
      nav.className = 'pz-real-nav';
      nav.setAttribute('aria-label', 'Основная навигация');
      const shortLabels = { 'Мои курсы': 'Курсы', 'Личные файлы': 'Файлы' };
      navItems.forEach(([label, href, active]) => {
        const link = document.createElement('a');
        link.href = 'https://edu.penzgtu.ru' + href;
        link.setAttribute('aria-label', label);
        if (shortLabels[label]) {
          const full = document.createElement('span');
          full.className = 'pz-nav-full';
          full.textContent = label;
          const short = document.createElement('span');
          short.className = 'pz-nav-short';
          short.textContent = shortLabels[label];
          link.append(full, short);
        } else {
          link.textContent = label;
        }
        if (active) { link.className = 'is-active'; link.setAttribute('aria-current', 'page'); }
        nav.appendChild(link);
      });
      header.appendChild(nav);
    } else {
      const nav = document.createElement('nav');
      nav.className = 'pz-real-nav';
      nav.setAttribute('aria-label', 'Основная навигация');
      const catalog = document.createElement('a');
      catalog.href = 'https://edu.penzgtu.ru/course/index.php';
      catalog.textContent = 'Каталог курсов';
      nav.appendChild(catalog);
      header.appendChild(nav);
    }

    const account = document.createElement('div');
    account.className = 'pz-real-account';

    if (loggedIn) {
      const userEl = document.querySelector('.usertext, .usermenu .usertext, [data-region="user-menu"] .usertext');
      const name = userEl ? userEl.textContent.trim().replace(/\s+/g, ' ') : 'Аккаунт';
      const avatar = document.createElement('span');
      avatar.className = 'pz-real-avatar';
      avatar.textContent = initial(name);
      avatar.setAttribute('aria-hidden', 'true');

      const profileAnchor = document.querySelector('.usermenu a[href*="/user/profile.php"], a[href*="/user/profile.php?id="]');
      const profile = document.createElement('a');
      profile.className = 'pz-real-name';
      profile.href = profileAnchor ? profileAnchor.href : 'https://edu.penzgtu.ru/user/profile.php';
      profile.textContent = name;
      profile.title = name;

      account.appendChild(avatar);
      account.appendChild(profile);

      if (sesskey) {
        const logout = document.createElement('a');
        logout.className = 'pz-real-logout';
        logout.href = 'https://edu.penzgtu.ru/login/logout.php?sesskey=' + encodeURIComponent(sesskey);
        logout.textContent = 'Выйти';
        account.appendChild(logout);
      }
    } else {
      const login = document.createElement('a');
      login.className = 'pz-real-login-link';
      login.href = 'https://edu.penzgtu.ru/login/index.php';
      login.textContent = 'Войти';
      account.appendChild(login);
    }

    header.appendChild(account);
    document.body.insertBefore(header, document.body.firstChild);

    const footer = document.createElement('footer');
    footer.className = 'pz-real-footer';
    footer.innerHTML = '<span>ПензГТУ · Учебный портал</span><span>Работает на Moodle</span>';
    document.body.appendChild(footer);

    if (isDashboard) {
      orderDashboard();
      window.setTimeout(orderDashboard, 600);
      window.setTimeout(orderDashboard, 1600);
    }

    if (path === '/user/profile.php' || path.startsWith('/user/profile.php')) {
      const profileParams = new URLSearchParams(window.location.search);
      const ownProfile = document.querySelector('a[href*="/user/edit.php"]') || !profileParams.has('id');
      if (ownProfile) {
        document.querySelectorAll('#message-user-button, [data-action="message-user"], a[href*="/message/index.php?id="]').forEach((el) => {
          if (el.closest('.pz-real-header, .pz-real-footer')) { return; }
          el.remove();
        });
      }
    }

    watchFilemanagers();
  };

  const ready = () => {
    if (!document.body) { return; }
    if (document.body.id === 'page-login-index' || path === '/login/index.php') {
      decorateLogin();
      return;
    }
    decorateShell();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
})();