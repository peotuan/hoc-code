// 1. Extract configuration into separate module
const DEFAULT_CONFIG = {
  hooks: {},
  extensions: [],
  wrappers: [],
  navbar: { 
    add: true,
    sticky: true,
    title: "Menu",
    titleLink: "parent" 
  },
  onClick: {
    close: null,
    preventDefault: null,
    setSelected: true
  },
  slidingSubmenus: true
};

// 2. Create class for menu functionality
window.MMenu = class MMenu {
  constructor(element, options = {}, config = {}) {
    this.element = element;
    this.options = {...DEFAULT_CONFIG, ...options};
    this.config = config;
    this.events = {};
    this.openPanels = [];
    this.API = {};
    this.init();
  }

  init() {
    this._initWrappers();
    this._initAddons(); 
    this._initExtensions();
    this._initHooks();
    this._initAPI();
    this._initMenu();
    this._initPanels();
    this._initOpened();
    this._initAnchors();
  }

  _initWrappers() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('mm-wrapper');
    this.element.parentNode.insertBefore(this.wrapper, this.element);
    this.wrapper.appendChild(this.element);
    
    this.options.wrappers.forEach(wrapper => {
      this.wrapper.classList.add(`mm-wrapper--${wrapper}`);
    });
  }

  _initAddons() {
    Object.keys(MMenu.addons).forEach(addon => {
      MMenu.addons[addon].call(this);
    });
  }

  _initExtensions() {
    this.options.extensions.forEach(extension => {
      this.element.classList.add(`mm-menu--${extension}`);
    });
  }

  _initHooks() {
    this.hooks = this.options.hooks;
  }

  _initAPI() {
    this.API = {
      open: (panel) => this.openPanel(panel),
      close: (panel) => this.closePanel(panel),
      setSelected: (element) => this.setSelected(element),
      bind: (event, callback) => this.on(event, callback)
    };
  }

  _initMenu() {
    this.element.classList.add('mm-menu');
    if (this.options.slidingSubmenus) {
      this.element.classList.add('mm-menu--sliding');
    }
  }

  _initPanels() {
    const panels = this.element.querySelectorAll('.mm-panel');
    panels.forEach(panel => this._initPanel(panel));
  }

  _initPanel(panel) {
    panel.classList.add('mm-panel');
    
    if (this.options.navbar.add) {
      const navbar = document.createElement('div');
      navbar.classList.add('mm-navbar');
      
      if (this.options.navbar.title) {
        const title = document.createElement('a');
        title.classList.add('mm-navbar__title');
        title.textContent = panel.getAttribute('data-mm-title') || this.options.navbar.title;
        navbar.appendChild(title);
      }
      
      panel.insertBefore(navbar, panel.firstChild);
    }
  }

  _initOpened() {
    const selected = this.element.querySelector('.mm-listitem--selected');
    if (selected) {
      this.openPanel(selected.closest('.mm-panel'));
    }
  }

  _initAnchors() {
    this.element.addEventListener('click', (event) => {
      const target = event.target.closest('a');
      if (!target) return;

      if (this.options.onClick.preventDefault) {
        event.preventDefault();
      }

      if (this.options.onClick.setSelected) {
        this.setSelected(target);
      }

      if (this.options.onClick.close) {
        this.closePanel(target.closest('.mm-panel'));
      }
    });
  }

  openPanel(panel, animated = true) {
    if (!panel) return;

    if (this.trigger('openPanel:before', { panel })) {
      if (animated) {
        panel.classList.add('mm-panel--animate');
      }

      panel.classList.add('mm-panel--opened');
      this.openPanels.push(panel);

      this.trigger('openPanel:after', { panel });
    }
  }

  closePanel(panel) {
    if (!panel) return;

    if (this.trigger('closePanel:before', { panel })) {
      panel.classList.remove('mm-panel--opened', 'mm-panel--animate');
      this.openPanels = this.openPanels.filter(p => p !== panel);

      this.trigger('closePanel:after', { panel });
    }
  }

  setSelected(element) {
    try {
      if (!element) {
        throw new Error('Element is required');
      }

      const current = this.element.querySelector('.mm-listitem--selected');
      if (current) {
        current.classList.remove('mm-listitem--selected');
      }

      const listItem = element.closest('.mm-listitem');
      if (listItem) {
        listItem.classList.add('mm-listitem--selected');
        this.trigger('setSelected', { element: listItem });
      }
    } catch (err) {
      console.error('Error setting selected:', err);
    }
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  trigger(event, data) {
    if (this.events[event]) {
      return !this.events[event].some(callback => callback(data) === false);
    }
    return true;
  }
}

// Add plugin system
MMenu.addons = {};
MMenu.registerAddon = function(name, addon) {
  MMenu.addons[name] = addon;
};

// Create jQuery plugin
(function($) {
  // Define MMenu as jQuery plugin
  $.fn.mmenu = function(options = {}) {
    const defaultConfig = {
      slidingSubmenus: true,
      navbar: {
        add: false,
        title: "Menu"
      },
      onClick: {
        close: true,
        preventDefault: true,
        setSelected: true
      }
    };

    const config = $.extend({}, defaultConfig, options);

    return this.each(function() {
      const $menu = $(this);
      
      // Move menu to body level
      $('body').append($menu);
      
      // Add required classes and initial styles
      $menu.addClass('mm-menu').css({
        'position': 'fixed',
        'top': '0',
        'left': '-280px',
        'height': '100%',
        'width': '280px',
        'max-width': '50%',
        'z-index': '99999',
        'background': '#fff',
        'overflow-y': 'auto',
        'transition': 'left 0.3s ease-in-out',
        'display': 'block',
        'visibility': 'visible'
      });
      
      // Create wrapper for menu content
      const $wrapper = $('<div class="mm-wrapper">').css({
        'height': '100%',
        'overflow-y': 'auto',
        'background': '#fff'
      });
      
      // Move menu contents into wrapper
      $menu.wrapInner($wrapper);
      
      if (config.slidingSubmenus) {
        $menu.addClass('mm-menu--sliding');
      }

      // Only add navbar if it doesn't exist
      if (config.navbar.add && !$menu.find('.mm-navbar').length) {
        const $navbar = $('<div class="mm-navbar">')
          .append(`<a class="mm-navbar__title">${config.navbar.title}</a>`);
        $menu.find('.mm-wrapper').prepend($navbar);
      }

      // Add overlay
      const $overlay = $('<div class="mm-overlay"></div>').css({
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'background': 'rgba(0,0,0,0.5)',
        'z-index': '99998',
        'display': 'none'
      });
      
      $('body').append($overlay);

      // Toggle menu on hamburger click
      $('#hamburger').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if ($menu.css('left') === '-280px') {
          $menu.css('left', '0');
          $overlay.fadeIn();
          $('body').css('overflow', 'hidden');
        } else {
          $menu.css('left', '-280px');
          $overlay.fadeOut();
          $('body').css('overflow', '');
        }
        $(this).toggleClass('active');
      });

      // Handle clicks
      $menu.on('click', 'a', function(e) {
        if (config.onClick.preventDefault) {
          e.preventDefault();
        }

        if (config.onClick.setSelected) {
          $menu.find('.mm-listitem--selected').removeClass('mm-listitem--selected');
          $(this).closest('.mm-listitem').addClass('mm-listitem--selected');
        }

        if (config.onClick.close) {
          $menu.css('left', '-280px');
          $overlay.fadeOut();
          $('#hamburger').removeClass('active');
          $('body').css('overflow', '');
        }
      });

      // Hide menu on overlay click
      $overlay.on('click', function() {
        $menu.css('left', '-280px');
        $overlay.fadeOut();
        $('#hamburger').removeClass('active');
        $('body').css('overflow', '');
      });
    });
  };
})(jQuery);
